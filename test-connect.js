const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres.ahzkorykrxctsywhnyxz:St3phudPass1@db.ahzkorykrxctsywhnyxz.supabase.co:5432/postgres',
});
client.connect().then(() => { console.log('Connected!'); client.end(); }).catch(e => console.error('Error:', e.message));
