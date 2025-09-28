import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { Upload, FileText, Image, AlertCircle, CheckCircle } from 'lucide-react';

const ReportUpload = ({ patientId, onUploadSuccess, onUploadError }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    await uploadFile(file);
  }, [patientId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.tiff'],
      'text/plain': ['.txt']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  const uploadFile = async (file) => {
    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('report', file);
      formData.append('patientId', patientId);
      formData.append('reportType', 'medical_report');

      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(Math.round(percentComplete));
        }
      });

      const response = await new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        };
        xhr.onerror = () => reject(new Error('Network error'));
        
        xhr.open('POST', `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/reports/upload`);
        xhr.send(formData);
      });

      if (response.success) {
        setUploadResult(response.data);
        onUploadSuccess && onUploadSuccess(response.data);
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (err) {
      setError(err.message);
      onUploadError && onUploadError(err.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (ext === 'pdf') return <FileText className="w-5 h-5" />;
    if (['png', 'jpg', 'jpeg', 'tiff'].includes(ext)) return <Image className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Medical Report
        </CardTitle>
        <CardDescription>
          Upload PDF files, medical images (PNG, JPG, TIFF), or text reports for AI analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!uploading && !uploadResult && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            {isDragActive ? (
              <p className="text-lg font-medium text-blue-600">Drop the file here...</p>
            ) : (
              <>
                <p className="text-lg font-medium mb-2">
                  Drag & drop a medical report here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Supports PDF, Images (PNG, JPG, TIFF), and text files up to 10MB
                </p>
              </>
            )}
          </div>
        )}

        {uploading && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="font-medium">Processing your report...</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-sm text-gray-600">
              {uploadProgress < 50 ? 'Uploading file...' : 
               uploadProgress < 80 ? 'Extracting text with OCR...' : 
               'Analyzing with AI...'}
            </p>
          </div>
        )}

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {uploadResult && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="space-y-2">
                <p className="font-medium">Report processed successfully!</p>
                <div className="flex items-center gap-2 text-sm">
                  {getFileIcon(uploadResult.fileName)}
                  <span>{uploadResult.fileName}</span>
                </div>
                <p className="text-xs">
                  Processed on {new Date(uploadResult.processedAt).toLocaleString()}
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {uploadResult && uploadResult.medicalSummary && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              AI Summary
            </h4>
            <div className="text-sm space-y-2">
              {uploadResult.medicalSummary.plainLanguageExplanation && (
                <div>
                  <strong>Plain Language Summary:</strong>
                  <p className="mt-1 text-gray-700">
                    {uploadResult.medicalSummary.plainLanguageExplanation}
                  </p>
                </div>
              )}
              
              {uploadResult.medicalSummary.urgentFindings && 
               uploadResult.medicalSummary.urgentFindings.length > 0 && (
                <Alert className="border-red-300 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription>
                    <strong className="text-red-800">Urgent Findings:</strong>
                    <ul className="list-disc list-inside mt-1 text-red-700">
                      {uploadResult.medicalSummary.urgentFindings.map((finding, idx) => (
                        <li key={idx}>{finding}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportUpload;