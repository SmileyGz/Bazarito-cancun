import { supabase } from '../src/lib/supabase';

export const revalidate = 3600; // 1 hour

export default async function sitemap() {
  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .not('slug', 'is', null);

  const productUrls = (products || []).map((product) => ({
    url: `https://bazaritocancun.com/p/${product.slug}`,
    lastModified: product.updated_at || new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [
    {
      url: 'https://bazaritocancun.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...productUrls,
  ];
}
