import fetch from 'node-fetch';

async function test() {
    const res = await fetch('http://localhost:5000/api/keil/fleet/repairs?company_id=5be36c2a-c42e-4469-8551-115ede9ca728');
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}
test();
