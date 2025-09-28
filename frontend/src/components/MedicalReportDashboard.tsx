import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/Button';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { 
  Upload, 
  BarChart3, 
  Calendar, 
  Mail, 
  FileText, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Send
} from 'lucide-react';

import ReportUpload from './ReportUpload';
import MedicalDataVisualization from './MedicalDataVisualization';
import AppointmentBooking from './AppointmentBooking';

const MedicalReportDashboard = ({ patientId, patientData }) => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upload');
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    fetchPatientReports();
  }, [patientId]);

  const fetchPatientReports = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/reports/patient/${patientId}`
      );
      const data = await response.json();
      
      if (data.success) {
        setReports(data.reports);
        if (data.reports.length > 0 && !selectedReport) {
          setSelectedReport(data.reports[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (reportData) => {
    setReports(prev => [reportData, ...prev]);
    setSelectedReport(reportData);
    setActiveTab('visualize');
  };

  const handleSendReportToDoctor = async (doctorEmail) => {
    if (!selectedReport) return;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/appointments/send-report-summary`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            patientId,
            reportData: {
              ...selectedReport,
              patientName: patientData?.name
            },
            doctorEmail
          })
        }
      );

      const result = await response.json();
      
      if (result.success) {
        setEmailSent(true);
        setTimeout(() => setEmailSent(false), 5000);
      }
    } catch (error) {
      console.error('Error sending report summary:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReportStatusColor = (report) => {
    if (report.medicalSummary?.urgentFindings?.length > 0) {
      return 'destructive';
    }
    if (report.medicalSummary?.riskFactors?.length > 2) {
      return 'secondary';
    }
    return 'default';
  };

  const renderReportsList = () => (
    <div className="space-y-3">
      {reports.map((report) => (
        <Card
          key={report.id}
          className={`cursor-pointer transition-colors ${
            selectedReport?.id === report.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
          }`}
          onClick={() => setSelectedReport(report)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{report.fileName}</span>
                  <Badge variant={getReportStatusColor(report)}>
                    {report.medicalSummary?.urgentFindings?.length > 0 ? 'Urgent' : 'Processed'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Uploaded: {formatDate(report.uploadedAt)}
                </p>
                {report.medicalSummary?.plainLanguageExplanation && (
                  <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                    {report.medicalSummary.plainLanguageExplanation.substring(0, 100)}...
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderReportSummary = () => {
    if (!selectedReport) {
      return (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4" />
          <p>Select a report to view summary and details</p>
        </div>
      );
    }

    const { medicalSummary } = selectedReport;

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Report Summary</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleSendReportToDoctor('doctor@example.com')}
                  className="flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Send to Doctor
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              {selectedReport.fileName} • {formatDate(selectedReport.processedAt)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emailSent && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Report summary sent to your doctor successfully!
                </AlertDescription>
              </Alert>
            )}

            {medicalSummary ? (
              <div className="space-y-4">
                {medicalSummary.plainLanguageExplanation && (
                  <div>
                    <h4 className="font-semibold mb-2">Plain Language Summary</h4>
                    <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">
                      {medicalSummary.plainLanguageExplanation}
                    </p>
                  </div>
                )}

                {medicalSummary.urgentFindings && medicalSummary.urgentFindings.length > 0 && (
                  <Alert className="border-red-300 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription>
                      <strong className="text-red-800">Urgent Findings:</strong>
                      <ul className="list-disc list-inside mt-1 text-red-700">
                        {medicalSummary.urgentFindings.map((finding, idx) => (
                          <li key={idx}>{finding}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {medicalSummary.diagnoses && medicalSummary.diagnoses.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Diagnoses</h4>
                      <ul className="space-y-1">
                        {medicalSummary.diagnoses.map((diagnosis, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            <span className="text-sm">{diagnosis}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {medicalSummary.symptoms && medicalSummary.symptoms.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Key Symptoms</h4>
                      <ul className="space-y-1">
                        {medicalSummary.symptoms.map((symptom, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                            <span className="text-sm">{symptom}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {medicalSummary.riskFactors && medicalSummary.riskFactors.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Risk Factors</h4>
                      <ul className="space-y-1">
                        {medicalSummary.riskFactors.map((factor, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                            <span className="text-sm">{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {medicalSummary.recommendations && medicalSummary.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Recommendations</h4>
                      <ul className="space-y-1">
                        {medicalSummary.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No medical summary available for this report
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading medical reports...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Medical Report Management</h1>
        <p className="text-gray-600">
          Upload, analyze, and visualize your medical reports with AI-powered insights
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="visualize" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Visualize
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Book Appointment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <ReportUpload 
            patientId={patientId}
            onUploadSuccess={handleUploadSuccess}
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Reports</CardTitle>
                <CardDescription>
                  {reports.length} report{reports.length !== 1 ? 's' : ''} uploaded
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reports.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4" />
                    <p>No reports uploaded yet</p>
                    <Button 
                      onClick={() => setActiveTab('upload')}
                      className="mt-2"
                      size="sm"
                    >
                      Upload Your First Report
                    </Button>
                  </div>
                ) : (
                  renderReportsList()
                )}
              </CardContent>
            </Card>

            <div>
              {renderReportSummary()}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="visualize" className="space-y-4">
          {selectedReport ? (
            <MedicalDataVisualization 
              reportData={selectedReport}
              reportId={selectedReport.id}
            />
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No Report Selected</h3>
                <p className="text-gray-600">
                  Please upload or select a report to view data visualizations
                </p>
                <Button 
                  onClick={() => setActiveTab(reports.length > 0 ? 'reports' : 'upload')}
                  className="mt-4"
                >
                  {reports.length > 0 ? 'Select Report' : 'Upload Report'}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <AppointmentBooking 
            patientId={patientId}
            patientData={patientData}
            onBookingSuccess={(appointment) => {
              console.log('Appointment booked:', appointment);
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MedicalReportDashboard;