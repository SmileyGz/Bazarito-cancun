// ─────────────────────────────────────────────
// Bazarito Cancún — Data Store (localStorage)
// ─────────────────────────────────────────────

const STORAGE_KEY  = 'bazarito_inventory';
const SALES_KEY    = 'bazarito_sales';
const ADMIN_PASSWORD = 'bazarito2024'; // Change this!

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

// ─── Seed inventory ───────────────────────────

const SEED_DATA = [
  { id:'1', name:'Organizador de Cocina Multiusos',    description:'Rack metálico de 3 niveles para organizar tu cocina.',  category:'hogar',    type:'stock',   cost:1250, price:2300, status:'available', stock:5,  supplier:'Mercado Central',   image:null, images:[], featured:true,  createdAt: new Date(Date.now() - 15*864e5).toISOString() },
  { id:'2', name:'Repisa Bar de Madera',                description:'Repisa flotante estilo industrial para bar o sala.',     category:'hogar',    type:'one_off', cost:900,  price:1400, status:'available', stock:1,  supplier:'Liquidación local', image:null, images:[], featured:true,  createdAt: new Date(Date.now() - 10*864e5).toISOString() },
  { id:'3', name:'Soporte Organizador de Baño',         description:'Torre organizadora de 4 niveles para baño.',            category:'hogar',    type:'stock',   cost:450,  price:850,  status:'available', stock:8,  supplier:'Mercado Central',   image:null, images:[], featured:false, createdAt: new Date(Date.now() - 8*864e5).toISOString()  },
  { id:'4', name:'Cargador Magnético 3 en 1',           description:'Carga iPhone, AirPods y Apple Watch simultáneamente.',  category:'gadgets',  type:'stock',   cost:280,  price:550,  status:'available', stock:12, supplier:'Proveedor Tech',    image:null, images:[], featured:true,  createdAt: new Date(Date.now() - 6*864e5).toISOString()  },
  { id:'5', name:'Bebedero Automático para Mascotas',   description:'Fuente de agua filtrada 1.8 L para perros y gatos.',    category:'mascotas', type:'stock',   cost:380,  price:699,  status:'available', stock:6,  supplier:'Proveedor Pet',     image:null, images:[], featured:false, createdAt: new Date(Date.now() - 5*864e5).toISOString()  },
  { id:'6', name:'Lámpara LED de Escritorio',           description:'Lámpara articulada USB con luz regulable.',             category:'gadgets',  type:'stock',   cost:320,  price:620,  status:'available', stock:4,  supplier:'Proveedor Tech',    image:null, images:[], featured:false, createdAt: new Date(Date.now() - 4*864e5).toISOString()  },
  { id:'7', name:'Smart TV 43" Samsung',                description:'Televisión 4K como nueva, con control remoto.',         category:'gadgets',  type:'one_off', cost:4500, price:7800, status:'available', stock:1,  supplier:'Marketplace',       image:null, images:[], featured:true,  createdAt: new Date(Date.now() - 3*864e5).toISOString()  },
  { id:'8', name:'Dispensador de Jabón con Sensor',     description:'Sin contacto, recargable USB. Ideal cocina y baño.',    category:'bienestar',type:'stock',   cost:210,  price:399,  status:'available', stock:10, supplier:'Mercado Central',   image:null, images:[], featured:false, createdAt: new Date(Date.now() - 2*864e5).toISOString()  },
];

// ─── Seed sales (demo data for the last 60 days) ──

function pastDate(daysAgo) {
  return new Date(Date.now() - daysAgo * 864e5).toISOString();
}

const SEED_SALES = [
  // June (current month)
  { id:'s1',  productId:'1', productName:'Organizador de Cocina Multiusos', category:'hogar',      type:'stock',   cost:1250, salePrice:2300, quantity:2, profit:2100, margin:84, saleDate: pastDate(2),  delivery: DELIVERY_METHODS.DELIVERY, notes:'' },
  { id:'s2',  productId:'4', productName:'Cargador Magnético 3 en 1',       category:'gadgets',    type:'stock',   cost:280,  salePrice:550,  quantity:3, profit:810,  margin:96, saleDate: pastDate(3),  delivery: DELIVERY_METHODS.PICKUP,   notes:'' },
  { id:'s3',  productId:'8', productName:'Dispensador de Jabón con Sensor', category:'bienestar',  type:'stock',   cost:210,  salePrice:399,  quantity:2, profit:378,  margin:90, saleDate: pastDate(5),  delivery: DELIVERY_METHODS.DELIVERY, notes:'' },
  { id:'s4',  productId:'3', productName:'Soporte Organizador de Baño',     category:'hogar',      type:'stock',   cost:450,  salePrice:850,  quantity:1, profit:400,  margin:89, saleDate: pastDate(6),  delivery: DELIVERY_METHODS.PICKUP,   notes:'' },
  // May
  { id:'s5',  productId:'1', productName:'Organizador de Cocina Multiusos', category:'hogar',      type:'stock',   cost:1250, salePrice:2300, quantity:1, profit:1050, margin:84, saleDate: pastDate(12), delivery: DELIVERY_METHODS.DELIVERY, notes:'' },
  { id:'s6',  productId:'2', productName:'Repisa Bar de Madera',            category:'hogar',      type:'one_off', cost:900,  salePrice:1450, quantity:1, profit:550,  margin:61, saleDate: pastDate(15), delivery: DELIVERY_METHODS.PICKUP,   notes:'Cliente negocio' },
  { id:'s7',  productId:'4', productName:'Cargador Magnético 3 en 1',       category:'gadgets',    type:'stock',   cost:280,  salePrice:550,  quantity:4, profit:1080, margin:96, saleDate: pastDate(18), delivery: DELIVERY_METHODS.DELIVERY, notes:'' },
  { id:'s8',  productId:'5', productName:'Bebedero Automático para Mascotas',category:'mascotas',  type:'stock',   cost:380,  salePrice:699,  quantity:2, profit:638,  margin:84, saleDate: pastDate(20), delivery: DELIVERY_METHODS.PICKUP,   notes:'' },
  { id:'s9',  productId:'6', productName:'Lámpara LED de Escritorio',       category:'gadgets',    type:'stock',   cost:320,  salePrice:620,  quantity:1, profit:300,  margin:94, saleDate: pastDate(22), delivery: DELIVERY_METHODS.DELIVERY, notes:'' },
  { id:'s10', productId:'8', productName:'Dispensador de Jabón con Sensor', category:'bienestar',  type:'stock',   cost:210,  salePrice:399,  quantity:3, profit:567,  margin:90, saleDate: pastDate(25), delivery: DELIVERY_METHODS.PICKUP,   notes:'' },
  // April
  { id:'s11', productId:'1', productName:'Organizador de Cocina Multiusos', category:'hogar',      type:'stock',   cost:1250, salePrice:2300, quantity:3, profit:3150, margin:84, saleDate: pastDate(38), delivery: DELIVERY_METHODS.DELIVERY, notes:'' },
  { id:'s12', productId:'7', productName:'Smart TV 43" Samsung',            category:'electronica',type:'one_off', cost:4500, salePrice:7800, quantity:1, profit:3300, margin:73, saleDate: pastDate(42), delivery: DELIVERY_METHODS.PICKUP,   notes:'Precio negociado' },
  { id:'s13', productId:'3', productName:'Soporte Organizador de Baño',     category:'hogar',      type:'stock',   cost:450,  salePrice:850,  quantity:2, profit:800,  margin:89, saleDate: pastDate(45), delivery: DELIVERY_METHODS.DELIVERY, notes:'' },
  { id:'s14', productId:'4', productName:'Cargador Magnético 3 en 1',       category:'gadgets',    type:'stock',   cost:280,  salePrice:550,  quantity:5, profit:1350, margin:96, saleDate: pastDate(50), delivery: DELIVERY_METHODS.PICKUP,   notes:'' },
  { id:'s15', productId:'5', productName:'Bebedero Automático para Mascotas',category:'mascotas',  type:'stock',   cost:380,  salePrice:699,  quantity:1, profit:319,  margin:84, saleDate: pastDate(55), delivery: DELIVERY_METHODS.DELIVERY, notes:'' },
];

// ─── Products CRUD ────────────────────────────

export function getProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) { localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA)); return SEED_DATA; }
    return JSON.parse(raw);
  } catch { return SEED_DATA; }
}

export function saveProducts(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export function addProduct(product) {
  const products = getProducts();
  const newProduct = { ...product, id: Date.now().toString(), createdAt: new Date().toISOString() };
  products.unshift(newProduct);
  saveProducts(products);
  return newProduct;
}

export function updateProduct(id, updates) {
  const products = getProducts();
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return null;
  products[idx] = { ...products[idx], ...updates };
  saveProducts(products);
  return products[idx];
}

export function deleteProduct(id) {
  saveProducts(getProducts().filter(p => p.id !== id));
}

// ─── Sales CRUD ───────────────────────────────

export function getSales() {
  try {
    const raw = localStorage.getItem(SALES_KEY);
    if (!raw) { localStorage.setItem(SALES_KEY, JSON.stringify(SEED_SALES)); return SEED_SALES; }
    return JSON.parse(raw);
  } catch { return SEED_SALES; }
}

export function saveSales(sales) {
  localStorage.setItem(SALES_KEY, JSON.stringify(sales));
}

/**
 * Record a sale and update product inventory accordingly.
 * @param {string} productId
 * @param {{ salePrice: number, quantity: number, delivery: string, notes: string, saleDate: string }} saleData
 */
export function recordSale(productId, saleData) {
  const products = getProducts();
  const idx      = products.findIndex(p => p.id === productId);
  if (idx === -1) return;

  const product  = products[idx];
  const qty      = Number(saleData.quantity) || 1;
  const sp       = Number(saleData.salePrice) || product.price;
  const totalCost   = product.cost * qty;
  const totalRevenue = sp * qty;
  const profit   = totalRevenue - totalCost;
  const margin   = Math.round((profit / totalCost) * 100);
  const daysToSell = product.createdAt
    ? Math.floor((Date.now() - new Date(product.createdAt)) / (1000 * 60 * 60 * 24))
    : 0;

  // ── Update product stock ──
  const newStock = Math.max(0, (product.stock || 1) - qty);
  let newStatus = product.status;

  if (product.type === PRODUCT_TYPES.ONE_OFF || newStock === 0) {
    newStatus = STATUSES.SOLD;
  }

  products[idx] = {
    ...product,
    stock:      newStock,
    status:     newStatus,
    daysToSell: product.daysToSell ?? daysToSell,
    lastSoldAt: new Date().toISOString(),
  };
  saveProducts(products);

  // ── Record the sale ──
  const saleRecord = {
    id:          `s${Date.now()}`,
    productId,
    productName: product.name,
    category:    product.category,
    type:        product.type,
    cost:        product.cost,
    salePrice:   sp,
    quantity:    qty,
    profit,
    margin,
    saleDate:    saleData.saleDate || new Date().toISOString(),
    delivery:    saleData.delivery || DELIVERY_METHODS.PICKUP,
    notes:       saleData.notes || '',
  };

  const sales = getSales();
  sales.unshift(saleRecord);
  saveSales(sales);
  return saleRecord;
}

export function deleteSale(id) {
  saveSales(getSales().filter(s => s.id !== id));
}

// ─── Analytics ────────────────────────────────

export function getStats() {
  const products = getProducts();
  const sales    = getSales();
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
    totalUnitsSold,
    lowStock: active.filter(p => (p.stock || 0) <= 2 && p.type === PRODUCT_TYPES.STOCK).length,
  };
}

/**
 * Returns sales aggregated by month for the past N months.
 */
export function getMonthlySummary(months = 6) {
  const sales = getSales();
  const result = [];

  for (let i = months - 1; i >= 0; i--) {
    const d     = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const year  = d.getFullYear();
    const month = d.getMonth(); // 0-indexed

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

/**
 * Returns sales for a specific year+month.
 */
export function getSalesForMonth(year, month) {
  return getSales().filter(s => {
    const d = new Date(s.saleDate);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

/**
 * Top selling products by profit.
 */
export function getTopProducts(limit = 5) {
  const sales = getSales();
  const map   = {};
  sales.forEach(s => {
    if (!map[s.productId]) {
      map[s.productId] = { name: s.productName, category: s.category, revenue: 0, profit: 0, units: 0 };
    }
    map[s.productId].revenue += s.salePrice * s.quantity;
    map[s.productId].profit  += s.profit;
    map[s.productId].units   += s.quantity;
  });
  return Object.values(map)
    .sort((a, b) => b.profit - a.profit)
    .slice(0, limit);
}

/**
 * Sales breakdown by category.
 */
export function getCategoryBreakdown() {
  const sales = getSales();
  const map   = {};
  sales.forEach(s => {
    if (!map[s.category]) map[s.category] = { revenue: 0, profit: 0, units: 0 };
    map[s.category].revenue += s.salePrice * s.quantity;
    map[s.category].profit  += s.profit;
    map[s.category].units   += s.quantity;
  });
  return map;
}

// ─── Auth ────────────────────────────────────

export function checkPassword(pw) { return pw === ADMIN_PASSWORD; }

// ─── Messenger CTA ───────────────────────────

export const MESSENGER_URL = 'https://m.me/61574976372140';

export function getMessengerLink(productName) {
  const msg = encodeURIComponent(`Hola! Vi el "${productName}" en el catálogo, ¿está disponible? 😊`);
  return `https://m.me/61574976372140?text=${msg}`;
}
