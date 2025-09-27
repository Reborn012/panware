import React, { useState } from 'react';

const PatientForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    sex: 'female',
    chief_complaint: '',
    symptoms: [],
    family_history: [],
    smoking_history: false,
    medical_history: [],
    current_medications: [],
    labs: {
      ca19_9: '',
      glucose: '',
      lipase: ''
    }
  });

  const symptomOptions = [
    'abdominal_pain',
    'weight_loss',
    'new_onset_diabetes',
    'back_pain',
    'fatigue',
    'nausea',
    'vomiting',
    'frequent_urination'
  ];

  const familyHistoryOptions = [
    'pancreatic_cancer',
    'diabetes',
    'colon_cancer',
    'breast_cancer',
    'ovarian_cancer'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('labs.')) {
      const labField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        labs: {
          ...prev.labs,
          [labField]: type === 'number' ? parseFloat(value) || 0 : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleCheckboxGroupChange = (field, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const processedData = {
      ...formData,
      age: parseInt(formData.age),
      presentation_summary: `${formData.age}-year-old ${formData.sex} presenting with ${formData.chief_complaint.replace('_', ' ')}.`
    };

    onSubmit(processedData);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">New Patient</h2>
          <button
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age *
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                required
                min="0"
                max="120"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sex *
              </label>
              <select
                name="sex"
                value={formData.sex}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-primary"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chief Complaint *
            </label>
            <select
              name="chief_complaint"
              value={formData.chief_complaint}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-primary"
            >
              <option value="">Select chief complaint...</option>
              <option value="abdominal_pain">Abdominal Pain</option>
              <option value="weight_loss">Weight Loss</option>
              <option value="diabetes">New Diabetes</option>
              <option value="routine_checkup">Routine Checkup</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Symptoms
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {symptomOptions.map(symptom => (
                <label key={symptom} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.symptoms.includes(symptom)}
                    onChange={(e) => handleCheckboxGroupChange('symptoms', symptom, e.target.checked)}
                    className="rounded border-gray-300 text-medical-primary focus:ring-medical-primary"
                  />
                  <span className="text-sm text-gray-700 capitalize">
                    {symptom.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Family History
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {familyHistoryOptions.map(condition => (
                <label key={condition} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.family_history.includes(condition)}
                    onChange={(e) => handleCheckboxGroupChange('family_history', condition, e.target.checked)}
                    className="rounded border-gray-300 text-medical-primary focus:ring-medical-primary"
                  />
                  <span className="text-sm text-gray-700 capitalize">
                    {condition.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="smoking_history"
                checked={formData.smoking_history}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-medical-primary focus:ring-medical-primary"
              />
              <span className="text-sm font-medium text-gray-700">Smoking History</span>
            </label>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Laboratory Values</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CA 19-9 (U/mL)
                </label>
                <input
                  type="number"
                  name="labs.ca19_9"
                  value={formData.labs.ca19_9}
                  onChange={handleInputChange}
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Glucose (mg/dL)
                </label>
                <input
                  type="number"
                  name="labs.glucose"
                  value={formData.labs.glucose}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lipase (U/L)
                </label>
                <input
                  type="number"
                  name="labs.lipase"
                  value={formData.labs.lipase}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-primary"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Add Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientForm;