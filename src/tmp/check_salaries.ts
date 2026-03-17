import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkSalaries() {
    try {
        const res = await pool.query("SELECT id, name, username, basic_salary FROM users WHERE username LIKE '%@keil.com%' OR username LIKE '%maxtron%';");
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkSalaries();
