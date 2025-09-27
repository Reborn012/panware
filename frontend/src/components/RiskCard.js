import React from 'react';

const RiskCard = ({ riskAssessment, patient }) => {
  if (!riskAssessment) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const getRiskColor = () => {
    switch (riskAssessment.risk_level) {
      case 'high':
        return 'risk-high';
      case 'medium':
        return 'risk-medium';
      default:
        return 'risk-low';
    }
  };

  const getRiskIcon = () => {
    switch (riskAssessment.risk_level) {
      case 'high':
        return (
          <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'medium':
        return (
          <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="card-header mb-0">Risk Assessment</h3>
        {getRiskIcon()}
      </div>

      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-3">
          <span className={`risk-badge ${getRiskColor()}`}>
            {riskAssessment.risk_level.toUpperCase()} RISK
          </span>
          <span className="text-2xl font-bold text-gray-900">
            Score: {riskAssessment.score}
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              riskAssessment.risk_level === 'high'
                ? 'bg-red-500'
                : riskAssessment.risk_level === 'medium'
                ? 'bg-yellow-500'
                : 'bg-green-500'
            }`}
            style={{
              width: `${Math.min((riskAssessment.score / 10) * 100, 100)}%`
            }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Low (0-2)</span>
          <span>Medium (3-5)</span>
          <span>High (6+)</span>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Risk Factors Identified</h4>
        <div className="space-y-2">
          {riskAssessment.reasons.length > 0 ? (
            riskAssessment.reasons.map((reason, index) => (
              <div key={index} className="flex items-center text-sm">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-3 flex-shrink-0"></div>
                <span className="text-gray-700">{reason}</span>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">No significant risk factors identified</div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h4 className="font-medium text-gray-900 mb-2">Recommended Action</h4>
        <p className="text-sm text-gray-700 leading-relaxed">
          {riskAssessment.recommended_action}
        </p>

        {riskAssessment.risk_level === 'high' && (
          <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-400 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 font-medium">
                  URGENT: This patient requires immediate attention
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskCard;