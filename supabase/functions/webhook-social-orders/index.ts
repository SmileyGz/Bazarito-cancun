import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const payload = await req.json()
    
    // Create Supabase Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ error: "DB missing" }), { status: 500 })
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    let orderSource = "unknown"
    let items = []
    
    // Parse Meta Webhook
    // Facebook orders send a payload to "commerce_account"
    if (payload.object === "commerce_account") {
      orderSource = "facebook"
      // Extract items from Facebook webhook payload (simplified)
      // Actual implementation requires Graph API call to fetch order details
      // using the Order ID provided in the webhook.
      const orderId = payload.entry?.[0]?.changes?.[0]?.value?.order_id
      if (orderId) {
        console.log(`Received Facebook order: ${orderId}`)
        // Fetch order details from Graph API using FB_ACCESS_TOKEN here...
        // For now, we stub an item deduction:
        // items = [{ retailer_id: "uuid-of-product", quantity: 1 }]
      }
    }
    
    // Parse TikTok Webhook
    if (payload.type === 1) { // TikTok typically uses type=1 for orders
      orderSource = "tiktok"
      console.log(`Received TikTok order`)
      // items = [{ sku: "uuid-of-product", quantity: 1 }]
    }

    // Process Inventory Deduction
    for (const item of items) {
      const productId = item.retailer_id || item.sku
      const quantitySold = item.quantity

      if (!productId) continue

      // Get current inventory
      const { data: inv } = await supabase
        .from('inventory')
        .select('quantity')
        .eq('product_id', productId)
        .single()
        
      if (inv) {
        const newStock = Math.max(0, inv.quantity - quantitySold)
        await supabase
          .from('inventory')
          .update({ quantity: newStock })
          .eq('product_id', productId)
          
        if (newStock === 0) {
          await supabase
            .from('products')
            .update({ status: 'draft' }) // out of stock
            .eq('id', productId)
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    })

  } catch (error) {
    console.error("Webhook error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
