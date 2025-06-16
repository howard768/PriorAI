#!/usr/bin/env node

const axios = require('axios');

/**
 * Real-time Policy Collection Monitor
 * Tracks when new policies are added to the database
 */

const API_BASE = 'http://localhost:3002';
let lastPolicyCount = 0;
let lastPayerCount = 0;
let startTime = new Date();

async function checkPolicyUpdates() {
  try {
    // Get current policy metrics
    const [policiesResponse, analyticsResponse] = await Promise.all([
      axios.get(`${API_BASE}/api/policies?limit=1`),
      axios.get(`${API_BASE}/api/analytics/data-moat`)
    ]);

    const totalPolicies = policiesResponse.data.metadata.total_policies;
    const totalPayers = analyticsResponse.data.market_coverage.payers_covered;
    const lastUpdated = policiesResponse.data.metadata.last_updated;
    
    // Check for new policies
    if (totalPolicies > lastPolicyCount) {
      const newPolicies = totalPolicies - lastPolicyCount;
      console.log(`🎉 NEW POLICIES ADDED: +${newPolicies} (Total: ${totalPolicies})`);
      lastPolicyCount = totalPolicies;
    }

    // Check for new payers
    if (totalPayers > lastPayerCount) {
      const newPayers = totalPayers - lastPayerCount;
      console.log(`🏥 NEW PAYERS ADDED: +${newPayers} (Total: ${totalPayers})`);
      lastPayerCount = totalPayers;
    }

    // Show current status
    const runtime = Math.round((new Date() - startTime) / 1000);
    console.log(`[${new Date().toISOString().substr(11, 8)}] 📊 Status: ${totalPolicies} policies, ${totalPayers} payers (Runtime: ${runtime}s)`);
    
    // Show recent policy details if there are new ones
    if (totalPolicies > 3) { // More than initial seeded data
      const recentPolicies = await axios.get(`${API_BASE}/api/policies?limit=3`);
      console.log('📋 Most Recent Policies:');
      recentPolicies.data.policies.forEach((policy, index) => {
        console.log(`   ${index + 1}. ${policy.payer} - ${policy.medication} (${policy.confidence_score})`);
      });
    }

    console.log('---');

  } catch (error) {
    console.error(`❌ Error checking policies: ${error.message}`);
  }
}

async function startMonitoring() {
  console.log('🔍 Starting Real-Time Policy Collection Monitor...');
  console.log(`📡 Monitoring: ${API_BASE}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log('===============================================\n');

  // Initial check
  try {
    const initialResponse = await axios.get(`${API_BASE}/api/policies?limit=1`);
    lastPolicyCount = initialResponse.data.metadata.total_policies;
    
    const analyticsResponse = await axios.get(`${API_BASE}/api/analytics/data-moat`);
    lastPayerCount = analyticsResponse.data.market_coverage.payers_covered;
    
    console.log(`📊 Initial State: ${lastPolicyCount} policies, ${lastPayerCount} payers\n`);
  } catch (error) {
    console.error(`❌ Failed to connect to API: ${error.message}`);
    console.log('   Make sure the data collection service is running on port 3002');
    process.exit(1);
  }

  // Check every 10 seconds
  setInterval(checkPolicyUpdates, 10000);
  
  // Also check immediately
  setTimeout(checkPolicyUpdates, 1000);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Policy monitoring stopped');
  console.log(`⏱️  Total runtime: ${Math.round((new Date() - startTime) / 1000)} seconds`);
  process.exit(0);
});

startMonitoring(); 