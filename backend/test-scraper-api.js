/**
 * Test script for Scraper API endpoints
 * 
 * This script tests the /api/v1/scraper/maps-search endpoint
 * Run with: node backend/test-scraper-api.js
 */

const http = require('http');

const API_BASE = 'http://localhost:5000';
const API_VERSION = 'v1';
const ENDPOINT = `${API_BASE}/api/${API_VERSION}/scraper/maps-search`;

// Test data
const testData = {
  city: 'New York',
  category: 'restaurant',
  limit: 5
};

console.log('🧪 Testing Scraper API Endpoint');
console.log('================================');
console.log(`Endpoint: ${ENDPOINT}`);
console.log(`Test Data: ${JSON.stringify(testData, null, 2)}`);
console.log('');

const requestData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 5000,
  path: `/api/${API_VERSION}/scraper/maps-search`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': requestData.length,
    // Note: In production, you would need to add Authorization header
    // 'Authorization': 'Bearer <your-token-here>'
  }
};

console.log('📤 Sending POST request...');

const req = http.request(options, (res) => {
  console.log(`📥 Response Status: ${res.statusCode} ${res.statusMessage}`);
  console.log(`📋 Response Headers: ${JSON.stringify(res.headers)}`);
  
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    try {
      const parsed = JSON.parse(responseData);
      console.log('\n✅ Response Body:');
      console.log(JSON.stringify(parsed, null, 2));
      
      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log('\n🎉 Test PASSED: API responded successfully');
        if (parsed.data && parsed.data.businesses) {
          console.log(`📊 Found ${parsed.data.businesses.length} businesses`);
          if (parsed.data.businesses.length > 0) {
            console.log('📝 Sample business:');
            console.log(JSON.stringify(parsed.data.businesses[0], null, 2));
          }
        }
      } else {
        console.log('\n❌ Test FAILED: API returned error status');
        if (parsed.error) {
          console.log(`Error: ${parsed.error}`);
          console.log(`Message: ${parsed.message}`);
        }
      }
    } catch (error) {
      console.log('\n❌ Test FAILED: Failed to parse response as JSON');
      console.log(`Raw response: ${responseData}`);
      console.log(`Error: ${error.message}`);
    }
    
    process.exit(res.statusCode === 200 || res.statusCode === 201 ? 0 : 1);
  });
});

req.on('error', (error) => {
  console.error('\n❌ Test FAILED: Request error');
  console.error(`Error: ${error.message}`);
  
  if (error.code === 'ECONNREFUSED') {
    console.error('\n💡 Tip: Make sure the server is running on port 5000');
    console.error('   Run: npm run dev:backend');
  }
  
  process.exit(1);
});

req.write(requestData);
req.end();

// Also test the API root to verify server is running
console.log('\n🔍 Testing API root endpoint...');
const apiRootReq = http.get(`${API_BASE}/api/${API_VERSION}`, (res) => {
  console.log(`API Root Status: ${res.statusCode}`);
  if (res.statusCode === 200) {
    console.log('✅ API server is running');
  }
});
apiRootReq.on('error', (err) => {
  console.log(`❌ API root test failed: ${err.message}`);
});