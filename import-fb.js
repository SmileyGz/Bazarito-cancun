import { createClient } from '@supabase/supabase-js';

const FB_CATALOG_ID = "2142999566151921";
const FB_ACCESS_TOKEN = "EAAOFTaVf9YgBRkvgpU1ayo8KwS78XzDMiG3E194uK14YKtVczbK7B54e6tJY6dqeO6JwWUmJGhaUx1ZCZCjsUx72yeOpqAZApNs8G1J6cgwroZCZAtOs1cEw0F2IOSVLhpjaJp59E4qFaT3M10maTJ42MQMISmIRstdlG8J63WOgiZCZACRRiZC5gnXWf6jDsHG1asew17tlRyFZANkZCemZBmJ6Trw5OFJm46CugZDZD";
const SUPABASE_URL = "https://samwziooqhzohpszyddw.supabase.co";
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function importProducts() {
  console.log('Fetching products from Facebook Catalog...');
  try {
    const res = await fetch(`https://graph.facebook.com/v18.0/${FB_CATALOG_ID}/products?access_token=${FB_ACCESS_TOKEN}&fields=name,description,price,image_url,availability,retailer_id,id`);
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

    // Fetch existing products and their inventory to map by name
    const { data: existingData, error: existingErr } = await supabase
      .from('products')
      .select('*, inventory(quantity)')
      .eq('business_id', biz.id);
      
    if (existingErr) throw existingErr;
    const existingMap = new Map();
    existingData.forEach(p => existingMap.set(p.name, p));

    const fbNamesSeen = new Set();
    let updatedCount = 0;
    const productsToInsert = [];
    const productsToUpdate = [];
    const inventoryToUpsert = [];
    const itemAvailabilityMap = new Map();

    for (const item of items) {
      fbNamesSeen.add(item.name);
      const priceVal = item.price ? parseFloat(item.price.replace(/[^0-9.]/g, '')) : 0;
      const statusVal = item.availability === 'in stock' ? 'active' : 'draft';
      const quantityVal = item.availability === 'in stock' ? 10 : 0;
      const fbId = item.id;

      if (existingMap.has(item.name)) {
        // Update existing product
        const existing = existingMap.get(item.name);
        
        // Merge custom_attributes
        const newCustom = { ...(existing.custom_attributes || {}), fb_id: fbId };

        // We prepare the full row for upsert to avoid overwriting missing columns
        // We delete joined tables from the object before upsert
        const { inventory, ...existingRow } = existing;
        
        productsToUpdate.push({
          ...existingRow,
          price: priceVal,
          description: item.description || '',
          status: statusVal,
          custom_attributes: newCustom
        });

        // Update inventory logic
        if (statusVal === 'active') {
          const invQty = inventory && inventory.length > 0 ? inventory[0].quantity : (inventory?.quantity ?? 0);
          if (invQty === 0 || !inventory) {
            inventoryToUpsert.push({ product_id: existing.id, quantity: 10 });
          }
        } else {
          inventoryToUpsert.push({ product_id: existing.id, quantity: 0 });
        }

        updatedCount++;
      } else {
        // Insert new
        productsToInsert.push({
          business_id: biz.id,
          category_id: cat.id,
          name: item.name,
          description: item.description || '',
          price: priceVal,
          cost: priceVal * 0.5,
          images: item.image_url ? [item.image_url] : [],
          status: statusVal,
          custom_attributes: { ui_type: 'stock', delivery_enabled: true, fb_id: fbId }
        });
        
        // We'll insert inventory for new products after we get their IDs
        itemAvailabilityMap.set(item.name, quantityVal);
      }
    }

    if (productsToUpdate.length > 0) {
      console.log(`Bulk updating ${productsToUpdate.length} existing products...`);
      await supabase.from('products').upsert(productsToUpdate);
    }

    if (productsToInsert.length > 0) {
      console.log(`Bulk inserting ${productsToInsert.length} new products...`);
      const { data: insertedProducts, error: insertErr } = await supabase
        .from('products')
        .insert(productsToInsert)
        .select();

      if (insertErr) throw insertErr;

      const newInventoryToInsert = insertedProducts.map(prod => ({
        product_id: prod.id,
        quantity: itemAvailabilityMap.get(prod.name) || 0
      }));
      inventoryToUpsert.push(...newInventoryToInsert);

      console.log(`✅ Inserted ${productsToInsert.length} new products.`);
    }

    if (inventoryToUpsert.length > 0) {
      console.log(`Bulk updating inventory for ${inventoryToUpsert.length} products...`);
      await supabase.from('inventory').upsert(inventoryToUpsert, { onConflict: 'product_id' });
    }

    // Purge Stale Items (Items in DB but not in FB feed anymore)
    let archivedCount = 0;
    const productsToArchive = [];
    for (const [name, p] of existingMap.entries()) {
      if (!fbNamesSeen.has(name) && p.status !== 'archived') {
        const { inventory, ...existingRow } = p;
        productsToArchive.push({ ...existingRow, status: 'archived' });
        archivedCount++;
      }
    }
    if (productsToArchive.length > 0) {
      console.log(`Bulk archiving ${productsToArchive.length} stale products...`);
      await supabase.from('products').upsert(productsToArchive);
    }

    console.log(`✅ Synchronization complete. Updated: ${updatedCount}. Inserted: ${productsToInsert.length}. Archived (Stale): ${archivedCount}.`);

  } catch (error) {
    console.error('Script error:', error);
  }
}

importProducts();
