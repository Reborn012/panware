# Pancreatic Cancer Clinical Copilot

**Delivering the right medical information, to the right provider, at the right time.**

A comprehensive AI-powered clinical decision support system built for the Impiricus HackGT challenge, featuring specialized medical agents, real-time collaboration, and intelligent health management.

## 🚀 Features

### Core Clinical Features
- **Provider Dashboard**: Clinical risk assessment with evidence-based recommendations
- **Patient View**: Simplified, empathetic explanations in plain language
- **Risk Scoring Engine**: Rule-based assessment of pancreatic cancer risk factors
- **Literature Integration**: Relevant study summaries based on risk factors
- **Dynamic Questionnaires**: Targeted follow-up questions based on chief complaints
- **Insurance Integration**: ICD-10/CPT code mapping with cost estimates
- **Dual-Mode Interface**: Seamless switching between provider and patient views

### 🤖 AI-Powered Agent System (NEW!)
- **4 Specialized Medical Agents**:
  - **Dr. Sarah Chen** - Diagnostic Specialist (risk assessment, symptom analysis)
  - **Dr. Michael Rodriguez** - Treatment Specialist (therapy options, protocols)
  - **Dr. Lisa Wang** - Health Routine Specialist (preventive care, lifestyle)
  - **Jennifer Thompson** - Care Coordinator (scheduling, follow-ups)
- **Intelligent Query Routing**: Automatically selects the best specialist for each medical query
- **Agent Collaboration**: Multiple agents can contribute to complex medical decisions
- **Confidence Scoring**: Each response includes specialist confidence levels
- **Conversation Memory**: Agents maintain context across patient interactions

### 💬 Real-Time AI Features
- **Live AI Conversations**: Powered by Google Gemini 2.5 Flash API
- **Voice Recognition**: Hands-free interaction with Web Speech API
- **Real-Time Collaboration**: Multi-provider Socket.IO integration
- **Smart Suggestions**: Context-aware follow-up question recommendations

### 📅 Health Management & Scheduling
- **Personalized Health Routines**: AI-generated daily care plans
- **Google Calendar Sync**: Automatic appointment and routine scheduling
- **Intelligent Reminders**: Smart notifications for medications and appointments
- **Care Coordination**: Automated provider scheduling and referrals

## 🛠 Tech Stack

- **Frontend**: React 18 + TailwindCSS + Socket.IO Client
- **Backend**: Node.js + Express + Socket.IO Server
- **AI Integration**: Google Gemini 2.5 Flash API
- **APIs**: RESTful endpoints with real-time WebSocket support
- **Agent System**: Custom Mastra-inspired multi-agent architecture
- **Calendar**: Google Calendar API integration
- **Data**: Mock patient database with clinical scenarios

## 🏁 Quick Start

### Prerequisites
- Node.js 16+
- Google Gemini API key
- (Optional) Google Calendar API credentials

### Backend Setup
```bash
cd backend
npm install

# Create .env file with your API keys
echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env
echo "NODE_ENV=development" >> .env
echo "PORT=5000" >> .env

npm start
```
Server runs on http://localhost:5000

### Frontend Setup
```bash
cd frontend
npm install --legacy-peer-deps
npm start
```
Application runs on http://localhost:3000

## 📡 API Endpoints

### Core Endpoints
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get specific patient
- `POST /api/risk` - Calculate risk assessment
- `POST /api/study` - Get literature summary
- `POST /api/questionnaire` - Generate follow-up questions
- `POST /api/insurance` - Get insurance/billing codes

### AI & Agent Endpoints
- `POST /api/ai/chat` - Send message to AI agent system
- `GET /api/ai/conversation/:sessionId` - Get conversation history
- `POST /api/calendar/schedule` - Schedule appointments
- `POST /api/health-routine/generate` - Generate personalized health routine
- `POST /api/health-routine/schedule` - Schedule routine to calendar

### Real-Time Events (Socket.IO)
- `join_session` - Join collaboration session
- `provider_joined` - Provider joined session
- `new_annotation` - New medical annotation
- `ai_response` - Real-time AI response

## 👥 Demo Patients

The application includes 4 preloaded patient cases:

1. **Sarah Johnson (65F)** - High risk: New diabetes + weight loss + family history
2. **Robert Chen (58M)** - Medium risk: Weight loss + smoking history
3. **Maria Rodriguez (72F)** - Medium risk: New diabetes + elevated CA 19-9
4. **James Wilson (45M)** - Low risk: Routine checkup, minimal symptoms

## 🔄 Core Workflows

### Provider Workflow
1. Select patient from sidebar
2. Review AI-powered risk assessment with specialist insights
3. Chat with specialized medical agents for diagnosis and treatment
4. Generate personalized health routines
5. Schedule appointments and coordinate care
6. View insurance codes and cost estimates

### Patient Workflow
1. Toggle to "Patient View"
2. See simplified, empathetic risk explanation
3. Chat with AI assistant about concerns
4. Receive personalized health routine
5. View calendar-synced care plan

### AI Agent Workflow
1. User asks medical question
2. System routes to appropriate specialist agent
3. Agent analyzes query with medical expertise
4. Response includes agent name and confidence score
5. Other agents can collaborate on complex cases

## 🎯 Key AI Agent Examples

### Diagnostic Queries → Dr. Sarah Chen
- "What's the risk assessment for this patient?"
- "How should we interpret these lab results?"
- "What additional tests should we order?"

### Treatment Queries → Dr. Michael Rodriguez
- "What treatment options are available?"
- "How should we manage this patient's care?"
- "What's the recommended protocol?"

### Health Routine Queries → Dr. Lisa Wang
- "Create a health routine for this patient"
- "What lifestyle changes do you recommend?"
- "Help with diet and exercise planning"

### Coordination Queries → Jennifer Thompson
- "Schedule a follow-up appointment"
- "Coordinate with specialists"
- "What's the care timeline?"

## 🚀 Development

Built during HackGT 2024 for the Impiricus challenge. Demonstrates cutting-edge integration of AI agents, clinical decision support, and patient communication tools.

### Key Implementation Details

- **AI Agent Routing**: NLP-based query classification and specialist assignment
- **Risk Algorithm**: Weighted scoring based on age, symptoms, family history, labs
- **Study Matching**: Dynamic literature lookup based on primary risk factors
- **Code Mapping**: Automated ICD-10/CPT suggestion with cost estimation
- **Dual UX**: Provider-technical vs patient-friendly presentation layers
- **Real-Time Sync**: Socket.IO for live collaboration and updates
- **Calendar Integration**: Automated scheduling with Google Calendar API
- **Voice Interface**: Web Speech API for hands-free operation

## 🔧 Configuration

### Environment Variables (.env)
```
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback
NODE_ENV=development
PORT=5000
```

## 🎉 Live Demo Features

- **Real AI Conversations**: Live chat with Google Gemini 2.5 Flash
- **Specialist Routing**: Queries automatically routed to the right medical expert
- **Voice Input**: Click microphone to speak your questions
- **Health Routines**: Generate and sync personalized care plans
- **Smart Scheduling**: One-click appointment booking
- **Real-Time Collaboration**: Multiple providers can join sessions

---

*Built with ❤️ for better patient care through AI-powered clinical decision support.*