const axios = require('axios');

async function testEndpoint() {
    try {
        const res = await axios.get('http://localhost:5000/api/maxtron/rm-orders', {
            // Need token? Let's just mock the controller directly or query Supabase directly using the same query.
        });
        console.log(res.data);
    } catch(e) {
        console.error(e.message);
    }
}
testEndpoint();
