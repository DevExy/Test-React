import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

function TabSwitchWarning({ clearWarning, onTimeout }) {
  const [countdown, setCountdown] = useState(4); // Start at 4 seconds

  // Countdown timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeout(); // Trigger submission when countdown reaches 0
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onTimeout]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 20 }}
        className="bg-white rounded-xl p-6 max-w-sm shadow-2xl text-center"
      >
        <h2 className="text-xl font-bold text-red-600 mb-4">Warning!</h2>
        <p className="text-gray-600 mb-4">
          Switching tabs or losing focus during the exam is not allowed. Please stay on this page.
        </p>
        <p className="text-red-500 font-semibold mb-6">
          Submitting in: {countdown} seconds
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={clearWarning}
          className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-all duration-300 font-medium"
        >
          Got it!
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default TabSwitchWarning;