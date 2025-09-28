import React, { useState } from 'react';
import {
  MessageCircle,
  User,
  Clock,
  Heart,
  Brain,
  AlertTriangle,
  CheckCircle,
  Info,
  Loader,
  Copy,
  Download,
  Mail
} from 'lucide-react';
import { Button } from './ui/Button';

const PlainLanguageExplanation = ({ reportData, patientData }) => {
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const generateExplanation = async () => {
    if (!reportData || !reportData.extractedText) {
      setError('No report data available for explanation');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/reports/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportText: reportData.extractedText,
          patientAge: patientData?.age || 'Not specified',
          patientName: patientData?.name || 'Patient'
        })
      });

      const result = await response.json();

      if (result.success) {
        setExplanation(result.explanation);
      } else {
        setError(result.error || 'Failed to generate explanation');
      }
    } catch (err) {
      console.error('Explanation generation error:', err);
      setError('Failed to connect to explanation service');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!explanation) return;

    try {
      await navigator.clipboard.writeText(explanation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const downloadExplanation = () => {
    if (!explanation) return;

    const blob = new Blob([explanation], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical-explanation-${patientData?.name || 'patient'}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareByEmail = () => {
    if (!explanation) return;

    const subject = `Medical Report Explanation for ${patientData?.name || 'Patient'}`;
    const body = explanation;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 shadow-sm border border-green-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Plain Language Explanation</h2>
              <p className="text-gray-600">
                Get your medical report explained in simple, easy-to-understand language
              </p>
            </div>
          </div>

          {!explanation && (
            <Button
              onClick={generateExplanation}
              disabled={loading || !reportData?.extractedText}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Explain My Report
                </>
              )}
            </Button>
          )}
        </div>

        {/* Patient Info */}
        {patientData && (
          <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200">
            <User className="w-5 h-5 text-gray-500" />
            <div className="text-sm">
              <span className="font-medium text-gray-900">
                {patientData.name || 'Patient'}
              </span>
              {patientData.age && (
                <span className="text-gray-600 ml-2">
                  • Age: {patientData.age}
                </span>
              )}
              <span className="text-gray-500 ml-2">
                • Report generated {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="font-medium text-red-800">Error</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
          <Button
            onClick={generateExplanation}
            className="mt-3 bg-red-600 hover:bg-red-700 text-white"
            size="sm"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-center space-x-3">
            <Loader className="w-6 h-6 text-blue-600 animate-spin" />
            <div className="text-center">
              <p className="text-blue-800 font-medium">Generating your explanation...</p>
              <p className="text-blue-600 text-sm mt-1">
                Our AI is translating your medical report into plain language
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Explanation Content */}
      {explanation && (
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy Text'}
            </Button>

            <Button
              onClick={downloadExplanation}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>

            <Button
              onClick={shareByEmail}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Email
            </Button>

            <Button
              onClick={generateExplanation}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Brain className="w-4 h-4" />
              Regenerate
            </Button>
          </div>

          {/* Main Explanation */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Your Report Explained</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                Generated {new Date().toLocaleTimeString()}
              </div>
            </div>

            <div className="prose prose-gray max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {explanation}
              </div>
            </div>
          </div>

          {/* Important Reminders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium text-blue-900">Remember</h4>
              </div>
              <p className="text-blue-800 text-sm">
                This explanation is for educational purposes only. Always discuss your results with your healthcare provider for proper medical advice.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-green-900">Next Steps</h4>
              </div>
              <p className="text-green-800 text-sm">
                Share this explanation with your doctor during your next appointment. It can help you ask better questions about your health.
              </p>
            </div>
          </div>

          {/* Questions to Ask Your Doctor */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-purple-900">Questions to Ask Your Doctor</h3>
            </div>

            <div className="space-y-3 text-purple-800">
              <div className="flex items-start gap-2">
                <span className="font-medium text-purple-600">1.</span>
                <span>Can you explain what these results mean for my overall health?</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium text-purple-600">2.</span>
                <span>Are there any concerning findings I should know about?</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium text-purple-600">3.</span>
                <span>What follow-up tests or treatments might I need?</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium text-purple-600">4.</span>
                <span>How often should I have similar tests in the future?</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium text-purple-600">5.</span>
                <span>Are there lifestyle changes I should consider based on these results?</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Report State */}
      {!reportData && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Report Available</h3>
          <p className="text-gray-600">
            Upload a medical report first to get a plain language explanation.
          </p>
        </div>
      )}
    </div>
  );
};

export default PlainLanguageExplanation;