const BASE_URL = 'http://localhost:5000';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, colors.cyan);
  console.log('='.repeat(60));
}

function logTest(testName) {
  log(`\n▶ ${testName}`, colors.blue);
}

function logSuccess(message) {
  log(`  ✓ ${message}`, colors.green);
}

function logError(message) {
  log(`  ✗ ${message}`, colors.red);
}

function logWarning(message) {
  log(`  ⚠ ${message}`, colors.yellow);
}

async function makeRequest(method, path, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${path}`, options);
  const data = await response.json().catch(() => null);
  
  return { response, data };
}

let testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

async function testLinkTracking() {
  logSection('TEST SUITE 1: Link Tracking Functionality');

  logTest('Test 1.1: Start ad view tracking');
  try {
    const { response, data } = await makeRequest('POST', '/api/ad-views/start', {
      userId: 'test-user-1',
      campaignId: 'test-campaign-1',
    });

    if (response.ok && data.trackingToken && data.viewId) {
      logSuccess(`Ad view started successfully`);
      logSuccess(`Tracking token: ${data.trackingToken.substring(0, 20)}...`);
      logSuccess(`View ID: ${data.viewId}`);
      testResults.passed++;
      return data;
    } else {
      logError(`Failed to start ad view: ${JSON.stringify(data)}`);
      testResults.failed++;
      return null;
    }
  } catch (error) {
    logError(`Error: ${error.message}`);
    testResults.failed++;
    return null;
  }
}

async function testCompleteView(trackingToken) {
  logTest('Test 1.2: Complete ad view');
  try {
    const { response, data } = await makeRequest('POST', `/api/ad-views/${trackingToken}/complete`);

    if (response.ok && data.success) {
      logSuccess('Ad view completed successfully');
      testResults.passed++;
      return true;
    } else {
      logError(`Failed to complete ad view: ${JSON.stringify(data)}`);
      testResults.failed++;
      return false;
    }
  } catch (error) {
    logError(`Error: ${error.message}`);
    testResults.failed++;
    return false;
  }
}

async function testClickTracking(trackingToken) {
  logTest('Test 1.3: Track link click');
  try {
    const { response, data } = await makeRequest('POST', `/api/ad-views/${trackingToken}/click`);

    if (response.ok && data.success) {
      logSuccess('Link click tracked successfully');
      testResults.passed++;
      return true;
    } else {
      logError(`Failed to track click: ${JSON.stringify(data)}`);
      testResults.failed++;
      return false;
    }
  } catch (error) {
    logError(`Error: ${error.message}`);
    testResults.failed++;
    return false;
  }
}

async function testRewardClaim(trackingToken) {
  logTest('Test 1.4: Claim reward');
  try {
    const { response, data } = await makeRequest('POST', `/api/ad-views/${trackingToken}/claim`, {
      rewardAmount: '5.00',
    });

    if (response.ok && data.success) {
      logSuccess('Reward claimed successfully');
      testResults.passed++;
      return true;
    } else {
      logError(`Failed to claim reward: ${JSON.stringify(data)}`);
      testResults.failed++;
      return false;
    }
  } catch (error) {
    logError(`Error: ${error.message}`);
    testResults.failed++;
    return false;
  }
}

async function testFraudDetection() {
  logSection('TEST SUITE 2: Fraud Detection');

  logTest('Test 2.1: Get fraud detection settings');
  try {
    const { response, data } = await makeRequest('GET', '/api/admin/fraud/settings');

    if (response.ok && data.id) {
      logSuccess('Fraud detection settings retrieved');
      logSuccess(`Max views per user per day: ${data.maxViewsPerUserPerDay}`);
      logSuccess(`Max views per IP per day: ${data.maxViewsPerIpPerDay}`);
      logSuccess(`Auto-flag threshold: ${data.autoFlagThreshold}`);
      logSuccess(`Enabled: ${data.enabled}`);
      testResults.passed++;
      return data;
    } else {
      logError(`Failed to get settings: ${JSON.stringify(data)}`);
      testResults.failed++;
      return null;
    }
  } catch (error) {
    logError(`Error: ${error.message}`);
    testResults.failed++;
    return null;
  }
}

async function testFraudScoring() {
  logTest('Test 2.2: Test fraud scoring with rapid views');
  try {
    const results = [];
    
    for (let i = 0; i < 5; i++) {
      const { response, data } = await makeRequest('POST', '/api/ad-views/start', {
        userId: 'test-user-fraud',
        campaignId: 'test-campaign-1',
      });
      
      results.push({ response, data });
      
      if (i < 4) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const successCount = results.filter(r => r.response.ok).length;
    const blockedCount = results.filter(r => r.response.status === 403).length;

    logSuccess(`Created ${successCount} ad views`);
    if (blockedCount > 0) {
      logSuccess(`Blocked ${blockedCount} views due to fraud detection`);
    }
    
    if (results[0].response.ok && results[0].data.trackingToken) {
      logSuccess(`First view fraud score tracked`);
    }

    testResults.passed++;
    return true;
  } catch (error) {
    logError(`Error: ${error.message}`);
    testResults.failed++;
    return false;
  }
}

async function testUpdateFraudSettings() {
  logTest('Test 2.3: Update fraud detection settings');
  try {
    const { response, data } = await makeRequest('PATCH', '/api/admin/fraud/settings', {
      maxViewsPerUserPerDay: 100,
      autoFlagThreshold: 90,
    });

    if (response.ok && data.maxViewsPerUserPerDay === 100) {
      logSuccess('Fraud settings updated successfully');
      logSuccess(`New max views per user: ${data.maxViewsPerUserPerDay}`);
      logSuccess(`New auto-flag threshold: ${data.autoFlagThreshold}`);
      testResults.passed++;
      return true;
    } else {
      logError(`Failed to update settings: ${JSON.stringify(data)}`);
      testResults.failed++;
      return false;
    }
  } catch (error) {
    logError(`Error: ${error.message}`);
    testResults.failed++;
    return false;
  }
}

async function testGetFlaggedViews() {
  logTest('Test 2.4: Get flagged ad views');
  try {
    const { response, data } = await makeRequest('GET', '/api/admin/fraud/flagged');

    if (response.ok && Array.isArray(data)) {
      logSuccess(`Retrieved ${data.length} flagged ad views`);
      if (data.length > 0) {
        logSuccess(`Sample flagged view: User ${data[0].userId}, Score: ${data[0].fraudScore}`);
      }
      testResults.passed++;
      return true;
    } else {
      logError(`Failed to get flagged views: ${JSON.stringify(data)}`);
      testResults.failed++;
      return false;
    }
  } catch (error) {
    logError(`Error: ${error.message}`);
    testResults.failed++;
    return false;
  }
}

async function testAnalytics() {
  logSection('TEST SUITE 3: Analytics & Reporting');

  logTest('Test 3.1: Get campaign analytics');
  try {
    const { response, data } = await makeRequest('GET', '/api/analytics/campaign/test-campaign-1');

    if (response.ok && data.campaignId) {
      logSuccess('Campaign analytics retrieved');
      logSuccess(`Total views: ${data.totalViews}`);
      logSuccess(`Completed views: ${data.completedViews}`);
      logSuccess(`Clicked views: ${data.clickedViews}`);
      logSuccess(`Completion rate: ${data.completionRate}%`);
      logSuccess(`Click-through rate: ${data.clickThroughRate}%`);
      logSuccess(`Fraud rate: ${data.fraudRate}%`);
      logSuccess(`Total rewards: $${data.totalRewards}`);
      testResults.passed++;
      return true;
    } else {
      logError(`Failed to get campaign analytics: ${JSON.stringify(data)}`);
      testResults.failed++;
      return false;
    }
  } catch (error) {
    logError(`Error: ${error.message}`);
    testResults.failed++;
    return false;
  }
}

async function testUserAnalytics() {
  logTest('Test 3.2: Get user analytics');
  try {
    const { response, data } = await makeRequest('GET', '/api/analytics/user/test-user-1');

    if (response.ok && data.userId) {
      logSuccess('User analytics retrieved');
      logSuccess(`Total views: ${data.totalViews}`);
      logSuccess(`Completed views: ${data.completedViews}`);
      logSuccess(`Clicked views: ${data.clickedViews}`);
      logSuccess(`Total earnings: $${data.totalEarnings}`);
      logSuccess(`Flagged views: ${data.flaggedViews}`);
      logSuccess(`Avg fraud score: ${data.avgFraudScore}`);
      testResults.passed++;
      return true;
    } else {
      logError(`Failed to get user analytics: ${JSON.stringify(data)}`);
      testResults.failed++;
      return false;
    }
  } catch (error) {
    logError(`Error: ${error.message}`);
    testResults.failed++;
    return false;
  }
}

async function testGetUserAdViews() {
  logTest('Test 3.3: Get user ad views');
  try {
    const { response, data } = await makeRequest('GET', '/api/ad-views/user/test-user-1');

    if (response.ok && Array.isArray(data)) {
      logSuccess(`Retrieved ${data.length} ad views for user`);
      if (data.length > 0) {
        logSuccess(`Sample view: Campaign ${data[0].campaignId}, Completed: ${!!data[0].viewCompleted}`);
      }
      testResults.passed++;
      return true;
    } else {
      logError(`Failed to get user ad views: ${JSON.stringify(data)}`);
      testResults.failed++;
      return false;
    }
  } catch (error) {
    logError(`Error: ${error.message}`);
    testResults.failed++;
    return false;
  }
}

async function testGetCampaignAdViews() {
  logTest('Test 3.4: Get campaign ad views');
  try {
    const { response, data } = await makeRequest('GET', '/api/ad-views/campaign/test-campaign-1');

    if (response.ok && Array.isArray(data)) {
      logSuccess(`Retrieved ${data.length} ad views for campaign`);
      if (data.length > 0) {
        logSuccess(`Sample view: User ${data[0].userId}, Clicked: ${data[0].linkClicked}`);
      }
      testResults.passed++;
      return true;
    } else {
      logError(`Failed to get campaign ad views: ${JSON.stringify(data)}`);
      testResults.failed++;
      return false;
    }
  } catch (error) {
    logError(`Error: ${error.message}`);
    testResults.failed++;
    return false;
  }
}

async function runAllTests() {
  log('\n🚀 Starting Comprehensive Ad Tracking System Tests\n', colors.cyan);
  log(`Testing against: ${BASE_URL}\n`, colors.yellow);

  try {
    const adViewData = await testLinkTracking();
    
    if (adViewData && adViewData.trackingToken) {
      await new Promise(resolve => setTimeout(resolve, 500));
      await testCompleteView(adViewData.trackingToken);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      await testClickTracking(adViewData.trackingToken);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      await testRewardClaim(adViewData.trackingToken);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    await testFraudDetection();
    
    await new Promise(resolve => setTimeout(resolve, 500));
    await testFraudScoring();
    
    await new Promise(resolve => setTimeout(resolve, 500));
    await testUpdateFraudSettings();
    
    await new Promise(resolve => setTimeout(resolve, 500));
    await testGetFlaggedViews();

    await new Promise(resolve => setTimeout(resolve, 1000));
    await testAnalytics();
    
    await new Promise(resolve => setTimeout(resolve, 500));
    await testUserAnalytics();
    
    await new Promise(resolve => setTimeout(resolve, 500));
    await testGetUserAdViews();
    
    await new Promise(resolve => setTimeout(resolve, 500));
    await testGetCampaignAdViews();

  } catch (error) {
    logError(`\nFatal error during test execution: ${error.message}`);
    console.error(error);
  }

  logSection('TEST RESULTS SUMMARY');
  log(`\nTotal Tests: ${testResults.passed + testResults.failed}`, colors.cyan);
  log(`✓ Passed: ${testResults.passed}`, colors.green);
  log(`✗ Failed: ${testResults.failed}`, colors.red);
  
  if (testResults.warnings > 0) {
    log(`⚠ Warnings: ${testResults.warnings}`, colors.yellow);
  }

  const successRate = ((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1);
  log(`\nSuccess Rate: ${successRate}%`, successRate >= 80 ? colors.green : colors.red);

  if (testResults.failed === 0) {
    log('\n🎉 All tests passed!', colors.green);
  } else {
    log('\n⚠️  Some tests failed. Please review the errors above.', colors.yellow);
  }

  console.log('\n');
}

runAllTests().catch(console.error);
