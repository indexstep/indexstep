const https = require('https');

async function main() {
  // Create user via Supabase Auth REST API
  const email = 'admin@stephud.com';
  const password = 'admin123';
  const projectId = 'ahzkorykrxctsywhnyxz';
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'; // placeholder - won't work for auth

  // Try creating user with admin API
  // First, let's try with the service role key from local storage
  // Actually let's try to hit the Supabase auth endpoint
  
  const data = JSON.stringify({
    email,
    password,
    user_metadata: { name: 'Admin' }
  });

  const options = {
    hostname: `${projectId}.supabase.co`,
    port: 443,
    path: '/auth/v1/admin/users',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    }
  };

  const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      console.log('Response:', body);
    });
  });

  req.on('error', (e) => console.error('Error:', e.message));
  req.write(data);
  req.end();
}

main();
