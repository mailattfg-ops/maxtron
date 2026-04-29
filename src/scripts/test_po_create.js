const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function testCreate() {
  const orderData = {"order_number":"PO-000002","order_date":"2026-04-29","supplier_id":"915a958d-91b7-48a9-aff0-6ed8884d3f82","expected_delivery_date":"2026-04-29","remarks":"","total_amount":1.18,"company_id":"739f66c9-4f5a-428f-984e-ac9e2e689b59","status":"PENDING"};
  
  const { data, error } = await supabase.from('rm_orders').insert([orderData]).select();
  
  if (error) {
    console.error('Create Error:', error);
  } else {
    console.log('Create Success:', data);
  }
}

testCreate();
