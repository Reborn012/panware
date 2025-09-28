import { motion } from 'motion/react';
import { Button } from './ui/Button';

interface Question {
  id: number;
  text: string;
  answered: boolean;
}

interface FollowUpQuestionsProps {
  questions: Question[];
  onAnswer: (questionId: number, answer: string) => void;
}

export function FollowUpQuestions({ questions, onAnswer }: FollowUpQuestionsProps) {
  const answeredCount = questions.filter(q => q.answered).length;
  const progressValue = (answeredCount / questions.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-white border-2 border-stone-200 p-6 shadow-sm"
    >
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-stone-900">Follow-up Questions</h3>
          <motion.span
            key={answeredCount}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-sm text-stone-600 bg-stone-100 px-3 py-1 border border-stone-200 rounded-full"
          >
            {answeredCount}/{questions.length}
          </motion.span>
        </div>
        
        <div className="bg-stone-200 h-2 border border-stone-300 overflow-hidden">
          <motion.div
            className="h-full bg-green-600"
            initial={{ width: 0 }}
            animate={{ width: `${progressValue}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={`p-4 border-2 transition-all duration-200 ${
              question.answered 
                ? 'bg-green-50 border-green-200' 
                : 'bg-stone-50 border-stone-200'
            }`}
          >
            <div className="mb-3">
              <div className="flex items-start gap-3">
                <motion.span
                  animate={question.answered ? 
                    { backgroundColor: '#16a34a', color: '#ffffff' } : 
                    { backgroundColor: '#f5f5f4', color: '#374151' }
                  }
                  className="inline-flex items-center justify-center w-6 h-6 text-sm border border-stone-300 rounded-full"
                >
                  {question.answered ? '✓' : question.id}
                </motion.span>
                <p className="text-sm text-stone-900 flex-1">
                  {question.text}
                </p>
              </div>
            </div>

            {!question.answered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex gap-2"
              >
                {['Yes', 'No', 'Unsure'].map((answer) => (
                  <motion.div
                    key={answer}
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                  >
                    <Button
                      variant={answer === 'Yes' ? 'default' : answer === 'No' ? 'destructive' : 'secondary'}
                      size="sm"
                      onClick={() => onAnswer(question.id, answer)}
                      className={`text-xs border-0 rounded-full ${
                        answer === 'Yes' ? 'bg-green-600 hover:bg-green-700' :
                        answer === 'No' ? 'bg-red-600 hover:bg-red-700' :
                        'bg-stone-400 hover:bg-stone-500 text-white'
                      }`}
                    >
                      {answer}
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {question.answered && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 text-sm text-green-700"
              >
                <span>Completed</span>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}