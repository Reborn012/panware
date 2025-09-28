const express = require('express');
const AppointmentService = require('../services/appointmentService');

const router = express.Router();
const appointmentService = new AppointmentService();

// Get available appointment slots
router.get('/slots/:doctorId/:date', async (req, res) => {
    try {
        const { doctorId, date } = req.params;
        const { duration = 30 } = req.query;
        
        const slots = await appointmentService.getAvailableSlots(doctorId, date, parseInt(duration));
        
        res.json({
            success: true,
            slots: slots.filter(slot => slot.available),
            date,
            doctorId
        });
    } catch (error) {
        console.error('Get slots error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Book an appointment
router.post('/book', async (req, res) => {
    try {
        const appointmentData = req.body;
        
        // Validate required fields
        const required = ['patientId', 'patientName', 'patientEmail', 'doctorId', 'doctorName', 'startTime', 'endTime', 'reason'];
        const missing = required.filter(field => !appointmentData[field]);
        
        if (missing.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Missing required fields: ${missing.join(', ')}`
            });
        }

        const result = await appointmentService.bookAppointment(appointmentData);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        console.error('Book appointment error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get patient appointments
router.get('/patient/:patientId', async (req, res) => {
    try {
        const { patientId } = req.params;
        const appointments = await appointmentService.getPatientAppointments(patientId);
        
        res.json({
            success: true,
            appointments
        });
    } catch (error) {
        console.error('Get patient appointments error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Send report summary to doctor
router.post('/send-report-summary', async (req, res) => {
    try {
        const { patientId, reportData, doctorEmail } = req.body;
        
        if (!patientId || !reportData || !doctorEmail) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: patientId, reportData, doctorEmail'
            });
        }

        const result = await appointmentService.sendReportSummaryToDoctor(patientId, reportData, doctorEmail);
        
        res.json(result);
    } catch (error) {
        console.error('Send report summary error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get mock doctor list for testing
router.get('/doctors', (req, res) => {
    const mockDoctors = [
        {
            id: 'dr_chen_001',
            name: 'Dr. Sarah Chen',
            specialty: 'Oncology',
            subSpecialty: 'Pancreatic Cancer',
            email: 'dr.chen@hospital.com',
            availability: 'Mon-Fri 9AM-5PM'
        },
        {
            id: 'dr_rodriguez_002',
            name: 'Dr. Michael Rodriguez',
            specialty: 'Gastroenterology',
            subSpecialty: 'Pancreatic Disorders',
            email: 'dr.rodriguez@hospital.com',
            availability: 'Tue-Thu 10AM-6PM'
        },
        {
            id: 'dr_wang_003',
            name: 'Dr. Lisa Wang',
            specialty: 'Internal Medicine',
            subSpecialty: 'Preventive Care',
            email: 'dr.wang@hospital.com',
            availability: 'Mon-Wed-Fri 8AM-4PM'
        }
    ];

    res.json({
        success: true,
        doctors: mockDoctors
    });
});

module.exports = router;