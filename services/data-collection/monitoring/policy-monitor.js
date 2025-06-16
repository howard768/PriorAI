/**
 * Policy Monitor & Learning Engine
 * Provides real-time change detection and learning flywheel capabilities
 * Key features:
 * - Semantic change detection using AI
 * - Impact assessment for policy changes
 * - Learning model updates based on outcomes
 * - Competitive intelligence alerts
 */
class PolicyMonitor {
  constructor(anthropic, policyStorage) {
    this.anthropic = anthropic;
    this.storage = policyStorage;
    this.monitoringActive = false;
    this.changeDetectionModel = 'claude-3-5-sonnet-20241022';
  }

  // Real-time monitoring startup
  async startRealTimeMonitoring() {
    this.monitoringActive = true;
    console.log('🔍 Real-time policy monitoring activated');
    
    // Schedule periodic checks
    setInterval(async () => {
      if (this.monitoringActive) {
        await this.checkForChanges();
      }
    }, 6 * 60 * 60 * 1000); // Check every 6 hours
  }

  async stopRealTimeMonitoring() {
    this.monitoringActive = false;
    console.log('⏹️ Real-time policy monitoring stopped');
  }

  // Core change detection
  async checkForChanges() {
    console.log('🔍 Starting policy change detection scan...');
    
    try {
      // Get recent policies for comparison
      const recentPolicies = await this.storage.getPolicies({ limit: 100 });
      
      // Group by payer and medication for comparison
      const policyGroups = this.groupPoliciesByPayerMedication(recentPolicies);
      
      let changesDetected = 0;
      
      for (const [key, policies] of Object.entries(policyGroups)) {
        if (policies.length > 1) {
          const changes = await this.detectPolicyChanges(policies);
          if (changes.length > 0) {
            changesDetected += changes.length;
            await this.processDetectedChanges(changes);
          }
        }
      }
      
      console.log(`✅ Change detection complete. ${changesDetected} changes detected.`);
      return changesDetected;
    } catch (error) {
      console.error('❌ Error during change detection:', error);
      return 0;
    }
  }

  // AI-powered semantic change detection
  async detectPolicyChanges(policies) {
    if (policies.length < 2) return [];
    
    // Sort by date to compare versions
    policies.sort((a, b) => new Date(a.last_updated) - new Date(b.last_updated));
    const changes = [];
    
    for (let i = 1; i < policies.length; i++) {
      const oldPolicy = policies[i - 1];
      const newPolicy = policies[i];
      
      const changeAnalysis = await this.analyzeSemanticChanges(oldPolicy, newPolicy);
      
      if (changeAnalysis.hasSignificantChanges) {
        changes.push({
          policy_id: newPolicy.id,
          change_type: 'updated',
          old_requirements: oldPolicy.requirements,
          new_requirements: newPolicy.requirements,
          impact_level: changeAnalysis.impactLevel,
          summary: changeAnalysis.summary,
          ai_analysis: changeAnalysis,
          detected_at: new Date().toISOString()
        });
      }
    }
    
    return changes;
  }

  async analyzeSemanticChanges(oldPolicy, newPolicy) {
    try {
      const analysisPrompt = this.buildChangeAnalysisPrompt(oldPolicy, newPolicy);
      
      const message = await this.anthropic.messages.create({
        model: this.changeDetectionModel,
        max_tokens: 2000,
        temperature: 0.1,
        system: this.getChangeAnalysisSystemPrompt(),
        messages: [
          {
            role: 'user',
            content: analysisPrompt
          }
        ]
      });

      const response = message.content[0].text;
      return this.parseChangeAnalysis(response);
    } catch (error) {
      console.error('Error in semantic change analysis:', error);
      return {
        hasSignificantChanges: false,
        impactLevel: 'unknown',
        summary: 'Analysis failed',
        error: error.message
      };
    }
  }

  getChangeAnalysisSystemPrompt() {
    return `You are an expert policy analyst specializing in detecting meaningful changes in insurance payer policies. Your role is to identify semantically significant changes that could impact prior authorization success rates.

Analyze policy changes and respond ONLY with properly formatted JSON:

{
  "hasSignificantChanges": true|false,
  "impactLevel": "low|medium|high",
  "summary": "brief description of changes",
  "changedCategories": ["eligibility_criteria", "step_therapy", "documentation", "etc."],
  "specificChanges": [
    {
      "type": "added|removed|modified",
      "category": "category name",
      "description": "what changed",
      "oldValue": "previous requirement",
      "newValue": "new requirement",
      "impactOnApproval": "positive|negative|neutral"
    }
  ],
  "businessImpact": {
    "approvalRateChange": "increase|decrease|neutral",
    "estimatedImpact": "percentage estimate if possible",
    "affectedPopulations": ["specific patient groups affected"]
  },
  "recommendedActions": [
    "specific actions to take in response to changes"
  ]
}

Focus on changes that meaningfully affect approval probability, not minor formatting differences.`;
  }

  buildChangeAnalysisPrompt(oldPolicy, newPolicy) {
    return `Analyze the semantic differences between these two versions of a ${newPolicy.payer} policy for ${newPolicy.medication}:

PREVIOUS VERSION (${oldPolicy.last_updated}):
${JSON.stringify(oldPolicy.requirements, null, 2)}

CURRENT VERSION (${newPolicy.last_updated}):
${JSON.stringify(newPolicy.requirements, null, 2)}

ANALYSIS INSTRUCTIONS:
1. Identify meaningful changes that could affect prior authorization approval rates
2. Assess the business impact of each change
3. Determine if changes make approval easier or harder
4. Ignore minor formatting or structural differences
5. Focus on clinical criteria, step therapy, documentation requirements

Respond with properly formatted JSON analysis only.`;
  }

  parseChangeAnalysis(response) {
    try {
      let cleanedResponse = response.trim();
      
      if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```[a-z]*\n?/, '');
        cleanedResponse = cleanedResponse.replace(/\n?```$/, '');
      }
      
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('Failed to parse change analysis:', error);
      return {
        hasSignificantChanges: false,
        impactLevel: 'unknown',
        summary: 'Parse error occurred',
        error: error.message
      };
    }
  }

  // Process and store detected changes
  async processDetectedChanges(changes) {
    for (const change of changes) {
      // Store in database
      await this.storeChangeRecord(change);
      
      // Trigger alerts for high-impact changes
      if (change.impact_level === 'high') {
        await this.triggerHighImpactAlert(change);
      }
      
      // Update learning models
      await this.updateLearningModelForChange(change);
    }
  }

  async storeChangeRecord(change) {
    const client = await this.storage.db.connect();
    
    try {
      await client.query(`
        INSERT INTO policy_changes 
        (policy_id, change_type, old_requirements, new_requirements, 
         impact_level, summary, ai_analysis, detected_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        change.policy_id,
        change.change_type,
        JSON.stringify(change.old_requirements),
        JSON.stringify(change.new_requirements),
        change.impact_level,
        change.summary,
        JSON.stringify(change.ai_analysis),
        change.detected_at
      ]);
    } finally {
      client.release();
    }
  }

  // Learning flywheel updates
  async updateLearningModel({ outcome_id, payer, medication }) {
    console.log(`🧠 Updating learning model with outcome ${outcome_id} for ${payer}/${medication}`);
    
    // Get outcome data
    const client = await this.storage.db.connect();
    
    try {
      const outcomeResult = await client.query(
        'SELECT * FROM pa_outcomes WHERE id = $1',
        [outcome_id]
      );
      
      if (outcomeResult.rows.length === 0) {
        console.warn(`Outcome ${outcome_id} not found`);
        return;
      }
      
      const outcome = outcomeResult.rows[0];
      
      // Calculate prediction accuracy if we have both predicted and actual
      if (outcome.approval_probability_predicted) {
        const actualScore = outcome.approval_status === 'approved' ? 1.0 : 0.0;
        const accuracy = 1.0 - Math.abs(outcome.approval_probability_predicted - actualScore);
        
        await client.query(
          'UPDATE pa_outcomes SET actual_outcome_score = $1, prediction_accuracy = $2 WHERE id = $3',
          [actualScore, accuracy, outcome_id]
        );
      }
      
      // Update or create learning model record
      await this.updateModelPerformanceMetrics(payer, medication, outcome);
      
      // Recalculate success patterns
      await this.recalculateSuccessPatterns(payer, medication);
      
      console.log(`✅ Learning model updated for ${payer}/${medication}`);
    } finally {
      client.release();
    }
  }

  async updateModelPerformanceMetrics(payer, medication, outcome) {
    const client = await this.storage.db.connect();
    
    try {
      // Check if model record exists
      const existingModel = await client.query(
        'SELECT * FROM learning_models WHERE payer = $1 AND medication = $2 AND model_type = $3',
        [payer, medication, 'approval_prediction']
      );
      
      if (existingModel.rows.length === 0) {
        // Create new model record
        await client.query(`
          INSERT INTO learning_models 
          (model_type, payer, medication, model_version, training_data_size, accuracy_metrics)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          'approval_prediction',
          payer,
          medication,
          '1.0',
          1,
          JSON.stringify({ latest_accuracy: outcome.prediction_accuracy || 0.5 })
        ]);
      } else {
        // Update existing model
        const currentMetrics = existingModel.rows[0].accuracy_metrics || {};
        const newDataSize = (existingModel.rows[0].training_data_size || 0) + 1;
        
        await client.query(`
          UPDATE learning_models 
          SET training_data_size = $1, 
              accuracy_metrics = $2,
              last_trained = CURRENT_TIMESTAMP
          WHERE id = $3
        `, [
          newDataSize,
          JSON.stringify({
            ...currentMetrics,
            latest_accuracy: outcome.prediction_accuracy || 0.5,
            last_outcome_update: new Date().toISOString()
          }),
          existingModel.rows[0].id
        ]);
      }
    } finally {
      client.release();
    }
  }

  async recalculateSuccessPatterns(payer, medication) {
    const client = await this.storage.db.connect();
    
    try {
      // Get all outcomes for this payer/medication combination
      const outcomes = await client.query(`
        SELECT approval_status, documentation_used, patient_profile_hash
        FROM pa_outcomes 
        WHERE payer = $1 AND medication = $2
      `, [payer, medication]);
      
      if (outcomes.rows.length < 5) {
        // Need minimum sample size for patterns
        return;
      }
      
      const approvalRate = outcomes.rows.filter(r => r.approval_status === 'approved').length / outcomes.rows.length;
      
      // Store or update success pattern
      await client.query(`
        INSERT INTO success_patterns 
        (payer, medication, pattern_type, pattern_data, success_rate, sample_size, statistical_significance)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (payer, medication, pattern_type)
        DO UPDATE SET 
          pattern_data = $4,
          success_rate = $5,
          sample_size = $6,
          statistical_significance = $7,
          last_calculated = CURRENT_TIMESTAMP
      `, [
        payer,
        medication,
        'overall_approval_rate',
        JSON.stringify({ calculated_from_outcomes: true }),
        approvalRate * 100,
        outcomes.rows.length,
        Math.min(outcomes.rows.length / 100, 1.0) // Simple significance calculation
      ]);
    } finally {
      client.release();
    }
  }

  // Public API methods
  async getRecentChanges({ daysBack = 30, payer, severity = 'all' }) {
    const client = await this.storage.db.connect();
    
    try {
      let query = `
        SELECT pc.*, pp.payer, pp.medication, pp.source
        FROM policy_changes pc
        JOIN payer_policies pp ON pc.policy_id = pp.id
        WHERE pc.detected_at >= CURRENT_DATE - INTERVAL '${daysBack} days'
      `;
      const params = [];
      let paramCount = 0;

      if (payer) {
        paramCount++;
        query += ` AND pp.payer ILIKE $${paramCount}`;
        params.push(`%${payer}%`);
      }

      if (severity !== 'all') {
        paramCount++;
        query += ` AND pc.impact_level = $${paramCount}`;
        params.push(severity);
      }

      query += ` ORDER BY pc.detected_at DESC`;

      const result = await client.query(query, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  // Utility methods
  groupPoliciesByPayerMedication(policies) {
    const groups = {};
    
    for (const policy of policies) {
      const key = `${policy.payer}|${policy.medication}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(policy);
    }
    
    return groups;
  }

  async triggerHighImpactAlert(change) {
    console.log(`🚨 HIGH IMPACT CHANGE DETECTED:`, {
      payer: change.payer,
      medication: change.medication,
      summary: change.summary,
      timestamp: change.detected_at
    });
    
    // In production, this would send alerts to relevant stakeholders
    // For now, just log the alert
  }

  async updateLearningModelForChange(change) {
    // Update model to account for policy changes
    console.log(`📊 Updating prediction models for policy change:`, {
      policy_id: change.policy_id,
      impact_level: change.impact_level
    });
    
    // In production, this would retrain/adjust models based on policy changes
  }

  // Analytics and insights
  getMonitoringMetrics() {
    return {
      monitoring_active: this.monitoringActive,
      last_scan: this.lastScanTime || null,
      changes_detected_today: this.todayChangesCount || 0,
      high_impact_alerts: this.highImpactAlertsCount || 0,
      model_updates_today: this.todayModelUpdates || 0
    };
  }
}

module.exports = PolicyMonitor; 