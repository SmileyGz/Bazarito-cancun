import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const FB_CATALOG_ID = "2142999566151921";
const FB_ACCESS_TOKEN = "EAAOFTaVf9YgBRkvgpU1ayo8KwS78XzDMiG3E194uK14YKtVczbK7B54e6tJY6dqeO6JwWUmJGhaUx1ZCZCjsUx72yeOpqAZApNs8G1J6cgwroZCZAtOs1cEw0F2IOSVLhpjaJp59E4qFaT3M10maTJ42MQMISmIRstdlG8J63WOgiZCZACRRiZC5gnXWf6jDsHG1asew17tlRyFZANkZCemZBmJ6Trw5OFJm46CugZDZD";
const FB_GRAPH_API = "https://graph.facebook.com/v19.0";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function exportProducts() {
  console.log('Fetching existing products from Bazarito...');
  const { data: biz } = await supabase.from('businesses').select('id').eq('slug', 'bazarito').single();
  if (!biz) throw new Error('Business not found');

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, description, price, status, images')
    .eq('business_id', biz.id);

  if (error) {
    console.error('Supabase Error:', error);
    return;
  }

  console.log(`Found ${products.length} products in Bazarito. Syncing to Facebook...`);

  // We can push max 50 items per batch to Facebook.
  const batchSize = 50;
  let successCount = 0;

  for (let i = 0; i < products.length; i += batchSize) {
    const chunk = products.slice(i, i + batchSize);
    
    const requests = chunk.map(product => {
      let imageUrl = "https://bazaritocancun.com/placeholder.png";
      if (product.images && product.images.length > 0) {
        let rawUrl = product.images[0];
        if (typeof rawUrl === 'string') {
          rawUrl = rawUrl.replace(/^\[\s*"?|"?\s*\]$/g, '').replace(/^"|"$/g, '');
        }
        if (rawUrl && rawUrl.startsWith('http')) {
          imageUrl = rawUrl;
        }
      }

      return {
        method: "UPDATE",
        retailer_id: product.id,
        data: {
          availability: product.status === 'active' ? "in stock" : "out of stock",
          brand: "Bazarito",
          condition: "new",
          description: product.description || product.name || "Producto Bazarito",
          image_url: imageUrl,
          name: product.name,
          price: Math.round(product.price * 100),
          currency: "MXN",
          url: `https://bazaritocancun.com/catalog?product=${product.id}`
        }
      };
    });

    const batchPayload = {
      allow_upsert: true,
      requests: requests
    };

    const res = await fetch(`${FB_GRAPH_API}/${FB_CATALOG_ID}/batch?access_token=${FB_ACCESS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batchPayload)
    });

    const result = await res.json();
    if (result.validation_status) {
      console.log("Validation errors:");
      console.dir(result.validation_status, { depth: null });
    } else {
      successCount += chunk.length;
      console.log(`Synced batch of ${chunk.length} products...`);
    }
  }

  console.log(`✅ Successfully exported ${successCount} products to Facebook Catalog!`);
}

exportProducts();
