import React, { useState, useEffect } from 'react';
import RiskCard from './RiskCard';
import StudyCard from './StudyCard';
import QuestionnaireCard from './QuestionnaireCard';
import InsuranceCard from './InsuranceCard';
import AIChatCard from './AIChatCard';
import PatientView from './PatientView';
import { apiService } from '../services/api';

const Dashboard = ({ patient, viewMode }) => {
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [studySummary, setStudySummary] = useState(null);
  const [questionnaire, setQuestionnaire] = useState(null);
  const [insuranceInfo, setInsuranceInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionId] = useState(`session_${patient?.id || 'demo'}_${Date.now()}`);

  useEffect(() => {
    if (patient) {
      loadPatientData();
    }
  }, [patient]);

  const loadPatientData = async () => {
    setLoading(true);
    try {
      const risk = await apiService.getRiskAssessment(patient);
      setRiskAssessment(risk);

      const primaryRiskFactor = risk.reasons.length > 0
        ? risk.reasons[0].toLowerCase().replace(/\s+/g, '_').replace('elevated_ca_19-9', 'ca19_9')
        : 'default';

      const [study, questions, insurance] = await Promise.all([
        apiService.getStudySummary(primaryRiskFactor),
        apiService.getQuestionnaire(patient.chief_complaint),
        apiService.getInsuranceMapping(patient.symptoms, risk.recommended_action)
      ]);

      setStudySummary(study);
      setQuestionnaire(questions);
      setInsuranceInfo(insurance);
    } catch (error) {
      console.error('Error loading patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-primary"></div>
      </div>
    );
  }

  if (viewMode === 'patient') {
    return (
      <PatientView
        patient={patient}
        riskAssessment={riskAssessment}
        questionnaire={questionnaire}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{patient.name}</h2>
            <p className="text-lg text-gray-600 mt-1">{patient.presentation_summary}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Patient ID: {patient.id}</p>
            <p className="text-sm text-gray-500">Age: {patient.age} • Sex: {patient.sex}</p>
            <div className="mt-2 flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-xs text-green-600 font-medium">AI Assistant Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Risk & Study */}
        <div className="space-y-6">
          <RiskCard
            riskAssessment={riskAssessment}
            patient={patient}
          />

          <StudyCard
            studySummary={studySummary}
            riskLevel={riskAssessment?.risk_level}
          />
        </div>

        {/* Middle Column - AI Chat */}
        <div className="space-y-6">
          <AIChatCard
            patient={patient}
            sessionId={sessionId}
          />
        </div>

        {/* Right Column - Questionnaire & Insurance */}
        <div className="space-y-6">
          <QuestionnaireCard
            questionnaire={questionnaire}
            chiefComplaint={patient.chief_complaint}
          />

          <InsuranceCard
            insuranceInfo={insuranceInfo}
            riskLevel={riskAssessment?.risk_level}
          />
        </div>
      </div>

      {/* Patient Summary Section */}
      <div className="mt-8 card">
        <h3 className="card-header">Patient Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Current Symptoms</h4>
            <div className="space-y-1">
              {patient.symptoms?.map((symptom, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mr-1 mb-1"
                >
                  {symptom.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Medical History</h4>
            <div className="space-y-1">
              {patient.medical_history?.length > 0 ? (
                patient.medical_history.map((condition, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    • {condition.replace('_', ' ')}
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">No significant history</div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Laboratory Values</h4>
            <div className="space-y-1 text-sm">
              {patient.labs && (
                <>
                  <div className="flex justify-between">
                    <span>CA 19-9:</span>
                    <span className={patient.labs.ca19_9 > 37 ? 'text-red-600 font-medium' : 'text-gray-600'}>
                      {patient.labs.ca19_9} U/mL
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Glucose:</span>
                    <span className={patient.labs.glucose > 125 ? 'text-red-600 font-medium' : 'text-gray-600'}>
                      {patient.labs.glucose} mg/dL
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lipase:</span>
                    <span className="text-gray-600">
                      {patient.labs.lipase} U/L
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Footer */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Enhanced with AI</h4>
            <p className="text-sm text-gray-600">
              This patient assessment is powered by advanced AI reasoning, real-time collaboration,
              and intelligent appointment scheduling. Ask the AI assistant any questions about diagnosis,
              treatment, or care coordination.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;