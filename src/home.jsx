import { useNavigate } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

function Home() {
  const navigate = useNavigate();

  const handleStartExam = () => {
    navigate('/exam');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-green-800 mb-6 text-center tracking-tight">
          Welcome to Python MCQ Exam
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Ready to test your Python skills? Click below to start the exam!
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStartExam}
          className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition-all duration-300 shadow-lg"
        >
          Start Exam <FaArrowRight />
        </motion.button>
      </motion.div>
    </div>
  );
}

export default Home;