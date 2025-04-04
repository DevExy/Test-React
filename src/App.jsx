import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import WelcomeScreen from './components/WelcomeScreen';
import ExamScreen from './components/ExamScreen';
import ResultScreen from './components/ResultScreen';
import TabSwitchWarning from './components/TabSwitchWarning';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const { examId, examName = 'Exam', durationMins = 60 } = state || {};
  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [examCompleted, setExamCompleted] = useState(false);
  const [tabSwitchWarning, setTabSwitchWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(durationMins * 60);
  const [answers, setAnswers] = useState([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [transformedQuestions, setTransformedQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [examResults, setExamResults] = useState(null);
  const [warningCount, setWarningCount] = useState(0); // New state to track warnings

  // Fetch questions from API
  useEffect(() => {
    const fetchQuestions = async () => {
      const accessToken = localStorage.getItem('access_token');
      const tokenType = localStorage.getItem('token_type');
      if (!accessToken || !tokenType || !examId) {
        setError('Authentication required or invalid exam ID. Please log in.');
        setLoading(false);
        navigate('/');
        return;
      }
      const disableRightClick = (e) => {
        e.preventDefault();
        alert("Right-click is disabled for security reasons.");
      };
      document.addEventListener('contextmenu', disableRightClick);
    
      // Disable developer tools shortcuts
      const disableDevTools = (e) => {
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
          (e.ctrlKey && e.key === 'U')
        ) {
          e.preventDefault();
          alert("Developer tools are disabled during this session.");
        }
      };
      document.addEventListener('keydown', disableDevTools);
    
      // Detect if dev tools are open (basic method)
      const detectDevTools = () => {
        const threshold = 160; // Approximate width/height when dev tools are open
        if (
          window.outerWidth - window.innerWidth > threshold ||
          window.outerHeight - window.innerHeight > threshold
        ) {
          alert("Developer tools detected! This session will be terminated.");
          setIsClosed(true); // Close the page
        }
      };
      const devToolsInterval = setInterval(detectDevTools, 1000);
      // --
      try {
        const response = await fetch(`http://4.240.76.3:8000/exams/${examId}`, {
          method: 'GET',
          headers: {
            'Authorization': `${tokenType} ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Fetched questions:', data);
          const transformed = data.questions.map((q) => ({
            id: q.id,
            text: q.question_text,
            options: [
              { id: 'A', text: q.option_a },
              { id: 'B', text: q.option_b },
              { id: 'C', text: q.option_c },
              { id: 'D', text: q.option_d },
            ],
          }));
          setTransformedQuestions(transformed);
          const initialAnswers = new Array(transformed.length).fill(null);
          setAnswers(initialAnswers);

          const savedAnswers = Cookies.get(`exam_${examId}_answers`);
          if (savedAnswers) {
            const parsedAnswers = JSON.parse(savedAnswers);
            if (parsedAnswers.length === transformed.length) {
              setAnswers(parsedAnswers);
              setSelectedOption(parsedAnswers[currentQuestionIndex] || null);
            }
          }
        } else if (response.status === 403) {
          setError('Access denied. Please log in again.');
          localStorage.clear();
          navigate('/');
        } else {
          const errorData = await response.json();
          setError(errorData.detail || `Failed to load exam ${examId}.`);
        }
      } catch (error) {
        setError('Network error. Please check your connection.');
        console.error('Fetch exams error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      fetchQuestions();
    } else {
      setLoading(false);
    }
  }, [examId, navigate]);

  // Detect Tab Switching or Focus Loss
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (examStarted && !examCompleted && document.hidden) {
        setTabSwitchWarning(true);
      }
    };

    const handleBlur = () => {
      if (examStarted && !examCompleted) {
        setTabSwitchWarning(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [examStarted, examCompleted]);

  // Timer functionality
  useEffect(() => {
    let timer;
    if (examStarted && !examCompleted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examStarted, examCompleted, timeLeft]);

  const startExam = () => {
    setExamStarted(true);
  };

  const handleOptionClick = (optionId) => {
    setSelectedOption(optionId);
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionId;
    setAnswers(newAnswers);
    Cookies.set(`exam_${examId}_answers`, JSON.stringify(newAnswers), { expires: 1 });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < transformedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(answers[currentQuestionIndex + 1] || null);
    } else {
      setShowSubmitModal(true);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedOption(answers[currentQuestionIndex - 1] || null);
    }
  };

  const jumpToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    setSelectedOption(answers[index] || null);
  };

  const resetExam = () => {
    setExamStarted(false);
    setCurrentQuestionIndex(0);
    setExamCompleted(false);
    setSelectedOption(null);
    setTimeLeft(durationMins * 60);
    setAnswers(new Array(transformedQuestions.length).fill(null));
    setShowSubmitModal(false);
    setExamResults(null);
    setWarningCount(0); // Reset warning count
    Cookies.remove(`exam_${examId}_answers`);
    navigate('/user');
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setShowSubmitModal(false);
    setExamCompleted(true);

    const accessToken = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type');

    try {
      const payload = {
        exam_id: examId,
        answers: transformedQuestions
          .map((question, idx) => {
            const selectedOption = answers[idx];
            if (selectedOption) {
              return {
                question_id: question.id,
                selected_option: selectedOption,
              };
            }
            return null;
          })
          .filter((answer) => answer !== null),
      };
      console.log('Submit payload:', payload);

      const response = await fetch('http://4.240.76.3:8000/exams/submit', {
        method: 'POST',
        headers: {
          'Authorization': `${tokenType} ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Submit response:', data);
        setExamResults(data);
        localStorage.removeItem(`exam_${examId}_answers`);
      } else if (response.status === 403) {
        setError('Access denied. Please log in again.');
        localStorage.clear();
        navigate('/');
      } else if (response.status === 422) {
        const errorData = await response.json();
        setError(`Submission failed: ${errorData.detail || 'Invalid data format'}`);
      } else {
        const errorData = await response.json();
        setError(`Submission failed: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      setError('Network error during submission. Please check your connection.');
      console.error('Submit error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTabSwitchTimeout = () => {
    setTabSwitchWarning(false);
    handleSubmit();
  };

  if (loading || submitting) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 p-6"
      >
        <p className="text-green-800 font-semibold">
          {loading ? 'Loading exam...' : 'Submitting your answers...'}
        </p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-100">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 p-6">
      <AnimatePresence mode="wait">
        {!examStarted ? (
          <WelcomeScreen startExam={startExam} />
        ) : examCompleted ? (
          <ResultScreen
            examResults={examResults}
            timeLeft={timeLeft}
            resetExam={resetExam}
            totalQuestions={transformedQuestions.length}
          />
        ) : (
          <ExamScreen
            currentQuestionIndex={currentQuestionIndex}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            answers={answers}
            setAnswers={setAnswers}
            timeLeft={timeLeft}
            handleOptionClick={handleOptionClick}
            handleNextQuestion={handleNextQuestion}
            handlePrevQuestion={handlePrevQuestion}
            jumpToQuestion={jumpToQuestion}
            onSubmit={handleSubmit}
            showSubmitModal={showSubmitModal}
            setShowSubmitModal={setShowSubmitModal}
            transformedQuestions={transformedQuestions}
            warningCount={warningCount} // Pass warning count
            setWarningCount={setWarningCount} // Pass setWarningCount function
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {tabSwitchWarning && (
          <TabSwitchWarning
            clearWarning={() => setTabSwitchWarning(false)}
            onTimeout={handleTabSwitchTimeout}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;