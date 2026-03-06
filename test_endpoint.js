
const axios = require('axios');

async function testEndpoint() {
    try {
        const res = await axios.get('http://localhost:5000/api/maxtron/inventory/stock-summary', {
            headers: {
                // We need a token, but let's see if we get a 401 or something else
            }
        });
        console.log('Status:', res.status);
        console.log('Data:', res.data);
    } catch (err) {
        console.log('Status:', err.response?.status);
        console.log('Body:', err.response?.data);
    }
}

testEndpoint();
