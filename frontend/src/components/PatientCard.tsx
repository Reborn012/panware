import { motion } from 'motion/react';

interface PatientCardProps {
  id: string;
  name: string;
  age: number;
  gender: string;
  condition: string;
  symptoms: string[];
  symptomsCount: number;
  isSelected: boolean;
  onClick: () => void;
}

export function PatientCard({ 
  id, 
  name, 
  age, 
  gender, 
  condition, 
  symptoms, 
  symptomsCount, 
  isSelected, 
  onClick 
}: PatientCardProps) {
  return (
    <motion.div
      layout
      whileHover={{ 
        y: -4, 
        boxShadow: "0 12px 30px rgba(0, 0, 0, 0.1)",
        scale: 1.02
      }}
      whileTap={{ y: 0, scale: 0.98 }}
      onClick={onClick}
      className={`
        cursor-pointer transition-all duration-300 p-5 border-2 rounded-xl backdrop-blur-sm
        ${isSelected 
          ? 'bg-gradient-to-br from-amber-50/90 to-orange-50/90 border-amber-300 shadow-xl shadow-amber-200/30' 
          : 'bg-white/80 border-stone-200 hover:border-amber-200 hover:bg-white/90'
        }
      `}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <motion.h3 
            className={`transition-colors ${isSelected ? 'text-amber-900' : 'text-stone-900'}`}
            layout
          >
            {name}
          </motion.h3>
          <p className="text-sm text-stone-600">
            {age}y • {gender}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-stone-500">{id}</span>
          <p className="text-xs text-stone-500">{symptomsCount} symptoms</p>
        </div>
      </div>
      
      <div className="mb-3">
        <motion.span
          layout
          className={`
            inline-block px-3 py-1 text-xs border
            ${isSelected 
              ? 'bg-amber-100 text-amber-800 border-amber-200' 
              : 'bg-stone-50 text-stone-700 border-stone-200'
            }
          `}
        >
          {condition}
        </motion.span>
      </div>
      
      <div className="flex flex-wrap gap-1">
        {symptoms.slice(0, 2).map((symptom, index) => (
          <motion.span
            key={symptom}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="text-xs px-2 py-1 bg-stone-100 border border-stone-200 text-stone-600 rounded-full"
          >
            {symptom}
          </motion.span>
        ))}
        {symptoms.length > 2 && (
          <span className="text-xs text-amber-700 cursor-pointer hover:underline">
            +{symptoms.length - 2}
          </span>
        )}
      </div>
    </motion.div>
  );
}