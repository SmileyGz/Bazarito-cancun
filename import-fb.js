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

    // Get default category and supplier
    let { data: catList } = await supabase.from('categories').select('id').eq('business_id', biz.id).limit(1);
    if (!catList || catList.length === 0) throw new Error("No categories found to assign products to.");
    const cat = catList[0];

    let insertedCount = 0;
    for (const item of items) {
      // Check if product already exists
      const { data: existing } = await supabase.from('products').select('id').eq('name', item.name).eq('business_id', biz.id).single();
      if (existing) {
        console.log(`Skipping ${item.name} (already exists)`);
        continue;
      }

      console.log(`Importing: ${item.name}`);
      const priceVal = item.price ? parseFloat(item.price.replace(/[^0-9.]/g, '')) : 0;
      
      const { data: prod, error: err } = await supabase.from('products').insert([{
        business_id: biz.id,
        category_id: cat.id,
        name: item.name,
        description: item.description || '',
        price: priceVal,
        cost: priceVal * 0.5, // estimate
        images: item.image_url ? [item.image_url] : [],
        status: item.availability === 'in stock' ? 'active' : 'draft',
        custom_attributes: { ui_type: 'stock', delivery_enabled: true }
      }]).select().single();

      if (err) {
        console.error('Error inserting product:', err.message);
        continue;
      }

      // Add inventory
      await supabase.from('inventory').insert([{
        product_id: prod.id,
        quantity: item.availability === 'in stock' ? 10 : 0
      }]);
      
      insertedCount++;
    }

    console.log(`✅ Successfully imported ${insertedCount} new products into Bazarito!`);

  } catch (error) {
    console.error('Script error:', error);
  }
}

importProducts();
