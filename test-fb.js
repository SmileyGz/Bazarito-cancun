

const FB_CATALOG_ID = "2142999566151921";
const FB_ACCESS_TOKEN = "EAAOFTaVf9YgBRkvgpU1ayo8KwS78XzDMiG3E194uK14YKtVczbK7B54e6tJY6dqeO6JwWUmJGhaUx1ZCZCjsUx72yeOpqAZApNs8G1J6cgwroZCZAtOs1cEw0F2IOSVLhpjaJp59E4qFaT3M10maTJ42MQMISmIRstdlG8J63WOgiZCZACRRiZC5gnXWf6jDsHG1asew17tlRyFZANkZCemZBmJ6Trw5OFJm46CugZDZD";

async function test() {
  const req = {
    allow_upsert: true,
    requests: [
      {
        method: "UPDATE",
        retailer_id: "test1234",
        data: {
          availability: "in stock",
          brand: "Bazarito",
          condition: "new",
          description: "Test",
          image_url: "https://bazaritocancun.com/placeholder.png",
          name: "Test Product",
          price: 1000,
          currency: "MXN",
          url: "https://bazaritocancun.com/test"
        }
      }
    ]
  };

  const res = await fetch(`https://graph.facebook.com/v19.0/${FB_CATALOG_ID}/batch?access_token=${FB_ACCESS_TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req)
  });

  const result = await res.json();
  console.log(JSON.stringify(result, null, 2));
}
test();
