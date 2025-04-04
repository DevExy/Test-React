// src/components/ExamCount.jsx
import { motion } from 'framer-motion';

const ExamCount = ({ darkMode, totalExams }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`w-80 h-36 rounded-3xl shadow-2xl border backdrop-blur-sm ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 text-white' 
          : 'bg-gradient-to-br from-white to-gray-50 border-green-100 text-gray-800'
      } flex flex-col items-center justify-center overflow-hidden`}
      whileHover={{
        y: -5,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Top gradient */}
      <div className="h-2 w-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500" />

      {/* Main content */}
      <div className="flex flex-col items-center justify-center flex-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-12 w-12 text-green-500 mb-2`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <p className={`text-lg font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
          Attended {totalExams || 2} {/* Use totalExams prop if provided */}
        </p>
      </div>

      {/* Bottom gradient */}
      <motion.div 
        className="h-1 w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-400"
        animate={{ 
          backgroundPosition: ['100% 50%', '0% 50%', '100% 50%'],
        }}
        transition={{ 
          duration: 5, 
          repeat: Infinity,
          ease: "linear"
        }}
        style={{ backgroundSize: '200% 200%' }}
      />
    </motion.div>
  );
};

export default ExamCount;