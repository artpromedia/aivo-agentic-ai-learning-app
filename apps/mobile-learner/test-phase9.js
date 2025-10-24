#!/usr/bin/env node

/**
 * Phase 9 Testing Script
 * 
 * Tests background sync, analytics, and crash reporting
 * Run this script to verify Phase 9 features are working
 */

const {execSync} = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m', // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m', // Red
    warning: '\x1b[33m', // Yellow
  };
  const reset = '\x1b[0m';
  console.log(`${colors[type]}${message}${reset}`);
}

function section(title) {
  log(`\n${'='.repeat(60)}`, 'info');
  log(title.toUpperCase(), 'info');
  log('='.repeat(60), 'info');
}

async function main() {
  log('\n🚀 Phase 9 Advanced Features - Testing Guide\n', 'success');

  section('1. Background Sync Testing');
  
  log('\n📋 Test 1: App Backgrounded');
  log('1. Open the app on your device');
  log('2. Press the home button (app goes to background)');
  log('3. Wait 15 minutes');
  log('4. Check device logs for [BackgroundFetch] messages\n');
  
  const test1 = await ask('Did background sync run? (y/n): ');
  if (test1.toLowerCase() === 'y') {
    log('✅ Test 1 PASSED', 'success');
  } else {
    log('❌ Test 1 FAILED - Check Info.plist (iOS) or AndroidManifest.xml (Android)', 'error');
  }

  log('\n📋 Test 2: App Killed (Headless)');
  log('1. Open the app');
  log('2. Force quit the app (swipe up from recents)');
  log('3. Wait 15 minutes');
  log('4. Check device logs (adb logcat or Xcode console)');
  log('5. Look for [BackgroundFetch] Headless task messages\n');
  
  const test2 = await ask('Did headless task run? (y/n): ');
  if (test2.toLowerCase() === 'y') {
    log('✅ Test 2 PASSED', 'success');
  } else {
    log('❌ Test 2 FAILED - Check index.js has registerHeadlessTask', 'error');
  }

  log('\n📋 Test 3: WiFi-Only Sync');
  log('1. Configure requiredNetworkType: "wifi" in backgroundSyncService');
  log('2. Disconnect WiFi (use cellular data)');
  log('3. Background the app');
  log('4. Wait for sync interval');
  log('5. Verify sync did NOT occur (check logs)');
  log('6. Connect to WiFi');
  log('7. Verify sync occurs\n');
  
  const test3 = await ask('Did WiFi-only sync work correctly? (y/n): ');
  if (test3.toLowerCase() === 'y') {
    log('✅ Test 3 PASSED', 'success');
  } else {
    log('❌ Test 3 FAILED - Check network type detection', 'error');
  }

  section('2. Upload Queue Testing');

  log('\n📋 Test 4: Background Upload');
  log('1. Take a photo or video');
  log('2. Add to upload queue');
  log('3. Background the app');
  log('4. Verify upload continues (check notification)');
  log('5. Check upload completes\n');
  
  const test4 = await ask('Did background upload work? (y/n): ');
  if (test4.toLowerCase() === 'y') {
    log('✅ Test 4 PASSED', 'success');
  } else {
    log('❌ Test 4 FAILED - Check uploadQueueService configuration', 'error');
  }

  log('\n📋 Test 5: Upload Retry');
  log('1. Disable internet connection');
  log('2. Add file to upload queue');
  log('3. Verify upload fails');
  log('4. Enable internet');
  log('5. Verify upload retries automatically\n');
  
  const test5 = await ask('Did upload retry work? (y/n): ');
  if (test5.toLowerCase() === 'y') {
    log('✅ Test 5 PASSED', 'success');
  } else {
    log('❌ Test 5 FAILED - Check retry logic in uploadQueueService', 'error');
  }

  section('3. Analytics Testing');

  log('\n📋 Test 6: Event Tracking');
  log('1. Perform various actions (start lesson, complete activity)');
  log('2. Check console for [Analytics] logs');
  log('3. Wait up to 1 hour');
  log('4. Check Firebase Console > Analytics > Events');
  log('5. Verify events appear with correct parameters\n');
  
  const test6 = await ask('Do analytics events appear in Firebase? (y/n): ');
  if (test6.toLowerCase() === 'y') {
    log('✅ Test 6 PASSED', 'success');
  } else {
    log('❌ Test 6 FAILED - Check Firebase configuration and google-services.json/GoogleService-Info.plist', 'error');
  }

  log('\n📋 Test 7: Screen View Tracking');
  log('1. Navigate between screens');
  log('2. Check console for [Navigation] logs');
  log('3. Check Firebase Console for screen_view events\n');
  
  const test7 = await ask('Are screen views tracked? (y/n): ');
  if (test7.toLowerCase() === 'y') {
    log('✅ Test 7 PASSED', 'success');
  } else {
    log('❌ Test 7 FAILED - Check navigationUtils integration', 'error');
  }

  log('\n📋 Test 8: Offline Event Queue');
  log('1. Disable internet');
  log('2. Perform actions (complete lesson, earn badge)');
  log('3. Verify events queued in database (check analytics_events table)');
  log('4. Enable internet');
  log('5. Verify events sync to Firebase\n');
  
  const test8 = await ask('Does offline event queue work? (y/n): ');
  if (test8.toLowerCase() === 'y') {
    log('✅ Test 8 PASSED', 'success');
  } else {
    log('❌ Test 8 FAILED - Check analyticsService offline queue', 'error');
  }

  section('4. Crash Reporting Testing');

  log('\n📋 Test 9: Manual Error Capture');
  log('1. Add this code to your app:');
  log('   import * as Sentry from "@sentry/react-native";');
  log('   Sentry.captureException(new Error("Test error"));');
  log('2. Run the code');
  log('3. Check Sentry dashboard');
  log('4. Verify error appears with context\n');
  
  const test9 = await ask('Does Sentry capture manual errors? (y/n): ');
  if (test9.toLowerCase() === 'y') {
    log('✅ Test 9 PASSED', 'success');
  } else {
    log('❌ Test 9 FAILED - Check SENTRY_DSN in .env and sentry.config.ts', 'error');
  }

  log('\n📋 Test 10: Error Context');
  log('1. Set user context with analyticsService.setUser()');
  log('2. Trigger an error');
  log('3. Check Sentry dashboard');
  log('4. Verify user/device information is attached\n');
  
  const test10 = await ask('Does Sentry include error context? (y/n): ');
  if (test10.toLowerCase() === 'y') {
    log('✅ Test 10 PASSED', 'success');
  } else {
    log('❌ Test 10 FAILED - Check Sentry.setUser() and setContext() calls', 'error');
  }

  section('5. COPPA Compliance Testing');

  log('\n📋 Test 11: Analytics Toggle');
  log('1. Call analyticsService.setAnalyticsEnabled(false)');
  log('2. Perform actions');
  log('3. Verify events are NOT sent to Firebase');
  log('4. Call analyticsService.setAnalyticsEnabled(true)');
  log('5. Perform actions');
  log('6. Verify events ARE sent\n');
  
  const test11 = await ask('Does analytics toggle work? (y/n): ');
  if (test11.toLowerCase() === 'y') {
    log('✅ Test 11 PASSED', 'success');
  } else {
    log('❌ Test 11 FAILED - Check setAnalyticsEnabled implementation', 'error');
  }

  section('Test Summary');

  const tests = [test1, test2, test3, test4, test5, test6, test7, test8, test9, test10, test11];
  const passed = tests.filter(t => t.toLowerCase() === 'y').length;
  const failed = tests.length - passed;

  log(`\nTotal Tests: ${tests.length}`);
  log(`Passed: ${passed}`, passed > 0 ? 'success' : 'error');
  log(`Failed: ${failed}`, failed > 0 ? 'error' : 'success');

  const passRate = (passed / tests.length) * 100;
  log(`\nPass Rate: ${passRate.toFixed(1)}%`, passRate >= 90 ? 'success' : passRate >= 70 ? 'warning' : 'error');

  if (passRate === 100) {
    log('\n🎉 Congratulations! All Phase 9 features are working!', 'success');
  } else if (passRate >= 90) {
    log('\n⚠️  Almost there! Fix the remaining issues.', 'warning');
  } else if (passRate >= 70) {
    log('\n⚠️  Good progress, but needs more work.', 'warning');
  } else {
    log('\n❌ Multiple issues detected. Review installation guide.', 'error');
  }

  log('\n📚 Next Steps:');
  log('1. Fix any failed tests (see error messages above)');
  log('2. Review PHASE9_INSTALLATION.md for troubleshooting');
  log('3. Check device logs for error details');
  log('4. Test on multiple devices (iOS and Android)');
  log('5. Monitor Firebase Console and Sentry dashboard');

  rl.close();
}

// Run the tests
main().catch((error) => {
  console.error('Error running tests:', error);
  process.exit(1);
});
