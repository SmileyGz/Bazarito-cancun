import { supabase } from '../../../src/lib/supabase';
import ClientPage from './ClientPage';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const { data } = await supabase.from('products').select('*').eq('id', id).single();
  
  if (!data) {
    return { title: 'Producto no encontrado | Bazarito Cancún' };
  }

  return {
    title: `${data.name} | Bazarito Cancún ☀️`,
    description: data.description || 'Encuentra lo que necesitas con entrega rápida en Cancún. Pago seguro con MercadoPago.',
    openGraph: {
      title: `${data.name} | Bazarito Cancún ☀️`,
      description: data.description || 'Producto disponible con entrega en Cancún.',
      images: data.images?.length ? [{ url: data.images[0] }] : (data.image ? [{ url: data.image }] : []),
      locale: 'es_MX',
      siteName: 'Bazarito Cancún',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${data.name} | Bazarito Cancún ☀️`,
      description: data.description || 'Producto disponible con entrega en Cancún.',
      images: data.images?.length ? [data.images[0]] : (data.image ? [data.image] : []),
    },
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const { data, error } = await supabase.from('products').select('*, inventory(quantity)').eq('id', id).single();
  
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
