const http = require('http');

// Test CORS headers by making an OPTIONS request
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/v1/scraper/maps-search/public',
  method: 'OPTIONS',
  headers: {
    'Origin': 'https://mapleads-frontend.onrender.com',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'Content-Type, Accept'
  }
};

const req = http.request(options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    console.log('\nCORS Headers Check:');
    console.log('Access-Control-Allow-Origin:', res.headers['access-control-allow-origin']);
    console.log('Access-Control-Allow-Methods:', res.headers['access-control-allow-methods']);
    console.log('Access-Control-Allow-Headers:', res.headers['access-control-allow-headers']);
    console.log('Access-Control-Allow-Credentials:', res.headers['access-control-allow-credentials']);
    
    if (res.headers['access-control-allow-origin'] === 'https://mapleads-frontend.onrender.com') {
      console.log('✅ CORS test PASSED: Frontend origin allowed');
    } else {
      console.log('❌ CORS test FAILED: Frontend origin not properly allowed');
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
  console.log('Note: Make sure the backend server is running on port 5000');
});

req.end();