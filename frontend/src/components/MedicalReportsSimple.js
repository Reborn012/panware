import React, { useState } from 'react';
import { FileText, Upload, BarChart3, Calendar, AlertCircle, CheckCircle, Mail, MessageCircle } from 'lucide-react';
import { Button } from './ui/Button';
import MedicalDataVisualization from './MedicalDataVisualization';
import PlainLanguageExplanation from './PlainLanguageExplanation';

const MedicalReportsSimple = ({ patientId, patientData }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadResult, setUploadResult] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('report', file);
      formData.append('patientId', patientId);
      formData.append('reportType', 'medical_report');
      formData.append('sessionId', 'session_' + Date.now());

      const response = await fetch('http://localhost:5000/api/reports/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success !== false) {
        setUploadResult(result);
        setActiveTab('summary');
      } else {
        alert('Upload failed: ' + result.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const renderUploadTab = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Upload className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900 mb-2">Upload Medical Report</h2>
        <p className="text-stone-600 mb-6">
          Upload PDFs, images, or text files for AI-powered analysis
        </p>
      </div>

      <div className="bg-white rounded-xl border-2 border-dashed border-stone-300 hover:border-blue-400 transition-colors duration-200">
        <label htmlFor="file-upload" className="cursor-pointer block p-8">
          <div className="text-center">
            <Upload className="w-12 h-12 text-stone-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-stone-900 mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-sm text-stone-600">
              PDF, PNG, JPG, or TXT files (up to 50MB)
            </p>
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.txt,.tiff"
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {uploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <div>
              <p className="text-blue-800 font-medium">Processing your report...</p>
              <p className="text-blue-600 text-sm">
                Using OCR and AI to extract and analyze medical content
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-stone-50 rounded-lg p-4 text-sm text-stone-600">
        <h4 className="font-medium mb-2">Supported Features:</h4>
        <ul className="space-y-1">
          <li>• OCR text extraction from images and PDFs</li>
          <li>• AI-powered medical content analysis</li>
          <li>• Structured data extraction (lab results, vitals)</li>
          <li>• Plain language explanations</li>
          <li>• Interactive data visualizations</li>
        </ul>
      </div>
    </div>
  );

  const renderSummaryTab = () => {
    if (!uploadResult) {
      return (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-stone-400 mx-auto mb-4" />
          <p className="text-stone-600">No reports uploaded yet</p>
          <Button
            onClick={() => setActiveTab('upload')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Upload a Report
          </Button>
        </div>
      );
    }

    const { medicalSummary, fileName, processedAt, extractedText } = uploadResult;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-stone-900">Report Summary</h2>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setActiveTab('explain')}
              >
                Get Plain Explanation
              </Button>
              <Button
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => setActiveTab('visualize')}
              >
                View Charts
              </Button>
            </div>
          </div>

          <div className="bg-stone-50 rounded-lg p-3 mb-4 text-sm">
            <span className="font-medium">{fileName}</span>
            <span className="mx-2">•</span>
            <span>{new Date(processedAt).toLocaleString()}</span>
          </div>

          {medicalSummary && (
            <div className="space-y-4">
              {medicalSummary.urgentFindings && medicalSummary.urgentFindings.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <strong className="text-red-800">Urgent Findings</strong>
                  </div>
                  <ul className="list-disc list-inside text-red-700">
                    {medicalSummary.urgentFindings.map((finding, idx) => (
                      <li key={idx}>{finding}</li>
                    ))}
                  </ul>
                </div>
              )}

              {medicalSummary.plainLanguageExplanation && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-blue-900">Plain Language Summary</h4>
                  <p className="text-blue-800">{medicalSummary.plainLanguageExplanation}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {medicalSummary.diagnoses && medicalSummary.diagnoses.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
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

                {medicalSummary.riskFactors && medicalSummary.riskFactors.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
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
              </div>

              {medicalSummary.recommendations && medicalSummary.recommendations.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-green-900">Recommendations</h4>
                  <ul className="space-y-1">
                    {medicalSummary.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {extractedText && (
            <div className="mt-6 bg-stone-50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Extracted Text (Preview)</h4>
              <p className="text-sm text-stone-700 whitespace-pre-wrap">
                {extractedText.substring(0, 500)}...
              </p>
            </div>
          )}
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <strong className="text-green-800">Report Processed Successfully</strong>
          </div>
          <p className="text-green-700 text-sm">
            Your medical report has been analyzed with AI. You can now share this summary with your healthcare provider.
          </p>
        </div>
      </div>
    );
  };

  const renderExplainTab = () => {
    return (
      <div>
        <PlainLanguageExplanation
          reportData={uploadResult}
          patientData={patientData}
        />
      </div>
    );
  };

  const renderVisualizeTab = () => {
    return (
      <div>
        <MedicalDataVisualization
          patientData={patientData}
          reportData={uploadResult}
          timeRange="30d"
        />
      </div>
    );
  };

  const renderBookingTab = () => (
    <div className="text-center py-12">
      <Calendar className="w-16 h-16 text-stone-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-stone-900 mb-2">Appointment Booking</h3>
      <p className="text-stone-600 mb-6">Schedule follow-up appointments based on your report analysis</p>
      <Button className="bg-amber-600 hover:bg-amber-700 text-white">
        Coming Soon
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-blue-200">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-stone-900 mb-1">Medical Report Management</h1>
            <p className="text-stone-600">
              Upload, analyze, and visualize your medical reports with AI-powered insights
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 bg-white rounded-lg p-1 shadow-inner">
          <Button
            onClick={() => setActiveTab('upload')}
            variant={activeTab === 'upload' ? 'default' : 'ghost'}
            className={`flex-1 transition-all duration-200 ${
              activeTab === 'upload'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-stone-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
          <Button
            onClick={() => setActiveTab('summary')}
            variant={activeTab === 'summary' ? 'default' : 'ghost'}
            className={`flex-1 transition-all duration-200 ${
              activeTab === 'summary'
                ? 'bg-green-500 text-white shadow-md'
                : 'text-stone-600 hover:text-green-600 hover:bg-green-50'
            }`}
          >
            <FileText className="w-4 h-4 mr-2" />
            Summary
          </Button>
          <Button
            onClick={() => setActiveTab('explain')}
            variant={activeTab === 'explain' ? 'default' : 'ghost'}
            className={`flex-1 transition-all duration-200 ${
              activeTab === 'explain'
                ? 'bg-teal-500 text-white shadow-md'
                : 'text-stone-600 hover:text-teal-600 hover:bg-teal-50'
            }`}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Explain
          </Button>
          <Button
            onClick={() => setActiveTab('visualize')}
            variant={activeTab === 'visualize' ? 'default' : 'ghost'}
            className={`flex-1 transition-all duration-200 ${
              activeTab === 'visualize'
                ? 'bg-purple-500 text-white shadow-md'
                : 'text-stone-600 hover:text-purple-600 hover:bg-purple-50'
            }`}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Visualize
          </Button>
          <Button
            onClick={() => setActiveTab('booking')}
            variant={activeTab === 'booking' ? 'default' : 'ghost'}
            className={`flex-1 transition-all duration-200 ${
              activeTab === 'booking'
                ? 'bg-amber-500 text-white shadow-md'
                : 'text-stone-600 hover:text-amber-600 hover:bg-amber-50'
            }`}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Book Appointment
          </Button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'upload' && renderUploadTab()}
      {activeTab === 'summary' && renderSummaryTab()}
      {activeTab === 'explain' && renderExplainTab()}
      {activeTab === 'visualize' && renderVisualizeTab()}
      {activeTab === 'booking' && renderBookingTab()}
    </div>
  );
};

export default MedicalReportsSimple;