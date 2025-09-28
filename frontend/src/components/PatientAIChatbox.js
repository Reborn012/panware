import React, { useState } from 'react';
import { Send, Bot, User, Shield } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { apiService } from '../services/api';

const PatientAIChatbox = ({ patientName, patientData }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: `Hi ${patientName.split(' ')[0]}! I'm here to help explain any medical information in simple terms. You can ask me about your symptoms, test results, risk factors, or anything else you'd like to understand better. What would you like to know?`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(`patient_${patientData?.id || 'default'}_${Date.now()}`);

  const quickQuestions = [
    "What is a risk assessment?",
    "Explain my symptoms simply",
    "What do my test results mean?",
    "Should I be worried?",
    "What are the next steps?"
  ];

  const getAIResponse = (userMessage) => {
    const message = userMessage.toLowerCase();

    if (message.includes('risk assessment') || message.includes('risk')) {
      return `A risk assessment is like a health report card that helps doctors understand how likely you are to have certain health problems.

Think of it like this: If you're crossing a street, you look both ways to assess the risk of cars coming. In medicine, we look at different factors about your health to assess risks.

For you, we're looking at things like:
• Your age (older adults have different risks)
• Your symptoms (what your body is telling us)
• Your medical history
• Family health history

A "high risk" doesn't mean you definitely have a problem - it just means we want to be extra careful and do some tests to make sure you're okay. It's like wearing a seatbelt - it's a safety measure, not because we expect an accident.`;
    }

    if (message.includes('symptoms') || message.includes('pain') || message.includes('weight loss')) {
      return `Your symptoms are your body's way of telling you that something might need attention - like a car's warning light on the dashboard.

Let me explain your symptoms in simple terms:
• **Abdominal pain**: This is discomfort in your belly area. It can happen for many reasons, from something simple like indigestion to something that needs medical attention.
• **Weight loss**: When you lose weight without trying, it's worth checking out to make sure everything is working properly in your body.

These symptoms don't automatically mean something serious is wrong. Many things can cause them. But your doctor wants to investigate to give you the best care and peace of mind.`;
    }

    if (message.includes('test') || message.includes('results')) {
      return `Medical tests are like detective tools that help doctors see what's happening inside your body that they can't see from the outside.

Common tests you might have:
• **Blood tests**: Check how different parts of your body are working
• **CT scan**: Takes detailed pictures of the inside of your body
• **X-rays**: Show pictures of bones and some organs

Think of tests like checking under the hood of your car - even if the car seems to run fine, sometimes a mechanic needs to look inside to make sure everything is working properly.

Your doctor will always explain what each test is for and what the results mean for your health.`;
    }

    if (message.includes('worried') || message.includes('scared') || message.includes('fear')) {
      return `It's completely normal to feel worried when dealing with health concerns. Many people feel this way, and your feelings are valid.

Here's what might help:
• **Knowledge**: Understanding what's happening often reduces fear
• **Questions**: Write down questions for your doctor
• **Support**: Talk to family, friends, or counselors
• **One step at a time**: Focus on the next step, not all possibilities

Remember: Your medical team is here to help you. We're being thorough because we care about your health, not because we expect the worst. Many health concerns, even serious-sounding ones, are very treatable when caught early.

You're not alone in this journey.`;
    }

    if (message.includes('next steps') || message.includes('what now') || message.includes('happen next')) {
      return `Here's what typically happens next in simple steps:

**Immediate steps:**
1. Your doctor will review all your information
2. They'll discuss test recommendations with you
3. You'll schedule any needed tests
4. You'll get clear instructions on what to do

**During tests:**
• Medical staff will explain each step
• Most tests are not painful
• You can ask questions anytime

**After tests:**
• Your doctor will review the results
• They'll explain what everything means
• You'll discuss treatment options if needed
• You'll make a plan together

**Remember:** Each step is designed to help you get the best care. You're always in control and can ask questions at any time.`;
    }

    if (message.includes('diabetes') || message.includes('blood sugar')) {
      return `Diabetes is when your body has trouble managing sugar in your blood. Think of it like this:

**Normal situation**: Your body is like a well-organized kitchen where sugar (fuel) gets used efficiently.

**With diabetes**: The kitchen staff (insulin) isn't working perfectly, so sugar builds up instead of being used for energy.

**The good news**: Diabetes is very manageable with the right approach:
• Healthy eating (doesn't mean boring food!)
• Regular activity (even just walking helps)
• Sometimes medication to help your body work better
• Regular check-ups to keep everything on track

Many people with diabetes live full, healthy, active lives. Your doctor will help you create a plan that works for your lifestyle.`;
    }

    // Default response
    return `I understand you're looking for information about "${userMessage}". While I can explain general medical concepts in simple terms, it's important that you discuss your specific situation with your doctor.

Here are some things I can help explain:
• What medical terms mean in everyday language
• How common tests work
• What symptoms might indicate
• General information about conditions
• What to expect during medical procedures

What specific aspect would you like me to explain in simpler terms? I'm here to help you understand your health information better.`;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    const currentInput = inputValue;
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Create patient context for the AI
      const patientContext = {
        name: patientName,
        age: patientData?.age,
        symptoms: patientData?.symptoms || [],
        condition: patientData?.condition,
        gender: patientData?.gender
      };

      // Call the real AI API
      const response = await apiService.sendAIMessage(currentInput, sessionId, patientContext);

      const aiResponse = {
        id: messages.length + 2,
        type: 'ai',
        content: response.response || response.message || 'I apologize, but I encountered an issue processing your request. Please try again.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error sending AI message:', error);

      // Fallback to local response if API fails
      const aiResponse = {
        id: messages.length + 2,
        type: 'ai',
        content: getAIResponse(currentInput),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = (question) => {
    setInputValue(question);
  };

  const formatMessage = (content) => {
    // Split by bold markers and bullet points for better formatting
    return content.split('\n').map((line, index) => {
      if (line.trim().startsWith('•')) {
        return (
          <div key={index} className="flex items-start gap-2 my-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
            <span>{line.replace('•', '').trim()}</span>
          </div>
        );
      }

      if (line.includes('**')) {
        // Handle bold text
        const parts = line.split('**');
        return (
          <p key={index} className="my-2">
            {parts.map((part, i) =>
              i % 2 === 1 ? (
                <span key={i} className="font-medium text-stone-900">{part}</span>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </p>
        );
      }

      return line.trim() ? <p key={index} className="my-2">{line}</p> : <br key={index} />;
    });
  };

  return (
    <div className="bg-white border-2 border-stone-200 shadow-sm rounded-xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-stone-200 p-6 rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-900">Ask Your Health Assistant</h3>
            <p className="text-stone-600">Get simple explanations about your health information</p>
          </div>
        </div>
      </div>

      {/* Quick Questions */}
      <div className="p-6 bg-stone-50 border-b border-stone-200">
        <p className="text-stone-700 mb-4 font-medium">Popular questions:</p>
        <div className="flex flex-wrap gap-2">
          {quickQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleQuickQuestion(question)}
              className="px-3 py-2 bg-white border border-stone-300 rounded-md text-stone-700 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 text-sm"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="h-80 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.type === 'ai'
                ? 'bg-blue-600'
                : 'bg-stone-600'
            }`}>
              {message.type === 'ai' ? (
                <Bot className="w-4 h-4 text-white" />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>

            <div className={`max-w-md p-4 rounded-lg border ${
              message.type === 'ai'
                ? 'bg-blue-50 border-blue-200'
                : 'bg-stone-50 border-stone-200'
            }`}>
              <div className="text-stone-800">
                {message.type === 'ai' ? formatMessage(message.content) : message.content}
              </div>
              <div className="text-xs text-stone-500 mt-2">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 border-t border-stone-200 rounded-b-xl">
        <div className="flex gap-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me about your health information..."
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="bg-blue-600 hover:bg-blue-700 text-white border-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <div className="mt-3 flex items-center gap-2 text-stone-500 text-sm">
          <Shield className="w-4 h-4" />
          <p>This AI provides general health information. Always discuss your specific situation with your doctor.</p>
        </div>
      </div>
    </div>
  );
};

export default PatientAIChatbox;