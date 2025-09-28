import React from 'react';
import { TrendingUp, TrendingDown, Activity, AlertTriangle } from 'lucide-react';

const MedicalScatterChart = ({ labResults, title = "Lab Results vs Normal Ranges" }) => {
  if (!labResults || labResults.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="text-center py-8 text-gray-500">
          <Activity className="w-12 h-12 mx-auto mb-4" />
          <p>No lab results available for chart</p>
        </div>
      </div>
    );
  }

  // Process lab results to extract values and ranges
  const processedData = labResults.map((lab, index) => {
    let patientValue = 0;
    let normalMin = 0;
    let normalMax = 0;
    let status = 'normal';

    // Extract patient value
    if (typeof lab.value === 'string') {
      patientValue = parseFloat(lab.value.replace(/[^\d.-]/g, '')) || 0;
    } else {
      patientValue = lab.value || 0;
    }

    // Extract normal range
    if (lab.normalRange) {
      const rangeMatch = lab.normalRange.match(/(\d+\.?\d*)\s*[-–]\s*(\d+\.?\d*)/);
      if (rangeMatch) {
        normalMin = parseFloat(rangeMatch[1]);
        normalMax = parseFloat(rangeMatch[2]);
      } else {
        // Try to extract single threshold (e.g., "<37")
        const singleMatch = lab.normalRange.match(/[<>]?\s*(\d+\.?\d*)/);
        if (singleMatch) {
          const value = parseFloat(singleMatch[1]);
          if (lab.normalRange.includes('<')) {
            normalMin = 0;
            normalMax = value;
          } else {
            normalMin = value;
            normalMax = value * 2; // Approximate upper bound
          }
        }
      }
    }

    // Determine status
    if (normalMin > 0 && normalMax > 0) {
      if (patientValue < normalMin) {
        status = 'low';
      } else if (patientValue > normalMax) {
        status = 'high';
      } else {
        status = 'normal';
      }
    }

    return {
      name: lab.name || lab.test || `Test ${index + 1}`,
      patientValue,
      normalMin,
      normalMax,
      normalMid: (normalMin + normalMax) / 2,
      status,
      unit: lab.unit || ''
    };
  }).filter(item => item.normalMin > 0 || item.normalMax > 0); // Only include items with ranges

  if (processedData.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="text-center py-8 text-gray-500">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
          <p>Unable to extract normal ranges from lab results</p>
        </div>
      </div>
    );
  }

  // Calculate chart dimensions
  const chartWidth = 600;
  const chartHeight = 400;
  const padding = 60;
  const plotWidth = chartWidth - (padding * 2);
  const plotHeight = chartHeight - (padding * 2);

  // Find min and max values for scaling
  const allValues = processedData.flatMap(item => [
    item.patientValue,
    item.normalMin,
    item.normalMax
  ]);
  const minValue = Math.min(...allValues) * 0.8;
  const maxValue = Math.max(...allValues) * 1.2;
  const valueRange = maxValue - minValue;

  // Create scales
  const xScale = (index) => padding + (index * (plotWidth / (processedData.length - 1)));
  const yScale = (value) => chartHeight - padding - ((value - minValue) / valueRange) * plotHeight;

  const getStatusColor = (status) => {
    switch (status) {
      case 'high': return '#ef4444';
      case 'low': return '#f59e0b';
      default: return '#10b981';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'high': return <TrendingUp className="w-4 h-4" style={{color: '#ef4444'}} />;
      case 'low': return <TrendingDown className="w-4 h-4" style={{color: '#f59e0b'}} />;
      default: return <Activity className="w-4 h-4" style={{color: '#10b981'}} />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-6 shadow-lg border border-purple-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-stone-900">{title}</h3>
          <p className="text-sm text-stone-600">Interactive visualization of patient values vs normal ranges</p>
        </div>
      </div>
      
      {/* Chart */}
      <div className="mb-6 bg-white rounded-lg p-4 shadow-inner">
        <svg width={chartWidth} height={chartHeight} className="border border-gray-200 rounded-lg bg-gradient-to-b from-gray-50 to-white">
          {/* Background */}
          <defs>
            <linearGradient id="chartBackground" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
          </defs>
          <rect width={chartWidth} height={chartHeight} fill="url(#chartBackground)" />
          
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(fraction => {
            const y = padding + (fraction * plotHeight);
            const value = minValue + (1 - fraction) * valueRange;
            return (
              <g key={fraction}>
                <line
                  x1={padding}
                  y1={y}
                  x2={chartWidth - padding}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeDasharray="3,3"
                  strokeWidth={fraction === 0.5 ? 2 : 1}
                />
                <text
                  x={padding - 15}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fontWeight="500"
                  fill="#6b7280"
                >
                  {value.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Normal ranges (background bars) */}
          {processedData.map((item, index) => {
            const x = xScale(index);
            const minY = yScale(item.normalMin);
            const maxY = yScale(item.normalMax);
            const barHeight = minY - maxY;
            
            return (
              <g key={`range-${index}`}>
                <rect
                  x={x - 20}
                  y={maxY}
                  width={40}
                  height={barHeight}
                  fill="#dcfce7"
                  fillOpacity={0.6}
                  stroke="#16a34a"
                  strokeWidth={1}
                  strokeOpacity={0.4}
                  rx={4}
                />
                {/* Range labels */}
                <text
                  x={x}
                  y={maxY - 8}
                  textAnchor="middle"
                  fontSize="8"
                  fill="#16a34a"
                  fontWeight="600"
                >
                  {item.normalMax.toFixed(0)}
                </text>
                <text
                  x={x}
                  y={minY + 15}
                  textAnchor="middle"
                  fontSize="8"
                  fill="#16a34a"
                  fontWeight="600"
                >
                  {item.normalMin.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* Patient values (scatter points) */}
          {processedData.map((item, index) => {
            const x = xScale(index);
            const y = yScale(item.patientValue);
            const color = getStatusColor(item.status);
            
            return (
              <g key={`point-${index}`}>
                {/* Glow effect */}
                <circle
                  cx={x}
                  cy={y}
                  r={10}
                  fill={color}
                  fillOpacity={0.2}
                />
                <circle
                  cx={x}
                  cy={y}
                  r={7}
                  fill={color}
                  stroke="white"
                  strokeWidth={3}
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                />
                {/* Value label with background */}
                <rect
                  x={x - 15}
                  y={y - 25}
                  width={30}
                  height={16}
                  fill="white"
                  stroke={color}
                  strokeWidth={1}
                  rx={8}
                  fillOpacity={0.9}
                />
                <text
                  x={x}
                  y={y - 15}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill={color}
                >
                  {item.patientValue.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {processedData.map((item, index) => {
            const x = xScale(index);
            return (
              <g key={`label-${index}`}>
                <rect
                  x={x - 25}
                  y={chartHeight - padding + 15}
                  width={50}
                  height={20}
                  fill="white"
                  fillOpacity={0.8}
                  rx={4}
                />
                <text
                  x={x}
                  y={chartHeight - padding + 27}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="600"
                  fill="#374151"
                >
                  {item.name.length > 10 ? item.name.substring(0, 10) + '...' : item.name}
                </text>
              </g>
            );
          })}

          {/* Chart title and labels */}
          <text
            x={chartWidth / 2}
            y={25}
            textAnchor="middle"
            fontSize="16"
            fontWeight="bold"
            fill="#111827"
          >
            Patient Values vs Normal Ranges
          </text>
          
          <text
            x={30}
            y={chartHeight / 2}
            textAnchor="middle"
            fontSize="12"
            fontWeight="600"
            fill="#6b7280"
            transform={`rotate(-90, 30, ${chartHeight / 2})`}
          >
            Lab Values
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="flex items-center gap-3 bg-green-50 p-3 rounded-lg border border-green-200">
          <div className="w-6 h-6 bg-green-100 border-2 border-green-400 rounded"></div>
          <span className="text-sm font-semibold text-green-800">Normal Range</span>
        </div>
        <div className="flex items-center gap-3 bg-green-50 p-3 rounded-lg border border-green-200">
          <div className="w-4 h-4 bg-green-500 rounded-full shadow-sm"></div>
          <span className="text-sm font-semibold text-green-800">Normal Values</span>
        </div>
        <div className="flex items-center gap-3 bg-red-50 p-3 rounded-lg border border-red-200">
          <div className="w-4 h-4 bg-red-500 rounded-full shadow-sm"></div>
          <span className="text-sm font-semibold text-red-800">High Values</span>
        </div>
        <div className="flex items-center gap-3 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <div className="w-4 h-4 bg-yellow-500 rounded-full shadow-sm"></div>
          <span className="text-sm font-semibold text-yellow-800">Low Values</span>
        </div>
      </div>

      {/* Values Summary */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <h4 className="font-bold text-gray-900 text-lg">Test Results Summary</h4>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {processedData.map((item, index) => (
            <div key={index} className={`flex items-center justify-between p-4 rounded-xl border-2 shadow-sm transition-all hover:shadow-md ${
              item.status === 'high' ? 'bg-red-50 border-red-200 hover:bg-red-100' :
              item.status === 'low' ? 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100' :
              'bg-green-50 border-green-200 hover:bg-green-100'
            }`}>
              <div className="flex items-center gap-3">
                {getStatusIcon(item.status)}
                <div>
                  <span className="font-semibold text-stone-900">{item.name}</span>
                  <div className="text-xs text-stone-600">
                    Normal: {item.normalMin.toFixed(1)}-{item.normalMax.toFixed(1)} {item.unit}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${
                  item.status === 'high' ? 'text-red-600' :
                  item.status === 'low' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {item.patientValue.toFixed(1)} {item.unit}
                </div>
                <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                  item.status === 'high' ? 'bg-red-200 text-red-800' :
                  item.status === 'low' ? 'bg-yellow-200 text-yellow-800' :
                  'bg-green-200 text-green-800'
                }`}>
                  {item.status.toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MedicalScatterChart;