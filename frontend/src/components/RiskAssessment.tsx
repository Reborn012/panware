import { motion } from 'motion/react';
import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface RiskAssessmentProps {
  score: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  factors: string[];
}

export function RiskAssessment({ score, level, factors }: RiskAssessmentProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 500);
    return () => clearTimeout(timer);
  }, [score]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'text-red-700';
      case 'MEDIUM': return 'text-yellow-700';
      case 'LOW': return 'text-green-700';
      default: return 'text-stone-600';
    }
  };

  const getLevelBg = (level: string) => {
    switch (level) {
      case 'HIGH': return 'bg-red-50 border-red-200';
      case 'MEDIUM': return 'bg-yellow-50 border-yellow-200';
      case 'LOW': return 'bg-green-50 border-green-200';
      default: return 'bg-stone-50 border-stone-200';
    }
  };

  const getProgressColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'bg-red-600';
      case 'MEDIUM': return 'bg-yellow-600';
      case 'LOW': return 'bg-green-600';
      default: return 'bg-stone-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)" }}
      transition={{ duration: 0.4 }}
      className="bg-white/80 backdrop-blur-sm border-2 border-stone-200 p-6 shadow-lg rounded-xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-stone-900">Risk Assessment</h3>
      </div>

      <div className="mb-6">
        <motion.span
          className={`text-sm ${getLevelColor(level)} px-3 py-1 border ${getLevelBg(level)} rounded-full`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {level} RISK
        </motion.span>
        
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-stone-700">Score:</span>
          <motion.span
            className="text-3xl text-stone-900"
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            key={animatedScore}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {animatedScore}
          </motion.span>
        </div>
      </div>

      {/* Animated Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-stone-500 mb-2">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
        </div>
        <div className="w-full bg-stone-200 h-3 border border-stone-300 overflow-hidden">
          <motion.div
            className={`h-full ${getProgressColor(level)}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((score / 20) * 100, 100)}%` }}
            transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>

      <div>
        <h4 className="text-stone-900 mb-4">Risk Factors</h4>
        <div className="space-y-3">
          {factors.slice(0, 4).map((factor, index) => (
            <motion.div
              key={factor}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
              className="flex items-center gap-3 bg-stone-50 p-3 border border-stone-200"
            >
              <motion.div
                className="w-2 h-2 bg-red-500 rounded-full"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
              />
              <span className="text-sm text-stone-700">{factor}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}