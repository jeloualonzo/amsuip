#!/usr/bin/env node

/**
 * Simple test script for the AI Signature Verification Service
 * Usage: node test-service.js [base-url]
 */

const BASE_URL = process.argv[2] || 'http://localhost:8081';

async function testHealthCheck() {
  console.log('🔍 Testing health check...');
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Health check passed');
      console.log('   Status:', data.status);
      console.log('   Services:', data.services);
    } else {
      console.log('❌ Health check failed');
      console.log('   Status:', response.status);
      console.log('   Response:', data);
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
  }
  console.log();
}

async function testTraining(studentId = 1) {
  console.log(`🎯 Testing training for student ${studentId}...`);
  try {
    const response = await fetch(`${BASE_URL}/train/${studentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Training request successful');
      console.log('   Success:', data.success);
      console.log('   Message:', data.message);
      if (data.profile) {
        console.log('   Profile status:', data.profile.status);
        console.log('   Samples:', data.profile.num_samples);
        console.log('   Threshold:', data.profile.threshold);
      }
    } else {
      console.log('❌ Training request failed');
      console.log('   Status:', response.status);
      console.log('   Error:', data.error || data.message);
    }
  } catch (error) {
    console.log('❌ Training request error:', error.message);
  }
  console.log();
}

async function testVerification() {
  console.log('📝 Testing signature verification...');
  
  // Create a simple test image (1x1 pixel PNG)
  const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA8+d2CQAAAABJRU5ErkJggg==';
  const testImageBuffer = Buffer.from(testImageBase64, 'base64');
  
  try {
    const formData = new FormData();
    const blob = new Blob([testImageBuffer], { type: 'image/png' });
    formData.append('file', blob, 'test-signature.png');
    formData.append('session_id', '1');
    
    const response = await fetch(`${BASE_URL}/verify`, {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Verification request successful');
      console.log('   Success:', data.success);
      console.log('   Match:', data.match);
      console.log('   Score:', data.score);
      console.log('   Decision:', data.decision);
      console.log('   Message:', data.message);
      if (data.predicted_student) {
        console.log('   Student:', `${data.predicted_student.firstname} ${data.predicted_student.surname}`);
      }
    } else {
      console.log('❌ Verification request failed');
      console.log('   Status:', response.status);
      console.log('   Error:', data.error || data.message);
    }
  } catch (error) {
    console.log('❌ Verification request error:', error.message);
  }
  console.log();
}

async function runTests() {
  console.log(`🚀 Testing AI Signature Verification Service at ${BASE_URL}\n`);
  
  await testHealthCheck();
  await testTraining();
  await testVerification();
  
  console.log('🏁 Test suite completed');
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.error('❌ This script requires Node.js 18+ with built-in fetch support');
  process.exit(1);
}

// Check if FormData is available
if (typeof FormData === 'undefined') {
  console.error('❌ FormData not available. Please use Node.js 18+ or install a polyfill');
  process.exit(1);
}

runTests().catch(error => {
  console.error('💥 Test suite failed:', error);
  process.exit(1);
});