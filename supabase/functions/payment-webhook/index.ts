// Supabase Edge Function: payment-webhook
// Receives Mercado Pago IPN/Webhook notifications and records orders in Supabase

import { serve }        from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature, x-request-id',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  try {
    const url    = new URL(req.url);
    const topic  = url.searchParams.get('topic') || url.searchParams.get('type');
    const id     = url.searchParams.get('id') || url.searchParams.get('data.id');

    // MP sends different event types — we only care about payment events
    if (topic !== 'payment' && topic !== 'merchant_order') {
      return new Response('ignored', { status: 200, headers: CORS });
    }

    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!accessToken || !supabaseUrl || !supabaseKey) {
      return new Response('Missing env vars', { status: 500, headers: CORS });
    }

    // ── Fetch payment details from MP ────────────────────────────────────────
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!mpRes.ok) {
      console.error('Failed to fetch payment from MP:', await mpRes.text());
      return new Response('MP lookup failed', { status: 502, headers: CORS });
    }

    const payment = await mpRes.json();
    console.log('MP Payment status:', payment.status, 'id:', payment.id);

    // Only process approved payments
    if (payment.status !== 'approved') {
      return new Response(`Payment not approved (${payment.status})`, { status: 200, headers: CORS });
    }

    // ── Extract metadata embedded by create-preference ───────────────────────
    const meta = payment.metadata || {};
    const {
      product_id,
      product_name,
      payment_type,   // 'deposit' | 'full'
      delivery_type,
      delivery_zone,
      delivery_fee,
      customer_name,
      customer_phone,
    } = meta;

    // ── Write order to Supabase ──────────────────────────────────────────────
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get business id for bazarito
    const { data: biz } = await supabase
      .from('businesses')
      .select('id')
      .eq('slug', 'bazarito')
      .single();

    if (!biz) {
      console.error('Business not found');
      return new Response('Business not found', { status: 500, headers: CORS });
    }

    // Fetch product to get cost and price
    const { data: prod } = await supabase
      .from('products')
      .select('*, inventory(quantity), custom_attributes')
      .eq('id', product_id)
      .single();

    if (!prod) {
      console.error('Product not found:', product_id);
      return new Response('Product not found', { status: 200, headers: CORS }); // don't retry
    }

    const unitPrice   = prod.price;
    const delivFee    = Number(delivery_fee) || 0;
    const orderStatus = payment_type === 'full' ? 'paid' : 'pending_delivery'; // pending = deposit paid, cash due on delivery
    const payMethod   = 'mercadopago';
    const notes       = [
      `MP Payment ID: ${payment.id}`,
      `Tipo: ${payment_type === 'full' ? 'Pago total' : 'Anticipo de envío'}`,
      `Cliente: ${customer_name} | ${customer_phone}`,
      delivery_zone ? `Zona: ${delivery_zone}` : '',
    ].filter(Boolean).join(' · ');

    // Create order
    const orderTotal = payment_type === 'full' ? unitPrice + delivFee : delivFee;
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert([{
        business_id: biz.id,
        total:       orderTotal,
        source:      delivery_type || 'delivery',
        pay_method:  payMethod,
        status:      orderStatus,
        notes,
      }])
      .select()
      .single();

    if (orderErr) {
      console.error('Order insert error:', orderErr);
      return new Response('DB error', { status: 500, headers: CORS });
    }

    // Create order item
    await supabase.from('order_items').insert([{
      order_id:   order.id,
      product_id: prod.id,
      quantity:   1,
      unit_price: unitPrice,
      unit_cost:  prod.cost,
    }]);

    // ── If full payment, mark product as sold ────────────────────────────────
    if (payment_type === 'full') {
      const isOneOff = prod.custom_attributes?.ui_type === 'one_off';
      if (isOneOff) {
        await supabase.from('products').update({ status: 'archived' }).eq('id', prod.id);
      } else {
        const currentStock = prod.inventory?.quantity || 0;
        const newStock     = Math.max(0, currentStock - 1);
        await supabase.from('inventory').update({ quantity: newStock }).eq('product_id', prod.id);
        if (newStock === 0) {
          await supabase.from('products').update({ status: 'draft' }).eq('id', prod.id);
        }
      }
    }

    console.log(`Order ${order.id} created for product ${product_id} — ${payment_type}`);
    return new Response(JSON.stringify({ ok: true, order_id: order.id }), {
      status: 200, headers: { ...CORS, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('payment-webhook error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
