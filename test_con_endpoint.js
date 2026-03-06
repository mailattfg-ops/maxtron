const fetch = require('node-fetch');

async function testPostEndpoint() {
    try {
        const payload = {
            consumption_slip_no: 'TEST-CSN',
            consumption_date: '2026-03-06',
            rm_id: '69f044d2-043b-4d0d-9347-93c1f7075677',
            quantity_used: 1,
            process_type: 'Extrusion',
            company_id: '88a8faa1-4d14-4986-8144-592651ee9dff'
        };

        const res = await fetch('http://localhost:5000/api/maxtron/consumptions', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        console.log('Response:', data);
    } catch(e) {
        console.error(e.message);
    }
}

testPostEndpoint();
