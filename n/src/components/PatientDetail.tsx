import { motion } from 'motion/react';
import { User, Calendar } from 'lucide-react';

interface PatientDetailProps {
  patient: {
    id: string;
    name: string;
    age: number;
    gender: string;
    description: string;
    contactInfo?: {
      phone?: string;
      email?: string;
      address?: string;
    };
  };
}

export function PatientDetail({ patient }: PatientDetailProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white border-2 border-stone-200 p-8 mb-8 shadow-sm"
    >
      <div className="flex items-start gap-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="w-16 h-16 bg-amber-800 rounded-full flex items-center justify-center"
        >
          <User className="w-8 h-8 text-white" />
        </motion.div>
        
        <div className="flex-1">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl text-stone-900 mb-2"
          >
            {patient.name}
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-2 text-stone-600 mb-4"
          >
            <Calendar className="w-4 h-4" />
            <span>{patient.age}-year-old {patient.gender}</span>
            <span className="mx-2">•</span>
            <span>{patient.id}</span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-stone-700 leading-relaxed bg-stone-50 p-4 border border-stone-200"
          >
            {patient.description}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="text-right"
        >
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-3 h-3 bg-green-500 rounded-full mb-2 ml-auto"
          />
          <span className="text-sm text-stone-600 bg-stone-100 px-3 py-1 border border-stone-200 rounded-full">
            Active
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}