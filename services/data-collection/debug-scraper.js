const PolicyScraper = require('./scrapers/policy-scraper');
const SQLiteStorage = require('./storage/sqlite-storage');
const RequirementExtractor = require('./parsers/requirement-extractor');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

async function debugScraper() {
  try {
    console.log('🧪 Testing scraper components...');
    
    // Initialize services
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    
    const policyStorage = new SQLiteStorage();
    await policyStorage.initializeSchema();
    
    const requirementExtractor = new RequirementExtractor(anthropic);
    
    console.log('✅ Services initialized');
    
    // Test basic policy storage
    const testPolicy = {
      payer: 'Test Payer',
      medication: 'Test Medication',
      source: 'Debug Test',
      requirements: { test: 'data' },
      confidence_score: 0.95,
      raw_text: 'Test policy content',
      extracted_at: new Date().toISOString(),
      effective_date: new Date().toISOString().split('T')[0]
    };
    
    const policyId = await policyStorage.storePolicy(testPolicy);
    console.log('✅ Test policy stored with ID:', policyId);
    
    // Check total count
    const totalPolicies = await policyStorage.getTotalPoliciesCount();
    console.log('📊 Total policies in database:', totalPolicies);
    
    // Initialize PolicyScraper
    const policyScraper = new PolicyScraper(requirementExtractor, policyStorage);
    console.log('✅ PolicyScraper initialized');
    
    // Test a simple Medicare scrape
    console.log('🏥 Testing Medicare scraper...');
    const medicareAgent = policyScraper.scraperAgents.medicare;
    
    if (medicareAgent) {
      console.log('✅ Medicare scraper agent found');
      
      // Test one medication scrape
      try {
        const policies = await medicareAgent.scrapeMedicationLCDs('Semaglutide');
        console.log('✅ Medicare scrape completed, found policies:', policies.length);
        
        if (policies.length > 0) {
          console.log('📋 Sample policy:', {
            payer: policies[0].payer,
            medication: policies[0].medication,
            contentLength: policies[0].content.length
          });
          
          // Try to store it
          if (requirementExtractor) {
            console.log('🤖 Extracting requirements...');
            const extractionResult = await requirementExtractor.extractRequirements({
              text: policies[0].content,
              payer: policies[0].payer,
              medication: policies[0].medication,
              source: policies[0].source
            });
            
            console.log('✅ Requirements extracted:', extractionResult.success);
            
            if (extractionResult.success) {
              await policyStorage.storePolicy({
                payer: policies[0].payer,
                medication: policies[0].medication,
                requirements: extractionResult.requirements,
                source: policies[0].source,
                confidence_score: extractionResult.confidence,
                raw_text: policies[0].content,
                extracted_at: new Date().toISOString(),
                effective_date: policies[0].effective_date
              });
              console.log('✅ Policy stored successfully');
            }
          }
        }
      } catch (scrapeError) {
        console.error('❌ Medicare scrape error:', scrapeError.message);
      }
    } else {
      console.error('❌ Medicare scraper agent not found');
    }
    
    // Final count
    const finalCount = await policyStorage.getTotalPoliciesCount();
    console.log('📊 Final policy count:', finalCount);
    
    await policyStorage.close();
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugScraper(); 