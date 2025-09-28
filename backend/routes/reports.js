const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const ReportProcessor = require('../services/reportProcessor');

const router = express.Router();
const reportProcessor = new ReportProcessor();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/tiff',
        'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type. Please upload PDF, image, or text files.'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Upload and process medical report
router.post('/upload', upload.single('report'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        const { patientId, reportType } = req.body;
        const filePath = req.file.path;
        const fileName = req.file.originalname;
        
        // Determine file type
        let fileType;
        if (req.file.mimetype === 'application/pdf') {
            fileType = 'pdf';
        } else if (req.file.mimetype.startsWith('image/')) {
            fileType = 'image';
        } else if (req.file.mimetype === 'text/plain') {
            fileType = 'text';
        }

        console.log(`Processing ${fileName} (${fileType}) for patient ${patientId}`);

        // Process the report
        const result = await reportProcessor.processReport(filePath, fileType, fileName);
        
        if (result.success) {
            // Store the processed report (in a real app, save to database)
            const reportData = {
                id: Date.now().toString(),
                patientId,
                reportType,
                fileName,
                uploadedAt: new Date().toISOString(),
                ...result
            };

            // Save to mock database file
            const reportsPath = path.join(__dirname, '../data/reports.json');
            try {
                const existingReports = JSON.parse(await fs.readFile(reportsPath, 'utf8'));
                existingReports.push(reportData);
                await fs.writeFile(reportsPath, JSON.stringify(existingReports, null, 2));
            } catch (error) {
                // Create new reports file if it doesn't exist
                await fs.writeFile(reportsPath, JSON.stringify([reportData], null, 2));
            }

            res.json({
                success: true,
                reportId: reportData.id,
                message: 'Report processed successfully',
                data: reportData
            });
        } else {
            res.status(500).json(result);
        }

        // Clean up uploaded file
        try {
            await fs.unlink(filePath);
        } catch (cleanupError) {
            console.error('Failed to clean up uploaded file:', cleanupError);
        }

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get processed reports for a patient
router.get('/patient/:patientId', async (req, res) => {
    try {
        const { patientId } = req.params;
        const reportsPath = path.join(__dirname, '../data/reports.json');
        
        try {
            const reports = JSON.parse(await fs.readFile(reportsPath, 'utf8'));
            const patientReports = reports.filter(report => report.patientId === patientId);
            
            res.json({
                success: true,
                reports: patientReports
            });
        } catch (error) {
            res.json({
                success: true,
                reports: []
            });
        }
    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get specific report details
router.get('/:reportId', async (req, res) => {
    try {
        const { reportId } = req.params;
        const reportsPath = path.join(__dirname, '../data/reports.json');
        
        try {
            const reports = JSON.parse(await fs.readFile(reportsPath, 'utf8'));
            const report = reports.find(r => r.id === reportId);
            
            if (report) {
                res.json({
                    success: true,
                    report
                });
            } else {
                res.status(404).json({
                    success: false,
                    error: 'Report not found'
                });
            }
        } catch (error) {
            res.status(404).json({
                success: false,
                error: 'Report not found'
            });
        }
    } catch (error) {
        console.error('Get report error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Generate visualization data from report
router.get('/:reportId/visualization', async (req, res) => {
    try {
        const { reportId } = req.params;
        const reportsPath = path.join(__dirname, '../data/reports.json');
        
        const reports = JSON.parse(await fs.readFile(reportsPath, 'utf8'));
        const report = reports.find(r => r.id === reportId);
        
        if (!report) {
            return res.status(404).json({
                success: false,
                error: 'Report not found'
            });
        }

        // Extract visualization data from structured data
        const visualizationData = generateVisualizationData(report);
        
        res.json({
            success: true,
            visualizations: visualizationData
        });
    } catch (error) {
        console.error('Visualization error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

function generateVisualizationData(report) {
    const visualizations = [];
    
    // Lab results chart
    if (report.medicalSummary?.labResults && report.medicalSummary.labResults.length > 0) {
        visualizations.push({
            type: 'bar',
            title: 'Laboratory Results',
            data: report.medicalSummary.labResults.map(lab => ({
                label: lab.name || 'Unknown',
                value: parseFloat(lab.value) || 0,
                normalRange: lab.normalRange || 'Unknown',
                status: lab.status || 'normal'
            }))
        });
    }

    // Vital signs trend
    if (report.structuredData) {
        const vitalSigns = [];
        
        if (report.structuredData.bloodPressure) {
            vitalSigns.push({
                type: 'Blood Pressure',
                values: report.structuredData.bloodPressure.map(bp => bp.value)
            });
        }
        
        if (report.structuredData.heartRate) {
            vitalSigns.push({
                type: 'Heart Rate',
                values: report.structuredData.heartRate.map(hr => parseFloat(hr.value))
            });
        }
        
        if (vitalSigns.length > 0) {
            visualizations.push({
                type: 'line',
                title: 'Vital Signs Trend',
                data: vitalSigns
            });
        }
    }

    // Risk factors pie chart
    if (report.medicalSummary?.riskFactors && report.medicalSummary.riskFactors.length > 0) {
        visualizations.push({
            type: 'pie',
            title: 'Risk Factors Distribution',
            data: report.medicalSummary.riskFactors.map((factor, index) => ({
                label: factor.name || factor,
                value: factor.severity || 1,
                color: getColorForIndex(index)
            }))
        });
    }

    return visualizations;
}

function getColorForIndex(index) {
    const colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
    ];
    return colors[index % colors.length];
}

module.exports = router;