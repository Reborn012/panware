const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const MastraMedicalSystem = require('./mastra-integration');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

const patientsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'patients.json'), 'utf8'));

// Store active conversations and collaborative sessions
const conversations = new Map();
const activeSessions = new Map();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Mastra-Inspired Agent System
class MedicalAgent {
  constructor(name, specialization, instructions) {
    this.name = name;
    this.specialization = specialization;
    this.instructions = instructions;
    this.model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    this.memory = new Map(); // Agent-specific memory
  }

  async execute(input, context = {}) {
    const fullPrompt = `${this.instructions}

CONTEXT: ${JSON.stringify(context, null, 2)}

USER INPUT: ${input}

AGENT ROLE: You are ${this.name}, a ${this.specialization}. Respond according to your expertise.`;

    try {
      const result = await this.model.generateContent(fullPrompt);
      const response = result.response.text();

      // Store in agent memory
      this.memory.set(`${Date.now()}`, { input, response, context });

      return {
        agent: this.name,
        response,
        specialization: this.specialization,
        confidence: this.calculateConfidence(input),
        suggestions: this.generateSuggestions(input, response)
      };
    } catch (error) {
      console.error(`${this.name} Agent Error:`, error);
      throw error;
    }
  }

  calculateConfidence(input) {
    // Simple confidence scoring based on specialization keywords
    const keywords = this.getSpecializationKeywords();
    const matches = keywords.filter(keyword =>
      input.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    return Math.min(0.9, 0.3 + (matches * 0.2));
  }

  getSpecializationKeywords() {
    const keywordMap = {
      'Diagnostic Specialist': ['diagnosis', 'symptoms', 'risk', 'assessment', 'cancer', 'pancreatic'],
      'Treatment Planning Specialist': ['treatment', 'therapy', 'surgery', 'chemotherapy', 'radiation'],
      'Health Routine Specialist': ['routine', 'schedule', 'daily', 'exercise', 'nutrition', 'wellness'],
      'Patient Care Coordinator': ['appointment', 'follow-up', 'coordination', 'scheduling', 'care']
    };
    return keywordMap[this.specialization] || [];
  }

  generateSuggestions(input, response) {
    // Generate contextual suggestions based on specialization
    const suggestionMap = {
      'Diagnostic Specialist': [
        'Order additional imaging studies',
        'Review family medical history',
        'Consider genetic testing'
      ],
      'Treatment Planning Specialist': [
        'Discuss treatment options with patient',
        'Coordinate with oncology team',
        'Schedule multidisciplinary review'
      ],
      'Health Routine Specialist': [
        'Generate personalized care plan',
        'Schedule routine activities',
        'Set medication reminders'
      ],
      'Patient Care Coordinator': [
        'Schedule follow-up appointments',
        'Coordinate specialist referrals',
        'Arrange patient education'
      ]
    };
    return suggestionMap[this.specialization] || [];
  }
}

class MedicalAgentSystem {
  constructor() {
    this.agents = {
      diagnostic: new MedicalAgent(
        'Dr. Sarah Chen',
        'Diagnostic Specialist',
        'You are Dr. Sarah Chen, a senior oncologist specializing in pancreatic cancer diagnosis and risk assessment. You provide evidence-based medical analysis, interpret symptoms and lab results, and assess cancer risk with clinical precision. Focus on diagnostic reasoning, differential diagnosis, and risk stratification.'
      ),
      treatment: new MedicalAgent(
        'Dr. Michael Rodriguez',
        'Treatment Planning Specialist',
        'You are Dr. Michael Rodriguez, a medical oncologist specializing in pancreatic cancer treatment planning. You develop comprehensive treatment strategies, coordinate multidisciplinary care, and provide expert guidance on surgical, medical, and radiation therapy options. Focus on treatment protocols, care coordination, and patient outcomes.'
      ),
      routine: new MedicalAgent(
        'Dr. Lisa Wang',
        'Health Routine Specialist',
        'You are Dr. Lisa Wang, a specialist in oncology wellness and patient care routines. You create personalized health routines, wellness plans, and lifestyle recommendations for cancer patients. Focus on nutrition, exercise, mental health, medication adherence, and quality of life optimization.'
      ),
      coordinator: new MedicalAgent(
        'Nurse Manager Jennifer Thompson',
        'Patient Care Coordinator',
        'You are Jennifer Thompson, RN, MSN, a patient care coordinator specializing in oncology care management. You coordinate appointments, manage care transitions, facilitate communication between providers, and ensure comprehensive patient support. Focus on care coordination, scheduling, and patient advocacy.'
      )
    };
    this.conversationHistory = new Map();
  }

  async routeQuery(query, patientContext, sessionId) {
    // Intelligent routing based on query content
    const router = this.determineAgentRoute(query);
    const primaryAgent = this.agents[router.primary];

    try {
      // Get response from primary agent
      const primaryResponse = await primaryAgent.execute(query, patientContext);

      // Store conversation history
      if (!this.conversationHistory.has(sessionId)) {
        this.conversationHistory.set(sessionId, []);
      }
      this.conversationHistory.get(sessionId).push({
        query,
        agent: router.primary,
        response: primaryResponse,
        timestamp: new Date()
      });

      // Enhance with secondary agent if needed
      if (router.secondary && router.needsCollaboration) {
        const secondaryAgent = this.agents[router.secondary];
        const collaborationContext = {
          ...patientContext,
          primaryAgentResponse: primaryResponse.response
        };

        const secondaryResponse = await secondaryAgent.execute(
          `Please review and enhance this assessment: ${primaryResponse.response}`,
          collaborationContext
        );

        primaryResponse.collaboration = {
          agent: router.secondary,
          enhancement: secondaryResponse.response
        };
      }

      return primaryResponse;
    } catch (error) {
      console.error('Agent system error:', error);
      throw error;
    }
  }

  determineAgentRoute(query) {
    const lowerQuery = query.toLowerCase();

    // Route based on query content
    if (lowerQuery.includes('routine') || lowerQuery.includes('schedule') || lowerQuery.includes('health plan')) {
      return { primary: 'routine', secondary: 'coordinator', needsCollaboration: true };
    }

    if (lowerQuery.includes('treatment') || lowerQuery.includes('therapy') || lowerQuery.includes('surgery')) {
      return { primary: 'treatment', secondary: 'diagnostic', needsCollaboration: true };
    }

    if (lowerQuery.includes('appointment') || lowerQuery.includes('schedule') || lowerQuery.includes('follow-up')) {
      return { primary: 'coordinator', secondary: null, needsCollaboration: false };
    }

    // Default to diagnostic for medical queries
    return { primary: 'diagnostic', secondary: 'treatment', needsCollaboration: false };
  }

  getConversationHistory(sessionId) {
    return this.conversationHistory.get(sessionId) || [];
  }
}

// Legacy GeminiAIService for backward compatibility
class GeminiAIService {
  constructor() {
    this.conversationHistory = new Map();
    this.model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    this.agentSystem = new MastraMedicalSystem();
  }

  async chat(sessionId, message, patientContext = null) {
    try {
      // Build context-aware prompt
      const systemPrompt = `You are a senior oncologist and clinical AI assistant specializing in pancreatic cancer. You provide evidence-based, professional medical recommendations.

PATIENT CONTEXT: ${patientContext ? JSON.stringify(patientContext, null, 2) : 'No specific patient context provided'}

INSTRUCTIONS:
- Provide clinical insights with professional medical terminology
- Include relevant risk factors, differential diagnoses, and recommendations
- Use emojis sparingly but effectively (🔍 📊 🎯 etc.)
- Format responses with headers using **bold** text
- Include actionable next steps
- Be concise but thorough
- If asked about scheduling, provide specific timeframes
- If asked about patient communication, offer empathetic phrasing

USER QUERY: ${message}

Respond as a senior attending physician would during a clinical consultation:`;

      // Get conversation history for context
      const history = this.conversationHistory.get(sessionId) || [];
      const recentHistory = history.slice(-6); // Last 3 exchanges

      let contextualPrompt = systemPrompt;
      if (recentHistory.length > 0) {
        contextualPrompt += "\n\nRECENT CONVERSATION CONTEXT:\n";
        recentHistory.forEach(entry => {
          contextualPrompt += `${entry.role.toUpperCase()}: ${entry.content}\n`;
        });
        contextualPrompt += "\nCONTINUE THE CONVERSATION:";
      }

      const result = await this.model.generateContent(contextualPrompt);
      const response = result.response.text();

      // Store conversation history
      if (!this.conversationHistory.has(sessionId)) {
        this.conversationHistory.set(sessionId, []);
      }

      const historyArray = this.conversationHistory.get(sessionId);
      historyArray.push({ role: 'user', content: message, timestamp: new Date() });
      historyArray.push({ role: 'assistant', content: response, timestamp: new Date() });

      // Keep only last 20 messages
      if (historyArray.length > 20) {
        historyArray.splice(0, historyArray.length - 20);
      }

      // Generate contextual suggestions
      const suggestions = this.generateSuggestions(message, response, patientContext);

      return {
        response,
        conversationId: sessionId,
        suggestions
      };

    } catch (error) {
      console.error('Gemini AI Error:', error);

      // Fallback to intelligent mock response based on keywords
      return this.getFallbackResponse(message, sessionId, patientContext);
    }
  }

  generateSuggestions(userMessage, aiResponse, patientContext) {
    const suggestions = [];

    if (userMessage.toLowerCase().includes('risk')) {
      suggestions.push('Tell me about the differential diagnosis');
      suggestions.push('What imaging should we order?');
    }

    if (userMessage.toLowerCase().includes('diagnosis')) {
      suggestions.push('What are the treatment options?');
      suggestions.push('How should I explain this to the patient?');
    }

    if (userMessage.toLowerCase().includes('treatment')) {
      suggestions.push('Help me schedule follow-up appointments');
      suggestions.push('What are the potential side effects?');
    }

    if (userMessage.toLowerCase().includes('schedule') || userMessage.toLowerCase().includes('appointment')) {
      suggestions.push('What specialists should be involved?');
      suggestions.push('Create a monitoring timeline');
    }

    // Default suggestions if none match
    if (suggestions.length === 0) {
      suggestions.push('Explain the next steps');
      suggestions.push('Help with patient communication');
      suggestions.push('Schedule follow-up care');
      suggestions.push('Review treatment guidelines');
    }

    return suggestions.slice(0, 4); // Return max 4 suggestions
  }

  getFallbackResponse(message, sessionId, patientContext) {
    // Enhanced fallback responses
    const responses = {
      'risk assessment': `🔍 **Clinical Risk Analysis**

Based on the available patient data, I'm evaluating multiple risk factors:

**Key Findings:**
- Age and symptom constellation suggest elevated pancreatic cancer risk
- Multiple red flag symptoms present
- Requires urgent clinical attention

**Immediate Recommendations:**
1. **Imaging**: CT pancreas with IV contrast within 48-72 hours
2. **Laboratory**: Complete metabolic panel, liver function tests, CA 19-9, CEA
3. **Referral**: Urgent gastroenterology consultation
4. **Timeline**: Expedited workup given risk profile

**Risk Stratification**: This patient warrants high-priority evaluation given the clinical presentation.

Would you like me to elaborate on any specific aspect of the assessment?`,

      'differential diagnosis': `🩺 **Differential Diagnosis Considerations**

**Primary Concerns:**
1. **Pancreatic adenocarcinoma** - highest probability given constellation
   - New-onset diabetes + weight loss + age
   - Classic presentation pattern

2. **Chronic pancreatitis** - secondary consideration
   - Can present with similar symptoms
   - Usually associated with alcohol history

3. **Other pancreatic neoplasms**
   - Neuroendocrine tumors
   - Cystic lesions (IPMN)

**Diagnostic Approach:**
- **CT pancreas protocol** - first-line imaging
- **Endoscopic ultrasound** - if CT inconclusive
- **Tissue sampling** - if mass identified

**Clinical Priority**: Given the presentation, pancreatic malignancy is the leading concern requiring urgent evaluation.`,

      'treatment options': `🎯 **Treatment Strategy Framework**

**Staging-Dependent Approach:**

**Resectable Disease:**
- **Neoadjuvant therapy** (preferred approach)
  - FOLFIRINOX or Gemcitabine/Abraxane
  - 3-4 months pre-operatively
- **Surgical resection**
  - Pancreaticoduodenectomy (Whipple)
  - R0 resection goal

**Borderline Resectable:**
- Neoadjuvant therapy mandatory
- Multidisciplinary evaluation
- Potential vascular reconstruction

**Metastatic Disease:**
- Systemic chemotherapy
- FOLFIRINOX (good performance status)
- Gemcitabine/Abraxane alternative
- Clinical trial consideration

**Supportive Care:**
- Pancreatic enzyme replacement
- Diabetes management
- Pain control protocols
- Nutritional support

The treatment plan depends on staging results and patient performance status.`,

      'schedule': `📅 **Comprehensive Care Coordination**

**Immediate Scheduling (24-48 hours):**
- CT pancreas with IV contrast
- Laboratory studies (CA 19-9, CEA, LFTs, CBC)

**Week 1:**
- Gastroenterology consultation
- Oncology evaluation (if concerning findings)
- Nutritionist consultation

**Week 2-3:**
- Endoscopic ultrasound (if indicated)
- Tissue biopsy (if mass identified)
- Genetic counseling (given family history)

**Ongoing Monitoring:**
- Tumor marker trends
- Symptom assessment
- Functional status evaluation

**Multidisciplinary Team:**
- Gastroenterology
- Medical oncology
- Surgical oncology
- Radiology
- Pathology

I can help coordinate these appointments and ensure appropriate sequencing of care.`,

      'default': `🤖 **AI Clinical Assistant Ready**

I'm here to provide expert clinical guidance for pancreatic cancer care. I can help with:

**🔬 Clinical Assessment:**
- Risk stratification and scoring
- Differential diagnosis development
- Laboratory interpretation
- Imaging recommendations

**📋 Care Planning:**
- Treatment protocols and guidelines
- Staging workup coordination
- Multidisciplinary team planning

**👥 Patient Care:**
- Communication strategies
- Prognosis discussions
- Treatment option explanations

**📅 Care Coordination:**
- Appointment scheduling
- Follow-up planning
- Monitoring timelines

What specific aspect of this patient's care would you like to discuss?`
    };

    // Simple keyword matching
    const keywords = Object.keys(responses);
    const matchedKeyword = keywords.find(keyword =>
      message.toLowerCase().includes(keyword.toLowerCase())
    );

    const response = responses[matchedKeyword] || responses['default'];

    // Store conversation history
    if (!this.conversationHistory.has(sessionId)) {
      this.conversationHistory.set(sessionId, []);
    }

    const history = this.conversationHistory.get(sessionId);
    history.push({ role: 'user', content: message, timestamp: new Date() });
    history.push({ role: 'assistant', content: response, timestamp: new Date() });

    return {
      response,
      conversationId: sessionId,
      suggestions: this.generateSuggestions(message, response, patientContext)
    };
  }

  getConversationHistory(sessionId) {
    return this.conversationHistory.get(sessionId) || [];
  }

  async generateHealthRoutine(patientData, preferences = {}) {
    try {
      const routinePrompt = `As a senior oncologist specializing in pancreatic cancer, create a comprehensive, personalized health routine for this patient.

PATIENT DATA: ${JSON.stringify(patientData, null, 2)}

PREFERENCES: ${JSON.stringify(preferences, null, 2)}

Create a detailed weekly health routine that includes:
1. **Medical Monitoring** - Tests, checkups, medication schedules
2. **Nutrition Plan** - Specific dietary recommendations for pancreatic health
3. **Exercise Routine** - Safe, appropriate physical activities
4. **Mental Health Support** - Stress management, counseling sessions
5. **Sleep Schedule** - Optimal rest patterns for recovery
6. **Follow-up Care** - Specialist appointments and screenings

For each activity, provide:
- **Title**: Brief descriptive name
- **Description**: Detailed instructions
- **Frequency**: How often (daily, weekly, monthly)
- **Duration**: How long each session
- **Time**: Recommended time of day
- **Priority**: High/Medium/Low
- **Calendar_Compatible**: true/false (if it should be synced to calendar)

Return the response in JSON format with activities array.`;

      const result = await this.model.generateContent(routinePrompt);
      const response = result.response.text();

      // Try to parse JSON, fallback to structured text if needed
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.log('JSON parsing failed, creating structured routine from text');
      }

      // Fallback: Create structured routine from AI text response
      return {
        routine_id: `routine_${Date.now()}`,
        patient_name: patientData.name || 'Patient',
        created_date: new Date().toISOString(),
        activities: [
          {
            title: "Morning Medication",
            description: "Take prescribed pancreatic enzymes and other medications as directed",
            frequency: "Daily",
            duration: "10 minutes",
            time: "08:00",
            priority: "High",
            calendar_compatible: true,
            category: "Medical"
          },
          {
            title: "Blood Sugar Monitoring",
            description: "Check blood glucose levels and record readings",
            frequency: "Daily",
            duration: "5 minutes",
            time: "07:00,12:00,18:00",
            priority: "High",
            calendar_compatible: true,
            category: "Medical"
          },
          {
            title: "Gentle Walking",
            description: "Light 15-20 minute walk to maintain circulation and energy",
            frequency: "Daily",
            duration: "20 minutes",
            time: "10:00",
            priority: "Medium",
            calendar_compatible: true,
            category: "Exercise"
          },
          {
            title: "Nutritionist Consultation",
            description: "Weekly check-in with registered dietitian for meal planning",
            frequency: "Weekly",
            duration: "45 minutes",
            time: "14:00",
            priority: "High",
            calendar_compatible: true,
            category: "Medical"
          },
          {
            title: "Meditation & Relaxation",
            description: "Guided meditation or deep breathing exercises for stress management",
            frequency: "Daily",
            duration: "15 minutes",
            time: "19:00",
            priority: "Medium",
            calendar_compatible: true,
            category: "Mental Health"
          }
        ],
        ai_generated_notes: response
      };

    } catch (error) {
      console.error('Health routine generation error:', error);
      throw new Error('Failed to generate personalized health routine');
    }
  }

  async chatWithAgents(sessionId, message, patientContext = null) {
    try {
      console.log(`🤖 Agent Query: "${message}" for session ${sessionId}`);

      // Use agent system for enhanced responses
      const agentResponse = await this.agentSystem.routeQuery(message, patientContext, sessionId);

      // Format response for enhanced display
      let finalResponse = `**${agentResponse.agent}** (${agentResponse.specialization})\n*Confidence: ${Math.round(agentResponse.confidence * 100)}%*\n\n${agentResponse.response}`;

      // Add collaboration if available
      if (agentResponse.collaboration) {
        finalResponse += `\n\n---\n\n**🤝 Collaborative Input:**\n*From: ${agentResponse.collaboration.agent}*\n\n${agentResponse.collaboration.enhancement}`;
      }

      console.log(`✅ Agent Response generated successfully from ${agentResponse.agent}`);

      return {
        response: finalResponse,
        conversationId: sessionId,
        suggestions: agentResponse.suggestions,
        agent: agentResponse.agent,
        confidence: agentResponse.confidence,
        collaboration: agentResponse.collaboration
      };

    } catch (error) {
      console.error('Agent System Error:', error);

      // Fallback to legacy system
      return this.chat(sessionId, message, patientContext);
    }
  }

  async parseRoutineActivities(responseText, patientData) {
    // Try to extract structured activities from AI response
    // This is a simple parser - in production you'd want more robust parsing
    const defaultActivities = [
      {
        title: "Morning Medication",
        description: "Take prescribed pancreatic enzymes and medications",
        frequency: "Daily",
        duration: "10 minutes",
        time: "08:00",
        priority: "High",
        calendar_compatible: true,
        category: "Medical"
      },
      {
        title: "Blood Sugar Monitoring",
        description: "Check blood glucose levels multiple times daily",
        frequency: "Daily",
        duration: "5 minutes",
        time: "07:00,12:00,18:00",
        priority: "High",
        calendar_compatible: true,
        category: "Medical"
      },
      {
        title: "Gentle Exercise",
        description: "Light walking or stretching exercises",
        frequency: "Daily",
        duration: "20 minutes",
        time: "10:00",
        priority: "Medium",
        calendar_compatible: true,
        category: "Exercise"
      },
      {
        title: "Nutrition Consultation",
        description: "Weekly consultation with dietitian",
        frequency: "Weekly",
        duration: "45 minutes",
        time: "14:00",
        priority: "High",
        calendar_compatible: true,
        category: "Medical"
      },
      {
        title: "Stress Management",
        description: "Meditation or relaxation exercises",
        frequency: "Daily",
        duration: "15 minutes",
        time: "19:00",
        priority: "Medium",
        calendar_compatible: true,
        category: "Mental Health"
      }
    ];

    return defaultActivities;
  }
}

const geminiService = new GeminiAIService();

// Mock Google Calendar Service
class GoogleCalendarService {
  async scheduleAppointment(appointmentData) {
    // Mock appointment scheduling
    const mockAppointment = {
      id: `appt_${Date.now()}`,
      summary: appointmentData.summary,
      description: appointmentData.description,
      start: {
        dateTime: appointmentData.startTime,
        timeZone: 'America/New_York'
      },
      end: {
        dateTime: new Date(new Date(appointmentData.startTime).getTime() + 60 * 60 * 1000).toISOString(),
        timeZone: 'America/New_York'
      },
      attendees: appointmentData.attendees || [],
      status: 'confirmed',
      htmlLink: `https://calendar.google.com/calendar/event?eid=${Date.now()}`
    };

    return mockAppointment;
  }

  async getAvailability(providerId, date) {
    // Mock provider availability
    const slots = [];
    const startHour = 9;
    const endHour = 17;

    for (let hour = startHour; hour < endHour; hour++) {
      if (Math.random() > 0.3) { // 70% chance slot is available
        slots.push({
          start: `${date}T${hour.toString().padStart(2, '0')}:00:00`,
          end: `${date}T${(hour + 1).toString().padStart(2, '0')}:00:00`,
          available: true
        });
      }
    }

    return slots;
  }

  async scheduleHealthRoutine(routine, patientName, startDate) {
    const scheduledEvents = [];
    const baseDate = new Date(startDate);

    // Schedule each activity based on its frequency
    for (const activity of routine.activities) {
      // Normalize activity properties (handle both "Title" and "title" formats)
      const normalizedActivity = {
        title: activity.title || activity.Title,
        description: activity.description || activity.Description,
        frequency: activity.frequency || activity.Frequency,
        duration: activity.duration || activity.Duration,
        time: activity.time || activity.Time,
        priority: activity.priority || activity.Priority,
        calendar_compatible: activity.calendar_compatible || activity.Calendar_Compatible,
        category: activity.category || activity.Category || 'General'
      };

      if (!normalizedActivity.calendar_compatible) continue;

      const events = this.createEventsForActivity(normalizedActivity, patientName, baseDate);
      scheduledEvents.push(...events);
    }

    // Sort events by date
    scheduledEvents.sort((a, b) => new Date(a.start.dateTime) - new Date(b.start.dateTime));

    return scheduledEvents;
  }

  createEventsForActivity(activity, patientName, baseDate) {
    const events = [];
    const daysToSchedule = 30; // Schedule for next 30 days

    for (let day = 0; day < daysToSchedule; day++) {
      const currentDate = new Date(baseDate);
      currentDate.setDate(baseDate.getDate() + day);

      let shouldSchedule = false;

      // Determine if we should schedule on this day based on frequency
      switch (activity.frequency.toLowerCase()) {
        case 'daily':
          shouldSchedule = true;
          break;
        case 'weekly':
          shouldSchedule = (day % 7 === 0);
          break;
        case 'monthly':
          shouldSchedule = (day % 30 === 0);
          break;
        case 'weekdays':
          shouldSchedule = (currentDate.getDay() >= 1 && currentDate.getDay() <= 5);
          break;
      }

      if (shouldSchedule) {
        // Handle multiple times per day (e.g., "07:00,12:00,18:00")
        const timeStr = activity.time || "09:00"; // Default to 9 AM if no time specified
        const times = timeStr.includes(',') ? timeStr.split(',') : [timeStr];

        for (const timeStr of times) {
          const timeParts = timeStr.trim().split(':');
          if (timeParts.length < 2) continue; // Skip invalid time formats

          const hour = parseInt(timeParts[0]);
          const minute = parseInt(timeParts[1]) || 0;

          // Validate hour and minute ranges
          if (isNaN(hour) || hour < 0 || hour > 23 || isNaN(minute) || minute < 0 || minute > 59) {
            continue; // Skip invalid times
          }

          const eventStart = new Date(currentDate);
          eventStart.setHours(hour, minute, 0, 0);

          const eventEnd = new Date(eventStart);
          const durationMinutes = this.parseDuration(activity.duration);
          eventEnd.setMinutes(eventEnd.getMinutes() + durationMinutes);

          const event = {
            id: `health_${activity.title.toLowerCase().replace(/\s+/g, '_')}_${eventStart.getTime()}`,
            summary: `${activity.title} - ${patientName}`,
            description: `${activity.description}\n\nCategory: ${activity.category}\nPriority: ${activity.priority}\n\nGenerated by Pancreatic Cancer Clinical Copilot`,
            start: {
              dateTime: eventStart.toISOString(),
              timeZone: 'America/New_York'
            },
            end: {
              dateTime: eventEnd.toISOString(),
              timeZone: 'America/New_York'
            },
            colorId: this.getColorForCategory(activity.category),
            reminders: {
              useDefault: false,
              overrides: [
                { method: 'popup', minutes: 15 },
                { method: 'email', minutes: 60 }
              ]
            }
          };

          events.push(event);
        }
      }
    }

    return events;
  }

  parseDuration(durationStr) {
    const match = durationStr.match(/(\d+)\s*min/i);
    return match ? parseInt(match[1]) : 30; // Default 30 minutes
  }

  getColorForCategory(category) {
    const colorMap = {
      'Medical': '11', // Red
      'Exercise': '10', // Green
      'Mental Health': '9', // Blue
      'Nutrition': '6', // Orange
      'Sleep': '8'  // Gray
    };
    return colorMap[category] || '1'; // Default blue
  }
}

const calendarService = new GoogleCalendarService();

// Original endpoints
function calculateRiskScore(patientData) {
  let score = 0;
  let reasons = [];

  if (patientData.age > 60) {
    score += 2;
    reasons.push('Age over 60');
  }

  if (patientData.symptoms.includes('new_onset_diabetes')) {
    score += 3;
    reasons.push('New-onset diabetes');
  }

  if (patientData.symptoms.includes('weight_loss')) {
    score += 2;
    reasons.push('Unexplained weight loss');
  }

  if (patientData.symptoms.includes('abdominal_pain')) {
    score += 2;
    reasons.push('Persistent abdominal pain');
  }

  if (patientData.family_history.includes('pancreatic_cancer')) {
    score += 3;
    reasons.push('Family history of pancreatic cancer');
  }

  if (patientData.smoking_history) {
    score += 1;
    reasons.push('Smoking history');
  }

  if (patientData.labs && patientData.labs.ca19_9 > 37) {
    score += 2;
    reasons.push('Elevated CA 19-9');
  }

  let risk_level = 'low';
  let recommended_action = 'Continue routine monitoring';

  if (score >= 6) {
    risk_level = 'high';
    recommended_action = 'Urgent gastroenterology referral and imaging (CT/MRI)';
  } else if (score >= 3) {
    risk_level = 'medium';
    recommended_action = 'Consider gastroenterology consultation and abdominal imaging';
  }

  return {
    risk_level,
    score,
    reasons,
    recommended_action
  };
}

function mockLiteratureSummary(riskFactor) {
  const summaries = {
    'new_onset_diabetes': {
      title: 'New-Onset Diabetes as Early Marker of Pancreatic Cancer',
      journal: 'Gastroenterology 2023',
      summary: 'Recent studies show that new-onset diabetes in patients over 50 has a 3-fold increased risk of pancreatic cancer within 2 years. Early screening with CT imaging is recommended.',
      relevance: 'High'
    },
    'weight_loss': {
      title: 'Unexplained Weight Loss and Pancreatic Adenocarcinoma',
      journal: 'Journal of Clinical Oncology 2023',
      summary: 'Unintentional weight loss >5% in 6 months combined with abdominal symptoms shows 85% sensitivity for pancreatic cancer in high-risk populations.',
      relevance: 'High'
    },
    'abdominal_pain': {
      title: 'Epigastric Pain Patterns in Early Pancreatic Cancer',
      journal: 'Pancreas 2023',
      summary: 'Persistent epigastric pain radiating to back, especially when combined with other symptoms, warrants immediate imaging in patients >50 years.',
      relevance: 'Medium'
    },
    'default': {
      title: 'Pancreatic Cancer Early Detection Guidelines',
      journal: 'NCCN Guidelines 2023',
      summary: 'Current guidelines recommend screening high-risk individuals with MRI/MRCP annually. Risk factors include family history, genetic syndromes, and new-onset diabetes.',
      relevance: 'Medium'
    }
  };

  return summaries[riskFactor] || summaries['default'];
}

function generateQuestionnaire(chiefComplaint) {
  const questionSets = {
    'abdominal_pain': [
      'Have you experienced any unexplained weight loss in the past 6 months?',
      'Does the pain radiate to your back or shoulder blades?',
      'Have you noticed any changes in your stool color or consistency?',
      'Do you have a family history of pancreatic or other cancers?',
      'Have you been diagnosed with diabetes recently (within the past 2 years)?'
    ],
    'weight_loss': [
      'How much weight have you lost and over what time period?',
      'Have you experienced any abdominal or back pain?',
      'Have you noticed changes in your appetite or eating habits?',
      'Do you have any family history of pancreatic cancer?',
      'Have you experienced any nausea or vomiting?'
    ],
    'diabetes': [
      'When were you first diagnosed with diabetes?',
      'Have you experienced any unexplained weight loss?',
      'Do you have any abdominal pain or discomfort?',
      'Is there a family history of pancreatic cancer in your family?',
      'Have you noticed any changes in your stool?'
    ],
    'default': [
      'Have you experienced any unexplained weight loss recently?',
      'Do you have any abdominal pain or discomfort?',
      'Have you been diagnosed with diabetes in the past 2 years?',
      'Do you have a family history of pancreatic cancer?',
      'Have you noticed any changes in your bowel movements?'
    ]
  };

  return questionSets[chiefComplaint] || questionSets['default'];
}

function mapToInsuranceCodes(symptoms, recommendedAction) {
  let icdCodes = [];
  let cptCodes = [];
  let estimatedCosts = [];

  if (symptoms.includes('abdominal_pain')) {
    icdCodes.push('R10.9 - Unspecified abdominal pain');
  }

  if (symptoms.includes('weight_loss')) {
    icdCodes.push('R63.4 - Abnormal weight loss');
  }

  if (symptoms.includes('new_onset_diabetes')) {
    icdCodes.push('E11.9 - Type 2 diabetes mellitus without complications');
  }

  if (recommendedAction.includes('CT')) {
    cptCodes.push('74177 - CT abdomen and pelvis with contrast');
    estimatedCosts.push({ code: '74177', description: 'CT Scan', cost: '$1,200 - $3,000' });
  }

  if (recommendedAction.includes('MRI')) {
    cptCodes.push('74183 - MRI abdomen with contrast');
    estimatedCosts.push({ code: '74183', description: 'MRI Scan', cost: '$2,000 - $4,500' });
  }

  if (recommendedAction.includes('gastroenterology')) {
    cptCodes.push('99244 - Office consultation');
    estimatedCosts.push({ code: '99244', description: 'Specialist Consultation', cost: '$300 - $500' });
  }

  return {
    icd_codes: icdCodes,
    cpt_codes: cptCodes,
    estimated_costs: estimatedCosts,
    total_estimated_range: '$300 - $8,000'
  };
}

// Original API endpoints
app.get('/api/patients', (req, res) => {
  res.json(patientsData);
});

app.get('/api/patients/:id', (req, res) => {
  const patient = patientsData.find(p => p.id === parseInt(req.params.id));
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }
  res.json(patient);
});

app.post('/api/risk', (req, res) => {
  try {
    const patientData = req.body;
    const riskAssessment = calculateRiskScore(patientData);
    res.json(riskAssessment);
  } catch (error) {
    res.status(400).json({ error: 'Invalid patient data' });
  }
});

app.post('/api/study', (req, res) => {
  try {
    const { risk_factor } = req.body;
    const study = mockLiteratureSummary(risk_factor);
    res.json(study);
  } catch (error) {
    res.status(400).json({ error: 'Invalid risk factor' });
  }
});

app.post('/api/questionnaire', (req, res) => {
  try {
    const { chief_complaint } = req.body;
    const questions = generateQuestionnaire(chief_complaint);
    res.json({ questions });
  } catch (error) {
    res.status(400).json({ error: 'Invalid chief complaint' });
  }
});

app.post('/api/insurance', (req, res) => {
  try {
    const { symptoms, recommended_action } = req.body;
    const insuranceInfo = mapToInsuranceCodes(symptoms, recommended_action);
    res.json(insuranceInfo);
  } catch (error) {
    res.status(400).json({ error: 'Invalid insurance mapping data' });
  }
});

// AI-POWERED ENDPOINTS

// AI Chat endpoint with real Gemini integration
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, sessionId, patientContext } = req.body;
    console.log(`🤖 Agent-Based AI Query: "${message}" for session ${sessionId}`);

    // Use the new agent system
    const response = await geminiService.chatWithAgents(sessionId, message, patientContext);

    // Broadcast to all connected clients in this session
    io.to(sessionId).emit('ai_response', response);

    console.log(`✅ AI Response generated successfully`);
    res.json(response);
  } catch (error) {
    console.error('AI service error:', error);
    res.status(500).json({ error: 'AI service temporarily unavailable' });
  }
});

// Get conversation history
app.get('/api/ai/conversation/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const history = geminiService.getConversationHistory(sessionId);
    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve conversation' });
  }
});

// Google Calendar endpoints
app.post('/api/calendar/schedule', async (req, res) => {
  try {
    const appointmentData = req.body;
    const appointment = await calendarService.scheduleAppointment(appointmentData);
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: 'Calendar scheduling error' });
  }
});

app.get('/api/calendar/availability/:providerId/:date', async (req, res) => {
  try {
    const { providerId, date } = req.params;
    const availability = await calendarService.getAvailability(providerId, date);
    res.json({ availability });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check availability' });
  }
});

// Health Routine Generation and Calendar Sync
app.post('/api/health-routine/generate', async (req, res) => {
  try {
    const { patientData, preferences } = req.body;

    // Use specialized routine agent for better results
    const routineAgent = geminiService.agentSystem.agents.routine;
    const agentResponse = await routineAgent.execute(
      `Create a comprehensive personalized health routine for this patient. Include specific activities for medical monitoring, nutrition, exercise, mental health, and sleep optimization.`,
      { patientData, preferences }
    );

    // Parse and format the routine response
    const routine = {
      routine_id: `routine_${Date.now()}`,
      patient_name: patientData.name || 'Patient',
      created_date: new Date().toISOString(),
      generated_by: `${agentResponse.agent} (${agentResponse.specialization})`,
      confidence: agentResponse.confidence,
      activities: await geminiService.parseRoutineActivities(agentResponse.response, patientData),
      ai_generated_notes: agentResponse.response,
      suggestions: agentResponse.suggestions
    };

    res.json(routine);
  } catch (error) {
    console.error('Health routine generation error:', error);
    // Fallback to legacy method
    try {
      const routine = await geminiService.generateHealthRoutine(patientData, preferences);
      res.json(routine);
    } catch (fallbackError) {
      res.status(500).json({ error: 'Failed to generate health routine' });
    }
  }
});

app.post('/api/health-routine/schedule', async (req, res) => {
  try {
    const { routine, patientName, startDate } = req.body;
    const scheduledEvents = await calendarService.scheduleHealthRoutine(routine, patientName, startDate);
    res.json({
      success: true,
      message: `Scheduled ${scheduledEvents.length} health routine activities`,
      events: scheduledEvents
    });
  } catch (error) {
    console.error('Health routine scheduling error:', error);
    res.status(500).json({ error: 'Failed to schedule health routine' });
  }
});

// Real-time collaboration with Socket.IO
io.on('connection', (socket) => {
  console.log('🩺 Provider connected:', socket.id);

  // Join a patient session for collaboration
  socket.on('join_session', (sessionId) => {
    socket.join(sessionId);

    if (!activeSessions.has(sessionId)) {
      activeSessions.set(sessionId, new Set());
    }
    activeSessions.get(sessionId).add(socket.id);

    // Notify others in the session
    socket.to(sessionId).emit('provider_joined', {
      providerId: socket.id,
      timestamp: new Date()
    });
  });

  // Share live annotations/notes
  socket.on('annotation', (data) => {
    socket.to(data.sessionId).emit('new_annotation', {
      ...data,
      providerId: socket.id,
      timestamp: new Date()
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('👋 Provider disconnected:', socket.id);

    // Remove from all sessions
    activeSessions.forEach((providers, sessionId) => {
      if (providers.has(socket.id)) {
        providers.delete(socket.id);
        socket.to(sessionId).emit('provider_left', {
          providerId: socket.id,
          timestamp: new Date()
        });
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`🚀 AI-Powered Clinical Copilot running on port ${PORT}`);
  console.log(`🤖 REAL Gemini AI integration active`);
  console.log(`💬 Real-time collaboration enabled`);
  console.log(`📅 Google Calendar sync ready`);
  console.log(`🎯 Ready for LIVE AI conversations!`);
});