import React from 'react';

const Sidebar = ({ patients, selectedPatient, onPatientSelect, onNewPatient }) => {
  const getRiskColor = (patient) => {
    if (patient.symptoms?.includes('new_onset_diabetes') && patient.symptoms?.includes('weight_loss')) {
      return 'bg-red-100 border-red-200';
    } else if (patient.symptoms?.length > 1) {
      return 'bg-yellow-100 border-yellow-200';
    }
    return 'bg-green-100 border-green-200';
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Patients</h2>
          <button
            onClick={onNewPatient}
            className="btn-primary text-sm"
          >
            + New Patient
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {patients.map((patient) => (
          <div
            key={patient.id}
            onClick={() => onPatientSelect(patient)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
              selectedPatient?.id === patient.id
                ? 'ring-2 ring-medical-primary border-medical-primary'
                : getRiskColor(patient)
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                <p className="text-sm text-gray-600">Age {patient.age}, {patient.sex}</p>
                <p className="text-xs text-gray-500 mt-1 capitalize">
                  {patient.chief_complaint?.replace('_', ' ')}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-xs text-gray-500">ID: {patient.id}</div>
                {patient.symptoms?.length > 0 && (
                  <div className="text-xs text-gray-600 mt-1">
                    {patient.symptoms.length} symptoms
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              {patient.symptoms?.slice(0, 2).map((symptom, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {symptom.replace('_', ' ')}
                </span>
              ))}
              {patient.symptoms?.length > 2 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  +{patient.symptoms.length - 2} more
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          <p>Demo Mode - {patients.length} patients loaded</p>
          <p className="mt-1">Powered by Impiricus HackGT</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;