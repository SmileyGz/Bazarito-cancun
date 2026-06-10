// Supabase Edge Function: generate-copy
// Securely proxies Gemini AI requests — the API key never leaves the server.
// Deploy with: npx supabase functions deploy generate-copy
// Set secret with: npx supabase secrets set GEMINI_API_KEY=<your-key>

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const CATEGORY_LABELS: Record<string, string> = {
  hogar:     'Hogar y Decoración',
  gadgets:   'Gadgets y Tecnología',
  mascotas:  'Mascotas',
  bienestar: 'Bienestar y Salud',
};

function buildPrompt(keywords: string, category: string, price: string): string {
  return `
Eres el copywriter de Bazarito Cancún, una tienda local en Cancún México con un estilo cálido, tropical y cercano.
Los clientes compran por Facebook Messenger y esperan respuestas amigables y directas.

Tu misión: generar el NOMBRE y la DESCRIPCIÓN de un producto para la tienda.

Datos del producto:
- Palabras clave / descripción breve: "${keywords}"
- Categoría: ${CATEGORY_LABELS[category] || category}
- Precio: ${price ? '$' + price + ' MXN' : 'no especificado'}

Reglas:
1. El nombre debe ser corto (máx 6 palabras), atractivo y en español México.
2. La descripción debe tener 2-3 oraciones. Tono: amigable, directo, menciona por qué es útil o especial.
3. No uses palabras genéricas como "producto", "artículo", "item". Sé creativo.
4. No uses emojis en el nombre. Puedes usar 1-2 emojis en la descripción.
5. Responde SOLO con JSON válido en este formato exacto:
{"name": "...", "description": "..."}
`;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
    });
  }

  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
  if (!GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured on server' }), {
      status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { keywords, category, price } = await req.json();

    if (!keywords?.trim()) {
      return new Response(JSON.stringify({ error: 'keywords is required' }), {
        status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(keywords, category || 'hogar', price || '') }] }],
        generationConfig: {
          temperature: 0.85,
          maxOutputTokens: 256,
          responseMimeType: 'application/json',
        }
      })
    });

    if (!geminiRes.ok) {
      const errBody = await geminiRes.json().catch(() => ({}));
      throw new Error(errBody?.error?.message || `Gemini API error ${geminiRes.status}`);
    }

    const geminiData = await geminiRes.json();
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response from Gemini');

    // Strip any markdown code fences Gemini might add
    const clean = text.replace(/```json\n?|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
    });
  }
});
