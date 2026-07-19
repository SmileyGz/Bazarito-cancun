import { supabase } from '../../../src/lib/supabase';
import ClientPage from './ClientPage';
import { notFound } from 'next/navigation';

export const revalidate = 3600; // 1 hour

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { data } = await supabase.from('products').select('*').eq('slug', slug).single();
  
  if (!data) {
    return { title: 'Producto no encontrado | Bazarito Cancún' };
  }

  const getValidImages = () => {
    let imgs = data.images?.length ? data.images : (data.image ? [data.image] : []);
    imgs = imgs.map(img => img.includes('social-cover.jpg') ? 'https://bazaritocancun.com/Logo.png' : img);
    if (imgs.length === 0) imgs = ['https://bazaritocancun.com/Logo.png'];
    return imgs.map(url => ({ url }));
  };

  return {
    title: `${data.name} | Bazarito Cancún ☀️`,
    description: data.description || 'Encuentra lo que necesitas con entrega rápida en Cancún. Pago seguro con MercadoPago.',
    alternates: {
      canonical: `/p/${slug}`,
    },
    openGraph: {
      title: `${data.name} | Bazarito Cancún ☀️`,
      description: data.description || 'Producto disponible con entrega en Cancún.',
      images: getValidImages(),
      locale: 'es_MX',
      siteName: 'Bazarito Cancún',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${data.name} | Bazarito Cancún ☀️`,
      description: data.description || 'Producto disponible con entrega en Cancún.',
      images: getValidImages().map(img => img.url),
    },
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const { data, error } = await supabase.from('products').select('*, inventory(quantity)').eq('slug', slug).single();
  
  if (!data || error) {
    notFound();
  }

  const mappedProduct = {
    ...data,
    category: data.category_id || 'hogar',
    stock: data.inventory?.quantity != null ? data.inventory.quantity : null,
    type: data.custom_attributes?.ui_type || (data.inventory ? 'stock' : 'one_off'),
    variants: data.custom_attributes?.variants || [],
    delivery_enabled: data.custom_attributes?.delivery_enabled !== false,
  };

  return <ClientPage product={mappedProduct} />;
}
