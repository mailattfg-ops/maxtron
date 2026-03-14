const fetch = require('node-fetch');

async function testApi() {
    console.log('--- Testing Suppliers GET API ---');
    try {
        const res = await fetch('http://localhost:5000/api/maxtron/suppliers');
        const data = await res.json();
        if (data.success && data.data.length > 0) {
            console.log('First Supplier Data:', JSON.stringify(data.data[0], null, 2));
        } else {
            console.log('No suppliers found or API failed:', data);
        }
    } catch (err) {
        console.error('Network Error:', err.message);
    }
}

testApi();
