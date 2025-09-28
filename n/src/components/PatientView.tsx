import { motion } from 'motion/react';
import { CheckCircle } from 'lucide-react';
import { PatientAIChatbox } from './PatientAIChatbox';

interface PatientViewProps {
  patient: {
    name: string;
    age: number;
    symptoms: string[];
    condition: string;
  };
}

export function PatientView({ patient }: PatientViewProps) {
  const patientQuestions = [
    'Have you experienced any unexplained weight loss in the past 6 months?',
    'Does the pain radiate to your back or shoulder blades?',
    'Have you noticed any changes in your stool color or consistency?'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <motion.h1
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl text-stone-900 mb-4"
        >
          Hi {patient.name.split(' ')[0]} 👋
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-stone-600"
        >
          Here's what we learned from your visit today, explained in simple terms
        </motion.p>
      </motion.div>

      {/* Visit Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white border-2 border-stone-200 p-8 shadow-sm"
      >
        <h2 className="text-2xl text-stone-900 mb-8">Your Visit Summary</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* What you told us about */}
          <div>
            <h3 className="text-stone-900 mb-6">What you told us about</h3>
            <div className="space-y-4">
              {patient.symptoms.map((symptom, index) => (
                <motion.div
                  key={symptom}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-stone-700 capitalize">{symptom}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Your basic information */}
          <div>
            <h3 className="text-stone-900 mb-6">Your basic information</h3>
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="text-stone-700"
              >
                Age: {patient.age} years old
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="text-stone-700"
              >
                Main concern: {patient.condition.toLowerCase()}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI Health Assistant */}
      <PatientAIChatbox patientName={patient.name} />

      {/* Questions to think about */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white border-2 border-stone-200 p-8 shadow-sm"
      >
        <h2 className="text-2xl text-stone-900 mb-4">Questions to think about</h2>
        <p className="text-stone-600 mb-8">
          These questions can help you and your doctor understand your symptoms better:
        </p>
        
        <div className="space-y-6">
          {patientQuestions.map((question, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="bg-stone-50 p-6 border border-stone-200"
            >
              <div className="flex items-start gap-4">
                <span className="text-stone-900 text-lg">
                  {index + 1}.
                </span>
                <p className="text-stone-800 flex-1">{question}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 p-8"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-amber-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl text-amber-900 mb-4">
            We recommend some additional tests
          </h2>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-center space-y-4"
        >
          <p className="text-stone-700 max-w-2xl mx-auto">
            Based on your symptoms and medical information, we think it would be helpful to do some additional 
            tests to make sure everything is okay. This is a precautionary step to give you the best care possible.
          </p>
          
          <div className="border-t border-amber-300 pt-6 mt-6">
            <p className="text-amber-800">
              Your doctor will discuss the next steps with you and help schedule any needed appointments.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}