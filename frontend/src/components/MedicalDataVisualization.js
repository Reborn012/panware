import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Activity,
  Heart,
  Thermometer,
  Scale,
  Eye,
  Droplets,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Filter,
  Calendar,
  Download
} from 'lucide-react';

const MedicalDataVisualization = ({ patientData, reportData, timeRange = '30d' }) => {
  const [selectedMetric, setSelectedMetric] = useState('vitals');
  const [timeFilter, setTimeFilter] = useState(timeRange);
  const [showAbnormalOnly, setShowAbnormalOnly] = useState(false);

  // Sample lab results data with trends
  const labResults = [
    {
      date: '2024-01-15',
      glucose: 95,
      hemoglobin: 13.2,
      platelets: 250000,
      wbc: 6800,
      ca19_9: 45,
      cea: 2.8,
      alt: 28,
      ast: 32,
      bilirubin: 0.8,
      amylase: 85,
      lipase: 42
    },
    {
      date: '2024-02-15',
      glucose: 102,
      hemoglobin: 12.8,
      platelets: 245000,
      wbc: 7200,
      ca19_9: 52,
      cea: 3.1,
      alt: 35,
      ast: 38,
      bilirubin: 1.1,
      amylase: 95,
      lipase: 48
    },
    {
      date: '2024-03-15',
      glucose: 118,
      hemoglobin: 12.1,
      platelets: 235000,
      wbc: 8100,
      ca19_9: 68,
      cea: 4.2,
      alt: 42,
      ast: 45,
      bilirubin: 1.4,
      amylase: 110,
      lipase: 65
    },
    {
      date: '2024-04-15',
      glucose: 125,
      hemoglobin: 11.8,
      platelets: 220000,
      wbc: 8800,
      ca19_9: 85,
      cea: 5.1,
      alt: 48,
      ast: 52,
      bilirubin: 1.8,
      amylase: 125,
      lipase: 78
    }
  ];

  // Sample vital signs data
  const vitalSigns = [
    {
      date: '2024-04-10',
      systolic: 128,
      diastolic: 82,
      heartRate: 72,
      temperature: 98.6,
      weight: 165,
      oxygenSat: 98,
      respiratoryRate: 16
    },
    {
      date: '2024-04-11',
      systolic: 132,
      diastolic: 85,
      heartRate: 78,
      temperature: 99.1,
      weight: 164,
      oxygenSat: 97,
      respiratoryRate: 18
    },
    {
      date: '2024-04-12',
      systolic: 135,
      diastolic: 88,
      heartRate: 82,
      temperature: 99.4,
      weight: 163,
      oxygenSat: 96,
      respiratoryRate: 19
    },
    {
      date: '2024-04-13',
      systolic: 140,
      diastolic: 90,
      heartRate: 85,
      temperature: 100.2,
      weight: 162,
      oxygenSat: 95,
      respiratoryRate: 20
    }
  ];

  // Define normal ranges for different metrics
  const normalRanges = {
    glucose: { min: 70, max: 100, unit: 'mg/dL' },
    hemoglobin: { min: 12.0, max: 15.5, unit: 'g/dL' },
    platelets: { min: 150000, max: 450000, unit: '/μL' },
    wbc: { min: 4000, max: 11000, unit: '/μL' },
    ca19_9: { min: 0, max: 37, unit: 'U/mL' },
    cea: { min: 0, max: 3.0, unit: 'ng/mL' },
    alt: { min: 7, max: 40, unit: 'U/L' },
    ast: { min: 8, max: 40, unit: 'U/L' },
    bilirubin: { min: 0.2, max: 1.2, unit: 'mg/dL' },
    amylase: { min: 30, max: 110, unit: 'U/L' },
    lipase: { min: 10, max: 60, unit: 'U/L' },
    systolic: { min: 90, max: 120, unit: 'mmHg' },
    diastolic: { min: 60, max: 80, unit: 'mmHg' },
    heartRate: { min: 60, max: 100, unit: 'bpm' },
    temperature: { min: 97.0, max: 99.0, unit: '°F' },
    weight: { min: null, max: null, unit: 'lbs' },
    oxygenSat: { min: 95, max: 100, unit: '%' },
    respiratoryRate: { min: 12, max: 20, unit: '/min' }
  };

  // Get trend direction for a metric
  const getTrendDirection = (data, metric) => {
    if (data.length < 2) return 'stable';
    const latest = data[data.length - 1][metric];
    const previous = data[data.length - 2][metric];
    if (latest > previous) return 'up';
    if (latest < previous) return 'down';
    return 'stable';
  };

  // Check if a value is abnormal
  const isAbnormal = (value, metric) => {
    const range = normalRanges[metric];
    if (!range) return false;
    if (range.min !== null && value < range.min) return true;
    if (range.max !== null && value > range.max) return true;
    return false;
  };

  // Get color for abnormal values
  const getValueColor = (value, metric) => {
    if (isAbnormal(value, metric)) {
      return 'text-red-600';
    }
    return 'text-green-600';
  };

  // Colors for charts
  const colors = {
    primary: '#3B82F6',
    secondary: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#8B5CF6'
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label, metric }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const range = normalRanges[metric];
      const isAbnormalValue = isAbnormal(data.value, metric);

      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className={`font-semibold ${isAbnormalValue ? 'text-red-600' : 'text-green-600'}`}>
            {data.value} {range?.unit || ''}
            {isAbnormalValue && (
              <span className="ml-2 text-xs bg-red-100 text-red-800 px-1 rounded">ABNORMAL</span>
            )}
          </p>
          {range && (
            <p className="text-xs text-gray-500">
              Normal: {range.min !== null ? range.min : 'N/A'} - {range.max !== null ? range.max : 'N/A'} {range.unit}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Lab Results Overview Cards
  const LabResultsCards = () => {
    const latestResults = labResults[labResults.length - 1];

    const criticalMarkers = [
      { key: 'ca19_9', name: 'CA 19-9', icon: AlertCircle, critical: true },
      { key: 'cea', name: 'CEA', icon: AlertCircle, critical: true },
      { key: 'glucose', name: 'Glucose', icon: Droplets, critical: false },
      { key: 'bilirubin', name: 'Bilirubin', icon: Eye, critical: false }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {criticalMarkers.map(({ key, name, icon: Icon, critical }) => {
          const value = latestResults[key];
          const trend = getTrendDirection(labResults, key);
          const abnormal = isAbnormal(value, key);
          const range = normalRanges[key];

          return (
            <div key={key} className={`p-4 rounded-lg border-2 ${critical && abnormal ? 'border-red-200 bg-red-50' : abnormal ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <Icon className={`h-5 w-5 ${critical && abnormal ? 'text-red-600' : abnormal ? 'text-yellow-600' : 'text-green-600'}`} />
                {trend === 'up' && <TrendingUp className="h-4 w-4 text-red-500" />}
                {trend === 'down' && <TrendingDown className="h-4 w-4 text-green-500" />}
                {trend === 'stable' && <div className="h-4 w-4 bg-gray-400 rounded-full"></div>}
              </div>
              <h3 className="font-medium text-gray-900">{name}</h3>
              <p className={`text-2xl font-bold ${getValueColor(value, key)}`}>
                {value} <span className="text-sm font-normal">{range?.unit}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Normal: {range?.min !== null ? range.min : 'N/A'} - {range?.max !== null ? range.max : 'N/A'}
              </p>
              {abnormal && (
                <div className="mt-2 flex items-center">
                  <AlertCircle className="h-3 w-3 text-red-500 mr-1" />
                  <span className="text-xs text-red-600 font-medium">Abnormal</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Tumor Marker Trend Chart
  const TumorMarkerChart = () => (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Tumor Markers Trend</h3>
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-sm text-red-600 font-medium">Critical Monitoring</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={labResults}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip content={<CustomTooltip metric="ca19_9" />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="ca19_9"
            stroke={colors.danger}
            strokeWidth={3}
            name="CA 19-9 (U/mL)"
            dot={{ fill: colors.danger, strokeWidth: 2, r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="cea"
            stroke={colors.warning}
            strokeWidth={2}
            name="CEA (ng/mL)"
            dot={{ fill: colors.warning, strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-4 p-3 bg-red-50 rounded-lg">
        <p className="text-sm text-red-800">
          <strong>Alert:</strong> CA 19-9 levels are trending upward and exceed normal range.
          Immediate consultation with oncology recommended.
        </p>
      </div>
    </div>
  );

  // Vital Signs Dashboard
  const VitalSignsChart = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Blood Pressure */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Blood Pressure</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={vitalSigns}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="systolic"
              stroke={colors.danger}
              name="Systolic"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="diastolic"
              stroke={colors.primary}
              name="Diastolic"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Heart Rate & Temperature */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Heart Rate & Temperature</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={vitalSigns}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="heartRate"
              stroke={colors.secondary}
              name="Heart Rate (bpm)"
              strokeWidth={2}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="temperature"
              stroke={colors.warning}
              name="Temperature (°F)"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  // Comprehensive Lab Panel
  const LabPanelChart = () => (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Lab Panel Trends</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pancreatic Enzymes */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Pancreatic Enzymes</h4>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={labResults}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="amylase"
                stackId="1"
                stroke={colors.info}
                fill={colors.info}
                fillOpacity={0.6}
                name="Amylase (U/L)"
              />
              <Area
                type="monotone"
                dataKey="lipase"
                stackId="2"
                stroke={colors.warning}
                fill={colors.warning}
                fillOpacity={0.6}
                name="Lipase (U/L)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Liver Function */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Liver Function</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={labResults}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="alt" fill={colors.primary} name="ALT (U/L)" />
              <Bar dataKey="ast" fill={colors.secondary} name="AST (U/L)" />
              <Bar dataKey="bilirubin" fill={colors.warning} name="Bilirubin (mg/dL)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <h2 className="text-2xl font-bold text-gray-900">Medical Data Visualization</h2>

          <div className="flex flex-wrap items-center space-x-4">
            {/* Time Filter */}
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 3 months</option>
              <option value="1y">Last year</option>
            </select>

            {/* Metric Selector */}
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="vitals">Vital Signs</option>
              <option value="labs">Lab Results</option>
              <option value="markers">Tumor Markers</option>
              <option value="comprehensive">Comprehensive View</option>
            </select>

            {/* Show Abnormal Only Toggle */}
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showAbnormalOnly}
                onChange={(e) => setShowAbnormalOnly(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Abnormal only</span>
            </label>

            {/* Export Button */}
            <button className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lab Results Overview Cards */}
      <LabResultsCards />

      {/* Dynamic Content Based on Selection */}
      {selectedMetric === 'vitals' && <VitalSignsChart />}
      {selectedMetric === 'labs' && <LabPanelChart />}
      {selectedMetric === 'markers' && <TumorMarkerChart />}
      {selectedMetric === 'comprehensive' && (
        <div className="space-y-6">
          <TumorMarkerChart />
          <VitalSignsChart />
          <LabPanelChart />
        </div>
      )}

      {/* Risk Summary */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-lg border-l-4 border-red-500">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-6 w-6 text-red-500 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-red-900">Clinical Alert Summary</h3>
            <p className="text-red-800 mt-2">
              Based on the trending data, several critical markers are outside normal ranges:
            </p>
            <ul className="mt-3 space-y-1 text-red-700">
              <li>• CA 19-9 elevated and trending upward (85 U/mL, normal &lt;37)</li>
              <li>• CEA above normal range (5.1 ng/mL, normal &lt;3.0)</li>
              <li>• Pancreatic enzymes showing consistent elevation</li>
              <li>• Weight loss pattern observed</li>
            </ul>
            <p className="mt-3 text-red-900 font-medium">
              Recommend immediate gastroenterology consultation and advanced imaging.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalDataVisualization;