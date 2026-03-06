const fetch = require('node-fetch');

async function checkStockEP() {
    try {
        const res = await fetch('http://localhost:5000/api/maxtron/inventory/stock-summary?company_id=88a8faa1-4d14-4986-8144-592651ee9dff');
        const data = await res.json();
        console.log("Stock summary count:", data.data?.length);
        console.log("First item:", data.data?.[0]);
    } catch(e) {
        console.error(e.message);
    }
}

checkStockEP();
