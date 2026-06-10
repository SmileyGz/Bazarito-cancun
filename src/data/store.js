import { supabase } from '../lib/supabase';

export const ADMIN_PASSWORD = 'bazarito2024'; // Change this!

export const CATEGORIES = [
  { id: 'all',      label: 'Todo',          emoji: '📦' },
  { id: 'hogar',    label: 'Hogar y Decor', emoji: '🏠' },
  { id: 'gadgets',  label: 'Gadgets y Tech',emoji: '🔌' },
  { id: 'mascotas', label: 'Mascotas',      emoji: '🐾' },
  { id: 'bienestar',label: 'Bienestar',     emoji: '✨' },
];

export const PRODUCT_TYPES = { STOCK: 'stock', ONE_OFF: 'one_off' };

export const STATUSES = {
  AVAILABLE:    'available',
  SOLD:         'sold',
  OUT_OF_STOCK: 'out_of_stock',
};

export const DELIVERY_METHODS = {
  PICKUP:   'pickup',
  DELIVERY: 'delivery',
};

let BAZARITO_ID = null;
async function getBusinessId() {
  if (BAZARITO_ID) return BAZARITO_ID;
  const { data } = await supabase.from('businesses').select('id').eq('slug', 'bazarito').single();
  if (data) BAZARITO_ID = data.id;
  return BAZARITO_ID;
}

async function getCategoryId(slug) {
  const bizId = await getBusinessId();
  let { data } = await supabase.from('categories').select('id').eq('business_id', bizId).eq('slug', slug).single();
  if (!data) {
    const { data: newCat } = await supabase.from('categories').insert([{ business_id: bizId, name: slug, slug }]).select().single();
    return newCat?.id;
  }
  return data?.id;
}

async function getSupplierId(name) {
  if (!name) return null;
  const bizId = await getBusinessId();
  let { data } = await supabase.from('suppliers').select('id').eq('business_id', bizId).eq('name', name).single();
  if (!data) {
    const { data: newSup } = await supabase.from('suppliers').insert([{ business_id: bizId, name }]).select().single();
    return newSup?.id;
  }
  return data?.id;
}

// ─── Products CRUD ────────────────────────────

export async function getProducts() {
  const bizId = await getBusinessId();
  if (!bizId) return [];

  const { data, error } = await supabase
    .from('products')
    .select('*, inventory(quantity), categories(slug), suppliers(name)')
    .eq('business_id', bizId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error(error);
    return [];
  }

  return data.map(p => ({
    id: p.id,
    sku: p.sku || '',
    name: p.name,
    description: p.description,
    category: p.categories?.slug || 'hogar',
    type: p.type,
    cost: p.cost,
    price: p.price,
    status: p.status,
    stock: p.inventory?.quantity || 0,
    supplier: p.suppliers?.name || '',
    images: p.images || [],
    createdAt: p.created_at
  }));
}

export async function addProduct(product) {
  const bizId = await getBusinessId();
  const categoryId = await getCategoryId(product.category);
  const supplierId = await getSupplierId(product.supplier || 'General');

  const { data: prod, error } = await supabase
    .from('products')
    .insert([{
      business_id: bizId,
      category_id: categoryId,
      supplier_id: supplierId,
      name: product.name,
      description: product.description || '',
      type: product.type,
      status: product.status,
      price: product.price,
      cost: product.cost,
      images: product.images || []
    }])
    .select()
    .single();

  if (error) throw error;

  if (product.type === PRODUCT_TYPES.STOCK) {
    await supabase.from('inventory').insert([{
      product_id: prod.id,
      quantity: product.stock || 0
    }]);
  }

  return prod;
}

export async function updateProduct(id, updates) {
  const payload = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.type !== undefined) payload.type = updates.type;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.price !== undefined) payload.price = updates.price;
  if (updates.cost !== undefined) payload.cost = updates.cost;
  if (updates.images !== undefined) payload.images = updates.images;
  
  if (updates.category !== undefined) payload.category_id = await getCategoryId(updates.category);
  if (updates.supplier !== undefined) payload.supplier_id = await getSupplierId(updates.supplier);

  const { data: prod, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  if (updates.stock !== undefined && prod.type === PRODUCT_TYPES.STOCK) {
    await supabase
      .from('inventory')
      .update({ quantity: updates.stock })
      .eq('product_id', id);
  }

  return prod;
}

export async function deleteProduct(id) {
  await supabase.from('products').delete().eq('id', id);
}

// ─── Sales CRUD ───────────────────────────────

export async function getSales() {
  const bizId = await getBusinessId();
  const { data, error } = await supabase
    .from('order_items')
    .select(`
      id, quantity, unit_price, unit_cost,
      product_id,
      orders!inner(id, business_id, created_at, source, pay_method),
      products(name, type, categories(slug))
    `)
    .eq('orders.business_id', bizId)
    .order('orders(created_at)', { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data.map(item => ({
    id: item.id,
    orderId: item.orders.id,
    productId: item.product_id,
    productName: item.products?.name,
    category: item.products?.categories?.slug || 'hogar',
    type: item.products?.type,
    cost: item.unit_cost,
    salePrice: item.unit_price,
    quantity: item.quantity,
    profit: (item.unit_price - item.unit_cost) * item.quantity,
    margin: Math.round(((item.unit_price - item.unit_cost) / item.unit_cost) * 100) || 0,
    saleDate: item.orders.created_at,
    delivery: item.orders.source || 'pickup',
    notes: ''
  }));
}

export async function recordSale({ productId, quantity, delivery, notes }) {
  const bizId = await getBusinessId();

  // 1. Get Product
  const { data: prod } = await supabase.from('products').select('*, inventory(quantity)').eq('id', productId).single();
  if (!prod) throw new Error("Product not found");

  // 2. Create Order
  const { data: order } = await supabase.from('orders').insert([{
    business_id: bizId,
    total: prod.price * quantity,
    source: delivery
  }]).select().single();

  // 3. Create Order Item
  const { data: orderItem } = await supabase.from('order_items').insert([{
    order_id: order.id,
    product_id: prod.id,
    quantity: quantity,
    unit_price: prod.price,
    unit_cost: prod.cost
  }]).select().single();

  // 4. Update Inventory / Status
  if (prod.type === PRODUCT_TYPES.ONE_OFF) {
    await supabase.from('products').update({ status: STATUSES.SOLD }).eq('id', prod.id);
  } else {
    const currentStock = prod.inventory?.quantity || 0;
    const newStock = Math.max(0, currentStock - quantity);
    await supabase.from('inventory').update({ quantity: newStock }).eq('product_id', prod.id);
    if (newStock === 0) {
      await supabase.from('products').update({ status: STATUSES.OUT_OF_STOCK }).eq('id', prod.id);
    }
  }

  return orderItem;
}

export async function deleteSale(id) {
  // id here is the order_items id. To keep it simple, we just delete the item (and optionally the order if empty, but cascade handles some of this)
  const { data: item } = await supabase.from('order_items').select('order_id').eq('id', id).single();
  if (item) {
    await supabase.from('orders').delete().eq('id', item.order_id);
  }
}

export async function getTopProducts() {
  const sales = await getSales();
  const acc = {};
  for (const s of sales) {
    if (!acc[s.productId]) {
      acc[s.productId] = { name: s.productName, category: s.category, units: 0, profit: 0, type: s.type };
    }
    acc[s.productId].units += s.quantity;
    acc[s.productId].profit += s.profit;
  }
  return Object.values(acc).sort((a, b) => b.units - a.units);
}

export async function getSalesForMonth(year, month) {
  const sales = await getSales();
  return sales.filter(s => {
    const d = new Date(s.saleDate);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

export async function getStats() {
  const products = await getProducts();
  const sales    = await getSales();
  const active   = products.filter(p => p.status === STATUSES.AVAILABLE);
  const sold     = products.filter(p => p.status === STATUSES.SOLD);
  const margins  = active.map(p => ((p.price - p.cost) / p.cost) * 100);
  const avgMargin = margins.length > 0
    ? Math.round(margins.reduce((a,b) => a+b, 0) / margins.length) : 0;
  const totalValue   = active.reduce((s, p) => s + (p.price * (p.stock || 1)), 0);
  const totalRevenue = sales.reduce((s, sl) => s + sl.salePrice * sl.quantity, 0);
  const totalProfit  = sales.reduce((s, sl) => s + sl.profit, 0);
  const totalUnitsSold = sales.reduce((s, sl) => s + sl.quantity, 0);
  return {
    total: products.length,
    active: active.length,
    sold: sold.length,
    avgMargin,
    totalValue,
    totalRevenue,
    totalProfit,
    totalUnitsSold
  };
}

export async function getMonthlySummary(months = 6) {
  const sales = await getSales();
  const result = [];

  for (let i = months - 1; i >= 0; i--) {
    const d     = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const year  = d.getFullYear();
    const month = d.getMonth();

    const mSales = sales.filter(s => {
      const sd = new Date(s.saleDate);
      return sd.getFullYear() === year && sd.getMonth() === month;
    });

    const MONTHS_ES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    result.push({
      label:   `${MONTHS_ES[month]} ${year}`,
      year,
      month,
      revenue: mSales.reduce((s, sl) => s + sl.salePrice * sl.quantity, 0),
      profit:  mSales.reduce((s, sl) => s + sl.profit, 0),
      units:   mSales.reduce((s, sl) => s + sl.quantity, 0),
      count:   mSales.length,
      sales:   mSales,
    });
  }
  return result;
}

export async function getCategoryBreakdown() {
  const sales = await getSales();
  const map   = {};
  sales.forEach(s => {
    if (!map[s.category]) map[s.category] = { revenue: 0, profit: 0, units: 0 };
    map[s.category].revenue += s.salePrice * s.quantity;
    map[s.category].profit  += s.profit;
    map[s.category].units   += s.quantity;
  });
  return map;
}

export function checkPassword(pw) { return pw === ADMIN_PASSWORD; }

export const MESSENGER_URL = 'https://m.me/61574976372140';

export function getMessengerLink(productName) {
  const msg = encodeURIComponent(`¡Hola! Me interesa el producto "${productName}". ¿Aún lo tienen disponible?`);
  return `${MESSENGER_URL}?text=${msg}`;
}
