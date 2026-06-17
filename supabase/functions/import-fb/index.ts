import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const FB_CATALOG_ID = Deno.env.get('FB_CATALOG_ID');
    const FB_ACCESS_TOKEN = Deno.env.get('FB_ACCESS_TOKEN');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log('Fetching products from Facebook Catalog...');
    let url = `https://graph.facebook.com/v18.0/${FB_CATALOG_ID}/products?access_token=${FB_ACCESS_TOKEN}&fields=name,description,price,image_url,availability,retailer_id&limit=100`;
    let items = [];
    
    while (url) {
      const res = await fetch(url);
      const json = await res.json();
      
      if (json.error) {
        return new Response(JSON.stringify({ error: json.error }), { headers: { 'Content-Type': 'application/json' }, status: 400 });
      }

      const fetchedItems = json.data || [];
      items = items.concat(fetchedItems);
      
      url = json.paging && json.paging.next ? json.paging.next : null;
    }

    console.log(`Found ${items.length} products in Facebook Catalog.`);

    if (items.length === 0) {
        return new Response(JSON.stringify({ message: "No products found" }), { headers: { 'Content-Type': 'application/json' } });
    }

    // Get Business ID
    const { data: biz } = await supabase.from('businesses').select('id').eq('slug', 'bazarito').single();
    if (!biz) throw new Error('Business not found');

    let { data: catList } = await supabase.from('categories').select('id').eq('business_id', biz.id).limit(1);
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
        category_id: cat?.id || null,
        name: item.name,
        description: item.description || '',
        price: priceVal,
        cost: priceVal * 0.5,
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

    return new Response(JSON.stringify({ message: `Successfully imported ${insertedCount} new products into Bazarito!` }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})
