const BASE_URL = 'http://localhost:5000';

async function testSimple() {
  console.log('Testing error handling...\n');
  
  // Test 1: Missing auth header
  console.log('1. Testing missing auth header:');
  try {
    const res = await fetch(`${BASE_URL}/api/ad-views/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'test', campaignId: 'test' }),
    });
    const data = await res.json();
    console.log(`   Status: ${res.status}`);
    console.log(`   Response:`, JSON.stringify(data, null, 2));
  } catch (e) {
    console.log(`   Error: ${e.message}`);
  }
  
  console.log('\n2. Testing invalid token:');
  try {
    const res = await fetch(`${BASE_URL}/api/ad-views/invalid-token/complete`, {
      method: 'POST',
    });
    const data = await res.json();
    console.log(`   Status: ${res.status}`);
    console.log(`   Response:`, JSON.stringify(data, null, 2));
  } catch (e) {
    console.log(`   Error: ${e.message}`);
  }
}

testSimple();
