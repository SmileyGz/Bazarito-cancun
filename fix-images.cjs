require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');

const supabase = createClient('https://samwziooqhzohpszyddw.supabase.co', process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('products').select('id, images').eq('business_id', '8b27928d-f17a-47da-84d7-616a7c5ff113');
  if (error) {
    console.error(error);
    return;
  }
  
  let count = 0;
  for (const p of data) {
    if (p.images && p.images[0] && p.images[0].includes('fbcdn.net')) {
      try {
        console.log('Downloading', p.images[0].substring(0, 50) + '...');
        const res = await fetch(p.images[0]);
        if (!res.ok) throw new Error('Status ' + res.status);
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const compressed = await sharp(buffer)
          .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 60 })
          .toBuffer();
        const b64 = 'data:image/webp;base64,' + compressed.toString('base64');
        const { error: upErr } = await supabase.from('products').update({ images: [b64] }).eq('id', p.id);
        if (upErr) throw upErr;
        count++;
        console.log('Updated', p.id);
      } catch (err) {
        console.error('Failed', p.id, err.message);
      }
    }
  }
  console.log('Fixed', count, 'images');
}
run();
