import React, { useState } from 'react';

const PatientView = ({ patient, riskAssessment, questionnaire }) => {
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  const getPatientFriendlyRiskMessage = () => {
    if (!riskAssessment) return null;

    switch (riskAssessment.risk_level) {
      case 'high':
        return {
          title: 'We recommend some additional tests',
          message: 'Based on your symptoms and medical information, we think it would be helpful to do some additional tests to make sure everything is okay. This is a precautionary step to give you the best care possible.',
          tone: 'yellow',
          icon: '🏥',
          action: 'Your doctor will discuss the next steps with you and help schedule any needed appointments.'
        };
      case 'medium':
        return {
          title: 'We may want to do some follow-up',
          message: 'Your symptoms suggest we should keep a closer eye on things. This might mean some additional tests or check-ups to make sure you stay healthy.',
          tone: 'blue',
          icon: '👩‍⚕️',
          action: 'Your healthcare team will work with you to create a plan that feels comfortable for you.'
        };
      default:
        return {
          title: 'Everything looks good for now',
          message: 'Based on what we know today, your symptoms don\'t suggest anything urgent. We\'ll continue to monitor your health and make sure you feel your best.',
          tone: 'green',
          icon: '✅',
          action: 'Keep taking care of yourself and don\'t hesitate to reach out if you have any concerns.'
        };
    }
  };

  const patientMessage = getPatientFriendlyRiskMessage();

  const getToneClasses = (tone) => {
    switch (tone) {
      case 'yellow':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      case 'blue':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      default:
        return 'bg-green-50 border-green-200 text-green-900';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Hi {patient.name.split(' ')[0]} 👋
        </h2>
        <p className="text-lg text-gray-600">
          Here's what we learned from your visit today, explained in simple terms
        </p>
      </div>

      {patientMessage && (
        <div className={`card border-2 ${getToneClasses(patientMessage.tone)}`}>
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">{patientMessage.icon}</div>
            <h3 className="text-2xl font-bold mb-3">{patientMessage.title}</h3>
            <p className="text-lg leading-relaxed">
              {patientMessage.message}
            </p>
          </div>

          <div className="border-t border-current border-opacity-20 pt-4">
            <p className="font-medium text-center">
              {patientMessage.action}
            </p>
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="card-header">Your Visit Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">What you told us about</h4>
            <div className="space-y-2">
              {patient.symptoms?.map((symptom, index) => (
                <div key={index} className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span className="capitalize">{symptom.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Your basic information</h4>
            <div className="space-y-2 text-gray-700">
              <div>Age: {patient.age} years old</div>
              <div>Main concern: {patient.chief_complaint?.replace('_', ' ')}</div>
              {patient.smoking_history && <div>Previous smoking history</div>}
            </div>
          </div>
        </div>
      </div>

      {questionnaire && questionnaire.questions && (
        <div className="card">
          <h3 className="card-header">Questions to think about</h3>
          <p className="text-gray-600 mb-4">
            These questions can help you and your doctor understand your symptoms better:
          </p>
          <div className="space-y-3">
            {questionnaire.questions.slice(0, 3).map((question, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-800 font-medium">
                  {index + 1}. {question}
                </p>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowMoreInfo(!showMoreInfo)}
            className="mt-4 text-medical-primary hover:text-blue-700 font-medium"
          >
            {showMoreInfo ? 'Show less' : `See ${questionnaire.questions.length - 3} more questions`}
          </button>

          {showMoreInfo && (
            <div className="mt-4 space-y-3">
              {questionnaire.questions.slice(3).map((question, index) => (
                <div key={index + 3} className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 font-medium">
                    {index + 4}. {question}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="card">
        <h3 className="card-header">What happens next?</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-medical-primary text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Follow your doctor's recommendations</h4>
              <p className="text-gray-600">
                Your healthcare team will let you know about any tests or follow-up appointments you might need.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-medical-primary text-white rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Keep track of your symptoms</h4>
              <p className="text-gray-600">
                Write down any changes in how you feel, including new symptoms or if existing ones get better or worse.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-medical-primary text-white rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Don't hesitate to call</h4>
              <p className="text-gray-600">
                If you have questions or if anything feels urgent, contact your healthcare provider right away.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-blue-50 border-blue-200">
        <div className="text-center">
          <div className="text-3xl mb-3">💙</div>
          <h3 className="text-xl font-bold text-blue-900 mb-2">You're in good hands</h3>
          <p className="text-blue-800">
            Your healthcare team is here to support you every step of the way. We're committed to helping you feel your best and answering any questions you might have.
          </p>
        </div>
      </div>

      <div className="text-center py-6 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          This summary was generated by your clinical care team • For questions, contact your healthcare provider
        </p>
      </div>
    </div>
  );
};

export default PatientView;