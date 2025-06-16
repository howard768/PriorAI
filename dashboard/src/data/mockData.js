// Enhanced Payer Data
export const enhancedPayerData = [
  // Major Payers
  {
    id: 'unitedhealthcare',
    name: 'UnitedHealthcare',
    category: 'major',
    approvalRate: 78,
    avgProcessingTime: '2-3 days',
    requiresSpecialForm: false,
    preferredSubmissionMethod: 'electronic'
  },
  {
    id: 'anthem',
    name: 'Anthem Blue Cross Blue Shield',
    category: 'major',
    approvalRate: 82,
    avgProcessingTime: '3-4 days',
    requiresSpecialForm: true,
    preferredSubmissionMethod: 'electronic'
  },
  {
    id: 'aetna',
    name: 'Aetna',
    category: 'major',
    approvalRate: 75,
    avgProcessingTime: '2-3 days',
    requiresSpecialForm: false,
    preferredSubmissionMethod: 'portal'
  },
  {
    id: 'cigna',
    name: 'Cigna',
    category: 'major',
    approvalRate: 80,
    avgProcessingTime: '3-5 days',
    requiresSpecialForm: false,
    preferredSubmissionMethod: 'electronic'
  },
  {
    id: 'humana',
    name: 'Humana',
    category: 'major',
    approvalRate: 73,
    avgProcessingTime: '4-5 days',
    requiresSpecialForm: true,
    preferredSubmissionMethod: 'fax'
  },
  
  // Regional Payers
  {
    id: 'kaiser',
    name: 'Kaiser Permanente',
    category: 'regional',
    approvalRate: 85,
    avgProcessingTime: '1-2 days',
    requiresSpecialForm: false,
    preferredSubmissionMethod: 'portal'
  },
  {
    id: 'bcbs-ca',
    name: 'Blue Shield of California',
    category: 'regional',
    approvalRate: 79,
    avgProcessingTime: '2-3 days',
    requiresSpecialForm: false,
    preferredSubmissionMethod: 'electronic'
  },
  {
    id: 'healthfirst',
    name: 'Healthfirst (NY)',
    category: 'regional',
    approvalRate: 76,
    avgProcessingTime: '3-4 days',
    requiresSpecialForm: false,
    preferredSubmissionMethod: 'electronic'
  },
  
  // Medicare Plans
  {
    id: 'medicare-partd',
    name: 'Medicare Part D',
    category: 'medicare',
    approvalRate: 68,
    avgProcessingTime: '5-7 days',
    requiresSpecialForm: true,
    preferredSubmissionMethod: 'fax'
  },
  {
    id: 'medicare-advantage',
    name: 'Medicare Advantage',
    category: 'medicare',
    approvalRate: 71,
    avgProcessingTime: '4-6 days',
    requiresSpecialForm: true,
    preferredSubmissionMethod: 'electronic'
  },
  
  // Medicaid
  {
    id: 'medicaid-ca',
    name: 'Medi-Cal (California)',
    category: 'medicaid',
    approvalRate: 65,
    avgProcessingTime: '7-10 days',
    requiresSpecialForm: true,
    preferredSubmissionMethod: 'fax'
  },
  {
    id: 'medicaid-ny',
    name: 'NY State Medicaid',
    category: 'medicaid',
    approvalRate: 63,
    avgProcessingTime: '7-10 days',
    requiresSpecialForm: true,
    preferredSubmissionMethod: 'fax'
  }
];

// GLP-1 Medications
export const glp1Medications = [
  // Semaglutide
  {
    id: 'ozempic',
    name: 'Ozempic',
    genericName: 'semaglutide',
    manufacturer: 'Novo Nordisk',
    class: 'GLP-1 RA',
    indication: 'Type 2 Diabetes',
    dosages: [
      { value: '0.25mg', label: '0.25 mg weekly (starting dose)' },
      { value: '0.5mg', label: '0.5 mg weekly' },
      { value: '1mg', label: '1 mg weekly' },
      { value: '2mg', label: '2 mg weekly (max dose)' }
    ],
    frequency: 'weekly'
  },
  {
    id: 'wegovy',
    name: 'Wegovy',
    genericName: 'semaglutide',
    manufacturer: 'Novo Nordisk',
    class: 'GLP-1 RA',
    indication: 'Weight Management',
    dosages: [
      { value: '0.25mg', label: '0.25 mg weekly (month 1)' },
      { value: '0.5mg', label: '0.5 mg weekly (month 2)' },
      { value: '1mg', label: '1 mg weekly (month 3)' },
      { value: '1.7mg', label: '1.7 mg weekly (month 4)' },
      { value: '2.4mg', label: '2.4 mg weekly (maintenance)' }
    ],
    frequency: 'weekly'
  },
  {
    id: 'rybelsus',
    name: 'Rybelsus',
    genericName: 'semaglutide',
    manufacturer: 'Novo Nordisk',
    class: 'GLP-1 RA',
    indication: 'Type 2 Diabetes',
    dosages: [
      { value: '3mg', label: '3 mg daily (starting dose)' },
      { value: '7mg', label: '7 mg daily' },
      { value: '14mg', label: '14 mg daily (max dose)' }
    ],
    frequency: 'daily'
  },
  
  // Tirzepatide
  {
    id: 'mounjaro',
    name: 'Mounjaro',
    genericName: 'tirzepatide',
    manufacturer: 'Eli Lilly',
    class: 'GLP-1/GIP RA',
    indication: 'Type 2 Diabetes',
    dosages: [
      { value: '2.5mg', label: '2.5 mg weekly (starting dose)' },
      { value: '5mg', label: '5 mg weekly' },
      { value: '7.5mg', label: '7.5 mg weekly' },
      { value: '10mg', label: '10 mg weekly' },
      { value: '12.5mg', label: '12.5 mg weekly' },
      { value: '15mg', label: '15 mg weekly (max dose)' }
    ],
    frequency: 'weekly'
  },
  {
    id: 'zepbound',
    name: 'Zepbound',
    genericName: 'tirzepatide',
    manufacturer: 'Eli Lilly',
    class: 'GLP-1/GIP RA',
    indication: 'Weight Management',
    dosages: [
      { value: '2.5mg', label: '2.5 mg weekly (starting dose)' },
      { value: '5mg', label: '5 mg weekly' },
      { value: '7.5mg', label: '7.5 mg weekly' },
      { value: '10mg', label: '10 mg weekly' },
      { value: '12.5mg', label: '12.5 mg weekly' },
      { value: '15mg', label: '15 mg weekly (max dose)' }
    ],
    frequency: 'weekly'
  },
  
  // Liraglutide
  {
    id: 'victoza',
    name: 'Victoza',
    genericName: 'liraglutide',
    manufacturer: 'Novo Nordisk',
    class: 'GLP-1 RA',
    indication: 'Type 2 Diabetes',
    dosages: [
      { value: '0.6mg', label: '0.6 mg daily (week 1)' },
      { value: '1.2mg', label: '1.2 mg daily' },
      { value: '1.8mg', label: '1.8 mg daily (max dose)' }
    ],
    frequency: 'daily'
  },
  {
    id: 'saxenda',
    name: 'Saxenda',
    genericName: 'liraglutide',
    manufacturer: 'Novo Nordisk',
    class: 'GLP-1 RA',
    indication: 'Weight Management',
    dosages: [
      { value: '0.6mg', label: '0.6 mg daily (week 1)' },
      { value: '1.2mg', label: '1.2 mg daily (week 2)' },
      { value: '1.8mg', label: '1.8 mg daily (week 3)' },
      { value: '2.4mg', label: '2.4 mg daily (week 4)' },
      { value: '3mg', label: '3 mg daily (maintenance)' }
    ],
    frequency: 'daily'
  },
  
  // Dulaglutide
  {
    id: 'trulicity',
    name: 'Trulicity',
    genericName: 'dulaglutide',
    manufacturer: 'Eli Lilly',
    class: 'GLP-1 RA',
    indication: 'Type 2 Diabetes',
    dosages: [
      { value: '0.75mg', label: '0.75 mg weekly (starting dose)' },
      { value: '1.5mg', label: '1.5 mg weekly' },
      { value: '3mg', label: '3 mg weekly' },
      { value: '4.5mg', label: '4.5 mg weekly (max dose)' }
    ],
    frequency: 'weekly'
  },
  
  // Exenatide
  {
    id: 'byetta',
    name: 'Byetta',
    genericName: 'exenatide',
    manufacturer: 'AstraZeneca',
    class: 'GLP-1 RA',
    indication: 'Type 2 Diabetes',
    dosages: [
      { value: '5mcg', label: '5 mcg twice daily (month 1)' },
      { value: '10mcg', label: '10 mcg twice daily' }
    ],
    frequency: 'twice daily'
  },
  {
    id: 'bydureon',
    name: 'Bydureon BCise',
    genericName: 'exenatide ER',
    manufacturer: 'AstraZeneca',
    class: 'GLP-1 RA',
    indication: 'Type 2 Diabetes',
    dosages: [
      { value: '2mg', label: '2 mg weekly' }
    ],
    frequency: 'weekly'
  }
];

// Helper function to get payers by category
export const getPayersByCategory = (category) => {
  return enhancedPayerData.filter(payer => payer.category === category);
};

// Helper function to get medications by class
export const getMedicationsByClass = (medClass) => {
  return glp1Medications.filter(med => med.class === medClass);
}; 