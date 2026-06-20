---
name: mercadopago_integration
description: Mercado Pago Checkout Pro Integration (React + Supabase)
---

# Skill: Mercado Pago Checkout Pro Integration (React + Supabase)

## Description
This skill provides a complete, robust, and production-ready integration of Mercado Pago Checkout Pro (Wallet Brick) for a React/Vite frontend using Supabase Edge Functions as the backend.

**Use this skill to instruct an AI Agent on how to implement Mercado Pago in a new project without repeating common pitfalls.**

---

## 1. Prerequisites & Environment Variables

### Frontend (`.env`)
The frontend requires the **Public Key**. It is safe to expose.
```env
# Must start with APP_USR- (Production) or TEST- (Sandbox)
# DO NOT USE PLACEHOLDERS OR IT WILL FAIL SILENTLY
VITE_MP_PUBLIC_KEY=APP_USR-your-public-key
```

### Backend (Supabase Secrets)
The backend requires the **Access Token**. It must be stored securely in Supabase Vault/Secrets.
Run this command in the Supabase CLI or set it in the Dashboard:
```bash
supabase secrets set MERCADOPAGO_ACCESS_TOKEN=APP_USR-your-long-access-token
```
> **CRITICAL PITFALL AVOIDANCE:** 
> 1. Do NOT confuse the Public Key with the Access Token. The Access Token is much longer and is the only one authorized to create preferences. Using a Public Key in the backend will result in a `403 PA_UNAUTHORIZED_RESULT_FROM_POLICIES` error.
> 2. If using a Production token (`APP_USR-`), the application MUST be activated in the Mercado Pago Developer Dashboard ("Ir a producción"). Otherwise, the API will return a 403 error. For testing before activation, use Sandbox credentials (`TEST-`).

---

## 2. Frontend Component: MercadoPagoWallet.jsx
*Dependencies:* None (SDK loads dynamically).

Create this component to render the Wallet Brick. 
> **CRITICAL PITFALL AVOIDANCE:** This code contains a robust `useEffect` cleanup specifically designed to prevent React 18/19 Strict Mode double-mounting issues. Without this specific cleanup, the Mercado Pago SDK might mount twice on the same DOM element, causing the button to remain invisible/blank without throwing explicit errors.

```jsx
import React, { useEffect, useRef } from 'react';

// Mercado Pago SDK is loaded via script tag injected once
let sdkPromise = null;
function loadMPSdk() {
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    if (window.MercadoPago) { resolve(window.MercadoPago); return; }
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.onload = () => resolve(window.MercadoPago);
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return sdkPromise;
}

export default function MercadoPagoWallet({ preferenceId, onError }) {
  const containerRef = useRef(null);
  const brickRef     = useRef(null);

  useEffect(() => {
    if (!preferenceId) return;

    let destroyed = false;
    let activeBrick = null;

    loadMPSdk().then((MercadoPago) => {
      if (destroyed || !containerRef.current) return;

      const mp = new MercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY, { locale: 'es-MX' });
      const bricksBuilder = mp.bricks();

      // Clear any previous elements to avoid duplicates/stale state
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }

      bricksBuilder.create('wallet', 'mp-wallet-container', {
        initialization: { preferenceId },
        callbacks: {
          onError: (err) => {
            console.error('MP Wallet error', err);
            if (!destroyed && onError) onError(err);
          },
        },
      }).then((brick) => {
        if (destroyed) {
          brick.unmount();
        } else {
          activeBrick = brick;
          brickRef.current = brick;
        }
      });
    }).catch((err) => {
      console.error('Failed to load MP SDK', err);
      if (!destroyed && onError) onError(err);
    });

    return () => {
      destroyed = true;
      if (activeBrick) {
        activeBrick.unmount();
      }
    };
  }, [preferenceId]);

  if (!preferenceId) return null;

  return (
    <div>
      <div id="mp-wallet-container" ref={containerRef} style={{ minHeight: 60 }} />
    </div>
  );
}
```

---

## 3. Supabase Edge Function: create-preference

This function creates the payment preference. It requires `VITE_SUPABASE_ANON_KEY` or an authenticated token to be called from the frontend.

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const payload = await req.json();
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');

    if (!accessToken) {
      throw new Error('MP access token not configured');
    }

    // Adjust items to your business logic
    const preference = {
      items: [
        {
          id: payload.product_id,
          title: payload.product_name,
          quantity: 1,
          unit_price: payload.price,
          currency_id: 'MXN',
        }
      ],
      payer: {
        name: payload.customer_name,
        email: payload.customer_email || 'test_user_123@testuser.com', // MP often requires an email
      },
      metadata: {
        custom_order_id: payload.order_id
      },
      back_urls: {
        success: payload.success_url || 'https://yourwebsite.com/success',
        failure: payload.failure_url || 'https://yourwebsite.com/failure',
        pending: payload.pending_url || 'https://yourwebsite.com/pending',
      },
      auto_return: 'approved',
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-webhook`,
    };

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preference),
    });

    if (!mpRes.ok) {
      const errBody = await mpRes.text();
      let detail = errBody;
      try { detail = JSON.parse(errBody)?.message || errBody; } catch {}
      throw new Error(`MP API Error ${mpRes.status}: ${detail}`);
    }

    const mpData = await mpRes.json();

    return new Response(JSON.stringify({ preference_id: mpData.id, init_point: mpData.init_point }), { 
      status: 200, 
      headers: { ...CORS, 'Content-Type': 'application/json' } 
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
```

---

## 4. Supabase Edge Function: payment-webhook

This function listens for updates from Mercado Pago and updates the database. Remember to configure this URL in the Mercado Pago Dashboard under Webhooks (IPN) -> `https://[PROJECT-REF].supabase.co/functions/v1/payment-webhook`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = { 'Access-Control-Allow-Origin': '*' };

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const url = new URL(req.url);
    const topic = url.searchParams.get('topic') || url.searchParams.get('type');
    const id = url.searchParams.get('id') || url.searchParams.get('data.id');

    if (topic !== 'payment') {
      return new Response('ignored', { status: 200, headers: CORS });
    }

    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    
    // Fetch payment details to verify it's legitimate
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!mpRes.ok) return new Response('MP lookup failed', { status: 502, headers: CORS });

    const payment = await mpRes.json();
    
    if (payment.status === 'approved') {
      // Process order creation / status update in Supabase
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const customOrderId = payment.metadata?.custom_order_id;
      
      if (customOrderId) {
         await supabase.from('orders').update({ status: 'paid' }).eq('id', customOrderId);
      }
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS });
  }
});
```

## Agent Usage Instructions
To implement this skill in a new project:
1. Ensure the frontend has `VITE_MP_PUBLIC_KEY`.
2. Ensure Supabase has `MERCADOPAGO_ACCESS_TOKEN`.
3. Create the two Supabase Edge Functions as described.
4. Copy `MercadoPagoWallet.jsx` into the components directory.
5. In the checkout flow, first call the `create-preference` function to get the `preference_id`.
6. Once the `preference_id` is obtained, render `<MercadoPagoWallet preferenceId={preferenceId} />`.
