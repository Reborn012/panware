import { motion } from 'motion/react';
import { DollarSign, AlertCircle, CreditCard } from 'lucide-react';

interface InsuranceBillingProps {
  costEstimate: {
    min: number;
    max: number;
  };
  icdCodes: Array<{
    code: string;
    description: string;
  }>;
  cptCodes: Array<{
    code: string;
    description: string;
  }>;
  priorAuthRequired: boolean;
}

export function InsuranceBilling({ 
  costEstimate, 
  icdCodes, 
  cptCodes, 
  priorAuthRequired 
}: InsuranceBillingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-white border-2 border-stone-200 p-8 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
          <CreditCard className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl text-stone-900">Insurance & Billing</h2>
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <DollarSign className="w-4 h-4" />
            <span>Cost Estimate</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Cost Estimate */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-blue-50 p-6 border-2 border-blue-200"
          >
            <h3 className="text-stone-900 mb-3">Total Estimated Cost</h3>
            <motion.div
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-2xl text-stone-900"
            >
              ${costEstimate.min.toLocaleString()} - ${costEstimate.max.toLocaleString()}
            </motion.div>
          </motion.div>

          {/* Prior Authorization Alert */}
          {priorAuthRequired && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-yellow-50 border-2 border-yellow-200 p-4"
            >
              <div className="flex items-start gap-3">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                </motion.div>
                <div>
                  <h4 className="text-yellow-800 mb-1">Prior Authorization</h4>
                  <p className="text-sm text-yellow-700">
                    High-risk imaging may require pre-approval
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* ICD-10 Codes */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="text-stone-900 mb-4">ICD-10 Codes</h3>
            <div className="space-y-3">
              {icdCodes.map((code, index) => (
                <motion.div
                  key={code.code}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  className="flex items-center justify-between bg-stone-50 p-3 border border-stone-200"
                >
                  <span className="text-sm text-stone-700">{code.description}</span>
                  <motion.span
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 border border-blue-200 rounded-full"
                  >
                    {code.code}
                  </motion.span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CPT Codes */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h3 className="text-stone-900 mb-4">CPT Codes</h3>
            <div className="space-y-3">
              {cptCodes.map((code, index) => (
                <motion.div
                  key={code.code}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                  className="flex items-center justify-between bg-stone-50 p-3 border border-stone-200"
                >
                  <span className="text-sm text-stone-700">{code.description}</span>
                  <motion.span
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="text-xs bg-green-100 text-green-700 px-2 py-1 border border-green-200 rounded-full"
                  >
                    {code.code}
                  </motion.span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}