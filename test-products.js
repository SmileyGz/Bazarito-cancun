import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://samwziooqhzohpszyddw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhbXd6aW9vcWh6b2hwc3p5ZGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNDg1MzAsImV4cCI6MjA5NjYyNDUzMH0.EFmRsIARd_oh3tn_eB40J25CRpEU-v91phjwChlGnuw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('products').select('*').limit(1);
  console.log('Product cols:', data ? Object.keys(data[0]) : error);
}
test();
