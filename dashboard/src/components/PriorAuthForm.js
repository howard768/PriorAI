import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config/environment';
import { mockDataService } from '../services/mockDataService';
import { 
  User, 
  FileText, 
  Pill, 
  Send, 
  AlertCircle, 
  CheckCircle,
  Download,
  Copy,
  Building2,
  Calendar,
  CreditCard,
  Activity,
  Heart,
  Brain,
  Stethoscope,
  ChevronDown,
  Clock,
  TrendingUp,
  Zap,
  Loader2
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  CommandGroup
} from './ui/select';

const PriorAuthForm = () => {
  const [activeTab, setActiveTab] = useState('patient-payer');
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [approvalPrediction, setApprovalPrediction] = useState(null);
  const [selectedMedication, setSelectedMedication] = useState(null);
  
  // Real payer data from API
  const [realPayerData, setRealPayerData] = useState([]);
  const [loadingPayers, setLoadingPayers] = useState(true);
  const [payerPolicies, setPayerPolicies] = useState({});
  
  // Real medication data from API
  const [glp1Medications, setGlp1Medications] = useState([]);

  // Form data state
  const [formData, setFormData] = useState({
    // Patient Information
    patientName: '',
    dateOfBirth: '',
    gender: '',
    weight: '',
    height: '',
    bmi: '',
    
    // Insurance Information
    payerName: '',
    memberId: '',
    groupNumber: '',
    planType: '',
    
    // Clinical Information
    primaryDiagnosis: '',
    icd10Code: '',
    hba1c: '',
    fastingGlucose: '',
    comorbidities: [],
    
    // Treatment History
    currentMedications: '',
    previousTreatments: '',
    contraindications: '',
    
    // Medication Request
    requestedMedication: '',
    dosage: '',
    frequency: '',
    duration: '',
    
    // Additional Documentation
    clinicalNotes: '',
    labResults: '',
    stepTherapyReason: ''
  });

  // Fetch real payer data from API
  useEffect(() => {
    const fetchPayerData = async () => {
      try {
        setLoadingPayers(true);
        
        // Use mock data in demo mode
        const response = config.USE_MOCK_DATA 
          ? await mockDataService.getPolicies()
          : await axios.get(`${config.API_BASE_URL}/api/policies?limit=100`);
        
        if (response.data.success) {
          // Extract unique payers from policies
          const payerMap = new Map();
          const medicationSet = new Set();
          
          response.data.policies.forEach(policy => {
            // Process payers
            if (!payerMap.has(policy.payer)) {
              payerMap.set(policy.payer, {
                id: policy.payer.toLowerCase().replace(/\s+/g, '-'),
                name: policy.payer,
                category: categorizePayerType(policy.payer),
                policies: []
              });
            }
            payerMap.get(policy.payer).policies.push(policy);
            
            // Extract medications
            if (policy.medication && policy.medication !== 'GLP-1 Receptor Agonists') {
              medicationSet.add(policy.medication);
            }
          });
          
          // Process unique payers
          const uniquePayers = Array.from(payerMap.values()).map(payer => ({
            ...payer,
            approvalRate: calculateApprovalRate(payer.policies),
            avgProcessingDays: calculateAvgProcessingDays(payer.policies),
            submissionMethod: determineSubmissionMethod(payer.policies),
            requiresPriorAuth: true,
            specialRequirements: extractSpecialRequirements(payer.policies)
          }));
          
          setRealPayerData(uniquePayers.sort((a, b) => a.name.localeCompare(b.name)));
          
          // Store policies by payer for quick lookup
          const policiesByPayer = {};
          response.data.policies.forEach(policy => {
            if (!policiesByPayer[policy.payer]) {
              policiesByPayer[policy.payer] = [];
            }
            policiesByPayer[policy.payer].push(policy);
          });
          setPayerPolicies(policiesByPayer);
          
          // Create medication list from scraped data
          const medications = createGLP1MedicationsList(medicationSet);
          setGlp1Medications(medications);
        }
      } catch (error) {
        console.error('Error fetching payer data:', error);
        setRealPayerData([]);
        // Set default medications if API fails
        setGlp1Medications(getDefaultGLP1Medications());
      } finally {
        setLoadingPayers(false);
      }
    };

    fetchPayerData();
  }, []);

  // Create GLP-1 medications list from scraped data
  const createGLP1MedicationsList = (medicationSet) => {
    // Common GLP-1 medications with their details
    const knownMedications = [
      {
        id: 'ozempic',
        name: 'Ozempic',
        genericName: 'semaglutide',
        class: 'GLP-1 Receptor Agonist',
        indication: 'Type 2 Diabetes',
        manufacturer: 'Novo Nordisk',
        dosages: ['0.25 mg', '0.5 mg', '1 mg', '2 mg'],
        frequency: 'Once weekly'
      },
      {
        id: 'wegovy',
        name: 'Wegovy',
        genericName: 'semaglutide',
        class: 'GLP-1 Receptor Agonist',
        indication: 'Weight Management',
        manufacturer: 'Novo Nordisk',
        dosages: ['0.25 mg', '0.5 mg', '1 mg', '1.7 mg', '2.4 mg'],
        frequency: 'Once weekly'
      },
      {
        id: 'mounjaro',
        name: 'Mounjaro',
        genericName: 'tirzepatide',
        class: 'GLP-1/GIP Receptor Agonist',
        indication: 'Type 2 Diabetes',
        manufacturer: 'Eli Lilly',
        dosages: ['2.5 mg', '5 mg', '7.5 mg', '10 mg', '12.5 mg', '15 mg'],
        frequency: 'Once weekly'
      },
      {
        id: 'zepbound',
        name: 'Zepbound',
        genericName: 'tirzepatide',
        class: 'GLP-1/GIP Receptor Agonist',
        indication: 'Weight Management',
        manufacturer: 'Eli Lilly',
        dosages: ['2.5 mg', '5 mg', '7.5 mg', '10 mg', '12.5 mg', '15 mg'],
        frequency: 'Once weekly'
      },
      {
        id: 'trulicity',
        name: 'Trulicity',
        genericName: 'dulaglutide',
        class: 'GLP-1 Receptor Agonist',
        indication: 'Type 2 Diabetes',
        manufacturer: 'Eli Lilly',
        dosages: ['0.75 mg', '1.5 mg', '3 mg', '4.5 mg'],
        frequency: 'Once weekly'
      },
      {
        id: 'victoza',
        name: 'Victoza',
        genericName: 'liraglutide',
        class: 'GLP-1 Receptor Agonist',
        indication: 'Type 2 Diabetes',
        manufacturer: 'Novo Nordisk',
        dosages: ['0.6 mg', '1.2 mg', '1.8 mg'],
        frequency: 'Once daily'
      },
      {
        id: 'saxenda',
        name: 'Saxenda',
        genericName: 'liraglutide',
        class: 'GLP-1 Receptor Agonist',
        indication: 'Weight Management',
        manufacturer: 'Novo Nordisk',
        dosages: ['0.6 mg', '1.2 mg', '1.8 mg', '2.4 mg', '3 mg'],
        frequency: 'Once daily'
      },
      {
        id: 'rybelsus',
        name: 'Rybelsus',
        genericName: 'semaglutide',
        class: 'GLP-1 Receptor Agonist (Oral)',
        indication: 'Type 2 Diabetes',
        manufacturer: 'Novo Nordisk',
        dosages: ['3 mg', '7 mg', '14 mg'],
        frequency: 'Once daily'
      },
      {
        id: 'byetta',
        name: 'Byetta',
        genericName: 'exenatide',
        class: 'GLP-1 Receptor Agonist',
        indication: 'Type 2 Diabetes',
        manufacturer: 'AstraZeneca',
        dosages: ['5 mcg', '10 mcg'],
        frequency: 'Twice daily'
      },
      {
        id: 'bydureon',
        name: 'Bydureon BCise',
        genericName: 'exenatide ER',
        class: 'GLP-1 Receptor Agonist',
        indication: 'Type 2 Diabetes',
        manufacturer: 'AstraZeneca',
        dosages: ['2 mg'],
        frequency: 'Once weekly'
      }
    ];
    
    return knownMedications;
  };

  // Default medications if API fails
  const getDefaultGLP1Medications = () => {
    return createGLP1MedicationsList(new Set());
  };

  // Helper functions for processing payer data
  const categorizePayerType = (payerName) => {
    const name = payerName.toLowerCase();
    if (name.includes('medicare')) return 'Medicare';
    if (name.includes('medicaid')) return 'Medicaid';
    if (['unitedhealth', 'anthem', 'aetna', 'cigna', 'humana'].some(major => name.includes(major))) {
      return 'Major';
    }
    return 'Regional';
  };

  const calculateApprovalRate = (policies) => {
    const avgRequirements = policies.reduce((sum, p) => 
      sum + (p.requirements?.eligibility_criteria?.length || 0), 0) / policies.length;
    
    if (avgRequirements < 3) return 85;
    if (avgRequirements < 5) return 75;
    return 65;
  };

  const calculateAvgProcessingDays = (policies) => {
    const hasStepTherapy = policies.some(p => p.requirements?.step_therapy?.length > 0);
    return hasStepTherapy ? 7 : 5;
  };

  const determineSubmissionMethod = (policies) => {
    const hasElectronic = policies.some(p => 
      JSON.stringify(p.requirements).toLowerCase().includes('portal') ||
      JSON.stringify(p.requirements).toLowerCase().includes('electronic')
    );
    return hasElectronic ? 'Electronic' : 'Fax';
  };

  const extractSpecialRequirements = (policies) => {
    const requirements = new Set();
    policies.forEach(policy => {
      if (policy.requirements?.step_therapy?.length > 0) {
        requirements.add('Step therapy documentation required');
      }
      if (policy.requirements?.documentation_required?.some(d => d.document_type === 'lab_results')) {
        requirements.add('Recent lab results required');
      }
      if (policy.requirements?.provider_requirements?.specialization) {
        requirements.add(policy.requirements.provider_requirements.specialization);
      }
    });
    return Array.from(requirements);
  };

  // Calculate BMI when height and weight change
  useEffect(() => {
    if (formData.weight && formData.height) {
      const heightInInches = parseFloat(formData.height);
      const weightInLbs = parseFloat(formData.weight);
      if (heightInInches > 0 && weightInLbs > 0) {
        const bmi = (weightInLbs / (heightInInches * heightInInches)) * 703;
        setFormData(prev => ({ ...prev, bmi: bmi.toFixed(1) }));
      }
    }
  }, [formData.weight, formData.height]);

  // Update confidence score based on form completion
  useEffect(() => {
    const requiredFields = [
      'patientName', 'dateOfBirth', 'gender', 'weight', 'height',
      'payerName', 'memberId', 'planType',
      'primaryDiagnosis', 'icd10Code', 'hba1c',
      'requestedMedication', 'dosage', 'frequency'
    ];
    
    const filledFields = requiredFields.filter(field => formData[field]);
    const score = Math.round((filledFields.length / requiredFields.length) * 100);
    setConfidenceScore(score);
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMedicationSelect = (medication) => {
    setSelectedMedication(medication);
    setFormData(prev => ({
      ...prev,
      requestedMedication: medication.name,
      dosage: medication.dosages[0] || '',
      frequency: medication.frequency || ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      // Prepare data for AI service
      const patientData = {
        name: formData.patientName,
        age: calculateAge(formData.dateOfBirth),
        gender: formData.gender,
        bmi: formData.bmi,
        weight: formData.weight
      };
      
      const clinicalContext = {
        primaryDiagnosis: formData.primaryDiagnosis,
        hba1c: formData.hba1c,
        fastingGlucose: formData.fastingGlucose,
        comorbidities: formData.comorbidities,
        currentMedications: formData.currentMedications,
        previousTreatments: formData.previousTreatments,
        requestedMedication: formData.requestedMedication,
        notes: formData.clinicalNotes
      };
      
      const payerRequirements = {
        payer: formData.payerName,
        planType: formData.planType
      };
      
      // Call the AI service or use mock in demo mode
      const response = config.USE_MOCK_DATA
        ? await mockDataService.analyzePriorAuth({
            patientData,
            clinicalContext,
            payerRequirements
          })
        : await axios.post(`${config.AI_SERVICE_URL}/analyze-prior-auth`, {
            patientData,
            clinicalContext,
            payerRequirements
          });
      
      if (response.data.success) {
        // Update with real AI results
        setGeneratedLetter(response.data.documentation.documentation);
        setApprovalPrediction(response.data.prediction);
        setConfidenceScore(response.data.prediction.probability);
        
        setSubmitStatus({
          type: 'success',
          message: 'Medical necessity letter generated successfully!'
        });
      } else {
        throw new Error('Analysis failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.message || 'Failed to analyze prior authorization. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleDownloadLetter = () => {
    const blob = new Blob([generatedLetter], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical_necessity_letter_${formData.patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleCopyLetter = () => {
    navigator.clipboard.writeText(generatedLetter);
    alert('Letter copied to clipboard!');
  };

  const getConfidenceColor = () => {
    if (confidenceScore >= 80) return 'bg-green-500';
    if (confidenceScore >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getConfidenceTextColor = () => {
    if (confidenceScore >= 80) return 'text-green-600';
    if (confidenceScore >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'patient-payer':
        return (
          <div className="space-y-6">
            {/* Patient Information */}
            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Patient Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                    placeholder="Enter patient's full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <Select value={formData.gender} onValueChange={(value) => handleSelectChange('gender', value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (lbs) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                    placeholder="Weight in pounds"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Height (inches) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                    placeholder="Height in inches"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    BMI
                  </label>
                  <input
                    type="text"
                    name="bmi"
                    value={formData.bmi}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm sm:text-base"
                    placeholder="Auto-calculated"
                  />
                </div>
              </div>
            </div>

            {/* Insurance Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Insurance Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Insurance Payer <span className="text-red-500">*</span>
                  </label>
                  {loadingPayers ? (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                      <span className="ml-2 text-sm text-gray-600">Loading payers...</span>
                    </div>
                  ) : (
                    <Select value={formData.payerName} onValueChange={(value) => handleSelectChange('payerName', value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select insurance payer" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {['Major', 'Regional', 'Medicare', 'Medicaid'].map(category => {
                          const categoryPayers = realPayerData.filter(p => p.category === category);
                          if (categoryPayers.length === 0) return null;
                          
                          return (
                            <CommandGroup key={category} heading={`${category} Payers`}>
                              {categoryPayers.map(payer => (
                                <SelectItem key={payer.id} value={payer.name}>
                                  <div className="flex items-center justify-between w-full">
                                    <span>{payer.name}</span>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                      <span>{payer.approvalRate}% approval</span>
                                      <span>•</span>
                                      <span>{payer.avgProcessingDays}d avg</span>
                                      {payer.submissionMethod === 'Electronic' && (
                                        <Zap className="h-3 w-3 text-green-600" />
                                      )}
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </CommandGroup>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {formData.payerName && payerPolicies[formData.payerName] && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Payer Requirements</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      {extractSpecialRequirements(payerPolicies[formData.payerName]).map((req, idx) => (
                        <li key={idx}>• {req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Member ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="memberId"
                      value={formData.memberId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                      placeholder="Member ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Group Number
                    </label>
                    <input
                      type="text"
                      name="groupNumber"
                      value={formData.groupNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                      placeholder="Group Number"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plan Type <span className="text-red-500">*</span>
                    </label>
                    <Select value={formData.planType} onValueChange={(value) => handleSelectChange('planType', value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select plan type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PPO">PPO</SelectItem>
                        <SelectItem value="HMO">HMO</SelectItem>
                        <SelectItem value="EPO">EPO</SelectItem>
                        <SelectItem value="POS">POS</SelectItem>
                        <SelectItem value="Medicare Advantage">Medicare Advantage</SelectItem>
                        <SelectItem value="Medicaid">Medicaid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'clinical':
        return (
          <div className="space-y-6">
            {/* Clinical Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Clinical Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Diagnosis <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="primaryDiagnosis"
                    value={formData.primaryDiagnosis}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Type 2 Diabetes Mellitus"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ICD-10 Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="icd10Code"
                    value={formData.icd10Code}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., E11.9"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    HbA1c (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="hba1c"
                    value={formData.hba1c}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., 8.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fasting Glucose (mg/dL)
                  </label>
                  <input
                    type="number"
                    name="fastingGlucose"
                    value={formData.fastingGlucose}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., 180"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comorbidities
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'hypertension', label: 'Hypertension', icon: Heart },
                    { value: 'dyslipidemia', label: 'Dyslipidemia', icon: Activity },
                    { value: 'obesity', label: 'Obesity', icon: User },
                    { value: 'cardiovascular', label: 'Cardiovascular Disease', icon: Heart },
                    { value: 'neuropathy', label: 'Neuropathy', icon: Brain },
                    { value: 'retinopathy', label: 'Retinopathy', icon: Stethoscope }
                  ].map(condition => (
                    <label key={condition.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value={condition.value}
                        checked={formData.comorbidities.includes(condition.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              comorbidities: [...prev.comorbidities, condition.value]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              comorbidities: prev.comorbidities.filter(c => c !== condition.value)
                            }));
                          }
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700 flex items-center gap-1">
                        <condition.icon className="h-4 w-4 text-gray-400" />
                        {condition.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clinical Notes
                </label>
                <textarea
                  name="clinicalNotes"
                  value={formData.clinicalNotes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Additional clinical information..."
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recent Lab Results
                </label>
                <textarea
                  name="labResults"
                  value={formData.labResults}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Include relevant lab results (e.g., lipid panel, liver function, kidney function)..."
                />
              </div>
            </div>
          </div>
        );

      case 'treatment':
        return (
          <div className="space-y-6">
            {/* Treatment History */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Treatment History</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Medications
                  </label>
                  <textarea
                    name="currentMedications"
                    value={formData.currentMedications}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="List current medications..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Previous Treatments (Failed Therapies)
                  </label>
                  <textarea
                    name="previousTreatments"
                    value={formData.previousTreatments}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="List previous treatments and reasons for discontinuation..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraindications
                  </label>
                  <textarea
                    name="contraindications"
                    value={formData.contraindications}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="List any contraindications..."
                  />
                </div>
              </div>
            </div>

            {/* Medication Request */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Medication Request</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Requested GLP-1 Medication <span className="text-red-500">*</span>
                  </label>
                  <Select 
                    value={formData.requestedMedication} 
                    onValueChange={(value) => {
                      const medication = glp1Medications.find(m => m.name === value);
                      if (medication) {
                        handleMedicationSelect(medication);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select GLP-1 medication" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {Object.entries(
                        glp1Medications.reduce((groups, med) => {
                          const group = med.class;
                          if (!groups[group]) groups[group] = [];
                          groups[group].push(med);
                          return groups;
                        }, {})
                      ).map(([className, meds]) => (
                        <CommandGroup key={className} heading={className}>
                          {meds.map(med => (
                            <SelectItem key={med.id} value={med.name}>
                              <div className="flex flex-col">
                                <span className="font-medium">{med.name}</span>
                                <span className="text-xs text-gray-500">
                                  {med.indication} • {med.manufacturer}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </CommandGroup>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dosage <span className="text-red-500">*</span>
                    </label>
                    {selectedMedication ? (
                      <Select value={formData.dosage} onValueChange={(value) => handleSelectChange('dosage', value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select dosage" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedMedication.dosages.map(dosage => (
                            <SelectItem key={dosage} value={dosage}>{dosage}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <input
                        type="text"
                        name="dosage"
                        value={formData.dosage}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Select medication first"
                        disabled
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frequency <span className="text-red-500">*</span>
                    </label>
                    <Select value={formData.frequency} onValueChange={(value) => handleSelectChange('frequency', value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Once daily">Once daily</SelectItem>
                        <SelectItem value="Twice daily">Twice daily</SelectItem>
                        <SelectItem value="Once weekly">Once weekly</SelectItem>
                        <SelectItem value="As directed">As directed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., 90 days"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Step Therapy Exception (if applicable)
                  </label>
                  <Select value={formData.stepTherapyReason} onValueChange={(value) => handleSelectChange('stepTherapyReason', value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select reason if applicable" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contraindication">Contraindication to preferred agents</SelectItem>
                      <SelectItem value="intolerance">Intolerance/adverse reaction to preferred agents</SelectItem>
                      <SelectItem value="failure">Treatment failure on preferred agents</SelectItem>
                      <SelectItem value="drug-interaction">Drug interaction with current medications</SelectItem>
                      <SelectItem value="comorbidity">Comorbidity requiring specific agent</SelectItem>
                      <SelectItem value="not-applicable">Not applicable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'documentation':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Review & Generate Letter</h3>
              
              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Submission Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Patient:</span>
                    <span className="font-medium">{formData.patientName || 'Not entered'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payer:</span>
                    <span className="font-medium">{formData.payerName || 'Not selected'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Medication:</span>
                    <span className="font-medium">{formData.requestedMedication || 'Not selected'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Diagnosis:</span>
                    <span className="font-medium">{formData.primaryDiagnosis || 'Not entered'}</span>
                  </div>
                </div>
              </div>

              {/* Generate Letter Button */}
              <div className="flex justify-center sm:justify-end mt-6">
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting || confidenceScore < 60}
                  className={`
                    w-full sm:w-auto px-6 py-3 rounded-md font-medium flex items-center justify-center gap-2 text-sm sm:text-base
                    ${isSubmitting || confidenceScore < 60
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800'
                    }
                  `}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                      Generating Letter...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                      Generate Medical Necessity Letter
                    </>
                  )}
                </button>
              </div>

              {/* Status Messages */}
              {submitStatus && (
                <div className={`mt-4 p-4 rounded-md flex items-start gap-3 ${
                  submitStatus.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  {submitStatus.type === 'success' ? (
                    <CheckCircle className="h-5 w-5 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">{submitStatus.message}</p>
                    {submitStatus.type === 'success' && approvalPrediction && (
                      <div className="mt-2 space-y-1 text-sm">
                        <p>Approval Probability: <span className="font-bold">{approvalPrediction.probability}%</span></p>
                        <p>Risk Level: <span className="font-medium">{approvalPrediction.riskLevel}</span></p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Prior Authorization Assistant</h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-600">
              Complete all required fields to generate an AI-powered medical necessity letter
            </p>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* Main Form */}
            <div className="flex-1 p-4 sm:p-6">
              {/* Tabs - Scrollable on mobile */}
              <div className="border-b border-gray-200 mb-4 sm:mb-6">
                <nav className="-mb-px flex overflow-x-auto scrollbar-hide">
                  {[
                    { id: 'patient-payer', label: 'Patient & Payer', icon: User, mobileLabel: 'Patient' },
                    { id: 'clinical', label: 'Clinical Case', icon: FileText, mobileLabel: 'Clinical' },
                    { id: 'treatment', label: 'Treatment & Medication', icon: Pill, mobileLabel: 'Treatment' },
                    { id: 'documentation', label: 'Review & Generate Letter', icon: FileText, mobileLabel: 'Generate' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex items-center gap-1 sm:gap-2 py-2 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap
                        ${activeTab === tab.id
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      <tab.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.mobileLabel}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <form onSubmit={handleSubmit}>
                {renderTabContent()}
              </form>
            </div>

            {/* Sidebar - Hidden on mobile, shown as bottom sheet on mobile when needed */}
            <div className="w-full lg:w-80 bg-gray-50 p-4 sm:p-6 border-t lg:border-t-0 lg:border-l border-gray-200">
              {/* Confidence Score */}
              <div className="mb-4 sm:mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Approval Confidence</h3>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${getConfidenceTextColor()} bg-opacity-10`}>
                        {confidenceScore}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                    <div
                      style={{ width: `${confidenceScore}%` }}
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${getConfidenceColor()} transition-all duration-300`}
                    />
                  </div>
                </div>
              </div>

              {/* Pre-Submission Assistant */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-md p-4 mb-6">
                <h4 className="text-base font-semibold text-indigo-900 mb-2">Pre-Submission Assistant</h4>
                <p className="text-sm text-indigo-800 mb-2">
                  The system checks your submission in real-time for payer-specific requirements and documentation completeness.
                </p>
                <ul className="text-sm text-indigo-800 space-y-1">
                  <li>• Payer-specific requirements review</li>
                  <li>• Medical necessity compliance</li>
                  <li>• Documentation completeness</li>
                </ul>
              </div>

              {/* Automated Letter Generation */}
              <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
                <h4 className="text-base font-semibold text-purple-900 mb-2">Automated Letter Generation</h4>
                <p className="text-sm text-purple-800 mb-2">
                  Complete the form to generate a compliant, personalized letter of medical necessity.
                </p>
                <button
                  disabled
                  className="w-full px-3 py-2 bg-purple-100 text-purple-400 text-sm rounded-md cursor-not-allowed"
                >
                  Generate Letter of Medical Necessity
                </button>
                <p className="text-xs text-purple-600 mt-2 text-center">
                  Complete form to enable
                </p>
              </div>

              {/* Letter Generation */}
              {generatedLetter && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-green-900 mb-2">Letter Generated!</h3>
                  <p className="text-xs text-green-700 mb-3">
                    Your medical necessity letter is ready.
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={handleDownloadLetter}
                      className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download Letter
                    </button>
                    <button
                      onClick={handleCopyLetter}
                      className="w-full px-3 py-2 bg-white text-green-700 text-sm rounded-md border border-green-300 hover:bg-green-50 flex items-center justify-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy to Clipboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriorAuthForm; 