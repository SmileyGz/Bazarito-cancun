// Supabase Edge Function: create-preference
// Deno runtime — deployed to Supabase Edge Functions

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  try {
    const {
      payment_type,   // 'deposit' | 'full'
      product_id,
      product_name,
      product_price,
      delivery_type,  // 'pickup' | 'delivery'
      delivery_zone,  // 'short' | 'long' | 'night' | null
      delivery_fee,   // number
      customer_name,
      customer_phone,
    } = await req.json();

    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'MP access token not configured' }), {
        status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    // ── Build MP Preference items ────────────────────────────────────────────
    let items = [];

    if (payment_type === 'deposit') {
      // Charge only the delivery deposit amount
      items = [{
        id:          `delivery-deposit-${product_id}`,
        title:       `Anticipo de envío — ${product_name}`,
        description: `Depósito de entrega (zona: ${delivery_zone}). El producto se paga en efectivo al recibirlo.`,
        quantity:    1,
        unit_price:  delivery_fee,
        currency_id: 'MXN',
      }];
    } else {
      // Charge product + delivery fee
      items = [
        {
          id:          product_id,
          title:       product_name,
          quantity:    1,
          unit_price:  product_price,
          currency_id: 'MXN',
        },
      ];
      if (delivery_fee > 0) {
        items.push({
          id:          `delivery-fee-${product_id}`,
          title:       `Envío a domicilio (zona: ${delivery_zone})`,
          quantity:    1,
          unit_price:  delivery_fee,
          currency_id: 'MXN',
        });
      }
    }

    // ── Build preference payload ─────────────────────────────────────────────
    const preference = {
      items,
      payer: {
        name:  customer_name,
        phone: { number: customer_phone },
      },
      metadata: {
        product_id,
        product_name,
        payment_type,
        delivery_type,
        delivery_zone:  delivery_zone || 'pickup',
        delivery_fee:   delivery_fee  || 0,
        customer_name,
        customer_phone,
      },
      back_urls: {
        success: 'https://smileygz.github.io/Bazarito-cancun/',
        failure: 'https://smileygz.github.io/Bazarito-cancun/',
        pending: 'https://smileygz.github.io/Bazarito-cancun/',
      },
      auto_return:        'approved',
      statement_descriptor: 'Bazarito Cancun',
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-webhook`,
    };

    // ── Call MP API ──────────────────────────────────────────────────────────
    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preference),
    });

    if (!mpRes.ok) {
      const errBody = await mpRes.text();
      console.error('MP API error status:', mpRes.status, 'body:', errBody);
      let detail = errBody;
      try { detail = JSON.parse(errBody)?.message || JSON.parse(errBody)?.code || errBody; } catch {}
      return new Response(JSON.stringify({ error: `MP Error ${mpRes.status}: ${detail}` }), {
        status: 502, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const mpData = await mpRes.json();

    return new Response(
      JSON.stringify({ preference_id: mpData.id, init_point: mpData.init_point }),
      { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } },
    );

  } catch (err) {
    console.error('create-preference error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
