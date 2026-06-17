import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://samwziooqhzohpszyddw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhbXd6aW9vcWh6b2hwc3p5ZGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNDg1MzAsImV4cCI6MjA5NjYyNDUzMH0.EFmRsIARd_oh3tn_eB40J25CRpEU-v91phjwChlGnuw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: biz } = await supabase.from('businesses').select('id').eq('slug', 'bazarito').single();
  const orderPayload = {
    business_id: biz.id,
    total: 100,
    source: 'pickup',
    pay_method: 'mercadopago'
  };
  const { data, error } = await supabase.from('orders').insert([orderPayload]).select().single();
  console.log('Order insert:', data, error);
}
test();
