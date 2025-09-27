import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Plus, Maximize2, Minimize2, X } from 'lucide-react';
import RiskCard from './RiskCard';
import StudyCard from './StudyCard';
import QuestionnaireCard from './QuestionnaireCard';
import InsuranceCard from './InsuranceCard';
import AIChatCard from './AIChatCard';
import PatientView from './PatientView';
import { apiService } from '../services/api';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import '../styles/dashboard.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const WIDGET_TYPES = {
  RISK_CARD: 'risk_card',
  AI_CHAT: 'ai_chat',
  STUDY_CARD: 'study_card',
  QUESTIONNAIRE: 'questionnaire',
  INSURANCE: 'insurance',
  PATIENT_SUMMARY: 'patient_summary'
};

const AVAILABLE_WIDGETS = [
  { id: WIDGET_TYPES.RISK_CARD, name: 'Risk Assessment', icon: '🎯', description: 'AI-powered risk scoring' },
  { id: WIDGET_TYPES.AI_CHAT, name: 'AI Chat Assistant', icon: '🤖', description: 'Chat with medical AI' },
  { id: WIDGET_TYPES.STUDY_CARD, name: 'Literature Summary', icon: '📚', description: 'Relevant research studies' },
  { id: WIDGET_TYPES.QUESTIONNAIRE, name: 'Clinical Questions', icon: '📋', description: 'Diagnostic questionnaire' },
  { id: WIDGET_TYPES.INSURANCE, name: 'Insurance Codes', icon: '💳', description: 'Billing and coding info' },
  { id: WIDGET_TYPES.PATIENT_SUMMARY, name: 'Patient Summary', icon: '📊', description: 'Complete patient overview' }
];

const DEFAULT_LAYOUTS = {
  lg: [
    { i: WIDGET_TYPES.RISK_CARD, x: 0, y: 0, w: 4, h: 6, minW: 3, minH: 4 },
    { i: WIDGET_TYPES.AI_CHAT, x: 4, y: 0, w: 4, h: 8, minW: 3, minH: 6 },
    { i: WIDGET_TYPES.QUESTIONNAIRE, x: 8, y: 0, w: 4, h: 6, minW: 3, minH: 4 },
  ],
  md: [
    { i: WIDGET_TYPES.RISK_CARD, x: 0, y: 0, w: 6, h: 6, minW: 4, minH: 4 },
    { i: WIDGET_TYPES.AI_CHAT, x: 6, y: 0, w: 6, h: 8, minW: 4, minH: 6 },
    { i: WIDGET_TYPES.QUESTIONNAIRE, x: 0, y: 6, w: 6, h: 6, minW: 4, minH: 4 },
  ],
  sm: [
    { i: WIDGET_TYPES.RISK_CARD, x: 0, y: 0, w: 6, h: 6, minW: 6, minH: 4 },
    { i: WIDGET_TYPES.AI_CHAT, x: 0, y: 6, w: 6, h: 8, minW: 6, minH: 6 },
    { i: WIDGET_TYPES.QUESTIONNAIRE, x: 0, y: 14, w: 6, h: 6, minW: 6, minH: 4 },
  ]
};

const DraggableDashboard = ({ patient, viewMode }) => {
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [studySummary, setStudySummary] = useState(null);
  const [questionnaire, setQuestionnaire] = useState(null);
  const [insuranceInfo, setInsuranceInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionId] = useState(`session_${patient?.id || 'demo'}_${Date.now()}`);

  const [widgets, setWidgets] = useState([
    WIDGET_TYPES.RISK_CARD,
    WIDGET_TYPES.AI_CHAT,
    WIDGET_TYPES.QUESTIONNAIRE
  ]);
  const [layouts, setLayouts] = useState(DEFAULT_LAYOUTS);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [maximizedWidget, setMaximizedWidget] = useState(null);

  useEffect(() => {
    if (patient) {
      loadPatientData();
    }
  }, [patient]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const addWidget = (widgetType) => {
    if (!widgets.includes(widgetType)) {
      setWidgets([...widgets, widgetType]);

      // Add to layout with smart positioning
      const newLayouts = { ...layouts };
      Object.keys(newLayouts).forEach(breakpoint => {
        const layout = newLayouts[breakpoint];
        const maxY = Math.max(...layout.map(item => item.y + item.h), 0);
        newLayouts[breakpoint] = [
          ...layout,
          {
            i: widgetType,
            x: 0,
            y: maxY,
            w: breakpoint === 'sm' ? 6 : 4,
            h: 6,
            minW: breakpoint === 'sm' ? 6 : 3,
            minH: 4
          }
        ];
      });
      setLayouts(newLayouts);
    }
    setShowAddMenu(false);
  };

  const removeWidget = (widgetType) => {
    setWidgets(widgets.filter(w => w !== widgetType));
    const newLayouts = { ...layouts };
    Object.keys(newLayouts).forEach(breakpoint => {
      newLayouts[breakpoint] = newLayouts[breakpoint].filter(item => item.i !== widgetType);
    });
    setLayouts(newLayouts);
  };

  const onLayoutChange = (layout, allLayouts) => {
    setLayouts(allLayouts);
  };

  const toggleMaximize = (widgetType) => {
    setMaximizedWidget(maximizedWidget === widgetType ? null : widgetType);
  };

  const renderWidget = (widgetType) => {
    const isMaximized = maximizedWidget === widgetType;
    const baseClasses = "h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col";

    const widgetHeader = (title, icon) => (
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{icon}</span>
          <h3 className="font-medium text-gray-900 text-sm">{title}</h3>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => toggleMaximize(widgetType)}
            className="p-1 hover:bg-gray-200 rounded"
            title={isMaximized ? "Minimize" : "Maximize"}
          >
            {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button
            onClick={() => removeWidget(widgetType)}
            className="p-1 hover:bg-red-100 text-red-600 rounded"
            title="Remove widget"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );

    switch (widgetType) {
      case WIDGET_TYPES.RISK_CARD:
        return (
          <div className={baseClasses}>
            {widgetHeader('Risk Assessment', '🎯')}
            <div className="flex-1 overflow-hidden">
              <RiskCard riskAssessment={riskAssessment} patient={patient} />
            </div>
          </div>
        );

      case WIDGET_TYPES.AI_CHAT:
        return (
          <div className={baseClasses}>
            {widgetHeader('AI Assistant', '🤖')}
            <div className="flex-1 overflow-hidden">
              <AIChatCard patient={patient} sessionId={sessionId} />
            </div>
          </div>
        );

      case WIDGET_TYPES.STUDY_CARD:
        return (
          <div className={baseClasses}>
            {widgetHeader('Literature', '📚')}
            <div className="flex-1 overflow-hidden">
              <StudyCard studySummary={studySummary} riskLevel={riskAssessment?.risk_level} />
            </div>
          </div>
        );

      case WIDGET_TYPES.QUESTIONNAIRE:
        return (
          <div className={baseClasses}>
            {widgetHeader('Clinical Questions', '📋')}
            <div className="flex-1 overflow-hidden">
              <QuestionnaireCard questionnaire={questionnaire} chiefComplaint={patient.chief_complaint} />
            </div>
          </div>
        );

      case WIDGET_TYPES.INSURANCE:
        return (
          <div className={baseClasses}>
            {widgetHeader('Insurance & Billing', '💳')}
            <div className="flex-1 overflow-hidden">
              <InsuranceCard insuranceInfo={insuranceInfo} riskLevel={riskAssessment?.risk_level} />
            </div>
          </div>
        );

      case WIDGET_TYPES.PATIENT_SUMMARY:
        return (
          <div className={baseClasses}>
            {widgetHeader('Patient Summary', '📊')}
            <div className="flex-1 p-4 overflow-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
          </div>
        );

      default:
        return <div className={baseClasses}><div className="p-4">Unknown widget type</div></div>;
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

  // Maximized widget view
  if (maximizedWidget) {
    return (
      <div className="h-full flex flex-col">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{patient.name}</h2>
          <button
            onClick={() => setMaximizedWidget(null)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
          >
            Back to Dashboard
          </button>
        </div>
        <div className="flex-1">
          {renderWidget(maximizedWidget)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{patient.name}</h2>
          <p className="text-lg text-gray-600 mt-1">{patient.presentation_summary}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Patient ID: {patient.id}</p>
            <p className="text-sm text-gray-500">Age: {patient.age} • Sex: {patient.sex}</p>
          </div>

          {/* Add Widget Button */}
          <div className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              <span>Add Tool</span>
            </button>

            {showAddMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-2">
                  <h3 className="font-medium text-gray-900 mb-2 px-2">Available Tools</h3>
                  {AVAILABLE_WIDGETS
                    .filter(widget => !widgets.includes(widget.id))
                    .map(widget => (
                      <button
                        key={widget.id}
                        onClick={() => addWidget(widget.id)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md flex items-center space-x-3"
                      >
                        <span className="text-lg">{widget.icon}</span>
                        <div>
                          <div className="font-medium text-sm">{widget.name}</div>
                          <div className="text-xs text-gray-500">{widget.description}</div>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Draggable Grid */}
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        onLayoutChange={onLayoutChange}
        breakpoints={{ lg: 1200, md: 996, sm: 768 }}
        cols={{ lg: 12, md: 12, sm: 6 }}
        rowHeight={60}
        isDraggable={true}
        isResizable={true}
        compactType="vertical"
        preventCollision={false}
      >
        {widgets.map(widgetType => (
          <div key={widgetType}>
            {renderWidget(widgetType)}
          </div>
        ))}
      </ResponsiveGridLayout>

      {/* AI Insights Footer */}
      <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Enhanced with AI • Drag & Drop Dashboard</h4>
            <p className="text-sm text-gray-600">
              Drag widgets to rearrange, resize for optimal viewing, and add new tools as needed.
              This personalized dashboard adapts to your workflow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraggableDashboard;