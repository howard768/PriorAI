const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const app = express();
const PORT = process.env.AI_SERVICE_PORT || 3001;

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'demo-key',
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'ai-service',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Real AI-Powered Medical Necessity Generator
class AImedicalNecessityGenerator {
  async generateDocumentation(patientData, clinicalContext, payerRequirements) {
    try {
      const prompt = this.buildRealWorldPrompt(patientData, clinicalContext, payerRequirements);
      
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 3000,
        temperature: 0.2,
        system: this.getRealWorldSystemPrompt(),
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const documentation = message.content[0].text;
      
      return {
        success: true,
        documentation,
        wordCount: documentation.split(' ').length,
        payer: payerRequirements.payer || 'Insurance Payer',
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating medical necessity documentation:', error);
      return {
        success: false,
        error: error.message,
        generatedAt: new Date().toISOString()
      };
    }
  }

  getRealWorldSystemPrompt() {
    return `You are an expert physician and medical writer with extensive experience in prior authorization and insurance appeals. You specialize in creating compelling, medically accurate documentation that maximizes approval rates while maintaining complete clinical integrity.

Your expertise includes:
- Deep knowledge of insurance payer policies and requirements across all major insurers
- Understanding of medical necessity criteria for various medications and treatments
- Ability to present clinical cases in the most favorable light while remaining truthful
- Knowledge of current clinical guidelines and evidence-based medicine
- Experience with successful prior authorization strategies

Key principles for your medical necessity letters:
1. Use precise medical terminology and clinical reasoning
2. Build a compelling narrative that demonstrates clear medical necessity
3. Address potential payer concerns proactively
4. Include relevant clinical guidelines and evidence
5. Structure arguments logically and persuasively
6. Maintain professional medical writing standards
7. Be thorough but concise
8. Focus on patient outcomes and quality of life impacts

Generate documentation that reads like it was written by an experienced physician who understands both clinical medicine and insurance requirements.`;
  }

  buildRealWorldPrompt(patientData, clinicalContext, payerRequirements) {
    return `Create a comprehensive medical necessity letter for the following case:

PATIENT INFORMATION:
Name: ${patientData.name || 'Patient'}
Age: ${patientData.age || 'Not specified'} years
Gender: ${patientData.gender || 'Not specified'}
BMI: ${patientData.bmi || 'Not specified'}
Weight: ${patientData.weight || 'Not specified'} lbs

CLINICAL DETAILS:
Primary Diagnosis: ${clinicalContext.primaryDiagnosis || 'Not specified'}
HbA1c: ${clinicalContext.hba1c || 'Not specified'}%
Fasting Glucose: ${clinicalContext.fastingGlucose || 'Not specified'} mg/dL
Comorbidities: ${Array.isArray(clinicalContext.comorbidities) ? clinicalContext.comorbidities.join(', ') : clinicalContext.comorbidities || 'None specified'}

TREATMENT HISTORY:
Current Medications: ${clinicalContext.currentMedications || 'Not specified'}
Previous Failed Treatments: ${Array.isArray(clinicalContext.previousTreatments) ? clinicalContext.previousTreatments.join(', ') : clinicalContext.previousTreatments || 'Not specified'}
Requested Medication: ${clinicalContext.requestedMedication || 'Not specified - please determine appropriate medication based on clinical context'}

INSURANCE INFORMATION:
Payer: ${payerRequirements.payer || 'Insurance Payer'}
Plan Type: ${payerRequirements.planType || 'Not specified'}

CLINICAL CONTEXT & NOTES:
${clinicalContext.notes || 'Standard medical necessity case'}

INSTRUCTIONS:
Write a professional medical necessity letter that:

1. Uses proper medical letter format with space for provider letterhead
2. Addresses the specific insurance payer mentioned above
3. Provides compelling clinical justification for the requested medication
4. Incorporates relevant clinical guidelines and evidence
5. Addresses likely payer concerns and requirements
6. Uses appropriate medical terminology and professional tone
7. Builds a strong case for medical necessity based on the patient's specific situation
8. Includes relevant patient history and treatment failures
9. Emphasizes potential risks of denial and benefits of approval
10. Concludes with a clear, strong request for authorization

The letter should be comprehensive (500-800 words) and written as if by an experienced physician who understands both clinical medicine and insurance requirements. Make it specific to this patient's situation rather than generic.`;
  }
}

// Real AI-Powered Approval Predictor
class AIApprovalPredictor {
  async predictApprovalProbability(patientData, clinicalData, payerInfo) {
    try {
      const analysisPrompt = this.buildAnalysisPrompt(patientData, clinicalData, payerInfo);
      
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        temperature: 0.1,
        system: this.getAnalysisSystemPrompt(),
        messages: [
          {
            role: 'user',
            content: analysisPrompt
          }
        ]
      });

      const analysis = message.content[0].text;
      
      // Parse AI response to extract structured data
      const probability = this.extractProbability(analysis);
      const confidence = this.extractConfidence(analysis);
      const riskLevel = this.getRiskLevel(probability);
      const suggestions = this.extractSuggestions(analysis);
      
      return {
        success: true,
        probability: Math.round(probability),
        confidence: Math.round(confidence),
        riskLevel,
        suggestions,
        fullAnalysis: analysis,
        calculatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error predicting approval probability:', error);
      return {
        success: false,
        error: error.message,
        calculatedAt: new Date().toISOString()
      };
    }
  }

  getAnalysisSystemPrompt() {
    return `You are a senior medical consultant with 20+ years of experience in prior authorization, insurance appeals, and healthcare policy. You have deep knowledge of:

- Insurance payer policies and approval criteria across all major insurers
- Clinical guidelines for various medical conditions and treatments
- Historical approval rates and denial patterns
- Successful prior authorization strategies
- Medical necessity standards and documentation requirements

Your role is to provide realistic, data-driven assessments of prior authorization approval probability based on clinical presentations and payer characteristics.

Provide your analysis in this exact format:

APPROVAL PROBABILITY: [X]% (provide realistic percentage 0-100)
CONFIDENCE LEVEL: [Y]% (your confidence in this assessment 0-100)
RISK ASSESSMENT: [Detailed explanation of approval likelihood and key factors]
CRITICAL SUCCESS FACTORS: [3-5 key elements that will determine approval]
STRATEGIC RECOMMENDATIONS: [3-5 specific actionable suggestions to improve approval odds]
PAYER-SPECIFIC CONSIDERATIONS: [Insights about this specific payer's tendencies]

Base your assessment on real-world prior authorization standards, not theoretical scenarios.`;
  }

  buildAnalysisPrompt(patientData, clinicalData, payerInfo) {
    return `Analyze this prior authorization case and provide a realistic approval probability assessment:

PATIENT PROFILE:
- Age: ${patientData.age || 'Unknown'} years
- Gender: ${patientData.gender || 'Not specified'}
- BMI: ${patientData.bmi || 'Unknown'}
- Weight: ${patientData.weight || 'Unknown'} lbs

CLINICAL CASE:
- Primary Diagnosis: ${clinicalData.primaryDiagnosis || 'Not specified'}
- HbA1c: ${clinicalData.hba1c || 'Unknown'}%
- Fasting Glucose: ${clinicalData.fastingGlucose || 'Unknown'} mg/dL
- Comorbidities: ${Array.isArray(clinicalData.comorbidities) ? clinicalData.comorbidities.join(', ') : clinicalData.comorbidities || 'None documented'}
- Current Medications: ${clinicalData.currentMedications || 'Not documented'}
- Previous Treatment Failures: ${Array.isArray(clinicalData.previousTreatments) ? clinicalData.previousTreatments.join(', ') : clinicalData.previousTreatments || 'Not documented'}
- Requested Treatment: ${clinicalData.requestedMedication || 'Not specified - analyze based on clinical presentation'}

PAYER INFORMATION:
- Insurance: ${payerInfo.payer || 'Unknown payer'}
- Plan Type: ${payerInfo.planType || 'Unknown plan type'}

CLINICAL CONTEXT:
${clinicalData.notes || 'No additional clinical context provided'}

Based on your extensive experience with prior authorizations, what is the realistic probability of approval for this case? Consider the specific payer, clinical presentation, treatment history, and documentation quality in your assessment.`;
  }

  extractProbability(analysis) {
    const probabilityMatch = analysis.match(/APPROVAL PROBABILITY:\s*(\d+)%/i);
    return probabilityMatch ? parseInt(probabilityMatch[1]) : 50;
  }

  extractConfidence(analysis) {
    const confidenceMatch = analysis.match(/CONFIDENCE LEVEL:\s*(\d+)%/i);
    return confidenceMatch ? parseInt(confidenceMatch[1]) : 70;
  }

  extractSuggestions(analysis) {
    const suggestions = [];
    const strategicMatch = analysis.match(/STRATEGIC RECOMMENDATIONS:(.*?)(?=PAYER-SPECIFIC|$)/is);
    
    if (strategicMatch) {
      const recommendations = strategicMatch[1].trim();
      const lines = recommendations.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        const cleaned = line.replace(/^[-•*]\s*/, '').trim();
        if (cleaned && cleaned.length > 10) {
          suggestions.push(cleaned);
        }
      }
    }
    
    return suggestions.slice(0, 5); // Limit to 5 suggestions
  }

  getRiskLevel(probability) {
    if (probability >= 80) return 'Low Risk';
    if (probability >= 60) return 'Medium Risk'; 
    if (probability >= 40) return 'High Risk';
    return 'Very High Risk';
  }
}

// Initialize AI services
const aiMedicalGenerator = new AImedicalNecessityGenerator();
const aiApprovalPredictor = new AIApprovalPredictor();

// API Routes

// Generate medical necessity documentation
app.post('/generate-medical-necessity', async (req, res) => {
  try {
    const { patientData, clinicalContext, payerRequirements } = req.body;
    
    if (!patientData || !clinicalContext) {
      return res.status(400).json({
        error: 'Missing required fields: patientData and clinicalContext'
      });
    }
    
    const result = await aiMedicalGenerator.generateDocumentation(
      patientData,
      clinicalContext,
      payerRequirements || {}
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error in generate-medical-necessity:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Predict approval probability
app.post('/predict-approval', async (req, res) => {
  try {
    const { patientData, clinicalData, payerInfo } = req.body;
    
    if (!patientData || !clinicalData) {
      return res.status(400).json({
        error: 'Missing required fields: patientData and clinicalData'
      });
    }
    
    const result = await aiApprovalPredictor.predictApprovalProbability(
      patientData,
      clinicalData,
      payerInfo || {}
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error in predict-approval:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Combined endpoint for full prior auth analysis
app.post('/analyze-prior-auth', async (req, res) => {
  try {
    const { patientData, clinicalContext, payerRequirements } = req.body;
    
    if (!patientData || !clinicalContext) {
      return res.status(400).json({
        error: 'Missing required fields: patientData and clinicalContext'
      });
    }
    
    // Generate documentation and prediction in parallel using real AI
    const [documentationResult, predictionResult] = await Promise.all([
      aiMedicalGenerator.generateDocumentation(patientData, clinicalContext, payerRequirements || {}),
      aiApprovalPredictor.predictApprovalProbability(patientData, clinicalContext, payerRequirements || {})
    ]);
    
    res.json({
      success: true,
      documentation: documentationResult,
      prediction: predictionResult,
      analysisId: `ai_analysis_${Date.now()}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in analyze-prior-auth:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🤖 AI Service running on port ${PORT}`);
  console.log(`📊 Features enabled: Real AI Medical Necessity Generation, Dynamic Approval Prediction`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
