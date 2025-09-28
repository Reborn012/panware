import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Mail, Phone, Send } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';

const AppointmentBooking = ({ patientId, patientData, onBookingSuccess }) => {
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [appointmentData, setAppointmentData] = useState({
    patientName: patientData?.name || '',
    patientEmail: patientData?.email || '',
    patientPhone: patientData?.phone || '',
    reason: '',
    notes: ''
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDoctor, selectedDate]);

  const fetchDoctors = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/appointments/doctors`);
      const data = await response.json();
      
      if (data.success) {
        setDoctors(data.doctors);
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!selectedDoctor || !selectedDate) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/appointments/slots/${selectedDoctor.id}/${selectedDate}`
      );
      const data = await response.json();
      
      if (data.success) {
        setAvailableSlots(data.slots);
      }
    } catch (err) {
      console.error('Error fetching slots:', err);
      setError('Failed to load available time slots');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    try {
      setLoading(true);
      setError(null);

      const bookingData = {
        patientId,
        patientName: appointmentData.patientName,
        patientEmail: appointmentData.patientEmail,
        patientPhone: appointmentData.patientPhone,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        reason: appointmentData.reason,
        notes: appointmentData.notes
      };

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/appointments/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();
      
      if (result.success) {
        setSuccess(true);
        onBookingSuccess && onBookingSuccess(result.appointment);
      } else {
        throw new Error(result.error || 'Booking failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Select Doctor</label>
        <div className="grid grid-cols-1 gap-3">
          {doctors.map((doctor) => (
            <Card
              key={doctor.id}
              className={`cursor-pointer transition-colors ${
                selectedDoctor?.id === doctor.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedDoctor(doctor)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{doctor.name}</h3>
                    <p className="text-gray-600">{doctor.specialty}</p>
                    {doctor.subSpecialty && (
                      <Badge variant="secondary" className="mt-1">
                        {doctor.subSpecialty}
                      </Badge>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      Available: {doctor.availability}
                    </p>
                  </div>
                  <User className="w-8 h-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <div>
        <label htmlFor="date" className="block text-sm font-medium mb-2">
          Select Date
        </label>
        <Input
          id="date"
          type="date"
          min={getMinDate()}
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full"
        />
      </div>

      <Button 
        onClick={() => setStep(2)} 
        disabled={!selectedDoctor || !selectedDate}
        className="w-full"
      >
        Next: Choose Time
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">Available Time Slots</h3>
        <p className="text-sm text-gray-600 mb-4">
          {selectedDoctor.name} on {new Date(selectedDate).toLocaleDateString()}
        </p>
        
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading available slots...</p>
          </div>
        ) : availableSlots.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <Calendar className="w-8 h-8 mx-auto mb-2" />
            <p>No available slots for this date</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {availableSlots.map((slot, index) => (
              <Button
                key={index}
                variant={selectedSlot === slot ? "default" : "outline"}
                onClick={() => setSelectedSlot(slot)}
                className="flex items-center justify-center h-12"
              >
                <Clock className="w-4 h-4 mr-2" />
                {formatTime(slot.start)}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
          Back
        </Button>
        <Button 
          onClick={() => setStep(3)} 
          disabled={!selectedSlot}
          className="flex-1"
        >
          Next: Details
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="space-y-4">
        <div>
          <label htmlFor="patientName" className="block text-sm font-medium mb-2">
            Patient Name *
          </label>
          <Input
            id="patientName"
            value={appointmentData.patientName}
            onChange={(e) => setAppointmentData(prev => ({ ...prev, patientName: e.target.value }))}
            required
          />
        </div>

        <div>
          <label htmlFor="patientEmail" className="block text-sm font-medium mb-2">
            Email Address *
          </label>
          <Input
            id="patientEmail"
            type="email"
            value={appointmentData.patientEmail}
            onChange={(e) => setAppointmentData(prev => ({ ...prev, patientEmail: e.target.value }))}
            required
          />
        </div>

        <div>
          <label htmlFor="patientPhone" className="block text-sm font-medium mb-2">
            Phone Number
          </label>
          <Input
            id="patientPhone"
            type="tel"
            value={appointmentData.patientPhone}
            onChange={(e) => setAppointmentData(prev => ({ ...prev, patientPhone: e.target.value }))}
          />
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-medium mb-2">
            Reason for Visit *
          </label>
          <Input
            id="reason"
            value={appointmentData.reason}
            onChange={(e) => setAppointmentData(prev => ({ ...prev, reason: e.target.value }))}
            placeholder="e.g., Follow-up consultation, symptoms evaluation"
            required
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium mb-2">
            Additional Notes
          </label>
          <Textarea
            id="notes"
            value={appointmentData.notes}
            onChange={(e) => setAppointmentData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Any additional information you'd like to share..."
            rows={3}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
          Back
        </Button>
        <Button 
          onClick={handleBookAppointment}
          disabled={loading || !appointmentData.patientName || !appointmentData.patientEmail || !appointmentData.reason}
          className="flex-1"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Booking...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Book Appointment
            </>
          )}
        </Button>
      </div>
    </div>
  );

  if (success) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Appointment Booked Successfully!</h3>
          <p className="text-gray-600 mb-4">
            Your appointment with {selectedDoctor.name} has been scheduled for{' '}
            {new Date(selectedSlot.start).toLocaleDateString()} at{' '}
            {formatTime(selectedSlot.start)}.
          </p>
          <p className="text-sm text-gray-500">
            A confirmation email has been sent to {appointmentData.patientEmail}
          </p>
          <Button 
            onClick={() => {
              setStep(1);
              setSuccess(false);
              setSelectedDoctor(null);
              setSelectedDate('');
              setSelectedSlot(null);
            }}
            className="mt-4"
          >
            Book Another Appointment
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Book Appointment
        </CardTitle>
        <CardDescription>
          Schedule a consultation with one of our specialists
        </CardDescription>
        
        {/* Progress indicator */}
        <div className="flex items-center gap-2 mt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                step >= i ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {i}
              </div>
              {i < 3 && <div className={`w-8 h-0.5 ${step > i ? 'bg-blue-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </CardContent>
    </Card>
  );
};

export default AppointmentBooking;