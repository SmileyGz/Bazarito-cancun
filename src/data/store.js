import { supabase } from '../lib/supabase';

export const CATEGORIES = [
  { id: 'all',      label: 'Todo',           emoji: '📦' },
  { id: 'hogar',    label: 'Hogar y Decor',  emoji: '🏠' },
  { id: 'gadgets',  label: 'Gadgets y Tech', emoji: '🔌' },
  { id: 'mascotas', label: 'Mascotas',       emoji: '🐾' },
  { id: 'bienestar',label: 'Bienestar',      emoji: '✨' },
  { id: 'personal', label: 'Moda y Personal',emoji: '👗' },
];

export const PRODUCT_TYPES = { STOCK: 'stock', ONE_OFF: 'one_off' };

export const STATUSES = {
  AVAILABLE:    'active',
  SOLD:         'archived',
  OUT_OF_STOCK: 'draft',
};

export const DELIVERY_METHODS = {
  PICKUP:   'pickup',
  DELIVERY: 'delivery',
};

export async function getBusinessId() {
  return import.meta.env.VITE_BAZARITO_BUSINESS_ID;
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
    .select(`
      *,
      inventory (quantity),
      categories (slug),
      suppliers (name)
    `)
    .eq('business_id', bizId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error(error);
    return [];
  }

  return data.map(p => {
    const type = p.custom_attributes?.ui_type || (p.inventory ? PRODUCT_TYPES.STOCK : PRODUCT_TYPES.ONE_OFF);
    return {
      id: p.id,
      sku: p.sku || '',
      name: p.name,
      description: p.description,
      category: p.categories?.slug || 'hogar',
      type: type,
      cost: p.cost,
      price: p.price,
      status: p.status,
      stock: type === PRODUCT_TYPES.ONE_OFF ? 1 : (p.inventory?.quantity || 0),
      supplier: p.suppliers?.name || '',
      images: p.images || [],
      image: p.images?.[0] || null,
      variants: p.custom_attributes?.variants || [],
      marketing_ads: p.custom_attributes?.marketing_ads || [],
      delivery_enabled: p.custom_attributes?.delivery_enabled !== false, // default true
      createdAt: p.created_at
    };
  });
}

export async function getPublicProducts() {
  const bizId = await getBusinessId();
  if (!bizId) return [];

  const { data, error } = await supabase
    .from('products')
    .select(`
      id, name, description, sku, type, price, custom_attributes, created_at, images,
      inventory (quantity),
      categories (slug)
    `)
    .eq('business_id', bizId)
    .eq('status', STATUSES.AVAILABLE)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('getPublicProducts error:', error);
    return [];
  }

  return data.map(p => {
    const type = p.custom_attributes?.ui_type || (p.inventory ? PRODUCT_TYPES.STOCK : PRODUCT_TYPES.ONE_OFF);
    return {
      id: p.id,
      sku: p.sku || '',
      name: p.name,
      description: p.description,
      category: p.categories?.slug || 'hogar',
      type: type,
      price: p.price,
      status: STATUSES.AVAILABLE,
      stock: type === PRODUCT_TYPES.ONE_OFF ? 1 : (p.inventory?.quantity || 0),
      images: p.images || [],
      image: p.images?.[0] || null,
      variants: p.custom_attributes?.variants || [],
      delivery_enabled: p.custom_attributes?.delivery_enabled !== false, // default true
      createdAt: p.created_at
    };
  });
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
      type: 'physical',
      custom_attributes: {
        ui_type: product.type,
        variants: product.variants || [],
        marketing_ads: product.marketing_ads || [],
        delivery_enabled: product.delivery_enabled !== false,
      },
      status: product.status,
      price: product.price,
      cost: product.cost,
      images: product.images || []
    }])
    .select()
    .single();

  if (error) throw error;

  if (product.type === PRODUCT_TYPES.STOCK) {
    const { error: invErr } = await supabase.from('inventory').insert([{
      product_id: prod.id,
      quantity: product.stock || 0
    }]);
    if (invErr) throw new Error('Error al guardar inventario: ' + invErr.message);
  }

  return prod;
}

export async function updateProduct(id, updates) {
  const payload = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.price !== undefined) payload.price = updates.price;
  if (updates.cost !== undefined) payload.cost = updates.cost;
  if (updates.images !== undefined) payload.images = updates.images;
  // Merge custom_attributes so ui_type, variants, and delivery_enabled all survive
  if (updates.type !== undefined || updates.variants !== undefined || updates.delivery_enabled !== undefined || updates.marketing_ads !== undefined) {
    const { data: existing, error: existingErr } = await supabase.from('products').select('custom_attributes').eq('id', id).single();
    if (existingErr) throw existingErr;
    const prev = existing?.custom_attributes || {};
    payload.custom_attributes = {
      ...prev,
      ...(updates.type !== undefined             ? { ui_type: updates.type }                       : {}),
      ...(updates.variants !== undefined         ? { variants: updates.variants }                   : {}),
      ...(updates.delivery_enabled !== undefined ? { delivery_enabled: updates.delivery_enabled }   : {}),
      ...(updates.marketing_ads !== undefined    ? { marketing_ads: updates.marketing_ads }         : {}),
    };
  }

  if (updates.category !== undefined) payload.category_id = await getCategoryId(updates.category);
  if (updates.supplier !== undefined) payload.supplier_id = await getSupplierId(updates.supplier);

  const { data: prod, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  const currentType = prod.custom_attributes?.ui_type || PRODUCT_TYPES.STOCK;

  if (updates.stock !== undefined && currentType === PRODUCT_TYPES.STOCK) {
    const { error: invError } = await supabase
      .from('inventory')
      .upsert({ product_id: id, quantity: updates.stock }, { onConflict: 'product_id' });
    if (invError) throw new Error('Error al guardar stock: ' + invError.message);
  }

  return prod;
}

export async function updateProductAds(id, ads) {
  return updateProduct(id, { marketing_ads: ads });
}

export async function deleteProduct(id) {
  await supabase.from('products').delete().eq('id', id);
}

// ─── Sales CRUD ───────────────────────────────

let salesCache = null;
let salesCacheTime = 0;

export async function getSales() {
  if (salesCache && Date.now() - salesCacheTime < 60_000) return salesCache;

  const bizId = await getBusinessId();
  const { data, error } = await supabase
    .from('order_items')
    .select(`
      id, quantity, unit_price, unit_cost,
      product_id,
      orders!inner(id, business_id, created_at, source, pay_method, notes),
      products(name, type, categories(slug))
    `)
    .eq('orders.business_id', bizId)
    .order('orders(created_at)', { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  salesCache = data.map(item => ({
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
    notes: item.orders.notes || ''
  }));
  salesCacheTime = Date.now();
  
  return salesCache;
}

export async function recordSale({
  productId, quantity, delivery, notes,
  saleDate, salePrice, payMethod,
  deliveryFee, deliveryFeeAmount,
  clientName, clientPhone, clientEmail
}) {
  // Invalidate sales cache
  salesCache = null;
  salesCacheTime = 0;

  const bizId = await getBusinessId();

  // 1. Get Product
  const { data: prod } = await supabase.from('products').select('*, inventory(quantity)').eq('id', productId).single();
  if (!prod) throw new Error("Product not found");

  // Use exact sale price entered by admin (not product list price)
  const unitPrice = salePrice !== undefined ? Number(salePrice) : prod.price;
  const delivFee  = deliveryFee && deliveryFeeAmount ? Number(deliveryFeeAmount) : 0;
  const orderTotal = (unitPrice * quantity) + delivFee;

  // Normalize pay_method for DB enum constraint ('cash', 'mercadopago', etc.)
  let dbPayMethod = payMethod || 'cash';
  let payMethodNote = '';
  if (dbPayMethod === 'cash_pickup') {
    dbPayMethod = 'cash';
    payMethodNote = 'Pago: Efectivo en recolección';
  } else if (dbPayMethod === 'cash_delivery') {
    dbPayMethod = 'cash';
    payMethodNote = 'Pago: Efectivo a contraentrega';
  }

  // Build composite notes with client info
  const clientMeta = [clientName, clientPhone, clientEmail].filter(Boolean).join(' | ');
  const fullNotes  = [notes, payMethodNote, clientMeta ? `Cliente: ${clientMeta}` : ''].filter(Boolean).join(' · ');

  // 2. Create Order — override created_at with admin-provided saleDate
  const orderPayload = {
    business_id: bizId,
    total: orderTotal,
    source: delivery,
    pay_method: dbPayMethod,
    ...(fullNotes ? { notes: fullNotes } : {}),
  };
  // If saleDate differs from today, set created_at explicitly
  const today = new Date().toISOString().split('T')[0];
  if (saleDate && saleDate !== today) {
    orderPayload.created_at = new Date(saleDate + 'T12:00:00').toISOString();
  }

  const { data: order, error: orderErr } = await supabase.from('orders').insert([orderPayload]).select().single();
  if (orderErr) throw new Error(orderErr.message || "Error al crear la orden");

  // 3. Create Order Item with exact unit_price entered
  const { data: orderItem, error: itemErr } = await supabase.from('order_items').insert([{
    order_id: order.id,
    product_id: prod.id,
    quantity: quantity,
    unit_price: unitPrice,
    unit_cost: prod.cost
  }]).select().single();
  if (itemErr) throw new Error(itemErr.message || "Error al agregar el item a la orden");

  // 4. Update Inventory / Status
  const isOneOff = prod.custom_attributes?.ui_type === PRODUCT_TYPES.ONE_OFF;
  if (isOneOff) {
    await supabase.from('products').update({ status: STATUSES.SOLD }).eq('id', prod.id);
  } else {
    const currentStock = prod.inventory?.quantity || 0;
    const newStock = Math.max(0, currentStock - quantity);
    
    const { data: updatedInv } = await supabase
      .from('inventory')
      .update({ quantity: newStock })
      .eq('product_id', prod.id)
      .eq('quantity', currentStock)
      .select();

    if (!updatedInv || updatedInv.length === 0) {
      throw new Error("El inventario fue modificado mientras procesabas la venta. Recarga e intenta de nuevo.");
    }

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

export async function getStats(products = null) {
  if (!products) {
    products = await getProducts();
  }
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
  const lowStock = active.filter(p => p.type === PRODUCT_TYPES.STOCK && (p.stock || 0) <= 2).length;

  return {
    total: products.length,
    active: active.length,
    sold: sold.length,
    avgMargin,
    totalValue,
    totalRevenue,
    totalProfit,
    totalUnitsSold,
    lowStock
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

export const MESSENGER_URL = 'https://m.me/61574976372140';

export function getMessengerLink(productName) {
  const msg = encodeURIComponent(`¡Hola! Me interesa el producto "${productName}". ¿Aún lo tienen disponible?`);
  return `${MESSENGER_URL}?text=${msg}`;
}

// ─── Finance CRUD ─────────────────────────────

export async function getFinanceTransactions() {
  const { data, error } = await supabase
    .from('biz_finance_transactions')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching finance transactions:', error);
    return [];
  }
  return data;
}

export async function addFinanceTransaction(tx) {
  const { data, error } = await supabase
    .from('biz_finance_transactions')
    .insert([{
      date: tx.date,
      description: tx.description,
      amount: tx.amount,
      type: tx.type,
      category: tx.category,
      notes: tx.notes || null
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateFinanceTransaction(id, updates) {
  const { data, error } = await supabase
    .from('biz_finance_transactions')
    .update({
      date: updates.date,
      description: updates.description,
      amount: updates.amount,
      type: updates.type,
      category: updates.category,
      notes: updates.notes || null
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteFinanceTransaction(id) {
  const { error } = await supabase
    .from('biz_finance_transactions')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getFinancePortfolio() {
  const { data, error } = await supabase
    .from('biz_finance_portfolio')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching finance portfolio:', error);
    return [];
  }
  return data;
}

export async function addFinancePortfolioAsset(asset) {
  const { data, error } = await supabase
    .from('biz_finance_portfolio')
    .insert([{
      name: asset.name,
      category: asset.category,
      value: asset.value || 0,
      icon: asset.icon || '💰',
      notes: asset.notes || null
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateFinancePortfolioAsset(id, updates) {
  const { data, error } = await supabase
    .from('biz_finance_portfolio')
    .update({
      name: updates.name,
      category: updates.category,
      value: updates.value,
      icon: updates.icon,
      notes: updates.notes
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteFinancePortfolioAsset(id) {
  const { error } = await supabase
    .from('biz_finance_portfolio')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

