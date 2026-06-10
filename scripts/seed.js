import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const CATEGORIES = [
  { slug: 'hogar',    name: 'Hogar y Decor' },
  { slug: 'gadgets',  name: 'Gadgets y Tech' },
  { slug: 'mascotas', name: 'Mascotas' },
  { slug: 'bienestar',name: 'Bienestar' },
];

const SEED_PRODUCTS = [
  { sku: 'ORG-COC-01', name:'Organizador de Cocina Multiusos',   description:'Rack metálico de 3 niveles para organizar tu cocina.',  category_slug:'hogar',    type:'physical',   cost:1250, price:2300, status:'active', stock:5,  supplier_name:'Mercado Central' },
  { sku: 'REP-BAR-01', name:'Repisa Bar de Madera',                description:'Repisa flotante estilo industrial para bar o sala.',     category_slug:'hogar',    type:'physical', cost:900,  price:1400, status:'active', stock:1,  supplier_name:'Liquidación local' },
  { sku: 'SOP-BAN-01', name:'Soporte Organizador de Baño',         description:'Torre organizadora de 4 niveles para baño.',            category_slug:'hogar',    type:'physical',   cost:450,  price:850,  status:'active', stock:8,  supplier_name:'Mercado Central' },
  { sku: 'CAR-MAG-01', name:'Cargador Magnético 3 en 1',           description:'Carga iPhone, AirPods y Apple Watch simultáneamente.',  category_slug:'gadgets',  type:'physical',   cost:280,  price:550,  status:'active', stock:12, supplier_name:'Proveedor Tech' },
  { sku: 'BEB-MAS-01', name:'Bebedero Automático para Mascotas',   description:'Fuente de agua filtrada 1.8 L para perros y gatos.',    category_slug:'mascotas', type:'physical',   cost:380,  price:699,  status:'active', stock:6,  supplier_name:'Proveedor Pet' },
  { sku: 'LAM-LED-01', name:'Lámpara LED de Escritorio',           description:'Lámpara articulada USB con luz regulable.',             category_slug:'gadgets',  type:'physical',   cost:320,  price:620,  status:'active', stock:4,  supplier_name:'Proveedor Tech' },
  { sku: 'SMT-TV-01',  name:'Smart TV 43" Samsung',                description:'Televisión 4K como nueva, con control remoto.',         category_slug:'gadgets',  type:'physical', cost:4500, price:7800, status:'active', stock:1,  supplier_name:'Marketplace' },
  { sku: 'DIS-JAB-01', name:'Dispensador de Jabón con Sensor',     description:'Sin contacto, recargable USB. Ideal cocina y baño.',    category_slug:'bienestar',type:'physical',   cost:210,  price:399,  status:'active', stock:10, supplier_name:'Mercado Central' },
];

async function seed() {
  console.log("Seeding Supabase Database...");

  // 1. Create Business
  const { data: business, error: bizErr } = await supabase
    .from('businesses')
    .insert([{ name: 'Bazarito Cancún', slug: 'bazarito', type: 'retail', status: 'active' }])
    .select()
    .single();

  if (bizErr) {
    if (bizErr.code === '23505') {
       console.log('Business already exists. Fetching...');
    } else {
       console.error("Error creating business:", bizErr);
       return;
    }
  }
  
  const { data: existingBiz } = await supabase.from('businesses').select().eq('slug', 'bazarito').single();
  const businessId = existingBiz.id;
  console.log("Business ID:", businessId);

  // 2. Create Categories
  const categoryMap = {};
  for (const cat of CATEGORIES) {
    const { data: newCat, error: catErr } = await supabase
      .from('categories')
      .upsert([{ business_id: businessId, name: cat.name, slug: cat.slug }], { onConflict: 'business_id, slug' })
      .select()
      .single();
    if (newCat) categoryMap[cat.slug] = newCat.id;
  }
  console.log("Categories seeded.");

  // 3. Create Suppliers & Products
  const supplierMap = {};
  for (const p of SEED_PRODUCTS) {
    // Upsert Supplier
    if (!supplierMap[p.supplier_name]) {
      const { data: sup } = await supabase
        .from('suppliers')
        .insert([{ business_id: businessId, name: p.supplier_name }])
        .select()
        .single();
      if (sup) supplierMap[p.supplier_name] = sup.id;
    }

    const categoryId = categoryMap[p.category_slug];
    const supplierId = supplierMap[p.supplier_name];

    // Upsert Product
    const { data: prod, error: prodErr } = await supabase
      .from('products')
      .upsert([{
        business_id: businessId,
        category_id: categoryId,
        supplier_id: supplierId,
        name: p.name,
        description: p.description,
        sku: p.sku,
        type: p.type,
        status: p.status,
        price: p.price,
        cost: p.cost,
        images: []
      }], { onConflict: 'sku' })
      .select()
      .single();

    if (prodErr) {
      console.error("Error inserting product:", p.name, prodErr);
    } else if (prod) {
      // Upsert Inventory
      await supabase
        .from('inventory')
        .upsert([{ product_id: prod.id, quantity: p.stock }], { onConflict: 'product_id' });
    }
  }

  console.log("Products and Inventory seeded!");
}

seed();
