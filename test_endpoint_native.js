
async function testEndpoint() {
    try {
        const response = await fetch('http://localhost:5000/api/maxtron/inventory/stock-summary');
        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Data:', data);
    } catch (err) {
        console.log('Error:', err.message);
    }
}

testEndpoint();
