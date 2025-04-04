import { useState, useEffect } from 'react';
import { FaCheckCircle, FaRegClock, FaChevronRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import TabSwitchWarning from './TabSwitchWarning';

function ExamScreen({
  currentQuestionIndex,
  selectedOption,
  setSelectedOption,
  answers,
  setAnswers,
  timeLeft,
  handleOptionClick,
  handleNextQuestion,
  handlePrevQuestion,
  jumpToQuestion,
  onSubmit,
  showSubmitModal,
  setShowSubmitModal,
  transformedQuestions,
  warningCount,
  setWarningCount,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  const { examId, examName = 'Exam', durationMins = 60 } = state || {};
  const [localTimeLeft, setLocalTimeLeft] = useState(timeLeft || durationMins * 60);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [showKeyWarning, setShowKeyWarning] = useState(false);
  const [multipleMonitorsDetected, setMultipleMonitorsDetected] = useState(false);

  // Load answers from localStorage
  useEffect(() => {
    const savedAnswers = localStorage.getItem(`exam_${examId}_answers`);
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
  }, [examId, setAnswers]);

  // Timer functionality with timeout popup
  useEffect(() => {
    let timer;
    if (localTimeLeft > 0 && isFullScreen) {
      timer = setInterval(() => {
        setLocalTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            setShowTimeoutModal(true);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [localTimeLeft, isFullScreen]);

  // Detect alt-tab, screen switching, and focus loss
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isFullScreen) {
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
    };

    const handleBlur = () => {
      if (isFullScreen) {
        setShowWarning(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isFullScreen]);

  // Detect multiple monitors
  useEffect(() => {
    if (window.screen.availWidth > window.screen.width || window.screen.availHeight > window.screen.height) {
      setMultipleMonitorsDetected(true);
    }
  }, []);

  // Fullscreen and restrictions
  const enterFullScreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullScreen(true);
      document.addEventListener('contextmenu', preventDefault);
      document.addEventListener('keydown', handleKeyDown);
    } catch (err) {
      console.error('Failed to enter fullscreen:', err);
    }
  };

  const exitFullScreen = async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
        setIsFullScreen(false);
        document.removeEventListener('contextmenu', preventDefault);
        document.removeEventListener('keydown', handleKeyDown);
      } catch (err) {
        console.error('Failed to exit fullscreen:', err);
      }
    }
  };

  const preventDefault = (e) => {
    e.preventDefault();
    if (isFullScreen) {
      setShowKeyWarning(true);
      setWarningCount((prev) => {
        const newCount = prev + 1;
        if (newCount >= 4) {
          onSubmit();
          exitFullScreen();
          navigate('/results');
        }
        return newCount;
      });
    }
  };

  const handleKeyDown = (e) => {
    e.preventDefault();
    if (isFullScreen) {
      setShowKeyWarning(true);
      setWarningCount((prev) => {
        const newCount = prev + 1;
        if (newCount >= 4) {
          onSubmit();
          exitFullScreen();
          navigate('/results');
        }
        return newCount;
      });
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCustomOptionClick = (optionId) => {
    setSelectedOption(optionId);
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionId;
    setAnswers(newAnswers);
    localStorage.setItem(`exam_${examId}_answers`, JSON.stringify(newAnswers));
  };

  const handleWarningTimeout = () => {
    setShowWarning(false);
    onSubmit();
    exitFullScreen();
  };

  const clearWarning = () => {
    setShowWarning(false);
  };

  const clearKeyWarning = () => {
    setShowKeyWarning(false);
  };

  const handleTimeoutSubmit = () => {
    onSubmit();
    exitFullScreen();
    navigate('/results');
  };

  if (!transformedQuestions || transformedQuestions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-5xl flex items-center justify-center"
      >
        <p className="text-red-500 font-semibold">No questions available for this exam.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="exam"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-5xl flex relative"
    >
      <div className="flex-1 pr-8">
        {!isFullScreen && (
          <div className="flex flex-col items-center justify-center">
            <b className="mb-4 text-2xl">Online Exam Instructions</b>

            <ul className="list-disc list-outside space-y-4 text-left max-w-2xl">
              <li>
                <b>Technical Restrictions</b>
                <ul className="list-disc text-green-600 list-inside ml-4 mt-2 space-y-2">
                  <li><b>Browser Lockdown:</b> The exam is conducted in a secure browser mode. You cannot minimize, close, or switch tabs during the exam.</li>
                  <li><b>Right-Click Disabled:</b> Right-clicking is not allowed to prevent unfair means.</li>
                  <li><b>Inspect Element Blocked:</b> Developer tools (Inspect, Console, Elements, etc.) are disabled.</li>
                  <li><b>No Access to Builder Tools:</b> Any attempt to access unauthorized tools or settings is strictly prohibited.</li>
                  <li><b>Tab Switching Prohibited:</b> If you attempt to switch tabs or navigate away from the exam page, warnings will be issued. Multiple violations may lead to termination of your exam.</li>
                </ul>
              </li>

              <li>
                <b>Exam Rules & Guidelines</b>
                <ul className="list-disc text-green-600 list-inside ml-4 mt-2 space-y-2">
                  <li><b>Complete the Exam on Time:</b> Ensure you finish within the allocated time. There will be no extra time granted.</li>
                  <li><b>Multiple Warnings Can Lead to Disqualification:</b> Repeated violations (tab switching, suspicious activities, etc.) may result in automatic termination of your exam.</li>
                  <li><b>Stable Internet Connection:</b> Ensure you have a reliable internet connection before starting the exam. Any disconnection might not grant you extra time.</li>
                  <li><b>No External Help:</b> Do not use external resources, notes, or assistance from others.</li>
                  <li><b>Do Not Refresh or Reload:</b> Avoid refreshing or closing the browser, as it may lead to automatic submission or disqualification.</li>
                  <li><b>Check System Requirements:</b> Make sure your system meets the exam platform's technical requirements before starting.</li>
                </ul>
              </li>
            </ul>

            <div className="mt-6 text-center">
              <b>By proceeding with the exam, you agree to follow these rules. Any violation may result in disqualification.</b>
              <br />
              <b className="mt-2 block">Good luck! 🚀</b>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={enterFullScreen}
              className="mt-6 mb-6 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-all duration-300 font-medium"
            >
              Start Exam
            </motion.button>
          </div>
        )}

        {isFullScreen && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-green-800 tracking-tight">
                {examName} MCQ Challenge
              </h1>
              <div className="flex items-center">
                <div
                  className={`flex items-center p-2 rounded-lg ${
                    localTimeLeft < 60 ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-700'
                  }`}
                >
                  <FaRegClock className="mr-2" />
                  <span className="font-bold">{formatTime(localTimeLeft)}</span>
                </div>
              </div>
            </div>

            <div className="w-full h-3 bg-gray-200 rounded-full mb-8 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${((currentQuestionIndex + 1) / transformedQuestions.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <div className="mb-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestionIndex}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="text-sm font-medium text-green-600 block mb-2">
                    Question {currentQuestionIndex + 1} of {transformedQuestions.length}
                  </span>
                  <h2 className="text-xl font-semibold text-gray-900 leading-tight">
                    {transformedQuestions[currentQuestionIndex].text}
                  </h2>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="space-y-4 mb-8">
              <AnimatePresence>
                {transformedQuestions[currentQuestionIndex].options.map((option, idx) => (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCustomOptionClick(option.id)}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      selectedOption === option.id
                        ? 'border-green-500 bg-green-50 shadow-md'
                        : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          selectedOption === option.id
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className="text-gray-800 font-medium">{option.text}</span>
                    </div>
                    {selectedOption === option.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, type: 'spring' }}
                      >
                        <FaCheckCircle className="text-green-500" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="flex gap-4 mt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrevQuestion}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  currentQuestionIndex > 0
                    ? 'bg-white border-2 border-green-500 text-green-600 hover:bg-green-50 shadow-md'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={
                  currentQuestionIndex < transformedQuestions.length - 1
                    ? handleNextQuestion
                    : () => setShowSubmitModal(true)
                }
                className="flex-1 py-3 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg"
              >
                {currentQuestionIndex < transformedQuestions.length - 1 ? 'Next' : 'Finish'}{' '}
                <FaChevronRight className="text-sm" />
              </motion.button>
            </div>
          </>
        )}
      </div>

      {isFullScreen && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-64 bg-gradient-to-b from-green-50 to-white rounded-xl shadow-inner border border-green-100 p-6"
        >
          <h3 className="text-green-800 font-semibold mb-6 text-center">Question Navigator</h3>

          <div className="grid grid-cols-3 gap-3">
            {transformedQuestions.map((_, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => jumpToQuestion(index)}
                className={`w-12 h-12 rounded-lg flex items-center justify-center text-sm font-medium shadow-sm transition-all ${
                  index === currentQuestionIndex
                    ? 'bg-green-500 text-white shadow-md ring-2 ring-green-300 ring-offset-2'
                    : answers[index] !== null
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-300 text-white border border-gray-200'
                }`}
              >
                {index + 1}
              </motion.button>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-green-100">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600">Completed:</div>
              <div className="text-sm font-medium text-green-700">
                {answers.filter((a) => a !== null).length}/{transformedQuestions.length}
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-green-500 h-2 rounded-full"
                initial={{ width: '0%' }}
                animate={{
                  width: `${(answers.filter((a) => a !== null).length / transformedQuestions.length) * 100}%`,
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-green-100">
            <div className="text-sm text-gray-600 mb-2">Legend:</div>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-sm mr-2"></div>
                <span className="text-xs text-gray-600">Current Question</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-100 rounded-sm mr-2"></div>
                <span className="text-xs text-gray-600">Answered</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-300 border border-gray-200 rounded-sm mr-2"></div>
                <span className="text-xs text-gray-600">Unanswered</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab Switch Warning */}
      <AnimatePresence>
        {showWarning && (
          <TabSwitchWarning
            clearWarning={clearWarning}
            onTimeout={handleWarningTimeout}
          />
        )}
      </AnimatePresence>

      {/* Key Press Warning */}
      <AnimatePresence>
        {showKeyWarning && (
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
                Keyboard usage is not allowed during the exam. Warning {warningCount} of 3.
              </p>
              <p className="text-red-500 font-semibold mb-6">
                At 4 warnings, the exam will be automatically submitted.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearKeyWarning}
                className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-all duration-300 font-medium"
              >
                OK
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Multiple Monitors Warning */}
      <AnimatePresence>
        {multipleMonitorsDetected && isFullScreen && (
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
              <p className="text-gray-600 mb-6">
                Multiple monitors detected. Please use only one monitor for the exam.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMultipleMonitorsDetected(false)}
                className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-all duration-300 font-medium"
              >
                OK
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Modal */}
      <AnimatePresence>
        {showSubmitModal && (
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
              <h2 className="text-xl font-bold text-green-800 mb-4">Finish Exam?</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to submit your answers and end the exam?
              </p>
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    onSubmit();
                    exitFullScreen();
                  }}
                  className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-all duration-300 font-medium"
                >
                  Yes, Submit
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSubmitModal(false)}
                  className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-all duration-300 font-medium"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeout Modal */}
      <AnimatePresence>
        {showTimeoutModal && (
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
              <h2 className="text-xl font-bold text-red-600 mb-4">Time's Up!</h2>
              <p className="text-gray-600 mb-6">
                Your exam time has ended. Click Submit to view your results.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleTimeoutSubmit}
                className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-all duration-300 font-medium"
              >
                Submit
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default ExamScreen;