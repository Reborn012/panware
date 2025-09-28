import React, { useState, useEffect } from 'react';
import { Activity, Eye, User, Users, Plus, AlertTriangle, Brain, FileText, DollarSign } from 'lucide-react';
import { Button } from './components/ui/Button';
import { apiService } from './services/api';
import PatientViewEnhanced from './components/PatientViewEnhanced';
import MedicalReportsSimple from './components/MedicalReportsSimple';

const PatientCard = ({ patient, isSelected, onClick }) => (
  <div
    onClick={onClick}
    className={`
      p-4 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg border-2
      ${isSelected 
        ? 'bg-white border-amber-300 shadow-lg ring-2 ring-amber-200/50' 
        : 'bg-white/80 border-stone-200 hover:border-amber-200 hover:bg-white shadow-sm'
      }
    `}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h3 className="font-semibold text-stone-900 mb-1 text-lg">{patient.name}</h3>
        <p className="text-sm text-stone-600 mb-2 font-medium">{patient.condition}</p>
        <div className="flex items-center gap-3 text-xs text-stone-500">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            Age: {patient.age}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Activity className="w-3 h-3" />
            {patient.symptoms?.length || 0} symptoms
          </span>
        </div>
      </div>
      <div className={`
        w-4 h-4 rounded-full transition-colors duration-200
        ${isSelected ? 'bg-amber-500 shadow-md' : 'bg-stone-300'}
      `} />
    </div>
  </div>
);

const PatientDetail = ({ patient }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200 mb-6 backdrop-blur-sm">
    <div className="flex items-center gap-4 mb-4">
      <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center shadow-md">
        <User className="w-8 h-8 text-amber-700" />
      </div>
      <div className="flex-1">
        <h2 className="text-2xl font-bold text-stone-900 mb-1">{patient.name}</h2>
        <div className="flex items-center gap-4 text-stone-600">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            {patient.age} years old
          </span>
          <span>•</span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            {patient.gender}
          </span>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm text-stone-500">Patient ID</div>
        <div className="font-mono text-sm text-stone-700">#{patient.id}</div>
      </div>
    </div>
    <div className="bg-stone-50 rounded-lg p-4">
      <p className="text-stone-700 leading-relaxed">{patient.description}</p>
    </div>
  </div>
);

const RiskAssessment = ({ patient }) => {
  const [riskData, setRiskData] = useState({ score: 0, level: 'LOW', factors: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!patient) return;

    const fetchRiskAssessment = async () => {
      setLoading(true);
      try {
        const response = await apiService.calculateRisk(patient);
        setRiskData({
          score: response.score || 12,
          level: response.level || 'MODERATE',
          factors: response.factors || [
            `Age: ${patient.age} years`,
            `Symptoms: ${patient.symptoms?.join(', ') || 'None listed'}`,
            `Primary concern: ${patient.condition}`,
            `Gender: ${patient.gender}`
          ]
        });
      } catch (error) {
        console.error('Error fetching risk assessment:', error);
        // Fallback to patient-based calculation
        const score = calculatePatientRiskScore(patient);
        const level = score > 15 ? 'HIGH' : score > 8 ? 'MODERATE' : 'LOW';
        setRiskData({
          score,
          level,
          factors: [
            `Age: ${patient.age} years`,
            `Symptoms: ${patient.symptoms?.join(', ') || 'None listed'}`,
            `Primary concern: ${patient.condition}`,
            `Gender: ${patient.gender}`
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRiskAssessment();
  }, [patient?.id]);

  const calculatePatientRiskScore = (patient) => {
    let score = 0;
    if (patient.age > 60) score += 4;
    if (patient.age > 70) score += 2;
    if (patient.symptoms?.includes('weight loss')) score += 3;
    if (patient.symptoms?.includes('abdominal pain')) score += 2;
    if (patient.symptoms?.includes('new_onset_diabetes')) score += 3;
    if (patient.condition?.toLowerCase().includes('pain')) score += 1;
    return Math.min(score, 20);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
        <div className="animate-pulse">
          <div className="h-4 bg-stone-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-stone-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-stone-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-stone-200 rounded"></div>
            <div className="h-3 bg-stone-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="w-5 h-5 text-red-500" />
        <h3 className="font-semibold text-stone-900">Risk Assessment</h3>
      </div>
      <div className="text-center mb-4">
        <div className="text-3xl font-bold text-red-600 mb-1">{riskData.score}/20</div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          riskData.level === 'HIGH' ? 'bg-red-100 text-red-700' :
          riskData.level === 'MODERATE' ? 'bg-yellow-100 text-yellow-700' :
          'bg-green-100 text-green-700'
        }`}>
          {riskData.level} RISK
        </div>
      </div>
      <div className="space-y-2">
        {riskData.factors.slice(0, 4).map((factor, index) => (
          <div key={index} className="flex items-center gap-2 text-sm text-stone-600">
            <div className={`w-2 h-2 rounded-full ${
              riskData.level === 'HIGH' ? 'bg-red-400' :
              riskData.level === 'MODERATE' ? 'bg-yellow-400' :
              'bg-green-400'
            }`} />
            {factor}
          </div>
        ))}
      </div>
    </div>
  );
};

const AIClinicalAssistant = ({ patient }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState("Based on symptoms and risk factors, recommend CT scan and CA 19-9 test for early detection.");
  const [sessionId, setSessionId] = useState(`provider_${patient?.id || 'default'}_${Date.now()}`);

  // Reset recommendation when patient changes
  useEffect(() => {
    setRecommendation("Based on symptoms and risk factors, recommend CT scan and CA 19-9 test for early detection.");
    setSessionId(`provider_${patient?.id || 'default'}_${Date.now()}`);
  }, [patient?.id]);

  const handleAskAI = async () => {
    if (!patient) return;

    setIsLoading(true);
    try {
      const patientContext = {
        name: patient.name,
        age: patient.age,
        symptoms: patient.symptoms || [],
        condition: patient.condition,
        gender: patient.gender
      };

      const response = await apiService.sendAIMessage(
        "What is the risk assessment for this patient and what clinical recommendations do you have?",
        sessionId,
        patientContext
      );

      setRecommendation(response.response || response.message || "Unable to get AI recommendation at this time.");
    } catch (error) {
      console.error('Error getting AI recommendation:', error);
      setRecommendation("Unable to connect to AI assistant. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
      <div className="flex items-center gap-3 mb-4">
        <Brain className="w-5 h-5 text-blue-500" />
        <h3 className="font-semibold text-stone-900">AI Clinical Assistant</h3>
      </div>
      <div className="space-y-3">
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-800">
            "{recommendation}"
          </p>
        </div>
        <Button
          size="sm"
          className="w-full bg-blue-600 hover:bg-blue-700"
          onClick={handleAskAI}
          disabled={isLoading || !patient}
        >
          {isLoading ? "Getting AI Recommendation..." : "Ask AI Assistant"}
        </Button>
      </div>
    </div>
  );
};

const FollowUpQuestions = ({ patient, onAnswer }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!patient) return;

    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const response = await apiService.getQuestionnaire(patient);
        setQuestions(response.questions || generatePatientQuestions(patient));
      } catch (error) {
        console.error('Error fetching questions:', error);
        setQuestions(generatePatientQuestions(patient));
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [patient?.id]);

  const generatePatientQuestions = (patient) => {
    const baseQuestions = [
      { id: 1, text: `Have you experienced any changes in your ${patient.condition?.toLowerCase() || 'symptoms'} recently?`, answered: false },
      { id: 2, text: `How would you rate your pain level on a scale of 1-10?`, answered: false },
      { id: 3, text: `Have you noticed any new symptoms since your last visit?`, answered: false }
    ];

    // Add condition-specific questions
    if (patient.condition?.toLowerCase().includes('pain')) {
      baseQuestions.push({ id: 4, text: 'Does the pain radiate to other areas?', answered: false });
    }
    if (patient.symptoms?.includes('weight loss')) {
      baseQuestions.push({ id: 5, text: 'How much weight have you lost in the past 6 months?', answered: false });
    }

    return baseQuestions;
  };

  const handleAnswer = (questionId, answer) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId ? { ...q, answered: true, answer } : q
      )
    );
    if (onAnswer) onAnswer(questionId, answer);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
        <div className="animate-pulse">
          <div className="h-4 bg-stone-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-stone-200 rounded"></div>
            <div className="h-3 bg-stone-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
      <div className="flex items-center gap-3 mb-4">
        <FileText className="w-5 h-5 text-green-500" />
        <h3 className="font-semibold text-stone-900">Follow-up Questions</h3>
      </div>
      <div className="space-y-3">
        {questions.slice(0, 2).map((question) => (
          <div key={question.id} className="border-l-4 border-green-200 pl-3">
            <p className="text-sm text-stone-700 mb-2">{question.text}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAnswer(question.id, 'yes')}
              className="text-xs"
            >
              {question.answered ? 'Answered' : 'Answer'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

const InsuranceBilling = ({ patient }) => {
  const [billingData, setBillingData] = useState({
    costEstimate: { min: 0, max: 0 },
    icdCodes: [],
    priorAuthRequired: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!patient) return;

    const fetchBillingData = async () => {
      setLoading(true);
      try {
        const response = await apiService.getInsuranceInfo(patient);
        setBillingData({
          costEstimate: response.costEstimate || generateCostEstimate(patient),
          icdCodes: response.icdCodes || generateIcdCodes(patient),
          priorAuthRequired: response.priorAuthRequired !== undefined ? response.priorAuthRequired : determinepriorAuth(patient)
        });
      } catch (error) {
        console.error('Error fetching billing data:', error);
        setBillingData({
          costEstimate: generateCostEstimate(patient),
          icdCodes: generateIcdCodes(patient),
          priorAuthRequired: determinepriorAuth(patient)
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, [patient?.id]);

  const generateCostEstimate = (patient) => {
    const baseMin = 200;
    const baseMax = 1500;

    let multiplier = 1;
    if (patient.age > 65) multiplier += 0.5;
    if (patient.symptoms?.length > 2) multiplier += 0.3;
    if (patient.condition?.toLowerCase().includes('pain')) multiplier += 0.2;

    return {
      min: Math.round(baseMin * multiplier),
      max: Math.round(baseMax * multiplier)
    };
  };

  const generateIcdCodes = (patient) => {
    const codes = [];

    if (patient.condition?.toLowerCase().includes('pain')) {
      codes.push({ code: 'R10.9', description: 'Unspecified abdominal pain' });
    }
    if (patient.symptoms?.includes('weight loss')) {
      codes.push({ code: 'R63.4', description: 'Abnormal weight loss' });
    }
    if (patient.age > 60) {
      codes.push({ code: 'Z87.891', description: 'Personal history of nicotine dependence' });
    }

    // Default codes if none specific
    if (codes.length === 0) {
      codes.push(
        { code: 'Z00.00', description: 'Encounter for general adult medical examination without abnormal findings' },
        { code: 'Z51.11', description: 'Encounter for antineoplastic chemotherapy' }
      );
    }

    return codes;
  };

  const determinepriorAuth = (patient) => {
    if (patient.age > 65) return true;
    if (patient.symptoms?.includes('weight loss') && patient.symptoms?.includes('abdominal pain')) return true;
    return false;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
        <div className="animate-pulse">
          <div className="h-4 bg-stone-200 rounded w-1/2 mb-4"></div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="h-8 bg-stone-200 rounded"></div>
            <div className="h-8 bg-stone-200 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-stone-200 rounded"></div>
            <div className="h-3 bg-stone-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
      <div className="flex items-center gap-3 mb-4">
        <DollarSign className="w-5 h-5 text-purple-500" />
        <h3 className="font-semibold text-stone-900">Insurance & Billing</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-stone-600 mb-1">Cost Estimate</p>
          <p className="font-semibold text-stone-900">
            ${billingData.costEstimate.min} - ${billingData.costEstimate.max}
          </p>
        </div>
        <div>
          <p className="text-sm text-stone-600 mb-1">Prior Auth</p>
          <p className={`text-sm font-medium ${billingData.priorAuthRequired ? 'text-red-600' : 'text-green-600'}`}>
            {billingData.priorAuthRequired ? 'Required' : 'Not Required'}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm text-stone-600 mb-2">ICD Codes</p>
        <div className="space-y-1">
          {billingData.icdCodes.slice(0, 2).map((code) => (
            <div key={code.code} className="text-xs text-stone-700">
              <span className="font-mono bg-stone-100 px-2 py-1 rounded">{code.code}</span>
              <span className="ml-2">{code.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function AppModern() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [viewMode, setViewMode] = useState('provider');
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'reports'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await apiService.getPatients();
      const transformedPatients = data.map((patient) => ({
        id: `ID: ${patient.id}`,
        name: patient.name,
        age: patient.age,
        gender: patient.gender || 'female',
        condition: patient.condition || 'General Care',
        symptoms: patient.symptoms || [],
        description: patient.description || `${patient.age}-year-old ${patient.gender || 'patient'} with ${patient.condition || 'general medical concerns'}.`,
        contactInfo: {
          phone: patient.phone || '(555) 000-0000',
          email: patient.email || `${patient.name?.toLowerCase().replace(' ', '.')}@email.com`,
          address: patient.address
        }
      }));
      setPatients(transformedPatients);
      if (transformedPatients.length > 0) {
        setSelectedPatient(transformedPatients[0]);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
      // Fallback to sample data
      const samplePatients = [
        {
          id: 'ID: 1',
          name: 'Sarah Johnson',
          age: 65,
          gender: 'female',
          condition: 'Abdominal Pain',
          symptoms: ['abdominal pain', 'weight loss'],
          description: '65-year-old female with 3-month history of epigastric pain, 15-pound weight loss, and new diagnosis of diabetes.',
          contactInfo: { phone: '(555) 123-4567', email: 's.johnson@email.com', address: '123 Main St, City, State' }
        },
        {
          id: 'ID: 2',
          name: 'Robert Chen',
          age: 58,
          gender: 'male',
          condition: 'Weight Loss',
          symptoms: ['weight loss', 'fatigue'],
          description: '58-year-old male presenting with unexplained weight loss and fatigue over the past 2 months.',
          contactInfo: { phone: '(555) 234-5678', email: 'r.chen@email.com' }
        }
      ];
      setPatients(samplePatients);
      setSelectedPatient(samplePatients[0]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerQuestion = (questionId, answer) => {
    console.log(`Question ${questionId} answered: ${answer}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-stone-600">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/30">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-stone-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center rounded-xl shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-stone-900 leading-tight">
                  Pancreatic Cancer Clinical Copilot
                </h1>
                <p className="text-amber-700 text-sm font-medium">
                  Delivering the right medical information, to the right provider, at the right time
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-1">
              <Button
                onClick={() => setActiveTab('dashboard')}
                variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
                size="sm"
                className={`transition-all duration-200 ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-amber-700 shadow-md font-semibold border-amber-200'
                    : 'text-stone-600 hover:text-amber-700 hover:bg-white/50'
                }`}
              >
                <Activity className="w-4 h-4 mr-2" />
                Clinical Dashboard
              </Button>

              <Button
                onClick={() => setActiveTab('reports')}
                variant={activeTab === 'reports' ? 'default' : 'ghost'}
                size="sm"
                className={`transition-all duration-200 ${
                  activeTab === 'reports'
                    ? 'bg-white text-blue-700 shadow-md font-semibold border-blue-200'
                    : 'text-stone-600 hover:text-blue-700 hover:bg-white/50'
                }`}
              >
                <FileText className="w-4 h-4 mr-2" />
                Medical Reports
              </Button>
            </div>

            <div className="flex items-center gap-2 bg-stone-100 rounded-lg p-1">
              <Button
                onClick={() => setViewMode('provider')}
                variant={viewMode === 'provider' ? 'default' : 'ghost'}
                size="sm"
                className={`transition-all duration-200 ${
                  viewMode === 'provider'
                    ? 'bg-white text-stone-800 shadow-md font-semibold'
                    : 'text-stone-600 hover:text-stone-800 hover:bg-white/50'
                }`}
              >
                <Eye className="w-4 h-4 mr-2" />
                Provider View
              </Button>

              <Button
                onClick={() => setViewMode('patient')}
                variant={viewMode === 'patient' ? 'default' : 'ghost'}
                size="sm"
                className={`transition-all duration-200 ${
                  viewMode === 'patient'
                    ? 'bg-white text-blue-800 shadow-md font-semibold'
                    : 'text-stone-600 hover:text-blue-800 hover:bg-white/50'
                }`}
              >
                <User className="w-4 h-4 mr-2" />
                Patient View
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {activeTab === 'dashboard' ? (
          // Dashboard Tab
          viewMode === 'provider' ? (
            <div className="flex gap-8">
              {/* Sidebar - Patient List */}
              <div className="w-80 flex-shrink-0">
                <div className="sticky top-32 bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-stone-200">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3 text-amber-800">
                      <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-lg">Patients</span>
                        <div className="text-xs text-stone-500">{patients.length} total</div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">{patients.map((patient) => (
                      <PatientCard
                        key={patient.id}
                        patient={patient}
                        isSelected={selectedPatient?.id === patient.id}
                        onClick={() => setSelectedPatient(patient)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Content - Provider View */}
              <div className="flex-1 min-w-0">
                {selectedPatient && (
                  <>
                    <PatientDetail patient={selectedPatient} />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                      <RiskAssessment patient={selectedPatient} />

                      <AIClinicalAssistant patient={selectedPatient} />

                      <FollowUpQuestions
                        patient={selectedPatient}
                        onAnswer={handleAnswerQuestion}
                      />
                    </div>

                    <InsuranceBilling patient={selectedPatient} />
                  </>
                )}
              </div>
            </div>
          ) : (
            // Patient View in Dashboard
            <div>
              {selectedPatient && (
                <PatientViewEnhanced patient={selectedPatient} />
              )}
            </div>
          )
        ) : (
          // Medical Reports Tab
          <div>
            {selectedPatient ? (
              <MedicalReportsSimple 
                patientId={selectedPatient.id}
                patientData={selectedPatient}
              />
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-stone-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-stone-900 mb-2">No Patient Selected</h3>
                <p className="text-stone-600 mb-4">Please select a patient to access their medical reports</p>
                <Button onClick={() => setActiveTab('dashboard')}>
                  Go to Dashboard
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}