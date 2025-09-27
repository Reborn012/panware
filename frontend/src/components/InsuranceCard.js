import React, { useState } from 'react';

const InsuranceCard = ({ insuranceInfo, riskLevel }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!insuranceInfo) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="card-header mb-0">Insurance & Billing</h3>
        <div className="flex items-center text-sm text-gray-500">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          Cost Estimate
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium text-gray-900">Total Estimated Cost:</span>
          <span className="text-lg font-bold text-medical-primary">
            {insuranceInfo.total_estimated_range}
          </span>
        </div>

        {riskLevel === 'high' && (
          <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded mb-4">
            <p className="text-sm text-yellow-700">
              <strong>Prior Authorization:</strong> High-risk imaging may require pre-approval
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-3">ICD-10 Diagnostic Codes</h4>
          <div className="space-y-2">
            {insuranceInfo.icd_codes?.length > 0 ? (
              insuranceInfo.icd_codes.map((code, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{code}</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-mono">
                    {code.split(' - ')[0]}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">No specific codes identified</div>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">CPT Procedure Codes</h4>
          <div className="space-y-2">
            {insuranceInfo.cpt_codes?.length > 0 ? (
              insuranceInfo.cpt_codes.map((code, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{code}</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-mono">
                    {code.split(' - ')[0]}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">No procedures recommended</div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 mt-6">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between text-sm text-medical-primary hover:text-blue-700 font-medium"
        >
          <span>{showDetails ? 'Hide' : 'Show'} Cost Breakdown</span>
          <svg
            className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showDetails && (
          <div className="mt-4 space-y-3">
            {insuranceInfo.estimated_costs?.map((cost, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{cost.description}</div>
                  <div className="text-xs text-gray-500 font-mono">{cost.code}</div>
                </div>
                <div className="font-semibold text-gray-900">{cost.cost}</div>
              </div>
            ))}

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-1">Insurance Notes:</p>
                  <ul className="text-blue-700 space-y-1">
                    <li>• Costs vary by insurance plan and deductible</li>
                    <li>• In-network providers recommended for lower costs</li>
                    <li>• Prior authorization may affect timing</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsuranceCard;