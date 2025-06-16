// Mock data service for demo mode
const mockPayers = [
  {
    id: 'anthem',
    name: 'Anthem',
    category: 'Major',
    approvalRate: 75,
    avgProcessingDays: 5,
    submissionMethod: 'Electronic',
    requiresPriorAuth: true,
    specialRequirements: ['Step therapy documentation required', 'Recent lab results required']
  },
  {
    id: 'bcbs',
    name: 'Blue Cross Blue Shield',
    category: 'Major',
    approvalRate: 80,
    avgProcessingDays: 4,
    submissionMethod: 'Electronic',
    requiresPriorAuth: true,
    specialRequirements: ['Recent lab results required']
  },
  {
    id: 'aetna',
    name: 'Aetna',
    category: 'Major',
    approvalRate: 78,
    avgProcessingDays: 5,
    submissionMethod: 'Electronic',
    requiresPriorAuth: true,
    specialRequirements: ['Step therapy documentation required']
  },
  {
    id: 'cigna',
    name: 'Cigna',
    category: 'Major',
    approvalRate: 82,
    avgProcessingDays: 3,
    submissionMethod: 'Electronic',
    requiresPriorAuth: true,
    specialRequirements: []
  },
  {
    id: 'humana',
    name: 'Humana',
    category: 'Major',
    approvalRate: 70,
    avgProcessingDays: 7,
    submissionMethod: 'Fax',
    requiresPriorAuth: true,
    specialRequirements: ['Endocrinologist required', 'Step therapy documentation required']
  }
];

const mockPolicies = mockPayers.map(payer => ({
  payer: payer.name,
  medication: 'Ozempic',
  requirements: {
    eligibility_criteria: ['BMI > 30', 'HbA1c > 7%', 'Failed metformin'],
    step_therapy: ['Metformin trial required'],
    documentation_required: [
      { document_type: 'lab_results', description: 'HbA1c within 90 days' }
    ]
  },
  confidence_score: 0.95,
  extracted_at: new Date().toISOString()
}));

const mockAnalytics = {
  success: true,
  data_moat_strength: {
    unique_policies: 53,
    policy_versions: 100,
    outcome_data_points: 2,
    learning_accuracy: 0.78,
    competitive_advantage: {
      overall_score: 0.73,
      uniqueness_factor: 0.68,
      outcome_data_factor: 0.71,
      accuracy_factor: 0.82
    }
  },
  growth_metrics: {
    policies_added_last_30_days: 6,
    outcomes_collected_last_30_days: 2,
    accuracy_improvement: 0.15
  }
};

const generateMockLetter = (patientData, clinicalContext) => {
  return `LETTER OF MEDICAL NECESSITY

Date: ${new Date().toLocaleDateString()}

To: Prior Authorization Department
Re: ${patientData.name}

Dear Prior Authorization Reviewer,

I am writing to request prior authorization for ${clinicalContext.requestedMedication} for my patient, ${patientData.name}.

PATIENT INFORMATION:
- Age: ${patientData.age} years
- Gender: ${patientData.gender}
- BMI: ${patientData.bmi}
- Weight: ${patientData.weight} lbs

CLINICAL RATIONALE:
The patient has been diagnosed with ${clinicalContext.primaryDiagnosis} with an HbA1c of ${clinicalContext.hba1c}%. Despite lifestyle modifications and current medications, the patient has not achieved adequate glycemic control.

MEDICAL NECESSITY:
${clinicalContext.requestedMedication} is medically necessary for this patient due to:
1. Inadequate response to current therapy
2. BMI indicating obesity (${patientData.bmi})
3. Need for additional glycemic control

The patient meets all criteria for coverage as outlined in your policy guidelines.

Thank you for your consideration of this request. Please contact me if you need any additional information.

Sincerely,
[Provider Name]
[Practice Name]
[Contact Information]`;
};

export const mockDataService = {
  getPolicies: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            success: true,
            policies: mockPolicies,
            metadata: {
              total_policies: mockPolicies.length,
              last_updated: new Date().toISOString()
            }
          }
        });
      }, 500);
    });
  },

  getAnalytics: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockAnalytics });
      }, 300);
    });
  },

  analyzePriorAuth: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            success: true,
            documentation: {
              documentation: generateMockLetter(data.patientData, data.clinicalContext)
            },
            prediction: {
              decision: 'LIKELY_APPROVED',
              probability: 85,
              riskLevel: 'Low',
              confidence: 0.85
            }
          }
        });
      }, 2000);
    });
  },

  getPayerList: () => mockPayers
}; 