import React, { useState } from 'react';

const QuestionnaireCard = ({ questionnaire, chiefComplaint }) => {
  const [responses, setResponses] = useState({});
  const [showResponses, setShowResponses] = useState(false);

  if (!questionnaire || !questionnaire.questions) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const handleResponseChange = (questionIndex, response) => {
    setResponses(prev => ({
      ...prev,
      [questionIndex]: response
    }));
  };

  const getCompletionPercentage = () => {
    const totalQuestions = questionnaire.questions.length;
    const answeredQuestions = Object.keys(responses).length;
    return Math.round((answeredQuestions / totalQuestions) * 100);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="card-header mb-0">Follow-up Questions</h3>
        <div className="text-sm text-gray-500">
          {Object.keys(responses).length}/{questionnaire.questions.length} answered
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-3">
          Based on chief complaint: <span className="font-medium capitalize">
            {chiefComplaint?.replace('_', ' ')}
          </span>
        </p>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-medical-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${getCompletionPercentage()}%` }}
          ></div>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {questionnaire.questions.map((question, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">
              {index + 1}. {question}
            </h4>

            <div className="flex space-x-3">
              <button
                onClick={() => handleResponseChange(index, 'yes')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  responses[index] === 'yes'
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                } border`}
              >
                Yes
              </button>
              <button
                onClick={() => handleResponseChange(index, 'no')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  responses[index] === 'no'
                    ? 'bg-red-100 text-red-800 border-red-300'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                } border`}
              >
                No
              </button>
              <button
                onClick={() => handleResponseChange(index, 'unsure')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  responses[index] === 'unsure'
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                } border`}
              >
                Unsure
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowResponses(!showResponses)}
            className="text-sm text-medical-primary hover:text-blue-700 font-medium"
          >
            {showResponses ? 'Hide' : 'Show'} Response Summary
          </button>

          <div className="flex space-x-2">
            <button className="btn-secondary text-sm">
              Save Draft
            </button>
            <button
              className="btn-primary text-sm"
              disabled={Object.keys(responses).length === 0}
            >
              Generate Report
            </button>
          </div>
        </div>

        {showResponses && Object.keys(responses).length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-3">Response Summary:</h5>
            <div className="space-y-2">
              {Object.entries(responses).map(([questionIndex, response]) => (
                <div key={questionIndex} className="text-sm">
                  <span className="text-gray-600">Q{parseInt(questionIndex) + 1}:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    response === 'yes' ? 'bg-green-100 text-green-800' :
                    response === 'no' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {response.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionnaireCard;