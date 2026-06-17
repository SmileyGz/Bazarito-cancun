import dotenv from 'dotenv';
dotenv.config();

const FB_CATALOG_ID = "2142999566151921";
const FB_ACCESS_TOKEN = "EAAOFTaVf9YgBRkvgpU1ayo8KwS78XzDMiG3E194uK14YKtVczbK7B54e6tJY6dqeO6JwWUmJGhaUx1ZCZCjsUx72yeOpqAZApNs8G1J6cgwroZCZAtOs1cEw0F2IOSVLhpjaJp59E4qFaT3M10maTJ42MQMISmIRstdlG8J63WOgiZCZACRRiZC5gnXWf6jDsHG1asew17tlRyFZANkZCemZBmJ6Trw5OFJm46CugZDZD";
const FB_GRAPH_API = "https://graph.facebook.com/v19.0";

async function deleteDups() {
    console.log("Fetching all products from Facebook Catalog...");
    let url = `${FB_GRAPH_API}/${FB_CATALOG_ID}/products?access_token=${FB_ACCESS_TOKEN}&fields=id,retailer_id,name&limit=100`;
    let items = [];
    while (url) {
        const res = await fetch(url);
        const json = await res.json();
        if (json.data) items = items.concat(json.data);
        url = json.paging && json.paging.next ? json.paging.next : null;
    }
    
    console.log(`Total items in FB: ${items.length}`);
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    const itemsToDelete = items.filter(item => !uuidRegex.test(item.retailer_id));
    console.log(`Found ${itemsToDelete.length} old products to delete.`);

    if (itemsToDelete.length === 0) {
        console.log("No old products found. Everything is clean!");
        return;
    }

    const batchSize = 50;
    let deletedCount = 0;

    for (let i = 0; i < itemsToDelete.length; i += batchSize) {
        const chunk = itemsToDelete.slice(i, i + batchSize);
        
        const requests = chunk.map(item => {
            return {
                method: "DELETE",
                retailer_id: item.retailer_id
            };
        });

        const batchPayload = {
            requests: requests
        };

        const res = await fetch(`${FB_GRAPH_API}/${FB_CATALOG_ID}/batch?access_token=${FB_ACCESS_TOKEN}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(batchPayload)
        });

        const result = await res.json();
        if (result.validation_status) {
            console.error("Facebook Batch Error:", JSON.stringify(result.validation_status, null, 2));
        } else {
            deletedCount += chunk.length;
            console.log(`Deleted batch of ${chunk.length} old products...`);
        }
    }

    console.log(`✅ Successfully deleted ${deletedCount} old products from Facebook Catalog!`);
}

deleteDups();
