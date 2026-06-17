import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from Bazarito root .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY; // Or Service Role Key for scripts
const FB_CATALOG_ID = process.env.FB_CATALOG_ID;
const FB_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;
const FB_GRAPH_API = "https://graph.facebook.com/v19.0";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Helper to get Bazarito business ID
async function getBusinessId() {
  const { data, error } = await supabase.from('businesses').select('id').eq('slug', 'bazarito').single();
  if (error || !data) throw new Error("Could not find business ID");
  return data.id;
}

async function getFacebookProducts() {
  console.log(`Fetching products from Facebook Catalog: ${FB_CATALOG_ID}...`);
  const url = `${FB_GRAPH_API}/${FB_CATALOG_ID}/products?fields=id,name,description,price,image_url,availability&limit=100&access_token=${FB_ACCESS_TOKEN}`;
  
  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data.data || [];
}

async function importProducts() {
  try {
    if (!FB_CATALOG_ID || !FB_ACCESS_TOKEN) {
      console.error("❌ Missing FB_CATALOG_ID or FB_ACCESS_TOKEN in .env file.");
      process.exit(1);
    }

    const bizId = await getBusinessId();
    const fbProducts = await getFacebookProducts();

    console.log(`Found ${fbProducts.length} products in Facebook. Importing to Bazarito...`);

    let importedCount = 0;

    for (const fbProd of fbProducts) {
      // Basic mapping from Facebook -> Supabase
      const priceVal = fbProd.price ? parseFloat(fbProd.price.replace(/[^0-9.]/g, '')) : 0;
      
      const { data: existing } = await supabase
        .from('products')
        .select('id')
        .eq('name', fbProd.name)
        .eq('business_id', bizId)
        .single();

      if (existing) {
        console.log(`⚠️ Skipping "${fbProd.name}" (Already exists)`);
        continue;
      }

      // 1. Insert product
      const { data: newProd, error: prodError } = await supabase
        .from('products')
        .insert([{
          business_id: bizId,
          name: fbProd.name,
          description: fbProd.description || '',
          price: priceVal,
          cost: priceVal * 0.5, // estimate cost
          status: fbProd.availability === 'in stock' ? 'active' : 'draft',
          type: 'physical',
          images: fbProd.image_url ? [fbProd.image_url] : [],
          custom_attributes: {
            ui_type: 'stock',
            fb_id: fbProd.id
          }
        }])
        .select()
        .single();

      if (prodError) {
        console.error(`❌ Error importing "${fbProd.name}":`, prodError.message);
        continue;
      }

      // 2. Insert Inventory
      await supabase.from('inventory').insert([{
        product_id: newProd.id,
        quantity: fbProd.availability === 'in stock' ? 10 : 0 // Default starting stock
      }]);

      console.log(`✅ Imported: ${fbProd.name}`);
      importedCount++;
    }

    console.log(`\n🎉 Import complete! Imported ${importedCount} products successfully.`);
    process.exit(0);

  } catch (err) {
    console.error("❌ Script Error:", err.message);
    process.exit(1);
  }
}

importProducts();
