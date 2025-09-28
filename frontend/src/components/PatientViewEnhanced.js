import React from 'react';
import { CheckCircle } from 'lucide-react';
import PatientAIChatbox from './PatientAIChatbox';

const PatientViewEnhanced = ({ patient }) => {
  const patientQuestions = [
    'Have you experienced any unexplained weight loss in the past 6 months?',
    'Does the pain radiate to your back or shoulder blades?',
    'Have you noticed any changes in your stool color or consistency?'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-stone-900 mb-4">
          Hi {patient.name.split(' ')[0]} 👋
        </h1>
        <p className="text-stone-600 text-lg">
          Here's what we learned from your visit today, explained in simple terms
        </p>
      </div>

      {/* Visit Summary */}
      <div className="bg-white border-2 border-stone-200 rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-stone-900 mb-8">Your Visit Summary</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* What you told us about */}
          <div>
            <h3 className="text-lg font-semibold text-stone-900 mb-6">What you told us about</h3>
            <div className="space-y-4">
              {patient.symptoms.map((symptom, index) => (
                <div
                  key={symptom}
                  className="flex items-center gap-3 animate-fade-in"
                  style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-stone-700 capitalize">{symptom}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Your basic information */}
          <div>
            <h3 className="text-lg font-semibold text-stone-900 mb-6">Your basic information</h3>
            <div className="space-y-4">
              <div className="text-stone-700 animate-fade-in" style={{ animationDelay: '0.7s' }}>
                Age: {patient.age} years old
              </div>
              <div className="text-stone-700 animate-fade-in" style={{ animationDelay: '0.8s' }}>
                Main concern: {patient.condition.toLowerCase()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Health Assistant */}
      <PatientAIChatbox patientName={patient.name} patientData={patient} />

      {/* Questions to think about */}
      <div className="bg-white border-2 border-stone-200 rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-stone-900 mb-4">Questions to think about</h2>
        <p className="text-stone-600 mb-8">
          These questions can help you and your doctor understand your symptoms better:
        </p>

        <div className="space-y-6">
          {patientQuestions.map((question, index) => (
            <div
              key={index}
              className="bg-stone-50 p-6 rounded-lg border border-stone-200 animate-fade-in"
              style={{ animationDelay: `${0.7 + index * 0.1}s` }}
            >
              <div className="flex items-start gap-4">
                <span className="text-stone-900 text-lg font-semibold">
                  {index + 1}.
                </span>
                <p className="text-stone-800 flex-1">{question}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-amber-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-amber-900 mb-4">
            We recommend some additional tests
          </h2>
        </div>

        <div className="text-center space-y-4">
          <p className="text-stone-700 max-w-2xl mx-auto">
            Based on your symptoms and medical information, we think it would be helpful to do some additional
            tests to make sure everything is okay. This is a precautionary step to give you the best care possible.
          </p>

          <div className="border-t border-amber-300 pt-6 mt-6">
            <p className="text-amber-800 font-medium">
              Your doctor will discuss the next steps with you and help schedule any needed appointments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientViewEnhanced;