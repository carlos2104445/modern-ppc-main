const BASE_URL = "http://localhost:5000";

async function testEndpoint(name, method, url, body, expectedStatus, expectedErrorCode) {
  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-user-id": "test-user-123",
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${url}`, options);
    const data = await response.json();
    
    if (response.status === expectedStatus) {
      if (expectedErrorCode && data.code === expectedErrorCode) {
        console.log(`✅ ${name}: Correct error code ${expectedErrorCode}`);
        return true;
      } else if (!expectedErrorCode) {
        console.log(`✅ ${name}: Success`);
        return true;
      } else {
        console.log(`❌ ${name}: Expected error code ${expectedErrorCode}, got ${data.code}`);
        return false;
      }
    } else {
      console.log(`❌ ${name}: Expected status ${expectedStatus}, got ${response.status}`);
      console.log(`   Response:`, JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log("🧪 Testing Full Error Handling Migration\n");
  
  let passed = 0;
  let failed = 0;
  
  if (await testEndpoint(
    "Login with invalid credentials",
    "POST",
    "/api/auth/login",
    { email: "invalid@test.com", password: "wrong" },
    401,
    1001
  )) passed++; else failed++;
  
  if (await testEndpoint(
    "Get non-existent blog post",
    "GET",
    "/api/blog-posts/nonexistent-id",
    null,
    404,
    1200
  )) passed++; else failed++;
  
  if (await testEndpoint(
    "Get non-existent campaign",
    "GET",
    "/api/admin-campaigns/nonexistent-id",
    null,
    404,
    1200
  )) passed++; else failed++;
  
  if (await testEndpoint(
    "Track with invalid token",
    "GET",
    "/api/track/invalid-token",
    null,
    404,
    1304
  )) passed++; else failed++;
  
  if (await testEndpoint(
    "Complete non-existent ad view",
    "POST",
    "/api/ad-views/invalid-token/complete",
    {},
    404,
    1300
  )) passed++; else failed++;
  
  if (await testEndpoint(
    "Get non-existent withdrawal request",
    "GET",
    "/api/withdrawal-requests/nonexistent-id",
    null,
    404,
    1200
  )) passed++; else failed++;
  
  if (await testEndpoint(
    "Get non-existent deposit request",
    "GET",
    "/api/deposit-requests/nonexistent-id",
    null,
    404,
    1200
  )) passed++; else failed++;
  
  if (await testEndpoint(
    "Get non-existent role",
    "GET",
    "/api/roles/nonexistent-id",
    null,
    404,
    1200
  )) passed++; else failed++;
  
  if (await testEndpoint(
    "Get non-existent staff",
    "GET",
    "/api/staff/nonexistent-id",
    null,
    404,
    1200
  )) passed++; else failed++;
  
  if (await testEndpoint(
    "Get non-existent subscription plan",
    "GET",
    "/api/admin/subscription-plans/nonexistent-id",
    null,
    404,
    1200
  )) passed++; else failed++;
  
  if (await testEndpoint(
    "Get non-existent FAQ",
    "GET",
    "/api/faqs/nonexistent-id",
    null,
    404,
    1200
  )) passed++; else failed++;
  
  if (await testEndpoint(
    "Get non-existent payment",
    "GET",
    "/api/chapa/payments/nonexistent-id",
    null,
    404,
    1200
  )) passed++; else failed++;
  
  if (await testEndpoint(
    "Initialize payment with missing fields",
    "POST",
    "/api/chapa/initialize",
    { userId: "test" },
    400,
    1102
  )) passed++; else failed++;
  
  if (await testEndpoint(
    "Initialize payment with invalid amount",
    "POST",
    "/api/chapa/initialize",
    { 
      userId: "test", 
      amount: -10, 
      email: "test@test.com",
      firstName: "Test",
      lastName: "User"
    },
    400,
    1102
  )) passed++; else failed++;
  
  if (await testEndpoint(
    "Get all blog posts",
    "GET",
    "/api/blog-posts",
    null,
    200
  )) passed++; else failed++;
  
  if (await testEndpoint(
    "Get all FAQs",
    "GET",
    "/api/faqs",
    null,
    200
  )) passed++; else failed++;
  
  if (await testEndpoint(
    "Get financial settings",
    "GET",
    "/api/financial-settings",
    null,
    200
  )) passed++; else failed++;
  
  if (await testEndpoint(
    "Get referral settings",
    "GET",
    "/api/referral-settings",
    null,
    200
  )) passed++; else failed++;
  
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  console.log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log("\n✅ All tests passed! Error handling migration is complete.");
  } else {
    console.log("\n⚠️  Some tests failed. Please review the errors above.");
  }
}

runTests().catch(console.error);
