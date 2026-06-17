import dotenv from 'dotenv';
dotenv.config();

const FB_CATALOG_ID = "2142999566151921";
const FB_ACCESS_TOKEN = "EAAOFTaVf9YgBRkvgpU1ayo8KwS78XzDMiG3E194uK14YKtVczbK7B54e6tJY6dqeO6JwWUmJGhaUx1ZCZCjsUx72yeOpqAZApNs8G1J6cgwroZCZAtOs1cEw0F2IOSVLhpjaJp59E4qFaT3M10maTJ42MQMISmIRstdlG8J63WOgiZCZACRRiZC5gnXWf6jDsHG1asew17tlRyFZANkZCemZBmJ6Trw5OFJm46CugZDZD";
const FB_GRAPH_API = "https://graph.facebook.com/v19.0";

async function checkDups() {
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
    
    let original = 0;
    let fromBazarito = 0;

    for (const item of items) {
        if (uuidRegex.test(item.retailer_id)) {
            fromBazarito++;
        } else {
            original++;
        }
    }
    console.log(`From Bazarito (UUID retailer_id): ${fromBazarito}`);
    console.log(`Original FB items: ${original}`);
}

checkDups();
