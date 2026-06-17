import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const FB_GRAPH_API = "https://graph.facebook.com/v19.0"

serve(async (req) => {
  try {
    const payload = await req.json()
    
    const product = payload.type === 'DELETE' ? payload.old_record : payload.record
    
    if (!product || payload.table !== 'products') {
      return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400 })
    }

    const fbCatalogId = Deno.env.get('FB_CATALOG_ID')
    const fbAccessToken = Deno.env.get('FB_ACCESS_TOKEN')

    if (!fbCatalogId || !fbAccessToken) {
      console.error("Missing Facebook API credentials")
      return new Response(JSON.stringify({ error: "Missing config" }), { status: 500 })
    }
    
    // We only want to sync active or out-of-stock products.
    const isAvailable = product.status === 'active'
    
    let imageUrl = "https://bazaritocancun.com/placeholder.png"
    if (product.images && product.images.length > 0) {
      let rawUrl = product.images[0];
      if (typeof rawUrl === 'string') {
        rawUrl = rawUrl.replace(/^\[\s*"?|"?\s*\]$/g, '').replace(/^"|"$/g, '');
      }
      if (rawUrl && rawUrl.startsWith('http')) {
        imageUrl = rawUrl;
      }
    }

    const batchPayload = {
      allow_upsert: true,
      requests: [
        {
          method: payload.type === 'DELETE' ? 'DELETE' : 'UPDATE',
          retailer_id: product.id,
          data: {
            availability: isAvailable ? "in stock" : "out of stock",
            brand: "Bazarito",
            condition: "new",
            description: product.description || product.name || "Producto Bazarito",
            image_url: imageUrl,
            name: product.name,
            price: Math.round(product.price * 100),
            currency: "MXN",
            url: `https://bazaritocancun.com/catalog?product=${product.id}`
          }
        }
      ]
    }

    const fbResponse = await fetch(`${FB_GRAPH_API}/${fbCatalogId}/batch?access_token=${fbAccessToken}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(batchPayload)
    })

    const fbResult = await fbResponse.json()

    if (!fbResponse.ok) {
      console.error("Facebook API Error:", fbResult)
      throw new Error(JSON.stringify(fbResult))
    }

    console.log("Synced to Facebook Catalog:", fbResult)
    return new Response(JSON.stringify({ success: true, result: fbResult }), {
      headers: { "Content-Type": "application/json" }
    })

  } catch (error) {
    console.error("Function error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
