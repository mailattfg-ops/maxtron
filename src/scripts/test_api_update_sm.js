const fetch = require('node-fetch');

async function testUpdate() {
    const supplierId = 'f277c22f-9c75-4333-8c60-13aac1d1d1f0';
    const materialIds = ["4bda6f77-4b76-4ba6-87b5-fcd0eaa3966f","f823d085-34ae-45e6-a3c8-facdbb5f1c1a","3c9d92de-8f87-44d2-9e00-bdeedd5e39d3"];
    
    console.log('--- Testing API Update ---');
    try {
        const res = await fetch(`http://localhost:5000/api/maxtron/suppliers/${supplierId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                supplier_name: 'aj',
                supplier_code: 'ven 363636',
                supplied_materials: materialIds,
                company_id: '739f66c9-4f5a-428f-984e-ac9e2e689b59'
            })
        });
        const data = await res.json();
        console.log('Update Response:', data);

        console.log('\n--- Verifying with GET ---');
        const getRes = await fetch(`http://localhost:5000/api/maxtron/suppliers`);
        const getData = await getRes.json();
        const me = getData.data.find(s => s.id === supplierId);
        console.log('Supplier from GET:', JSON.stringify(me, null, 2));
    } catch (err) {
        console.error('Error:', err.message);
    }
}

testUpdate();
