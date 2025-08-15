// /lib/db.js
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function queryDB(sql, params = []) {
  const client = await pool.connect();
  try {
    const r = await client.query(sql, params);
    return r.rows;
  } finally {
    client.release();
  }
}
module.exports = { queryDB };