/**
 * Enhanced Confidence Scoring Algorithm
 * Multi-factor confidence assessment for policy requirement extraction
 */

class ConfidenceScorer {
  constructor(options = {}) {
    this.weights = {
      sourceReliability: options.sourceReliability || 0.25,
      extractionClarity: options.extractionClarity || 0.30,
      crossValidation: options.crossValidation || 0.20,
      historicalAccuracy: options.historicalAccuracy || 0.15,
      dataCompleteness: options.dataCompleteness || 0.10
    };
    
    this.sourceReliabilityScores = {
      'Medicare LCD Database': 0.95,
      'CA Medicaid': 0.90,
      'NY Medicaid': 0.88,
      'TX Medicaid': 0.85,
      'FL Medicaid': 0.87,
      'UnitedHealthcare Medical Policy': 0.92,
      'Anthem Medical Policy': 0.90,
      'Aetna Medical Policy': 0.91,
      'Cigna Medical Policy': 0.88,
      'Humana Medical Policy': 0.89,
      'Kaiser Northern California Formulary': 0.93,
      'Kaiser Southern California Formulary': 0.92,
      'Molina CA Medicaid Formulary': 0.85,
      'Ambetter (Centene) Medical Policy': 0.87,
      'American Diabetes Association Clinical Guidelines': 0.98,
      'American Association of Clinical Endocrinologists Clinical Guidelines': 0.97
    };
    
    this.historicalAccuracy = new Map(); // Track accuracy over time
    this.crossValidationCache = new Map(); // Cache cross-validation results
  }

  /**
   * Calculate comprehensive confidence score for extracted requirements
   * @param {Object} extraction - Extracted policy data
   * @param {Object} context - Additional context for scoring
   * @returns {Object} Confidence assessment with detailed breakdown
   */
  async calculateConfidence(extraction, context = {}) {
    const scores = {
      sourceReliability: this.assessSourceReliability(extraction, context),
      extractionClarity: this.assessExtractionClarity(extraction),
      crossValidation: await this.assessCrossValidation(extraction, context),
      historicalAccuracy: this.assessHistoricalAccuracy(extraction, context),
      dataCompleteness: this.assessDataCompleteness(extraction)
    };

    const weightedScore = Object.entries(scores).reduce((total, [factor, score]) => {
      return total + (score * this.weights[factor]);
    }, 0);

    const confidence = Math.max(0.1, Math.min(1.0, weightedScore));

    return {
      overall_confidence: confidence,
      confidence_level: this.getConfidenceLevel(confidence),
      factor_scores: scores,
      factor_weights: this.weights,
      recommendations: this.generateRecommendations(scores, confidence),
      quality_flags: this.generateQualityFlags(scores, extraction)
    };
  }

  /**
   * Assess reliability based on data source characteristics
   * @param {Object} extraction - Extracted data
   * @param {Object} context - Source context
   * @returns {number} Source reliability score (0-1)
   */
  assessSourceReliability(extraction, context) {
    const sourceKey = extraction.source || context.source || 'unknown';
    let baseScore = this.sourceReliabilityScores[sourceKey] || 0.50;

    // Adjust based on source characteristics
    const adjustments = {
      // Government sources get higher reliability
      medicare: 0.95,
      medicaid: 0.85,
      
      // Major commercial payers are generally reliable
      unitedHealthcare: 0.92,
      anthem: 0.90,
      aetna: 0.91,
      
      // Medical guidelines from professional societies are highly reliable
      ada: 0.98,
      aace: 0.97,
      endocrineSociety: 0.96,
      
      // Regional payers vary
      kaiser: 0.92,
      independence: 0.88
    };

    // Apply pattern-based adjustments
    for (const [pattern, score] of Object.entries(adjustments)) {
      if (sourceKey.toLowerCase().includes(pattern.toLowerCase())) {
        baseScore = Math.max(baseScore, score);
        break;
      }
    }

    // Factor in document age (newer is generally better)
    if (extraction.last_updated) {
      const daysSinceUpdate = this.getDaysSinceUpdate(extraction.last_updated);
      if (daysSinceUpdate > 365) {
        baseScore *= 0.9; // Reduce confidence for old policies
      } else if (daysSinceUpdate > 180) {
        baseScore *= 0.95;
      }
    }

    return Math.max(0.1, Math.min(1.0, baseScore));
  }

  /**
   * Assess clarity and completeness of extracted information
   * @param {Object} extraction - Extracted data
   * @returns {number} Extraction clarity score (0-1)
   */
  assessExtractionClarity(extraction) {
    let clarityScore = 0.5;
    const clarityFactors = [];

    // Check for key required fields
    const requiredFields = [
      'clinical_criteria',
      'step_therapy',
      'prior_authorization_requirements',
      'coverage_limitations'
    ];

    const presentFields = requiredFields.filter(field => 
      extraction.requirements && extraction.requirements[field]
    );
    const fieldCompleteness = presentFields.length / requiredFields.length;
    clarityFactors.push({ factor: 'field_completeness', score: fieldCompleteness, weight: 0.3 });

    // Assess detail level of clinical criteria
    if (extraction.requirements?.clinical_criteria) {
      const criteria = extraction.requirements.clinical_criteria;
      let criteriaDetail = 0.5;
      
      // Look for specific clinical markers
      const clinicalMarkers = [
        'HbA1c', 'BMI', 'diabetes', 'metformin', 'months', '%'
      ];
      
      const markerCount = clinicalMarkers.filter(marker =>
        JSON.stringify(criteria).toLowerCase().includes(marker.toLowerCase())
      ).length;
      
      criteriaDetail = Math.min(1.0, markerCount / clinicalMarkers.length);
      clarityFactors.push({ factor: 'clinical_detail', score: criteriaDetail, weight: 0.25 });
    }

    // Assess step therapy clarity
    if (extraction.requirements?.step_therapy) {
      const stepTherapy = extraction.requirements.step_therapy;
      let stepClarity = 0.3;
      
      // Look for step-specific information
      if (Array.isArray(stepTherapy) && stepTherapy.length > 0) {
        stepClarity = 0.7;
        
        // Check for time requirements
        const hasTimeRequirements = stepTherapy.some(step =>
          typeof step === 'string' && /\d+\s*(day|week|month)/i.test(step)
        );
        if (hasTimeRequirements) stepClarity = 0.9;
      }
      
      clarityFactors.push({ factor: 'step_therapy_clarity', score: stepClarity, weight: 0.2 });
    }

    // Assess documentation requirements clarity
    if (extraction.requirements?.documentation_required) {
      const docs = extraction.requirements.documentation_required;
      let docClarity = 0.4;
      
      const docTypes = ['lab', 'diagnosis', 'trial', 'failure', 'adherence'];
      const docTypeCount = docTypes.filter(type =>
        JSON.stringify(docs).toLowerCase().includes(type)
      ).length;
      
      docClarity = Math.min(1.0, 0.4 + (docTypeCount / docTypes.length) * 0.6);
      clarityFactors.push({ factor: 'documentation_clarity', score: docClarity, weight: 0.15 });
    }

    // Calculate weighted clarity score
    const totalWeight = clarityFactors.reduce((sum, factor) => sum + factor.weight, 0);
    if (totalWeight > 0) {
      clarityScore = clarityFactors.reduce((sum, factor) => 
        sum + (factor.score * factor.weight), 0) / totalWeight;
    }

    return Math.max(0.1, Math.min(1.0, clarityScore));
  }

  /**
   * Cross-validate with similar policies from other sources
   * @param {Object} extraction - Extracted data
   * @param {Object} context - Additional context
   * @returns {number} Cross-validation score (0-1)
   */
  async assessCrossValidation(extraction, context) {
    const cacheKey = `${extraction.payer}_${extraction.medication}`;
    
    // Check cache first
    if (this.crossValidationCache.has(cacheKey)) {
      const cached = this.crossValidationCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 3600000) { // 1 hour cache
        return cached.score;
      }
    }

    let validationScore = 0.5; // Default when no validation data available

    try {
      // Simulate cross-validation with similar policies
      // In production, this would query the database for similar policies
      const similarPolicies = await this.findSimilarPolicies(extraction);
      
      if (similarPolicies.length > 0) {
        const consistencyScores = similarPolicies.map(policy => 
          this.compareRequirements(extraction.requirements, policy.requirements)
        );
        
        validationScore = consistencyScores.reduce((sum, score) => sum + score, 0) / consistencyScores.length;
      }

      // Cache the result
      this.crossValidationCache.set(cacheKey, {
        score: validationScore,
        timestamp: Date.now()
      });

    } catch (error) {
      console.warn('Cross-validation failed:', error.message);
      validationScore = 0.4; // Lower confidence when validation fails
    }

    return Math.max(0.1, Math.min(1.0, validationScore));
  }

  /**
   * Assess historical accuracy of extractions from this source
   * @param {Object} extraction - Extracted data
   * @param {Object} context - Additional context
   * @returns {number} Historical accuracy score (0-1)
   */
  assessHistoricalAccuracy(extraction, context) {
    const sourceKey = `${extraction.payer}_${extraction.source}`;
    const accuracy = this.historicalAccuracy.get(sourceKey);

    if (!accuracy) {
      return 0.7; // Default for new sources
    }

    // Weight recent accuracy more heavily
    const recentWeight = 0.7;
    const overallWeight = 0.3;
    
    const recentAccuracy = accuracy.recent || 0.7;
    const overallAccuracy = accuracy.overall || 0.7;
    
    return (recentAccuracy * recentWeight) + (overallAccuracy * overallWeight);
  }

  /**
   * Assess completeness of extracted data
   * @param {Object} extraction - Extracted data
   * @returns {number} Data completeness score (0-1)
   */
  assessDataCompleteness(extraction) {
    let completenessScore = 0;
    const expectedFields = {
      payer: 0.15,
      medication: 0.15,
      source: 0.10,
      effective_date: 0.05,
      last_updated: 0.05,
      requirements: 0.50
    };

    // Check top-level fields
    for (const [field, weight] of Object.entries(expectedFields)) {
      if (extraction[field] && extraction[field] !== '') {
        if (field === 'requirements') {
          // Special handling for requirements object
          completenessScore += weight * this.assessRequirementsCompleteness(extraction[field]);
        } else {
          completenessScore += weight;
        }
      }
    }

    return Math.max(0.1, Math.min(1.0, completenessScore));
  }

  /**
   * Assess completeness of requirements object
   * @param {Object} requirements - Requirements object
   * @returns {number} Requirements completeness score (0-1)
   */
  assessRequirementsCompleteness(requirements) {
    if (!requirements || typeof requirements !== 'object') {
      return 0;
    }

    const expectedRequirements = {
      clinical_criteria: 0.30,
      step_therapy: 0.25,
      prior_authorization_requirements: 0.20,
      coverage_limitations: 0.15,
      documentation_required: 0.10
    };

    let completeness = 0;
    for (const [field, weight] of Object.entries(expectedRequirements)) {
      if (requirements[field]) {
        if (Array.isArray(requirements[field]) && requirements[field].length > 0) {
          completeness += weight;
        } else if (typeof requirements[field] === 'string' && requirements[field].length > 10) {
          completeness += weight;
        } else if (typeof requirements[field] === 'object' && Object.keys(requirements[field]).length > 0) {
          completeness += weight;
        }
      }
    }

    return completeness;
  }

  /**
   * Generate confidence level label
   * @param {number} confidence - Confidence score
   * @returns {string} Confidence level label
   */
  getConfidenceLevel(confidence) {
    if (confidence >= 0.9) return 'very_high';
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.7) return 'medium_high';
    if (confidence >= 0.6) return 'medium';
    if (confidence >= 0.5) return 'medium_low';
    if (confidence >= 0.4) return 'low';
    return 'very_low';
  }

  /**
   * Generate recommendations for improving confidence
   * @param {Object} scores - Factor scores
   * @param {number} confidence - Overall confidence
   * @returns {Array} Array of recommendation objects
   */
  generateRecommendations(scores, confidence) {
    const recommendations = [];

    if (scores.sourceReliability < 0.7) {
      recommendations.push({
        type: 'source_validation',
        priority: 'high',
        message: 'Consider cross-referencing with additional sources to validate requirements',
        action: 'add_source_validation'
      });
    }

    if (scores.extractionClarity < 0.6) {
      recommendations.push({
        type: 'extraction_improvement',
        priority: 'high',
        message: 'Extraction lacks specific clinical details. Review source document for more precise requirements',
        action: 'manual_review_required'
      });
    }

    if (scores.crossValidation < 0.5) {
      recommendations.push({
        type: 'cross_validation',
        priority: 'medium',
        message: 'Policy requirements differ significantly from similar payers. Verify accuracy',
        action: 'verify_requirements'
      });
    }

    if (scores.dataCompleteness < 0.7) {
      recommendations.push({
        type: 'data_completeness',
        priority: 'medium',
        message: 'Missing key requirement fields. Extract additional details from source',
        action: 'extract_missing_fields'
      });
    }

    if (confidence < 0.6) {
      recommendations.push({
        type: 'overall_quality',
        priority: 'high',
        message: 'Overall confidence is low. Manual review and validation recommended before use',
        action: 'manual_validation_required'
      });
    }

    return recommendations;
  }

  /**
   * Generate quality flags for the extraction
   * @param {Object} scores - Factor scores
   * @param {Object} extraction - Extracted data
   * @returns {Array} Array of quality flag objects
   */
  generateQualityFlags(scores, extraction) {
    const flags = [];

    if (scores.sourceReliability < 0.5) {
      flags.push({
        type: 'unreliable_source',
        severity: 'warning',
        message: 'Source reliability is below acceptable threshold'
      });
    }

    if (scores.extractionClarity < 0.4) {
      flags.push({
        type: 'unclear_extraction',
        severity: 'error',
        message: 'Extracted requirements lack necessary clinical detail'
      });
    }

    if (this.getDaysSinceUpdate(extraction.last_updated) > 365) {
      flags.push({
        type: 'outdated_policy',
        severity: 'warning',
        message: 'Policy document is more than 1 year old'
      });
    }

    if (!extraction.requirements?.step_therapy) {
      flags.push({
        type: 'missing_step_therapy',
        severity: 'info',
        message: 'No step therapy requirements identified'
      });
    }

    return flags;
  }

  /**
   * Update historical accuracy based on validation results
   * @param {string} sourceKey - Source identifier
   * @param {boolean} wasAccurate - Whether the extraction was accurate
   */
  updateHistoricalAccuracy(sourceKey, wasAccurate) {
    const current = this.historicalAccuracy.get(sourceKey) || {
      overall: 0.7,
      recent: 0.7,
      total_extractions: 0,
      accurate_extractions: 0,
      recent_extractions: [],
      last_updated: Date.now()
    };

    current.total_extractions++;
    if (wasAccurate) {
      current.accurate_extractions++;
    }

    // Update overall accuracy
    current.overall = current.accurate_extractions / current.total_extractions;

    // Update recent accuracy (last 20 extractions)
    current.recent_extractions.push(wasAccurate);
    if (current.recent_extractions.length > 20) {
      current.recent_extractions.shift();
    }
    
    const recentAccurate = current.recent_extractions.filter(Boolean).length;
    current.recent = recentAccurate / current.recent_extractions.length;

    current.last_updated = Date.now();
    this.historicalAccuracy.set(sourceKey, current);
  }

  /**
   * Helper method to find similar policies for cross-validation
   * @param {Object} extraction - Extracted data
   * @returns {Promise<Array>} Array of similar policies
   */
  async findSimilarPolicies(extraction) {
    // Simulate database query for similar policies
    // In production, this would query the actual policy database
    return [
      {
        payer: 'Similar Payer 1',
        medication: extraction.medication,
        requirements: {
          clinical_criteria: ['HbA1c >= 7.0%', 'BMI >= 30'],
          step_therapy: ['Metformin trial', 'Second-line agent']
        }
      }
    ];
  }

  /**
   * Compare two requirement objects for consistency
   * @param {Object} req1 - First requirements object
   * @param {Object} req2 - Second requirements object
   * @returns {number} Consistency score (0-1)
   */
  compareRequirements(req1, req2) {
    // Simplified consistency comparison
    // In production, this would use more sophisticated comparison algorithms
    let consistencyScore = 0.5;
    
    if (req1?.clinical_criteria && req2?.clinical_criteria) {
      // Compare clinical criteria similarity
      const criteria1 = JSON.stringify(req1.clinical_criteria).toLowerCase();
      const criteria2 = JSON.stringify(req2.clinical_criteria).toLowerCase();
      
      const commonTerms = ['hba1c', 'bmi', 'diabetes', 'metformin'];
      const matches = commonTerms.filter(term => 
        criteria1.includes(term) && criteria2.includes(term)
      ).length;
      
      consistencyScore = 0.3 + (matches / commonTerms.length) * 0.7;
    }
    
    return Math.max(0.1, Math.min(1.0, consistencyScore));
  }

  /**
   * Calculate days since last update
   * @param {string} dateString - Date string
   * @returns {number} Days since update
   */
  getDaysSinceUpdate(dateString) {
    if (!dateString) return 999;
    
    try {
      const updateDate = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - updateDate);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (error) {
      return 999;
    }
  }
}

module.exports = ConfidenceScorer; 