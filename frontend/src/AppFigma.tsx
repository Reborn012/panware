import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Users, Eye, Activity, User } from 'lucide-react';
import { Button } from './components/ui/Button';
import { PatientCard } from './components/PatientCard';
import { PatientDetail } from './components/PatientDetail';
import { RiskAssessment } from './components/RiskAssessment';
import { AIClinicalAssistant } from './components/AIClinicalAssistant';
import { FollowUpQuestions } from './components/FollowUpQuestions';
import { InsuranceBilling } from './components/InsuranceBilling';
import { PatientViewEnhanced } from './components/PatientViewEnhanced';
import { apiService } from './services/api';

// Mock data
const patients = [
  {
    id: 'ID: 1',
    name: 'Sarah Johnson',
    age: 65,
    gender: 'female',
    condition: 'Abdominal Pain',
    symptoms: ['abdominal pain', 'weight loss'],
    symptomsCount: 3,
    description: '65-year-old female with 3-month history of epigastric pain, 15-pound weight loss, and new diagnosis of diabetes.',
    contactInfo: {
      phone: '(555) 123-4567',
      email: 's.johnson@email.com',
      address: '123 Main St, City, State'
    }
  },
  {
    id: 'ID: 2',
    name: 'Robert Chen',
    age: 58,
    gender: 'male',
    condition: 'Weight Loss',
    symptoms: ['weight loss', 'fatigue'],
    symptomsCount: 3,
    description: '58-year-old male presenting with unexplained weight loss and fatigue over the past 2 months.',
    contactInfo: {
      phone: '(555) 234-5678',
      email: 'r.chen@email.com'
    }
  },
  {
    id: 'ID: 3',
    name: 'Maria Rodriguez',
    age: 72,
    gender: 'female',
    condition: 'Diabetes',
    symptoms: ['new onset diabetes', 'fatigue'],
    symptomsCount: 3,
    description: '72-year-old female with recent diagnosis of diabetes and associated symptoms.',
    contactInfo: {
      phone: '(555) 345-6789',
      email: 'm.rodriguez@email.com'
    }
  },
  {
    id: 'ID: 4',
    name: 'James Wilson',
    age: 45,
    gender: 'male',
    condition: 'Routine Checkup',
    symptoms: ['mild fatigue'],
    symptomsCount: 1,
    description: '45-year-old male here for routine checkup with mild fatigue complaints.',
    contactInfo: {
      phone: '(555) 456-7890',
      email: 'j.wilson@email.com'
    }
  }
];

const riskFactors = [
  'Age over 60',
  'New-onset diabetes',
  'Unexplained weight loss',
  'Persistent abdominal pain',
  'Family history of pancreatic cancer',
  'Elevated CA 19-9'
];

const followUpQuestions = [
  {
    id: 1,
    text: 'Have you experienced any unexplained weight loss in the past 6 months?',
    answered: false
  },
  {
    id: 2,
    text: 'Does the pain radiate to your back or shoulder blades?',
    answered: false
  },
  {
    id: 3,
    text: 'Have you noticed any changes in your stool color or consistency?',
    answered: false
  }
];

const insuranceData = {
  costEstimate: { min: 300, max: 8000 },
  icdCodes: [
    { code: 'R10.9', description: 'Unspecified abdominal pain' },
    { code: 'R63.4', description: 'Abnormal weight loss' },
    { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications' }
  ],
  cptCodes: [
    { code: '74177', description: 'CT abdomen and pelvis with contrast' }
  ],
  priorAuthRequired: true
};

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  condition: string;
  symptoms: string[];
  symptomsCount?: number;
  description: string;
  contactInfo: {
    phone: string;
    email: string;
    address?: string;
  };
}

export default function App() {
  const [patientsData, setPatientsData] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [questions, setQuestions] = useState(followUpQuestions);
  const [currentView, setCurrentView] = useState<'provider' | 'patient'>('provider');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await apiService.getPatients();
      const transformedPatients: Patient[] = data.map((patient: any) => ({
        id: `ID: ${patient.id}`,
        name: patient.name,
        age: patient.age,
        gender: patient.gender || 'female',
        condition: patient.condition || 'General Care',
        symptoms: patient.symptoms || [],
        symptomsCount: patient.symptoms?.length || 0,
        description: patient.description || `${patient.age}-year-old ${patient.gender || 'patient'} with ${patient.condition || 'general medical concerns'}.`,
        contactInfo: {
          phone: patient.phone || '(555) 000-0000',
          email: patient.email || `${patient.name?.toLowerCase().replace(' ', '.')}@email.com`,
          address: patient.address
        }
      }));
      setPatientsData(transformedPatients);
      if (transformedPatients.length > 0) {
        setSelectedPatientId(transformedPatients[0].id);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
      // Fallback to mock data
      setPatientsData(patients);
      setSelectedPatientId(patients[0].id);
    } finally {
      setLoading(false);
    }
  };

  const selectedPatient = patientsData.find(p => p.id === selectedPatientId) || patientsData[0];

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

  const handleAnswerQuestion = (questionId: number, answer: string) => {
    setQuestions(prev => 
      prev.map(q => 
        q.id === questionId 
          ? { ...q, answered: true }
          : q
      )
    );
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-300 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-800 flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-amber-900">
                  Pancreatic Cancer Clinical Copilot
                </h1>
                <p className="text-amber-700">
                  Delivering the right medical information, to the right provider, at the right time
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                onClick={() => setCurrentView('provider')}
                className={`px-4 py-2 border transition-all duration-200 ${
                  currentView === 'provider'
                    ? 'bg-stone-800 text-white border-stone-800'
                    : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>Provider View</span>
                </div>
              </motion.button>
              
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                onClick={() => setCurrentView('patient')}
                className={`px-4 py-2 border transition-all duration-200 ${
                  currentView === 'patient'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Patient View</span>
                </div>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <AnimatePresence mode="wait">
          {currentView === 'provider' ? (
            <motion.div
              key="provider"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
              className="flex gap-8"
            >
              {/* Sidebar - Patient List */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-80 flex-shrink-0"
              >
                <div className="sticky top-32">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-amber-800">
                      <Users className="w-5 h-5" />
                      <span>Patients</span>
                    </div>
                    <motion.div 
                      whileHover={{ y: -2 }}
                      whileTap={{ y: 0 }}
                    >
                      <Button 
                        size="sm" 
                        className="bg-amber-800 hover:bg-amber-900 text-white border-0"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </motion.div>
                  </div>
                  
                  <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {patientsData.map((patient) => (
                        <PatientCard
                          key={patient.id}
                          {...patient}
                          isSelected={selectedPatientId === patient.id}
                          onClick={() => setSelectedPatientId(patient.id)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedPatientId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PatientDetail patient={selectedPatient} />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                      <RiskAssessment
                        score={14}
                        level="HIGH"
                        factors={riskFactors}
                      />

                      <AIClinicalAssistant />

                      <FollowUpQuestions
                        questions={questions}
                        onAnswer={handleAnswerQuestion}
                      />
                    </div>

                    <InsuranceBilling {...insuranceData} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="patient"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              <PatientViewEnhanced patient={selectedPatient} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}