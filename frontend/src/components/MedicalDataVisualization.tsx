import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { TrendingUp, TrendingDown, Activity, AlertTriangle } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const MedicalDataVisualization = ({ reportData, reportId }) => {
  const [visualizations, setVisualizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (reportData?.medicalSummary || reportId) {
      generateVisualizations();
    }
  }, [reportData, reportId]);

  const generateVisualizations = async () => {
    try {
      setLoading(true);
      
      let vizData;
      if (reportId) {
        // Fetch visualization data from API
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/reports/${reportId}/visualization`);
        const result = await response.json();
        vizData = result.visualizations || [];
      } else {
        // Generate from local reportData
        vizData = generateLocalVisualizations(reportData);
      }

      setVisualizations(vizData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateLocalVisualizations = (data) => {
    const vizData = [];

    // Lab Results Visualization
    if (data.medicalSummary?.labResults && data.medicalSummary.labResults.length > 0) {
      const labData = data.medicalSummary.labResults.map(lab => ({
        name: lab.name || lab.test || 'Unknown Test',
        value: parseFloat(lab.value) || 0,
        normalMin: parseFloat(lab.normalRange?.split('-')[0]) || 0,
        normalMax: parseFloat(lab.normalRange?.split('-')[1]) || 0,
        status: lab.status || 'normal'
      }));

      vizData.push({
        type: 'bar',
        title: 'Laboratory Results',
        data: {
          labels: labData.map(item => item.name),
          datasets: [{
            label: 'Current Value',
            data: labData.map(item => item.value),
            backgroundColor: labData.map(item => 
              item.status === 'high' ? 'rgba(239, 68, 68, 0.8)' :
              item.status === 'low' ? 'rgba(245, 158, 11, 0.8)' :
              'rgba(34, 197, 94, 0.8)'
            ),
            borderColor: labData.map(item => 
              item.status === 'high' ? 'rgba(239, 68, 68, 1)' :
              item.status === 'low' ? 'rgba(245, 158, 11, 1)' :
              'rgba(34, 197, 94, 1)'
            ),
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                afterLabel: (context) => {
                  const item = labData[context.dataIndex];
                  return item.normalRange ? `Normal: ${item.normalRange}` : '';
                }
              }
            }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }

    // Risk Factors Pie Chart
    if (data.medicalSummary?.riskFactors && data.medicalSummary.riskFactors.length > 0) {
      const riskData = data.medicalSummary.riskFactors.map((factor, index) => ({
        name: typeof factor === 'string' ? factor : factor.name || `Risk Factor ${index + 1}`,
        value: typeof factor === 'object' && factor.severity ? factor.severity : 1
      }));

      const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#f97316'];

      vizData.push({
        type: 'pie',
        title: 'Risk Factors Distribution',
        data: {
          labels: riskData.map(item => item.name),
          datasets: [{
            data: riskData.map(item => item.value),
            backgroundColor: colors.slice(0, riskData.length),
            borderColor: colors.slice(0, riskData.length).map(color => color),
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
    }

    // Vital Signs Timeline (if available)
    if (data.structuredData) {
      const vitalSigns = [];
      
      if (data.structuredData.bloodPressure) {
        const bpData = data.structuredData.bloodPressure.map((bp, index) => {
          const values = bp.value.split('/');
          return {
            time: `Reading ${index + 1}`,
            systolic: parseInt(values[0]) || 0,
            diastolic: parseInt(values[1]) || 0
          };
        });

        vizData.push({
          type: 'line',
          title: 'Blood Pressure Trend',
          data: {
            labels: bpData.map(item => item.time),
            datasets: [
              {
                label: 'Systolic',
                data: bpData.map(item => item.systolic),
                borderColor: 'rgba(239, 68, 68, 1)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4
              },
              {
                label: 'Diastolic',
                data: bpData.map(item => item.diastolic),
                borderColor: 'rgba(59, 130, 246, 1)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4
              }
            ]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { position: 'top' }
            },
            scales: {
              y: { 
                beginAtZero: true,
                suggestedMax: 200
              }
            }
          }
        });
      }
    }

    return vizData;
  };

  const renderChart = (viz) => {
    const commonProps = {
      data: viz.data,
      options: viz.options
    };

    switch (viz.type) {
      case 'bar':
        return <Bar {...commonProps} />;
      case 'line':
        return <Line {...commonProps} />;
      case 'pie':
        return <Pie {...commonProps} />;
      default:
        return <div className="text-center text-gray-500">Unsupported chart type</div>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'high':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'low':
        return <TrendingDown className="w-4 h-4 text-yellow-500" />;
      default:
        return <Activity className="w-4 h-4 text-green-500" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">Generating visualizations...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-red-600">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Error loading visualizations: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (visualizations.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-4" />
            <p>No visualization data available for this report.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Medical Data Visualization
          </CardTitle>
          <CardDescription>
            Interactive charts and graphs generated from your medical report
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="0" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {visualizations.map((viz, index) => (
            <TabsTrigger key={index} value={index.toString()}>
              {viz.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {visualizations.map((viz, index) => (
          <TabsContent key={index} value={index.toString()}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{viz.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ height: '400px', display: 'flex', alignItems: 'center' }}>
                  {renderChart(viz)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Key Insights Summary */}
      {reportData?.medicalSummary?.labResults && (
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportData.medicalSummary.labResults.map((lab, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(lab.status)}
                    <span className="font-medium">{lab.name || `Test ${index + 1}`}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{lab.value}</div>
                    <Badge variant={
                      lab.status === 'high' ? 'destructive' :
                      lab.status === 'low' ? 'secondary' : 'default'
                    }>
                      {lab.status || 'normal'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MedicalDataVisualization;