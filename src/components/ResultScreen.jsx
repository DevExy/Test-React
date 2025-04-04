import { motion } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaRedo } from 'react-icons/fa';

function ResultScreen({ examResults, timeLeft, resetExam, totalQuestions }) {
  if (!examResults) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 p-6"
      >
        <p className="text-red-500 font-semibold">No results available.</p>
      </motion.div>
    );
  }

  const { exam_name, correct_answers, wrong_answers, total_marks, obtained_marks, percentage, completed_at } =
    examResults;

  // Calculate time taken (assuming timeLeft is the remaining time in seconds)
  const timeTakenInSeconds = totalQuestions * 60 - timeLeft;
  const minutes = Math.floor(timeTakenInSeconds / 60);
  const seconds = timeTakenInSeconds % 60;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl mx-auto"
    >
      <h1 className="text-3xl font-bold text-green-800 mb-6 text-center">
        {exam_name} - Results
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Score Summary */}
        <div className="bg-green-50 p-4 rounded-xl shadow-inner">
          <h2 className="text-lg font-semibold text-green-700 mb-2">Score</h2>
          <p className="text-4xl font-bold text-green-800">
            {obtained_marks}/{total_marks}
          </p>
          <p className="text-sm text-gray-600 mt-1">Percentage: {percentage}%</p>
        </div>

        {/* Answers Breakdown */}
        <div className="bg-blue-50 p-4 rounded-xl shadow-inner">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">Answers</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaCheckCircle className="text-green-500 mr-2" />
              <span className="text-green-800 font-medium">Correct: {correct_answers}</span>
            </div>
            <div className="flex items-center">
              <FaTimesCircle className="text-red-500 mr-2" />
              <span className="text-red-800 font-medium">Wrong: {wrong_answers}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Details */}
      <div className="space-y-4 mb-8">
        <div className="flex justify-between text-gray-700">
          <span className="font-medium">Total Questions:</span>
          <span>{totalQuestions}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span className="font-medium">Time Taken:</span>
          <span>{minutes}m {seconds}s</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span className="font-medium">Completed At:</span>
          <span>{new Date(completed_at).toLocaleString()}</span>
        </div>
      </div>

      {/* Restart Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={resetExam}
        className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg"
      >
        <FaRedo className="text-sm" />
        Restart Exam
      </motion.button>
    </motion.div>
  );
}

export default ResultScreen;