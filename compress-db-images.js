import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import sharp from 'sharp';

dotenv.config();
const supabase = createClient('https://samwziooqhzohpszyddw.supabase.co', process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  console.log('Fetching all product IDs...');
  const { data: products, error } = await supabase.from('products').select('id');
  if (error) { console.error('Error fetching ids', error); return; }
  
  console.log(`Found ${products.length} products. Checking images...`);
  
  let compressedCount = 0;
  for (const p of products) {
    const { data: prod, error: err } = await supabase.from('products').select('images').eq('id', p.id).single();
    if (err) { console.error(`Error fetching images for ${p.id}`); continue; }
    
    if (!prod.images || prod.images.length === 0) continue;
    
    let modified = false;
    const newImages = [];
    
    for (const img of prod.images) {
      if (img && img.startsWith('data:image/') && img.length > 50000) {
        // Base64 string > 50KB roughly
        try {
          const match = img.match(/^data:(image\/\w+);base64,(.+)$/);
          if (match) {
            const mime = match[1];
            const base64Data = match[2];
            const buffer = Buffer.from(base64Data, 'base64');
            const compressed = await sharp(buffer)
              .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
              .webp({ quality: 60 })
              .toBuffer();
            
            const newBase64 = `data:image/webp;base64,${compressed.toString('base64')}`;
            console.log(`Compressed image for ${p.id}: ${img.length} -> ${newBase64.length}`);
            newImages.push(newBase64);
            modified = true;
          } else {
            newImages.push(img);
          }
        } catch (e) {
          console.error(`Failed to compress image for ${p.id}:`, e);
          newImages.push(img);
        }
      } else {
        newImages.push(img);
      }
    }
    
    if (modified) {
      const { error: updateErr } = await supabase.from('products').update({ images: newImages }).eq('id', p.id);
      if (updateErr) {
        console.error(`Failed to update ${p.id}:`, updateErr);
      } else {
        compressedCount++;
        console.log(`Updated product ${p.id}`);
      }
    }
  }
  
  console.log(`Done. Compressed images for ${compressedCount} products.`);
}

run();
