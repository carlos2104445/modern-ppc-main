const BASE_URL = 'http://localhost:5000';

async function testErrorHandling() {
  console.log('🧪 Testing Error Handling System\n');
  
  const tests = [
    {
      name: 'Missing userId field',
      request: async () => {
        const response = await fetch(`${BASE_URL}/api/ad-views/start`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': 'test-user-1',
          },
          body: JSON.stringify({
            campaignId: 'test-campaign-1',
          }),
        });
        return response;
      },
      expectedCode: 1101,
      expectedStatus: 400,
    },
    {
      name: 'Missing authentication header',
      request: async () => {
        const response = await fetch(`${BASE_URL}/api/ad-views/start`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: 'test-user-1',
            campaignId: 'test-campaign-1',
          }),
        });
        return response;
      },
      expectedCode: 1000,
      expectedStatus: 401,
    },
    {
      name: 'Ad view not found',
      request: async () => {
        const response = await fetch(`${BASE_URL}/api/ad-views/invalid-token/complete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        return response;
      },
      expectedCode: 1300,
      expectedStatus: 404,
    },
    {
      name: 'Reward already claimed',
      request: async () => {
        const startResponse = await fetch(`${BASE_URL}/api/ad-views/start`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': 'test-user-1',
          },
          body: JSON.stringify({
            userId: 'test-user-1',
            campaignId: 'test-campaign-1',
          }),
        });
        
        if (!startResponse.ok) {
          console.log('Failed to create ad view:', await startResponse.text());
          return null;
        }
        
        const { trackingToken } = await startResponse.json();
        
        await fetch(`${BASE_URL}/api/ad-views/${trackingToken}/complete`, {
          method: 'POST',
        });
        
        await fetch(`${BASE_URL}/api/ad-views/${trackingToken}/claim`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rewardAmount: '0.10',
          }),
        });
        
        const response = await fetch(`${BASE_URL}/api/ad-views/${trackingToken}/claim`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rewardAmount: '0.10',
          }),
        });
        
        return response;
      },
      expectedCode: 1302,
      expectedStatus: 400,
    },
    {
      name: 'Minimum view duration not met',
      request: async () => {
        const startResponse = await fetch(`${BASE_URL}/api/ad-views/start`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': 'test-user-2',
          },
          body: JSON.stringify({
            userId: 'test-user-2',
            campaignId: 'test-campaign-1',
          }),
        });
        
        if (!startResponse.ok) {
          console.log('Failed to create ad view:', await startResponse.text());
          return null;
        }
        
        const { trackingToken } = await startResponse.json();
        
        await fetch(`${BASE_URL}/api/ad-views/${trackingToken}/complete`, {
          method: 'POST',
        });
        
        const response = await fetch(`${BASE_URL}/api/ad-views/${trackingToken}/claim`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rewardAmount: '0.10',
          }),
        });
        
        return response;
      },
      expectedCode: 1602,
      expectedStatus: 400,
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}`);
      const response = await test.request();
      
      if (!response) {
        console.log('  ❌ Test setup failed\n');
        failed++;
        continue;
      }
      
      const data = await response.json();
      
      const statusMatch = response.status === test.expectedStatus;
      const codeMatch = data.code === test.expectedCode;
      
      if (statusMatch && codeMatch) {
        console.log(`  ✅ Status: ${response.status}, Code: ${data.code}`);
        console.log(`  Message: ${data.message}`);
        if (data.details) {
          console.log(`  Details:`, JSON.stringify(data.details, null, 2));
        }
        passed++;
      } else {
        console.log(`  ❌ Expected status ${test.expectedStatus}, got ${response.status}`);
        console.log(`  ❌ Expected code ${test.expectedCode}, got ${data.code}`);
        console.log(`  Response:`, JSON.stringify(data, null, 2));
        failed++;
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      failed++;
    }
    console.log('');
  }

  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passed}/${tests.length}`);
  console.log(`❌ Failed: ${failed}/${tests.length}`);
  
  if (failed === 0) {
    console.log('\n🎉 All error handling tests passed!');
  }
}

testErrorHandling().catch(console.error);
