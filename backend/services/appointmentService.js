const { google } = require('googleapis');
const nodemailer = require('nodemailer');

class AppointmentService {
    constructor() {
        this.calendar = null;
        this.transporter = null;
        this.initializeServices();
    }

    async initializeServices() {
        // Google Calendar setup
        try {
            const auth = new google.auth.GoogleAuth({
                keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY, // Path to service account key
                scopes: ['https://www.googleapis.com/auth/calendar']
            });

            this.calendar = google.calendar({ version: 'v3', auth });
        } catch (error) {
            console.warn('Google Calendar not configured:', error.message);
        }

        // Email setup
        try {
            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_APP_PASSWORD
                }
            });
        } catch (error) {
            console.warn('Email service not configured:', error.message);
        }
    }

    async getAvailableSlots(doctorId, date, duration = 30) {
        try {
            if (!this.calendar) {
                // Return mock data if Google Calendar is not configured
                return this.getMockAvailableSlots(date);
            }

            const startOfDay = new Date(date);
            startOfDay.setHours(9, 0, 0, 0); // 9 AM start
            
            const endOfDay = new Date(date);
            endOfDay.setHours(17, 0, 0, 0); // 5 PM end

            // Get existing events for the day
            const events = await this.calendar.events.list({
                calendarId: process.env.DOCTOR_CALENDAR_ID || 'primary',
                timeMin: startOfDay.toISOString(),
                timeMax: endOfDay.toISOString(),
                singleEvents: true,
                orderBy: 'startTime'
            });

            const existingEvents = events.data.items || [];
            const availableSlots = [];

            // Generate 30-minute slots from 9 AM to 5 PM
            const currentTime = new Date(startOfDay);
            while (currentTime < endOfDay) {
                const slotEnd = new Date(currentTime.getTime() + duration * 60000);
                
                // Check if this slot conflicts with existing events
                const hasConflict = existingEvents.some(event => {
                    const eventStart = new Date(event.start.dateTime || event.start.date);
                    const eventEnd = new Date(event.end.dateTime || event.end.date);
                    
                    return (currentTime < eventEnd && slotEnd > eventStart);
                });

                if (!hasConflict) {
                    availableSlots.push({
                        start: currentTime.toISOString(),
                        end: slotEnd.toISOString(),
                        available: true
                    });
                }

                currentTime.setMinutes(currentTime.getMinutes() + duration);
            }

            return availableSlots;
        } catch (error) {
            console.error('Error getting available slots:', error);
            return this.getMockAvailableSlots(date);
        }
    }

    getMockAvailableSlots(date) {
        const slots = [];
        const baseDate = new Date(date);
        
        // Generate slots from 9 AM to 5 PM
        for (let hour = 9; hour < 17; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const start = new Date(baseDate);
                start.setHours(hour, minute, 0, 0);
                
                const end = new Date(start.getTime() + 30 * 60000);
                
                slots.push({
                    start: start.toISOString(),
                    end: end.toISOString(),
                    available: Math.random() > 0.3 // 70% chance slot is available
                });
            }
        }
        
        return slots;
    }

    async bookAppointment(appointmentData) {
        try {
            const {
                patientId,
                patientName,
                patientEmail,
                doctorId,
                doctorName,
                startTime,
                endTime,
                reason,
                notes
            } = appointmentData;

            let calendarEventId = null;

            // Create calendar event if Google Calendar is configured
            if (this.calendar) {
                try {
                    const event = {
                        summary: `Medical Consultation - ${patientName}`,
                        description: `Patient: ${patientName}\nReason: ${reason}\nNotes: ${notes || 'N/A'}`,
                        start: {
                            dateTime: startTime,
                            timeZone: 'America/New_York'
                        },
                        end: {
                            dateTime: endTime,
                            timeZone: 'America/New_York'
                        },
                        attendees: [
                            { email: patientEmail, displayName: patientName }
                        ],
                        reminders: {
                            useDefault: false,
                            overrides: [
                                { method: 'email', minutes: 24 * 60 }, // 1 day before
                                { method: 'popup', minutes: 30 } // 30 minutes before
                            ]
                        }
                    };

                    const calendarResponse = await this.calendar.events.insert({
                        calendarId: process.env.DOCTOR_CALENDAR_ID || 'primary',
                        resource: event,
                        sendUpdates: 'all'
                    });

                    calendarEventId = calendarResponse.data.id;
                } catch (calendarError) {
                    console.error('Calendar booking error:', calendarError);
                }
            }

            // Save appointment to local storage
            const appointment = {
                id: Date.now().toString(),
                patientId,
                patientName,
                patientEmail,
                doctorId,
                doctorName,
                startTime,
                endTime,
                reason,
                notes,
                status: 'scheduled',
                calendarEventId,
                createdAt: new Date().toISOString()
            };

            // Save to mock database
            await this.saveAppointment(appointment);

            // Send confirmation emails
            await this.sendConfirmationEmail(appointment);

            return {
                success: true,
                appointment,
                message: 'Appointment booked successfully'
            };
        } catch (error) {
            console.error('Booking error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async saveAppointment(appointment) {
        const fs = require('fs').promises;
        const path = require('path');
        
        try {
            const appointmentsPath = path.join(__dirname, '../data/appointments.json');
            
            let appointments = [];
            try {
                const existingData = await fs.readFile(appointmentsPath, 'utf8');
                appointments = JSON.parse(existingData);
            } catch (error) {
                // File doesn't exist, start with empty array
            }
            
            appointments.push(appointment);
            await fs.writeFile(appointmentsPath, JSON.stringify(appointments, null, 2));
        } catch (error) {
            console.error('Error saving appointment:', error);
        }
    }

    async sendConfirmationEmail(appointment) {
        if (!this.transporter) {
            console.log('Email service not configured, skipping confirmation email');
            return;
        }

        try {
            const startTime = new Date(appointment.startTime).toLocaleString();
            
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: appointment.patientEmail,
                subject: 'Appointment Confirmation - Pancreatic Cancer Clinical Copilot',
                html: `
                    <h2>Appointment Confirmation</h2>
                    <p>Dear ${appointment.patientName},</p>
                    <p>Your appointment has been successfully scheduled:</p>
                    <ul>
                        <li><strong>Doctor:</strong> ${appointment.doctorName}</li>
                        <li><strong>Date & Time:</strong> ${startTime}</li>
                        <li><strong>Reason:</strong> ${appointment.reason}</li>
                        <li><strong>Duration:</strong> 30 minutes</li>
                    </ul>
                    <p><strong>Preparation Instructions:</strong></p>
                    <ul>
                        <li>Bring any recent medical reports or test results</li>
                        <li>Prepare a list of current medications</li>
                        <li>Write down any questions or concerns you'd like to discuss</li>
                    </ul>
                    <p>If you need to reschedule or cancel this appointment, please contact us at least 24 hours in advance.</p>
                    <p>Thank you for using our Pancreatic Cancer Clinical Copilot system.</p>
                    <p>Best regards,<br>Medical Care Team</p>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log('Confirmation email sent to:', appointment.patientEmail);
        } catch (error) {
            console.error('Error sending confirmation email:', error);
        }
    }

    async getPatientAppointments(patientId) {
        const fs = require('fs').promises;
        const path = require('path');
        
        try {
            const appointmentsPath = path.join(__dirname, '../data/appointments.json');
            const data = await fs.readFile(appointmentsPath, 'utf8');
            const appointments = JSON.parse(data);
            
            return appointments.filter(apt => apt.patientId === patientId);
        } catch (error) {
            console.error('Error getting patient appointments:', error);
            return [];
        }
    }

    async sendReportSummaryToDoctor(patientId, reportData, doctorEmail) {
        if (!this.transporter) {
            console.log('Email service not configured, skipping doctor summary email');
            return { success: false, error: 'Email service not configured' };
        }

        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: doctorEmail,
                subject: `Patient Report Summary - ${reportData.patientName || 'Patient ID: ' + patientId}`,
                html: `
                    <h2>Patient Report Summary</h2>
                    <p><strong>Patient:</strong> ${reportData.patientName || 'Patient ID: ' + patientId}</p>
                    <p><strong>Report Date:</strong> ${new Date(reportData.processedAt).toLocaleDateString()}</p>
                    <p><strong>Report Type:</strong> ${reportData.reportType || 'Medical Report'}</p>
                    
                    <h3>AI-Generated Summary:</h3>
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
                        ${reportData.medicalSummary?.plainLanguageExplanation || 'Summary not available'}
                    </div>
                    
                    <h3>Key Findings:</h3>
                    <ul>
                        ${(reportData.medicalSummary?.diagnoses || []).map(d => `<li>${d}</li>`).join('')}
                    </ul>
                    
                    <h3>Risk Factors:</h3>
                    <ul>
                        ${(reportData.medicalSummary?.riskFactors || []).map(r => `<li>${r}</li>`).join('')}
                    </ul>
                    
                    ${reportData.medicalSummary?.urgentFindings?.length ? 
                        `<h3 style="color: red;">Urgent Findings:</h3>
                         <ul>${reportData.medicalSummary.urgentFindings.map(f => `<li style="color: red;"><strong>${f}</strong></li>`).join('')}</ul>` 
                        : ''}
                    
                    <p><em>This summary was generated by our AI clinical copilot system. Please review the full report for complete details.</em></p>
                `
            };

            await this.transporter.sendMail(mailOptions);
            return { success: true, message: 'Summary sent to doctor successfully' };
        } catch (error) {
            console.error('Error sending summary to doctor:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = AppointmentService;