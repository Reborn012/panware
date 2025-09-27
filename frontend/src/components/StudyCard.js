import React from 'react';

const StudyCard = ({ studySummary, riskLevel }) => {
  if (!studySummary) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const getRelevanceColor = () => {
    switch (studySummary.relevance?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="card-header mb-0">Relevant Literature</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRelevanceColor()}`}>
          {studySummary.relevance} Relevance
        </span>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold text-gray-900 mb-2 leading-tight">
          {studySummary.title}
        </h4>
        <p className="text-sm text-medical-secondary font-medium mb-3">
          {studySummary.journal}
        </p>
      </div>

      <div className="mb-6">
        <p className="text-sm text-gray-700 leading-relaxed">
          {studySummary.summary}
        </p>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Evidence-based recommendation</span>
          </div>

          <button className="text-medical-primary hover:text-blue-700 text-sm font-medium">
            View Full Study →
          </button>
        </div>
      </div>

      {riskLevel === 'high' && (
        <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Clinical Note:</strong> Current evidence supports aggressive workup for high-risk patients.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyCard;