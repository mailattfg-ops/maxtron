import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000';
const REPAIRS_API = `${API_BASE}/api/keil/fleet/repairs`;

async function test() {
    try {
        const res = await fetch(`${REPAIRS_API}?company_id=5be36c2a-c42e-4469-8551-115ede9ca728`);
        const data = await res.json();
        console.log('API RESPONSE:', JSON.stringify(data, null, 2));
    } catch (e: any) {
        console.error('FETCH ERROR:', e.message);
    }
}
test();
