import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Users, Eye, Activity, User, FileText, Upload } from 'lucide-react';
import { Button } from './components/ui/Button';
import { PatientCard } from './components/PatientCard';
import { PatientDetail } from './components/PatientDetail';
import { RiskAssessment } from './components/RiskAssessment';
import { AIClinicalAssistant } from './components/AIClinicalAssistant';
import { FollowUpQuestions } from './components/FollowUpQuestions';
import { InsuranceBilling } from './components/InsuranceBilling';
import { PatientViewEnhanced } from './components/PatientViewEnhanced';
import Sidebar from './components/Sidebar';
import DraggableDashboard from './components/DraggableDashboard';
import PatientForm from './components/PatientForm';
import MedicalReportDashboard from './components/MedicalReportDashboard';
import { apiService } from './services/api';

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

const App: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isProviderView, setIsProviderView] = useState(true);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'reports' | 'draggable'
  const [riskScore, setRiskScore] = useState(14);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getPatients();
      setPatients(data);
      if (data.length > 0) {
        setSelectedPatient(data[0]);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      // Fallback to mock data if API fails
      const mockPatients: Patient[] = [
        {
          id: '1',
          name: 'Sarah Johnson',
          age: 65,
          gender: 'female',
          condition: 'Abdominal Pain',
          symptoms: ['abdominal pain', 'weight loss'],
          symptomsCount: 3,
          description: '65-year-old female with 3-month history of epigastric pain, 15-pound weight loss, and new diagnosis of diabetes.',
          contactInfo: {
            phone: '(555) 123-4567',
            email: 'sarah.johnson@email.com',
            address: '123 Main St, Anytown, USA'
          }
        },
        {
          id: '2',
          name: 'Robert Chen',
          age: 58,
          gender: 'male',
          condition: 'Weight Loss',
          symptoms: ['weight loss', 'fatigue'],
          symptomsCount: 3,
          description: '58-year-old male with unexplained 20-pound weight loss and persistent fatigue over the past 4 months.',
          contactInfo: {
            phone: '(555) 987-6543',
            email: 'robert.chen@email.com',
            address: '456 Oak Ave, Somewhere, USA'
          }
        }
      ];
      setPatients(mockPatients);
      setSelectedPatient(mockPatients[0]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateRiskScore = (patientSymptoms: string[]) => {
    let score = 0;
    const symptomWeights: Record<string, number> = {
      'abdominal pain': 3,
      'weight loss': 4,
      'diabetes': 3,
      'jaundice': 4,
      'fatigue': 2,
      'nausea': 2,
      'back pain': 3
    };

    patientSymptoms.forEach(symptom => {
      score += symptomWeights[symptom.toLowerCase()] || 1;
    });

    // Add age factor
    if (selectedPatient && selectedPatient.age > 60) {
      score += 3;
    }

    return Math.min(score, 20); // Cap at 20
  };

  useEffect(() => {
    if (selectedPatient) {
      setRiskScore(calculateRiskScore(selectedPatient.symptoms));
    }
  }, [selectedPatient]);

  const handlePatientAdd = (newPatient: Omit<Patient, 'id'>) => {
    const patient: Patient = {
      ...newPatient,
      id: Date.now().toString(),
    };
    setPatients(prev => [patient, ...prev]);
    setSelectedPatient(patient);
    setShowPatientForm(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-600 font-medium">Loading Pancreatic Cancer Clinical Copilot...</p>
        </div>
      </div>
    );
  }

  // Navigation items
  const navigationItems = [
    { id: 'dashboard', label: 'Clinical Dashboard', icon: Activity },
    { id: 'reports', label: 'Medical Reports', icon: FileText },
    { id: 'draggable', label: 'Draggable View', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-stone-900">Pancreatic Cancer Clinical Copilot</h1>
                  <p className="text-xs text-stone-600">Delivering the right medical information, to the right provider, at the right time</p>
                </div>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="flex items-center space-x-2">
              {navigationItems.map(item => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeView === item.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveView(item.id)}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Button>
                );
              })}
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-stone-100 rounded-lg p-1">
                <Button
                  size="sm"
                  variant={isProviderView ? "default" : "ghost"}
                  onClick={() => setIsProviderView(true)}
                  className="flex items-center space-x-2 px-3"
                >
                  <Eye className="w-4 h-4" />
                  <span>Provider View</span>
                </Button>
                <Button
                  size="sm"
                  variant={!isProviderView ? "default" : "ghost"}
                  onClick={() => setIsProviderView(false)}
                  className="flex items-center space-x-2 px-3"
                >
                  <User className="w-4 h-4" />
                  <span>Patient View</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-8"
            >
              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-stone-900 flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Patients</span>
                  </h2>
                  <Button
                    size="sm"
                    onClick={() => setShowPatientForm(true)}
                    className="flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </Button>
                </div>

                <div className="space-y-3">
                  {patients.map(patient => (
                    <PatientCard
                      key={patient.id}
                      patient={patient}
                      isSelected={selectedPatient?.id === patient.id}
                      onClick={() => setSelectedPatient(patient)}
                    />
                  ))}
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                {selectedPatient ? (
                  isProviderView ? (
                    <div className="space-y-6">
                      <PatientDetail patient={selectedPatient} />
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <RiskAssessment
                          score={riskScore}
                          level={riskScore > 12 ? 'High' : riskScore > 6 ? 'Medium' : 'Low'}
                          factors={riskFactors}
                        />
                        <AIClinicalAssistant patientId={selectedPatient.id} />
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <FollowUpQuestions 
                          questions={followUpQuestions}
                          patientId={selectedPatient.id}
                        />
                        <InsuranceBilling patientData={selectedPatient} />
                      </div>
                    </div>
                  ) : (
                    <PatientViewEnhanced 
                      patient={selectedPatient}
                      riskScore={riskScore}
                      riskLevel={riskScore > 12 ? 'High' : riskScore > 6 ? 'Medium' : 'Low'}
                    />
                  )
                ) : (
                  <div className="text-center py-12">
                    <User className="w-16 h-16 text-stone-400 mx-auto mb-4" />
                    <p className="text-stone-600">Select a patient to view details</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeView === 'reports' && selectedPatient && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <MedicalReportDashboard 
                patientId={selectedPatient.id}
                patientData={selectedPatient}
              />
            </motion.div>
          )}

          {activeView === 'draggable' && (
            <motion.div
              key="draggable"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <DraggableDashboard />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Patient Form Modal */}
        <AnimatePresence>
          {showPatientForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowPatientForm(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <PatientForm
                  onSubmit={handlePatientAdd}
                  onCancel={() => setShowPatientForm(false)}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* No Patient Selected for Reports */}
        {activeView === 'reports' && !selectedPatient && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <FileText className="w-16 h-16 text-stone-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-stone-900 mb-2">No Patient Selected</h3>
            <p className="text-stone-600 mb-4">Please select a patient to access their medical reports</p>
            <Button onClick={() => setActiveView('dashboard')}>
              Go to Dashboard
            </Button>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default App;