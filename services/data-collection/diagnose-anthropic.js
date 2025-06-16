const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

console.log('🔍 Anthropic Client Diagnostics');
console.log('================================');

console.log('1. Environment Variables:');
console.log('   ANTHROPIC_API_KEY present:', !!process.env.ANTHROPIC_API_KEY);
console.log('   API Key starts with:', process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_API_KEY.substring(0, 15) + '...' : 'undefined');

console.log('\n2. Anthropic Module:');
console.log('   Anthropic constructor:', typeof Anthropic);
console.log('   Anthropic.prototype:', Object.getOwnPropertyNames(Anthropic.prototype));

try {
  console.log('\n3. Client Initialization:');
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
  
  console.log('   Client type:', typeof client);
  console.log('   Client constructor:', client.constructor.name);
  console.log('   Client properties:', Object.getOwnPropertyNames(client));
  console.log('   Messages property:', typeof client.messages);
  
  if (client.messages) {
    console.log('   Messages.create:', typeof client.messages.create);
  } else {
    console.log('   ❌ Messages property is missing');
  }
  
  console.log('\n4. Test API Call:');
  client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 100,
    temperature: 0.1,
    messages: [
      {
        role: 'user',
        content: 'Hello! This is a test. Please respond with "API connection successful".'
      }
    ]
  }).then(response => {
    console.log('   ✅ API call successful!');
    console.log('   Response:', response.content[0].text);
  }).catch(error => {
    console.log('   ❌ API call failed:', error.message);
  });
  
} catch (error) {
  console.log('   ❌ Client initialization failed:', error.message);
  console.log('   Error stack:', error.stack);
} 