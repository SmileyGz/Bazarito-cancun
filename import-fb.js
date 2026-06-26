import { createClient } from '@supabase/supabase-js';

const FB_CATALOG_ID = "2142999566151921";
const FB_ACCESS_TOKEN = "EAAOFTaVf9YgBRkvgpU1ayo8KwS78XzDMiG3E194uK14YKtVczbK7B54e6tJY6dqeO6JwWUmJGhaUx1ZCZCjsUx72yeOpqAZApNs8G1J6cgwroZCZAtOs1cEw0F2IOSVLhpjaJp59E4qFaT3M10maTJ42MQMISmIRstdlG8J63WOgiZCZACRRiZC5gnXWf6jDsHG1asew17tlRyFZANkZCemZBmJ6Trw5OFJm46CugZDZD";
const SUPABASE_URL = "https://samwziooqhzohpszyddw.supabase.co";
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function importProducts() {
  console.log('Fetching products from Facebook Catalog...');
  try {
    const res = await fetch(`https://graph.facebook.com/v18.0/${FB_CATALOG_ID}/products?access_token=${FB_ACCESS_TOKEN}&fields=name,description,price,image_url,availability,retailer_id`);
    const json = await res.json();
    
    if (json.error) {
      console.error('Facebook API Error:', json.error);
      return;
    }

    const items = json.data || [];
    console.log(`Found ${items.length} products in Facebook Catalog.`);

    if (items.length === 0) return;

    // Get Business ID
    const { data: biz } = await supabase.from('businesses').select('id').eq('slug', 'bazarito').single();
    if (!biz) throw new Error('Business not found');

    // Get default category
    let { data: catList } = await supabase.from('categories').select('id').eq('business_id', biz.id).limit(1);
    if (!catList || catList.length === 0) throw new Error("No categories found to assign products to.");
    const cat = catList[0];

    // Fetch existing product names to avoid N+1 check queries
    const { data: existingData, error: existingErr } = await supabase
      .from('products')
      .select('name')
      .eq('business_id', biz.id);
      
    if (existingErr) throw existingErr;
    const existingNames = new Set(existingData.map(p => p.name));

    const productsToInsert = [];
    const itemAvailabilityMap = new Map();

    for (const item of items) {
      if (existingNames.has(item.name)) {
        // Only log sporadically if there are too many to avoid noise
        continue;
      }

      console.log(`Preparing to import: ${item.name}`);
      const priceVal = item.price ? parseFloat(item.price.replace(/[^0-9.]/g, '')) : 0;
      
      productsToInsert.push({
        business_id: biz.id,
        category_id: cat.id,
        name: item.name,
        description: item.description || '',
        price: priceVal,
        cost: priceVal * 0.5, // estimate
        images: item.image_url ? [item.image_url] : [],
        status: item.availability === 'in stock' ? 'active' : 'draft',
        custom_attributes: { ui_type: 'stock', delivery_enabled: true }
      });
      
      itemAvailabilityMap.set(item.name, item.availability === 'in stock' ? 10 : 0);
    }

    if (productsToInsert.length === 0) {
      console.log('No new products to import.');
      return;
    }

    // Bulk Insert Products
    console.log(`Bulk inserting ${productsToInsert.length} new products...`);
    const { data: insertedProducts, error: insertErr } = await supabase
      .from('products')
      .insert(productsToInsert)
      .select();

    if (insertErr) {
      throw insertErr;
    }

    // Bulk Insert Inventory
    const inventoryToInsert = insertedProducts.map(prod => ({
      product_id: prod.id,
      quantity: itemAvailabilityMap.get(prod.name) || 0
    }));

    if (inventoryToInsert.length > 0) {
      console.log(`Bulk inserting inventory for ${inventoryToInsert.length} products...`);
      const { error: invErr } = await supabase.from('inventory').insert(inventoryToInsert);
      if (invErr) throw invErr;
    }

    console.log(`✅ Successfully imported ${insertedProducts.length} new products into Bazarito!`);

  } catch (error) {
    console.error('Script error:', error);
  }
}

importProducts();
