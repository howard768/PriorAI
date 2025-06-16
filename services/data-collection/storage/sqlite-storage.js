const sqlite3 = require('sqlite3').verbose();
const path = require('path');

/**
 * SQLite Data Storage Engine - Manages proprietary policy and outcome data
 * Creates competitive moat through structured storage of:
 * - Extracted payer requirements
 * - Policy version history  
 * - Outcome data patterns
 * - Learning model improvements
 */
class SQLiteStorage {
  constructor(dbPath = null) {
    this.dbPath = dbPath || path.join(__dirname, '../data/policies.db');
    this.db = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✅ Connected to SQLite database');
          resolve();
        }
      });
    });
  }

  async initializeSchema() {
    if (!this.db) await this.connect();
    
    const schema = [
      // Core policies table - stores extracted requirements
      `CREATE TABLE IF NOT EXISTS payer_policies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        payer TEXT NOT NULL,
        medication TEXT NOT NULL,
        source TEXT NOT NULL,
        requirements TEXT NOT NULL,
        confidence_score REAL DEFAULT 0.0,
        raw_text TEXT,
        extracted_at TEXT DEFAULT CURRENT_TIMESTAMP,
        scraped_at TEXT,
        scraping_job_id TEXT,
        policy_version INTEGER DEFAULT 1,
        effective_date TEXT,
        last_updated TEXT DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,

      // Policy change tracking - enables change detection
      `CREATE TABLE IF NOT EXISTS policy_changes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        policy_id INTEGER REFERENCES payer_policies(id),
        change_type TEXT NOT NULL,
        changed_fields TEXT,
        old_requirements TEXT,
        new_requirements TEXT,  
        impact_level TEXT DEFAULT 'medium',
        detected_at TEXT DEFAULT CURRENT_TIMESTAMP,
        summary TEXT,
        ai_analysis TEXT
      )`,

      // Outcome data - powers the learning flywheel
      `CREATE TABLE IF NOT EXISTS pa_outcomes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        payer TEXT NOT NULL,
        medication TEXT NOT NULL,
        patient_profile_hash TEXT NOT NULL,
        approval_status TEXT NOT NULL,
        denial_reason TEXT,
        appeal_outcome TEXT,
        documentation_used TEXT,
        approval_probability_predicted REAL,
        actual_outcome_score REAL,
        prediction_accuracy REAL,
        processing_time_days INTEGER,
        submitted_at TEXT DEFAULT CURRENT_TIMESTAMP,
        outcome_date TEXT,
        follow_up_data TEXT,
        learning_weight REAL DEFAULT 1.0
      )`,

      // Scraping jobs tracking
      `CREATE TABLE IF NOT EXISTS scraping_jobs (
        id TEXT PRIMARY KEY,
        sources TEXT NOT NULL,
        priority TEXT DEFAULT 'normal',
        status TEXT DEFAULT 'pending',
        started_at TEXT DEFAULT CURRENT_TIMESTAMP,
        completed_at TEXT,
        estimated_completion TEXT,
        results TEXT,
        error_message TEXT,
        policies_found INTEGER DEFAULT 0,
        policies_extracted INTEGER DEFAULT 0
      )`,

      // Success patterns - derived analytics
      `CREATE TABLE IF NOT EXISTS success_patterns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        payer TEXT NOT NULL,
        medication TEXT NOT NULL,
        pattern_type TEXT NOT NULL,
        pattern_data TEXT NOT NULL,
        success_rate REAL NOT NULL,
        sample_size INTEGER NOT NULL,
        confidence_interval TEXT,
        last_calculated TEXT DEFAULT CURRENT_TIMESTAMP,
        statistical_significance REAL
      )`,

      // Create indexes for performance
      `CREATE INDEX IF NOT EXISTS idx_policies_payer_med ON payer_policies(payer, medication)`,
      `CREATE INDEX IF NOT EXISTS idx_policies_active ON payer_policies(is_active, last_updated)`,
      `CREATE INDEX IF NOT EXISTS idx_outcomes_payer_med ON pa_outcomes(payer, medication)`,
      `CREATE INDEX IF NOT EXISTS idx_outcomes_approval ON pa_outcomes(approval_status, submitted_at)`
    ];

    for (const sql of schema) {
      await this.runQuery(sql);
    }
    
    console.log('✅ SQLite database schema initialized successfully');
  }

  runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }

  getQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  allQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Policy Management
  async storePolicy(policyData) {
    const sql = `
      INSERT INTO payer_policies 
      (payer, medication, source, requirements, confidence_score, raw_text, 
       extracted_at, scraped_at, scraping_job_id, effective_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      policyData.payer,
      policyData.medication,
      policyData.source,
      JSON.stringify(policyData.requirements),
      policyData.confidence_score,
      policyData.raw_text,
      policyData.extracted_at,
      policyData.scraped_at,
      policyData.scraping_job_id,
      policyData.effective_date
    ];
    
    const result = await this.runQuery(sql, params);
    return result.lastID;
  }

  async getPolicies({ payer, medication, limit = 50 } = {}) {
    let sql = `
      SELECT id, payer, medication, source, requirements, confidence_score,
             extracted_at, effective_date, last_updated, policy_version
      FROM payer_policies 
      WHERE is_active = 1
    `;
    
    const params = [];

    if (payer) {
      sql += ` AND payer LIKE ?`;
      params.push(`%${payer}%`);
    }

    if (medication) {
      sql += ` AND medication LIKE ?`;
      params.push(`%${medication}%`);
    }

    sql += ` ORDER BY last_updated DESC LIMIT ?`;
    params.push(limit);

    const rows = await this.allQuery(sql, params);
    
    // Parse JSON requirements
    return rows.map(row => ({
      ...row,
      requirements: JSON.parse(row.requirements || '{}')
    }));
  }

  // Outcome Data Management
  async storeOutcome(outcomeData) {
    const sql = `
      INSERT INTO pa_outcomes 
      (payer, medication, patient_profile_hash, approval_status, denial_reason,
       appeal_outcome, documentation_used, submitted_at, approval_probability_predicted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      outcomeData.payer,
      outcomeData.medication,
      outcomeData.patient_profile_hash,
      outcomeData.approval_status,
      outcomeData.denial_reason,
      outcomeData.appeal_outcome,
      JSON.stringify(outcomeData.documentation_used),
      outcomeData.submitted_at,
      outcomeData.approval_probability_predicted
    ];
    
    const result = await this.runQuery(sql, params);
    return result.lastID;
  }

  async getSuccessPatterns({ payer, medication, confidenceThreshold = 0.7 } = {}) {
    let sql = `
      SELECT payer, medication, pattern_type, pattern_data, success_rate,
             sample_size, confidence_interval, statistical_significance
      FROM success_patterns 
      WHERE statistical_significance >= ?
    `;
    
    const params = [confidenceThreshold];

    if (payer) {
      sql += ` AND payer LIKE ?`;
      params.push(`%${payer}%`);
    }

    if (medication) {
      sql += ` AND medication LIKE ?`;
      params.push(`%${medication}%`);
    }

    sql += ` ORDER BY success_rate DESC, sample_size DESC`;

    const rows = await this.allQuery(sql, params);
    
    return rows.map(row => ({
      ...row,
      pattern_data: JSON.parse(row.pattern_data || '{}'),
      confidence_interval: JSON.parse(row.confidence_interval || '{}')
    }));
  }

  // Analytics for Real Data
  async getDataMoatMetrics() {
    const metrics = {};

    // Unique policies count
    const policyCount = await this.getQuery(
      'SELECT COUNT(DISTINCT payer || "-" || medication) as unique_policies FROM payer_policies WHERE is_active = 1'
    );
    metrics.unique_policies = policyCount?.unique_policies || 0;

    // Policy versions
    const versionCount = await this.getQuery(
      'SELECT COUNT(*) as policy_versions FROM payer_policies'
    );
    metrics.policy_versions = versionCount?.policy_versions || 0;

    // Outcome data points
    const outcomeCount = await this.getQuery(
      'SELECT COUNT(*) as outcome_data_points FROM pa_outcomes'
    );
    metrics.outcome_data_points = outcomeCount?.outcome_data_points || 0;

    // Learning accuracy
    const accuracyQuery = await this.getQuery(
      'SELECT AVG(prediction_accuracy) as avg_accuracy FROM pa_outcomes WHERE prediction_accuracy IS NOT NULL'
    );
    metrics.learning_accuracy = accuracyQuery?.avg_accuracy || 0.0;

    // Recent growth metrics
    const recentPolicies = await this.getQuery(`
      SELECT COUNT(*) as recent_count 
      FROM payer_policies 
      WHERE extracted_at >= date('now', '-30 days')
    `);
    metrics.recent_policy_growth = recentPolicies?.recent_count || 0;

    const recentOutcomes = await this.getQuery(`
      SELECT COUNT(*) as recent_count 
      FROM pa_outcomes 
      WHERE submitted_at >= date('now', '-30 days')
    `);
    metrics.recent_outcome_growth = recentOutcomes?.recent_count || 0;

    // Market coverage
    const payerCoverage = await this.getQuery(
      'SELECT COUNT(DISTINCT payer) as payers_covered FROM payer_policies WHERE is_active = 1'
    );
    metrics.payers_covered = payerCoverage?.payers_covered || 0;

    const medicationCoverage = await this.getQuery(
      'SELECT COUNT(DISTINCT medication) as medications_covered FROM payer_policies WHERE is_active = 1'
    );
    metrics.medications_covered = medicationCoverage?.medications_covered || 0;

    // Calculate market coverage percentage
    metrics.market_coverage_percentage = Math.min((metrics.payers_covered / 200) * 100, 100);

    return metrics;
  }

  // Scraping Job Management
  async storeScrapingJob(jobData) {
    const sql = `
      INSERT INTO scraping_jobs 
      (id, sources, priority, status, estimated_completion)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const params = [
      jobData.id,
      JSON.stringify(jobData.sources),
      jobData.priority,
      jobData.status,
      jobData.estimatedCompletion
    ];
    
    await this.runQuery(sql, params);
  }

  async updateScrapingJob(jobId, updates) {
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates).map(v => typeof v === 'object' ? JSON.stringify(v) : v);
    
    const sql = `UPDATE scraping_jobs SET ${setClause} WHERE id = ?`;
    await this.runQuery(sql, [...values, jobId]);
  }

  // Utility methods
  async getTotalPoliciesCount() {
    const result = await this.getQuery('SELECT COUNT(*) as total FROM payer_policies WHERE is_active = 1');
    return result?.total || 0;
  }

  async getLastUpdateTime() {
    const result = await this.getQuery(
      'SELECT MAX(last_updated) as last_update FROM payer_policies WHERE is_active = 1'
    );
    return result?.last_update;
  }

  async getCoverageSummary() {
    const result = await this.getQuery(`
      SELECT 
        COUNT(DISTINCT payer) as unique_payers,
        COUNT(DISTINCT medication) as unique_medications,
        COUNT(*) as total_policies,
        AVG(confidence_score) as avg_confidence
      FROM payer_policies 
      WHERE is_active = 1
    `);
    
    return {
      unique_payers: result?.unique_payers || 0,
      unique_medications: result?.unique_medications || 0,
      total_policies: result?.total_policies || 0,
      avg_confidence: result?.avg_confidence || 0
    };
  }

  async getLastOutcomeUpdate() {
    const result = await this.getQuery(
      'SELECT MAX(submitted_at) as last_update FROM pa_outcomes'
    );
    return result?.last_update;
  }

  // Seed initial data for production
  async seedInitialData() {
    console.log('🌱 Seeding initial policy data...');
    
    const samplePolicies = [
      {
        payer: 'UnitedHealthcare',
        medication: 'Semaglutide (Ozempic)',
        source: 'UHC Medical Policy Document',
        requirements: {
          eligibility_criteria: [
            {
              category: 'clinical_measures',
              requirement: 'HbA1c >= 7.0%',
              operator: '>=',
              value: '7.0',
              unit: '%',
              mandatory: true
            },
            {
              category: 'prior_treatments',
              requirement: 'Metformin trial >= 3 months',
              operator: '>=',
              value: '3',
              unit: 'months',
              mandatory: true
            },
            {
              category: 'clinical_measures',
              requirement: 'BMI >= 27 kg/m²',
              operator: '>=',
              value: '27',
              unit: 'kg/m²',
              mandatory: true
            }
          ],
          step_therapy: [
            {
              step: 1,
              medications: ['Metformin'],
              duration_required: '3 months',
              failure_criteria: 'Inadequate glycemic control (HbA1c >= 7.0%)'
            },
            {
              step: 2,
              medications: ['Sulfonylurea', 'DPP-4 inhibitor'],
              duration_required: '3 months',
              failure_criteria: 'Inadequate glycemic control or intolerance'
            }
          ],
          documentation_required: [
            'HbA1c lab results within 3 months',
            'Documentation of metformin trial and outcome',
            'BMI calculation',
            'Cardiovascular risk assessment'
          ],
          quantity_limits: {
            initial_supply: '30 days',
            refills_allowed: 5,
            max_per_month: 1
          },
          reauthorization: {
            required: true,
            frequency: '12 months',
            criteria: 'HbA1c improvement >= 0.5%'
          }
        },
        confidence_score: 0.92,
        raw_text: `UnitedHealthcare Medical Policy: GLP-1 Receptor Agonists
        
COVERAGE CRITERIA:
1. Member has Type 2 diabetes mellitus
2. HbA1c ≥ 7.0% despite optimal medical management
3. BMI ≥ 27 kg/m² with cardiovascular risk factors
4. Trial and failure of metformin for minimum 3 months
5. Provider documentation of medical necessity

PRIOR AUTHORIZATION REQUIREMENTS:
- Complete prior authorization form
- Laboratory results (HbA1c within 3 months)
- Documentation of previous diabetes medications
- Clinical notes supporting medical necessity

LIMITATIONS:
- 30-day supply for initial prescription
- Annual reauthorization required
- Generic alternatives must be tried first when available`,
        extracted_at: new Date().toISOString(),
        effective_date: new Date().toISOString().split('T')[0]
      },
      {
        payer: 'Anthem',
        medication: 'Tirzepatide (Mounjaro)',
        source: 'Anthem Medical Policy',
        requirements: {
          eligibility_criteria: [
            {
              category: 'clinical_measures',
              requirement: 'HbA1c >= 7.5%',
              operator: '>=',
              value: '7.5',
              unit: '%',
              mandatory: true
            },
            {
              category: 'clinical_measures',
              requirement: 'BMI >= 30 kg/m²',
              operator: '>=',
              value: '30',
              unit: 'kg/m²',
              mandatory: true
            }
          ],
          step_therapy: [
            {
              step: 1,
              medications: ['Metformin', 'Sulfonylurea'],
              duration_required: '6 months',
              failure_criteria: 'HbA1c remains >= 7.5%'
            }
          ],
          documentation_required: [
            'HbA1c lab results',
            'Weight/BMI documentation',
            'Prior medication history',
            'Prescriber specialty (endocrinologist preferred)'
          ]
        },
        confidence_score: 0.88,
        raw_text: 'Anthem medical policy text for Tirzepatide...',
        extracted_at: new Date().toISOString(),
        effective_date: new Date().toISOString().split('T')[0]
      },
      {
        payer: 'Aetna',
        medication: 'Liraglutide (Victoza)',
        source: 'Aetna Coverage Determination',
        requirements: {
          eligibility_criteria: [
            {
              category: 'clinical_measures',
              requirement: 'HbA1c >= 7.0%',
              operator: '>=',
              value: '7.0',
              unit: '%',
              mandatory: true
            }
          ]
        },
        confidence_score: 0.85,
        raw_text: 'Aetna policy text...',
        extracted_at: new Date().toISOString(),
        effective_date: new Date().toISOString().split('T')[0]
      }
    ];

    for (const policy of samplePolicies) {
      await this.storePolicy(policy);
    }

    // Add sample outcome data
    const sampleOutcomes = [
      {
        payer: 'UnitedHealthcare',
        medication: 'Semaglutide',
        patient_profile_hash: 'hash_001',
        approval_status: 'approved',
        documentation_used: {
          hba1c: '8.2%',
          prior_treatments: ['Metformin 6 months'],
          bmi: '32.1'
        },
        submitted_at: new Date().toISOString(),
        approval_probability_predicted: 0.78
      },
      {
        payer: 'Anthem',
        medication: 'Tirzepatide',
        patient_profile_hash: 'hash_002',
        approval_status: 'denied',
        denial_reason: 'Step therapy not completed',
        documentation_used: {
          hba1c: '8.0%',
          prior_treatments: ['Metformin 2 months']
        },
        submitted_at: new Date().toISOString(),
        approval_probability_predicted: 0.35
      }
    ];

    for (const outcome of sampleOutcomes) {
      await this.storeOutcome(outcome);
    }

    console.log('✅ Initial policy data seeded successfully');
  }

  async close() {
    if (this.db) {
      return new Promise((resolve) => {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing database:', err);
          } else {
            console.log('✅ Database connection closed');
          }
          resolve();
        });
      });
    }
  }
}

module.exports = SQLiteStorage; 