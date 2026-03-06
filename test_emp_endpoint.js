const fetch = require('node-fetch');

async function testEmployees() {
    try {
        const res = await fetch('http://localhost:5000/api/maxtron/employees');
        const data = await res.json();
        console.log('Sample employee:', data.data?.[0]);
    } catch(e) {
        console.error(e.message);
    }
}

testEmployees();
