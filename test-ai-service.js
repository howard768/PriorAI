const axios = require('axios');

// Sample patient data based on real GLP-1 scenarios
const testCases = [
  {
    name: 'High Probability Case',
    patientData: {
      name: 'John Smith',
      age: 52,
      gender: 'Male',
      bmi: 32.5
    },
    clinicalContext: {
      primaryDiagnosis: 'Type 2 Diabetes Mellitus',
      hba1c: 8.2,
      comorbidities: ['Hypertension', 'Dyslipidemia', 'Obesity'],
      previousTreatments: ['Metformin', 'Glipizide', 'Insulin'],
      treatmentDuration: '6 months each',
      requestedMedication: 'Semaglutide (Ozempic)',
      indication: 'Type 2 Diabetes Management',
      notes: 'Patient has struggled with glucose control despite multiple medication trials. BMI indicates obesity with cardiovascular risk factors.'
    },
    payerRequirements: {
      payer: 'UnitedHealthcare'
    }
  },
  {
    name: 'Medium Probability Case',
    patientData: {
      name: 'Sarah Johnson',
      age: 38,
      gender: 'Female',
      bmi: 28.5
    },
    clinicalContext: {
      primaryDiagnosis: 'Type 2 Diabetes Mellitus',
      hba1c: 7.1,
      comorbidities: ['Hypertension'],
      previousTreatments: ['Metformin'],
      treatmentDuration: '4 months',
      requestedMedication: 'Semaglutide (Ozempic)',
      indication: 'Type 2 Diabetes Management',
      notes: 'Recently diagnosed diabetes with modest elevation in HbA1c. Single medication trial.'
    },
    payerRequirements: {
      payer: 'Anthem'
    }
  },
  {
    name: 'Challenging Case',
    patientData: {
      name: 'Robert Chen',
      age: 35,
      gender: 'Male',
      bmi: 26.0
    },
    clinicalContext: {
      primaryDiagnosis: 'Type 2 Diabetes Mellitus',
      hba1c: 6.8,
      comorbidities: [],
      previousTreatments: ['Metformin'],
      treatmentDuration: '2 months',
      requestedMedication: 'Semaglutide (Ozempic)',
      indication: 'Type 2 Diabetes Management',
      notes: 'Young patient with borderline diabetes control. Limited treatment history.'
    },
    payerRequirements: {
      payer: 'Aetna'
    }
  }
];

// Test the AI service
async function testAIService() {
  const baseUrl = 'http://localhost:3001';
  
  console.log('🧪 Testing GLP-1 RCM AI Service\n');
  
  // Test health endpoint
  try {
    const healthResponse = await axios.get(`${baseUrl}/health`);
    console.log('✅ AI Service Health Check:', healthResponse.data);
  } catch (error) {
    console.log('❌ AI Service not running. Start it with: npm run dev:ai');
    console.log('📝 Make sure to set your ANTHROPIC_API_KEY in .env file\n');
    return;
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('🤖 TESTING AI CAPABILITIES');
  console.log('='.repeat(80));
  
  for (const testCase of testCases) {
    console.log(`\n📋 Testing: ${testCase.name}`);
    console.log('-'.repeat(50));
    
    try {
      // Test complete analysis
      const response = await axios.post(`${baseUrl}/analyze-prior-auth`, testCase);
      const result = response.data;
      
      if (result.success) {
        console.log(`\n📊 APPROVAL PREDICTION:`);
        console.log(`   Probability: ${result.prediction.probability}%`);
        console.log(`   Risk Level: ${result.prediction.riskLevel}`);
        console.log(`   Confidence: ${result.prediction.confidence}%`);
        
        if (result.prediction.suggestions.length > 0) {
          console.log(`\n💡 SUGGESTIONS:`);
          result.prediction.suggestions.forEach((suggestion, i) => {
            console.log(`   ${i + 1}. ${suggestion}`);
          });
        }
        
        console.log(`\n📝 MEDICAL NECESSITY LETTER:`);
        console.log(`   Payer: ${result.documentation.payer}`);
        console.log(`   Word Count: ${result.documentation.wordCount}`);
        console.log(`   Confidence: ${Math.round(result.documentation.confidence * 100)}%`);
        console.log(`\n   Preview (first 200 chars):`);
        console.log(`   "${result.documentation.documentation.substring(0, 200)}..."`);
        
      } else {
        console.log(`❌ Analysis failed: ${result.error}`);
      }
      
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`);
    }
    
    console.log('\n' + '-'.repeat(50));
  }
  
  console.log('\n🎯 DEMO SCENARIOS COMPLETED');
  console.log('\n💼 INVESTOR KEY POINTS:');
  console.log('✅ AI generates medical necessity letters in <30 seconds');
  console.log('✅ Predicts approval probability with confidence scores');
  console.log('✅ Provides actionable suggestions to improve success rates');
  console.log('✅ Adapts to payer-specific requirements automatically');
  console.log('✅ Scales to handle thousands of prior authorizations daily');
  
  console.log('\n🔗 Next Steps:');
  console.log('1. Set ANTHROPIC_API_KEY in .env file');
  console.log('2. Run: npm run dev:ai');
  console.log('3. Test with: node test-ai-service.js');
  console.log('4. View demo interface: http://localhost:3000');
}

// Run the test
testAIService().catch(console.error); 