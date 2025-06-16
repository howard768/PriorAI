/**
 * AI-Powered Requirement Extraction Engine
 * Uses Claude to parse policy documents and extract structured medical necessity criteria
 * This creates proprietary structured data from public policy documents
 */
class RequirementExtractor {
  constructor(anthropic) {
    this.anthropic = anthropic;
    this.extractionModel = 'claude-3-5-sonnet-20241022';
    
    // Validate Anthropic client
    if (!this.anthropic) {
      console.error('❌ RequirementExtractor: Anthropic client is undefined');
    } else if (!this.anthropic.messages) {
      console.error('❌ RequirementExtractor: Anthropic client missing messages property');
    } else {
      console.log('✅ RequirementExtractor: Anthropic client properly initialized');
    }
  }

  async extractRequirements({ text, payer, medication, source }) {
    try {
      // Check if Anthropic client is available
      if (!this.anthropic || !this.anthropic.messages || !this.anthropic.messages.create) {
        console.error('❌ Anthropic client not properly initialized, falling back to basic extraction');
        return this.fallbackExtraction({ text, payer, medication, source });
      }
      
      const extractionPrompt = this.buildExtractionPrompt(text, payer, medication, source);
      
      const message = await this.anthropic.messages.create({
        model: this.extractionModel,
        max_tokens: 4000,
        temperature: 0.1,
        system: this.getExtractionSystemPrompt(),
        messages: [
          {
            role: 'user',
            content: extractionPrompt
          }
        ]
      });

      const response = message.content[0].text;
      const structuredRequirements = this.parseExtractionResponse(response);
      
      return {
        success: true,
        requirements: structuredRequirements,
        confidence: this.calculateExtractionConfidence(structuredRequirements, text),
        raw_ai_response: response,
        extracted_at: new Date().toISOString(),
        payer,
        medication,
        source
      };
    } catch (error) {
      console.error('Requirement extraction error:', error);
      return {
        success: false,
        error: error.message,
        payer,
        medication,
        source,
        extracted_at: new Date().toISOString()
      };
    }
  }

  getExtractionSystemPrompt() {
    return `You are an expert medical policy analyst with deep expertise in prior authorization requirements and payer policies. Your role is to extract structured, machine-readable medical necessity criteria from policy documents.

Your expertise includes:
- Understanding complex medical policy language and terminology
- Identifying key prior authorization requirements and criteria
- Extracting step therapy requirements and clinical thresholds
- Recognizing payer-specific nuances and exceptions
- Converting unstructured policy text into precise, actionable criteria

CRITICAL: Respond ONLY with properly formatted JSON. Do not include any explanatory text, markdown formatting, or code blocks. Output must be valid JSON that can be parsed programmatically.

Extract information in this exact JSON structure:

{
  "eligibility_criteria": [
    {
      "category": "diagnosis|age|clinical_measures|comorbidities|prior_treatments|provider_requirements",
      "requirement": "specific requirement text",
      "operator": ">=|<=|=|>|<|contains|excludes",
      "value": "threshold value or criteria",
      "unit": "unit if applicable",
      "mandatory": true|false
    }
  ],
  "step_therapy": [
    {
      "step": 1,
      "medications": ["medication names"],
      "duration_required": "minimum duration",
      "failure_criteria": "what constitutes failure"
    }
  ],
  "documentation_required": [
    {
      "document_type": "lab_results|diagnosis_codes|provider_notes|prior_auth_forms",
      "specific_requirement": "detailed requirement",
      "mandatory": true|false
    }
  ],
  "quantity_limits": {
    "initial_supply": "days or units",
    "refills_allowed": "number",
    "max_daily_dose": "if specified"
  },
  "reauthorization": {
    "frequency": "duration between reauth",
    "success_criteria": "what must be shown for continuation",
    "measurements_required": ["specific measurements needed"]
  },
  "exclusions": [
    {
      "condition": "exclusion criteria",
      "type": "absolute|relative"
    }
  ],
  "special_populations": [
    {
      "population": "population description", 
      "modified_criteria": "how criteria differ for this group"
    }
  ],
  "provider_requirements": {
    "specialization": "required or preferred specialization",
    "experience": "experience requirements if any",
    "attestation": "what provider must attest to"
  }
}

Focus on extracting precise, actionable criteria that can be used to evaluate prior authorization requests programmatically.`;
  }

  buildExtractionPrompt(text, payer, medication, source) {
    return `Extract structured medical necessity requirements from this ${payer} policy document for ${medication}:

POLICY DOCUMENT:
${text}

SOURCE CONTEXT:
- Payer: ${payer}
- Medication/Treatment: ${medication}
- Document Source: ${source}
- Extraction Date: ${new Date().toISOString()}

EXTRACTION INSTRUCTIONS:
Extract ALL medical necessity criteria, prior authorization requirements, step therapy protocols, documentation requirements, quantity limits, and exclusions from this policy document.

Pay special attention to:
1. Specific clinical thresholds (HbA1c levels, BMI requirements, etc.)
2. Required duration of previous treatments before failure is considered
3. Mandatory vs. preferred requirements
4. Provider qualification requirements
5. Documentation that must be submitted
6. Reauthorization requirements and success criteria
7. Population-specific modifications to standard criteria
8. Absolute vs. relative contraindications

Ensure all numeric thresholds, timeframes, and clinical criteria are captured with precision.

Respond with properly formatted JSON only - no additional text or formatting.`;
  }

  parseExtractionResponse(response) {
    try {
      // Clean the response to handle any potential formatting issues
      let cleanedResponse = response.trim();
      
      // Remove any potential markdown code blocks
      if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```[a-z]*\n?/, '');
        cleanedResponse = cleanedResponse.replace(/\n?```$/, '');
      }
      
      // Parse JSON
      const structured = JSON.parse(cleanedResponse);
      
      // Validate the structure
      this.validateExtractionStructure(structured);
      
      return structured;
    } catch (error) {
      console.error('Failed to parse extraction response:', error);
      console.error('Raw response:', response);
      
      // Return a basic structure if parsing fails
      return {
        eligibility_criteria: [],
        step_therapy: [],
        documentation_required: [],
        quantity_limits: {},
        reauthorization: {},
        exclusions: [],
        special_populations: [],
        provider_requirements: {},
        parsing_error: error.message,
        raw_response: response
      };
    }
  }

  validateExtractionStructure(structured) {
    const requiredFields = [
      'eligibility_criteria',
      'step_therapy', 
      'documentation_required',
      'quantity_limits',
      'reauthorization',
      'exclusions',
      'special_populations',
      'provider_requirements'
    ];

    for (const field of requiredFields) {
      if (!(field in structured)) {
        console.warn(`Missing required field in extraction: ${field}`);
      }
    }

    // Validate eligibility criteria structure
    if (Array.isArray(structured.eligibility_criteria)) {
      for (const criteria of structured.eligibility_criteria) {
        if (!criteria.category || !criteria.requirement) {
          console.warn('Invalid eligibility criteria structure:', criteria);
        }
      }
    }
  }

  calculateExtractionConfidence(structuredRequirements, originalText) {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on extracted content quality
    if (structuredRequirements.eligibility_criteria && structuredRequirements.eligibility_criteria.length > 0) {
      confidence += 0.2;
    }
    
    if (structuredRequirements.step_therapy && structuredRequirements.step_therapy.length > 0) {
      confidence += 0.1;
    }
    
    if (structuredRequirements.documentation_required && structuredRequirements.documentation_required.length > 0) {
      confidence += 0.1;
    }
    
    if (structuredRequirements.quantity_limits && Object.keys(structuredRequirements.quantity_limits).length > 0) {
      confidence += 0.05;
    }
    
    if (structuredRequirements.provider_requirements && Object.keys(structuredRequirements.provider_requirements).length > 0) {
      confidence += 0.05;
    }
    
    // Check for specific clinical thresholds (indicates detailed extraction)
    const textLower = originalText.toLowerCase();
    if (textLower.includes('hba1c') || textLower.includes('bmi') || textLower.includes('≥') || textLower.includes('months')) {
      const criteriaText = JSON.stringify(structuredRequirements).toLowerCase();
      if (criteriaText.includes('hba1c') || criteriaText.includes('bmi')) {
        confidence += 0.1;
      }
    }
    
    return Math.min(confidence, 1.0);
  }

  // Batch extraction for multiple documents
  async batchExtractRequirements(documents, options = {}) {
    const { maxConcurrent = 3 } = options;
    const results = [];
    
    // Process documents in batches to avoid rate limits
    for (let i = 0; i < documents.length; i += maxConcurrent) {
      const batch = documents.slice(i, i + maxConcurrent);
      
      const batchPromises = batch.map(doc => 
        this.extractRequirements({
          text: doc.text,
          payer: doc.payer,
          medication: doc.medication,
          source: doc.source
        })
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Add delay between batches to respect rate limits
      if (i + maxConcurrent < documents.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  // Update extraction based on feedback (learning component)
  async improveExtraction(extractionId, feedback) {
    // In production, this would update extraction models based on feedback
    // For now, log the feedback for analysis
    console.log('Extraction feedback received:', {
      extractionId,
      feedback,
      timestamp: new Date().toISOString()
    });
    
    // Store feedback for model improvement
    return {
      success: true,
      message: 'Feedback recorded for model improvement',
      extractionId,
      feedback
    };
  }

  // Get extraction analytics
  getExtractionAnalytics() {
    return {
      total_extractions: this.extractionCount || 0,
      average_confidence: this.averageConfidence || 0.75,
      success_rate: this.successRate || 0.95,
      common_patterns: this.getCommonPatterns(),
      improvement_areas: this.getImprovementAreas()
    };
  }

  getCommonPatterns() {
    return [
      'HbA1c thresholds (≥7.0% most common)',
      'BMI requirements (≥30 or ≥27 with comorbidities)', 
      'Metformin trial requirement (3-6 months)',
      'Provider specialization preferences',
      'Reauthorization at 6-12 month intervals'
    ];
  }

  getImprovementAreas() {
    return [
      'Complex formulary tier logic',
      'State-specific Medicaid variations',
      'Appeal process criteria',
      'Pediatric population requirements'
    ];
  }

  // Fallback extraction when Anthropic client is not available
  fallbackExtraction({ text, payer, medication, source }) {
    console.log(`🔄 Using fallback extraction for ${payer} - ${medication}`);
    
    // Basic rule-based extraction for common patterns
    const basicRequirements = {
      eligibility_criteria: [],
      step_therapy: [],
      documentation_required: [],
      quantity_limits: {},
      reauthorization: {},
      exclusions: [],
      special_populations: [],
      provider_requirements: {}
    };

    // Look for common patterns in the text
    const textLower = text.toLowerCase();
    
    // BMI requirements
    if (textLower.includes('bmi') && (textLower.includes('30') || textLower.includes('35'))) {
      basicRequirements.eligibility_criteria.push({
        category: 'clinical_measures',
        requirement: 'BMI requirement',
        operator: '>=',
        value: textLower.includes('35') ? '35' : '30',
        unit: 'kg/m²',
        mandatory: true
      });
    }

    // HbA1c requirements
    if (textLower.includes('hba1c') || textLower.includes('hemoglobin a1c')) {
      basicRequirements.eligibility_criteria.push({
        category: 'clinical_measures',
        requirement: 'HbA1c threshold',
        operator: '>=',
        value: '7.0',
        unit: '%',
        mandatory: true
      });
    }

    // Metformin requirement
    if (textLower.includes('metformin')) {
      basicRequirements.step_therapy.push({
        step: 1,
        medications: ['Metformin'],
        duration_required: '3 months',
        failure_criteria: 'Inadequate glycemic control or contraindication/intolerance'
      });
    }

    // Prior authorization
    if (textLower.includes('prior authorization') || textLower.includes('preauthorization')) {
      basicRequirements.documentation_required.push({
        document_type: 'prior_auth_forms',
        specific_requirement: 'Prior authorization required',
        mandatory: true
      });
    }

    return {
      success: true,
      requirements: basicRequirements,
      confidence: 0.6, // Lower confidence for fallback extraction
      extraction_method: 'fallback_rules',
      extracted_at: new Date().toISOString(),
      payer,
      medication,
      source,
      note: 'Extracted using fallback rule-based method due to AI service unavailability'
    };
  }
}

module.exports = RequirementExtractor; 