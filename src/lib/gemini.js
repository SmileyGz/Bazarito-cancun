// ─── Gemini AI Utility ────────────────────────────────────────────────────
// Calls the Supabase Edge Function "generate-copy" which securely proxies
// requests to Gemini. The API key lives in Supabase Secrets, never in the browser.

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const EDGE_URL          = `${SUPABASE_URL}/functions/v1/generate-copy`;

export async function generateProductCopy({ keywords, category, price }) {
  const response = await fetch(EDGE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ keywords, category, price }),
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error || `Error ${response.status}`);
  }

  return data; // { name: "...", description: "..." }
}
