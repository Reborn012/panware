import axios from 'axios';
import io from 'socket.io-client';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Socket.IO connection for real-time features
let socket = null;

const initializeSocket = () => {
  if (!socket) {
    socket = io('http://localhost:5000');
  }
  return socket;
};

export const apiService = {
  // Original endpoints
  async getPatients() {
    const response = await api.get('/patients');
    return response.data;
  },

  async getPatient(id) {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  async getRiskAssessment(patientData) {
    const response = await api.post('/risk', patientData);
    return response.data;
  },

  async getStudySummary(riskFactor) {
    const response = await api.post('/study', { risk_factor: riskFactor });
    return response.data;
  },

  async getQuestionnaire(chiefComplaint) {
    const response = await api.post('/questionnaire', { chief_complaint: chiefComplaint });
    return response.data;
  },

  async getInsuranceMapping(symptoms, recommendedAction) {
    const response = await api.post('/insurance', {
      symptoms,
      recommended_action: recommendedAction
    });
    return response.data;
  },

  // NEW AI-POWERED ENDPOINTS

  // AI Chat
  async sendAIMessage(message, sessionId, patientContext = null) {
    const response = await api.post('/ai/chat', {
      message,
      sessionId,
      patientContext
    });
    return response.data;
  },

  async getConversationHistory(sessionId) {
    const response = await api.get(`/ai/conversation/${sessionId}`);
    return response.data;
  },

  // Google Calendar Integration
  async scheduleAppointment(appointmentData) {
    const response = await api.post('/calendar/schedule', appointmentData);
    return response.data;
  },

  async getProviderAvailability(providerId, date) {
    const response = await api.get(`/calendar/availability/${providerId}/${date}`);
    return response.data;
  },

  // Real-time Collaboration
  joinCollaborationSession(sessionId, callbacks = {}) {
    const socketConnection = initializeSocket();

    socketConnection.emit('join_session', sessionId);

    // Handle real-time events
    if (callbacks.onProviderJoined) {
      socketConnection.on('provider_joined', callbacks.onProviderJoined);
    }

    if (callbacks.onProviderLeft) {
      socketConnection.on('provider_left', callbacks.onProviderLeft);
    }

    if (callbacks.onNewAnnotation) {
      socketConnection.on('new_annotation', callbacks.onNewAnnotation);
    }

    if (callbacks.onAIResponse) {
      socketConnection.on('ai_response', callbacks.onAIResponse);
    }

    return socketConnection;
  },

  sendAnnotation(sessionId, annotation) {
    if (socket) {
      socket.emit('annotation', {
        sessionId,
        ...annotation
      });
    }
  },

  // Voice Recognition Helper
  async processVoiceInput(audioBlob) {
    // In a real implementation, this would send audio to a speech-to-text service
    // For demo purposes, we'll simulate this
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          transcript: "What is the patient's risk assessment?",
          confidence: 0.95
        });
      }, 1000);
    });
  },

  // Advanced Analytics (Mock)
  async getPatientRiskTrends(patientId, timeframe = '6months') {
    // Mock trending data
    const mockTrends = {
      risk_scores: [
        { date: '2023-01-01', score: 3 },
        { date: '2023-03-01', score: 5 },
        { date: '2023-06-01', score: 8 },
        { date: '2023-09-01', score: 14 }
      ],
      key_changes: [
        'New onset diabetes detected',
        'Weight loss accelerated',
        'CA 19-9 elevated significantly'
      ],
      predictions: {
        next_3_months: 'high',
        recommended_monitoring: 'monthly',
        suggested_interventions: [
          'Immediate gastroenterology referral',
          'CT imaging with contrast',
          'Genetic counseling consultation'
        ]
      }
    };

    return new Promise((resolve) => {
      setTimeout(() => resolve(mockTrends), 500);
    });
  },

  // Multi-Modal Analysis (Mock)
  async analyzePatientImage(imageFile, analysisType = 'radiology') {
    // Mock image analysis
    const mockAnalysis = {
      findings: [
        'Pancreatic head mass measuring 2.3 cm',
        'Mild pancreatic ductal dilatation',
        'No evidence of vascular invasion'
      ],
      confidence: 0.87,
      recommendations: [
        'Tissue sampling recommended',
        'Multidisciplinary team consultation',
        'Staging workup if malignant'
      ],
      urgency: 'high'
    };

    return new Promise((resolve) => {
      setTimeout(() => resolve(mockAnalysis), 2000);
    });
  },

  // Health Routine Generation and Calendar Sync
  async generateHealthRoutine(patientData, preferences = {}) {
    const response = await api.post('/health-routine/generate', {
      patientData,
      preferences
    });
    return response.data;
  },

  async scheduleHealthRoutine(routine, patientName, startDate = new Date()) {
    const response = await api.post('/health-routine/schedule', {
      routine,
      patientName,
      startDate: startDate.toISOString()
    });
    return response.data;
  }
};

export default apiService;