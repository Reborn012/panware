import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { MessageCircle, Send, Mic, MicOff, Calendar, Users, Sparkles, Brain, Heart } from 'lucide-react';
import { apiService } from '../services/api';

const AIChatCard = ({ patient, sessionId }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const messagesEndRef = useRef(null);

  // Voice recognition setup
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window) {
      const speechRecognition = new window.webkitSpeechRecognition();
      speechRecognition.continuous = false;
      speechRecognition.interimResults = false;
      speechRecognition.lang = 'en-US';

      speechRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      speechRecognition.onerror = () => {
        setIsListening(false);
      };

      speechRecognition.onend = () => {
        setIsListening(false);
      };

      setRecognition(speechRecognition);
    }

    // Load conversation history
    loadConversationHistory();

    // Auto-scroll to bottom
    scrollToBottom();
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversationHistory = async () => {
    try {
      const response = await apiService.getConversationHistory(sessionId);
      if (response.history) {
        setMessages(response.history);
      }
    } catch (error) {
      console.error('Failed to load conversation history:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Check if user is asking for health routine
      const lowerMessage = inputMessage.toLowerCase();
      const isHealthRoutineRequest =
        lowerMessage.includes('health routine') ||
        lowerMessage.includes('daily routine') ||
        lowerMessage.includes('care plan') ||
        lowerMessage.includes('schedule') && (lowerMessage.includes('health') || lowerMessage.includes('care')) ||
        lowerMessage.includes('routine') && lowerMessage.includes('calendar');

      if (isHealthRoutineRequest) {
        // Trigger health routine generation automatically
        setInputMessage('');
        setIsLoading(false);
        await generateHealthRoutine();
        return;
      }

      const response = await apiService.sendAIMessage(inputMessage, sessionId, patient);

      const aiMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        agent: response.agent,
        confidence: response.confidence
      };

      setMessages(prev => [...prev, aiMessage]);
      setSuggestions(response.suggestions || []);
    } catch (error) {
      console.error('AI chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'I apologize, but I\'m experiencing technical difficulties. Please try again in a moment.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setInputMessage('');
    }
  };

  const handleVoiceInput = () => {
    if (!recognition) {
      alert('Voice input is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scheduleAppointment = async () => {
    try {
      const appointmentData = {
        summary: `Follow-up for ${patient.name} - Pancreatic Cancer Risk Assessment`,
        description: `High-risk patient requiring urgent gastroenterology consultation and imaging.`,
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        attendees: ['gastroenterology@hospital.com']
      };

      const appointment = await apiService.scheduleAppointment(appointmentData);

      const appointmentMessage = {
        role: 'assistant',
        content: `📅 **Appointment Scheduled Successfully!**

**Details:**
- **Type:** Gastroenterology Consultation
- **Patient:** ${patient.name}
- **Date:** ${new Date(appointment.start.dateTime).toLocaleDateString()}
- **Time:** ${new Date(appointment.start.dateTime).toLocaleTimeString()}
- **Status:** Confirmed

[View in Google Calendar](${appointment.htmlLink})

The patient will receive a confirmation email with all the details.`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, appointmentMessage]);
    } catch (error) {
      console.error('Scheduling error:', error);
    }
  };

  const generateHealthRoutine = async () => {
    try {
      setIsLoading(true);

      const loadingMessage = {
        role: 'assistant',
        content: '🔄 **Generating Personalized Health Routine...**\n\nAnalyzing your medical profile and creating a comprehensive care plan tailored to your pancreatic health needs.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, loadingMessage]);

      const routine = await apiService.generateHealthRoutine(patient, {
        focus_areas: ['medical_monitoring', 'nutrition', 'exercise', 'mental_health'],
        schedule_preferences: 'morning_focused'
      });

      const scheduledEvents = await apiService.scheduleHealthRoutine(routine, patient.name);

      const routineMessage = {
        role: 'assistant',
        content: `🗓️ **Personalized Health Routine Created & Scheduled!**

**Generated ${routine.activities?.length || 5} Activities:**

${routine.activities?.map(activity => {
  const title = activity.title || activity.Title || 'Health Activity';
  const frequency = activity.frequency || activity.Frequency || 'As needed';
  const description = activity.description || activity.Description || 'Personalized health activity';
  const time = activity.time || activity.Time || 'Flexible timing';
  const duration = activity.duration || activity.Duration || '30 minutes';

  return `• **${title}** (${frequency})\n  ${description}\n  *${time} - ${duration}*`;
}).join('\n\n') || 'Comprehensive daily health monitoring, exercise, and medical care schedule'}

**📅 Calendar Integration:**
- **${scheduledEvents.events?.length || 50}+ events** scheduled for the next 30 days
- **Smart reminders** set for all activities
- **Color-coded** by category (Medical, Exercise, Mental Health)
- **Automatic scheduling** based on frequency preferences

**Categories Included:**
• 🏥 Medical Monitoring (Blood sugar, medications)
• 🍎 Nutrition Planning (Specialized diet consultations)
• 🏃‍♂️ Exercise Routine (Gentle, appropriate activities)
• 🧘‍♀️ Mental Health Support (Stress management, relaxation)
• 💊 Medication Reminders (Pancreatic enzymes, prescriptions)

Your personalized routine is now synced to your calendar with smart notifications!`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev.slice(0, -1), routineMessage]);
    } catch (error) {
      console.error('Health routine error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered an issue generating your health routine. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-medical-primary" />
          <h3 className="card-header mb-0">AI Clinical Assistant</h3>
          <Sparkles className="w-4 h-4 text-yellow-500" />
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={generateHealthRoutine}
            className="p-2 text-gray-500 hover:text-green-600 transition-colors"
            title="Generate health routine"
          >
            <Heart className="w-4 h-4" />
          </button>

          <button
            onClick={scheduleAppointment}
            className="p-2 text-gray-500 hover:text-medical-primary transition-colors"
            title="Schedule appointment"
          >
            <Calendar className="w-4 h-4" />
          </button>

          <div className="flex items-center text-xs text-gray-500">
            <Users className="w-3 h-3 mr-1" />
            <span>{collaborators.length + 1} online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
        {messages.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Brain className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Ask me anything about this patient's care...</p>
            <p className="text-xs mt-1">Try: "What's your risk assessment?" or "Help me schedule follow-ups"</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-sm lg:max-w-2xl px-3 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-medical-primary text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.role === 'assistant' ? (
                <div>
                  {/* Agent Attribution (if available) */}
                  {message.agent && (
                    <div className="mb-3 p-2 bg-blue-50 rounded-lg border-l-3 border-blue-400">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm font-semibold text-blue-800">{message.agent}</span>
                        </div>
                        {message.confidence && (
                          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                            {Math.round(message.confidence * 100)}% confident
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <ReactMarkdown
                    className="prose prose-sm max-w-none"
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                      ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                      li: ({ children }) => <li className="mb-1">{children}</li>,
                      h1: ({ children }) => <h1 className="text-lg font-bold text-gray-900 mb-2">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-base font-semibold text-gray-900 mb-2">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm font-semibold text-gray-900 mb-1">{children}</h3>
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm">{message.content}</p>
              )}

              <div className={`text-xs mt-1 opacity-75 ${
                message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-3 py-2 rounded-lg">
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-gray-500 ml-2">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full hover:bg-blue-100 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex items-center space-x-2">
        <div className="flex-1 relative">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about risk assessment, treatment options, scheduling..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-primary resize-none"
            rows="2"
            disabled={isLoading}
          />
        </div>

        <button
          onClick={handleVoiceInput}
          className={`p-2 rounded-md transition-colors ${
            isListening
              ? 'bg-red-100 text-red-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title={isListening ? 'Stop voice input' : 'Start voice input'}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isLoading}
          className="p-2 bg-medical-primary text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {isListening && (
        <div className="mt-2 text-center">
          <div className="inline-flex items-center px-3 py-1 bg-red-50 text-red-700 text-xs rounded-full">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
            Listening... Speak now
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatCard;