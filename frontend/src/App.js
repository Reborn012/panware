import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DraggableDashboard from './components/DraggableDashboard';
import PatientForm from './components/PatientForm';
import { apiService } from './services/api';

function App() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [viewMode, setViewMode] = useState('provider'); // 'provider' or 'patient'
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await apiService.getPatients();
      setPatients(data);
      if (data.length > 0) {
        setSelectedPatient(data[0]);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setShowForm(false);
  };

  const handleNewPatient = () => {
    setShowForm(true);
    setSelectedPatient(null);
  };

  const handleFormSubmit = (newPatientData) => {
    const newPatient = {
      id: patients.length + 1,
      ...newPatientData
    };
    setPatients([...patients, newPatient]);
    setSelectedPatient(newPatient);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        patients={patients}
        selectedPatient={selectedPatient}
        onPatientSelect={handlePatientSelect}
        onNewPatient={handleNewPatient}
      />

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Pancreatic Cancer Clinical Copilot
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Delivering the right medical information, to the right provider, at the right time
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('provider')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      viewMode === 'provider'
                        ? 'bg-white text-medical-primary shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Provider View
                  </button>
                  <button
                    onClick={() => setViewMode('patient')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      viewMode === 'patient'
                        ? 'bg-white text-medical-primary shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Patient View
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          {showForm ? (
            <PatientForm
              onSubmit={handleFormSubmit}
              onCancel={() => setShowForm(false)}
            />
          ) : selectedPatient ? (
            <DraggableDashboard
              patient={selectedPatient}
              viewMode={viewMode}
            />
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No patient selected</h3>
                <p className="mt-1 text-sm text-gray-500">Select a patient from the sidebar or add a new one</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;