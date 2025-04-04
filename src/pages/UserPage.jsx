import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import SuccessPopup from '../components/SuccessPopup';
import InternetSpeed from '../components/InternetSpeed';
import ExamCount from '../components/ExamCount';

export default function UserPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || { username: 'Guest' };
  const accessToken = localStorage.getItem('access_token');
  const tokenType = localStorage.getItem('token_type');
  const [showSuccess, setShowSuccess] = useState(false);
  const [exams, setExams] = useState([]);
  const [examHistory, setExamHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedExam, setSelectedExam] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [showSettings, setShowSettings] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New exam available", time: "2 hours ago", read: false },
    { id: 2, message: "Your recent exam has been graded", time: "1 day ago", read: true }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const profileRef = useRef(null);

  const filteredExams = exams.filter(exam =>
    exam.exam_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (exam.description && exam.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
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
  // Fetch Exams on component mount
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await fetch('http://4.240.76.3:8000/exams/', {
          headers: {
            'Authorization': `${tokenType} ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          setExams(data);
        } else if (response.status === 403) {
          setError('Access denied. Please log in again.');
          localStorage.clear();
          navigate('/');
        } else {
          setError('Failed to fetch exams.');
        }
      } catch (error) {
        setError('Network error.');
        console.error('Fetch exams error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken && tokenType) {
      fetchExams();
    } else {
      setError('Authentication required.');
      setLoading(false);
      navigate('/');
    }
  }, [accessToken, tokenType, navigate]);

  // Fetch Exam History only when Results tab is active
  useEffect(() => {
    if (activeTab !== 'results') return;

    const fetchExamHistory = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://4.240.76.3:8000/exams/history/me', {
          headers: {
            'Authorization': `${tokenType} ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          setExamHistory(Array.isArray(data) ? data : [data]);
        } else if (response.status === 403) {
          setError('Access denied. Please log in again.');
          localStorage.clear();
          navigate('/');
        } else {
          setError('Failed to fetch exam history.');
        }
      } catch (error) {
        setError('Network error.');
        console.error('Fetch exam history error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken && tokenType) {
      fetchExamHistory();
    }
  }, [activeTab, accessToken, tokenType, navigate]);

  const handleStartExam = async (examId) => {
    setSelectedExam(examId);
    try {
      const response = await fetch(`http://4.240.76.3:8000/exams/${examId}`, {
        headers: {
          'Authorization': `${tokenType} ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        navigate('/exam', {
          state: {
            examId,
            examName: data.exam_name || 'Exam',
            durationMins: data.duration_mins || 60,
          },
        });
      } else {
        setError('Failed to load exam.');
        setSelectedExam(null);
      }
    } catch (error) {
      setError('Network error.');
      console.error('Start exam error:', error);
      setSelectedExam(null);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('http://4.240.76.3:8000/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `${tokenType} ${accessToken}` },
      });
      if (response.ok) {
        localStorage.clear();
        setShowSuccess(true);
      } else {
        localStorage.clear();
        navigate('/');
      }
    } catch (error) {
      localStorage.clear();
      navigate('/');
      console.error('Logout error:', error);
    }
  };

  const handlePopupClose = () => {
    setShowSuccess(false);
    navigate('/');
  };

  const handleNotificationRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  if (loading && activeTab !== 'results') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full min-h-screen bg-gradient-to-br from-green-50 to-white flex flex-col items-center justify-center"
      >
        <motion.div
          animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-20 h-20"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-green-500 to-green-300 opacity-30 blur-md" />
          <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-green-500 to-green-300 opacity-50 blur-sm" />
          <div className="absolute inset-4 rounded-full bg-white flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-green-800 font-semibold mt-6 text-lg"
        >
          Preparing your learning journey...
        </motion.p>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "200px" }}
          transition={{ delay: 0.8, duration: 2.5 }}
          className="h-1 bg-gradient-to-r from-green-500 to-green-300 rounded-full mt-4"
        />
      </motion.div>
    );
  }

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'} min-h-screen transition-colors duration-300`}>
      {/* Navigation */}
      <nav className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <motion.div
                whileHover={{ rotate: [0, 5, -5, 5, 0], transition: { duration: 0.5 } }}
                className="flex-shrink-0 flex items-center"
              >
                <div className="h-10 w-10 from-green-600 to-green-400 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="text-xl font-light text-green-600">exAIma</span>
              </motion.div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 pr-4 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-300`}
                  placeholder="Search exams..."
                />
              </div>

              {/* Notifications */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                  onClick={() => setShowSettings(prev => !prev)}
                >
                  <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {notifications.some(n => !n.read) && (
                      <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                    )}
                  </div>
                </motion.button>
                <AnimatePresence>
                  {showSettings && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`absolute right-0 mt-2 w-80 rounded-md shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'} origin-top-right z-30`}
                    >
                      <div className="px-4 py-3">
                        <p className="text-sm font-medium">Notifications</p>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {notifications.length > 0 ? notifications.map(notification => (
                          <div
                            key={notification.id}
                            className={`px-4 py-3 ${notification.read ? '' : 'bg-green-50'} ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} cursor-pointer`}
                            onClick={() => handleNotificationRead(notification.id)}
                          >
                            <div className="flex items-start">
                              <div className={`flex-shrink-0 h-8 w-8 rounded-full ${notification.read ? 'bg-gray-200' : 'bg-green-200'} flex items-center justify-center`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${notification.read ? 'text-gray-600' : 'text-green-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                              </div>
                              <div className="ml-3 flex-1">
                                <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{notification.message}</p>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{notification.time}</p>
                              </div>
                            </div>
                          </div>
                        )) : (
                          <div className="px-4 py-6 text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p className="mt-2 text-sm text-gray-500">No new notifications</p>
                          </div>
                        )}
                      </div>
                      <div className="px-4 py-2">
                        <button
                          className="text-sm text-green-600 hover:text-green-800 transition-colors duration-200"
                          onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                        >
                          Mark all as read
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User dropdown */}
              <div className="relative" ref={profileRef}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center cursor-pointer"
                  onClick={() => setShowProfileDropdown(prev => !prev)}
                >
                  <div className="h-10 w-10 bg-gradient-to-tr from-green-600 to-green-400 rounded-full flex items-center justify-center shadow-md text-white font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-2 hidden md:block">
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{user.username}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Student</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`ml-1 h-5 w-5 ${darkMode ? 'text-gray-300' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </motion.div>

                <AnimatePresence>
                  {showProfileDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`absolute right-0 mt-2 w-56 rounded-md shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'} origin-top-right z-30`}
                    >
                      <div className="px-4 py-3">
                        <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Signed in as</p>
                        <p className="text-sm font-medium text-green-600 truncate">{user.email || user.username}</p>
                      </div>
                      <div className="py-1">
                        <button
                          className={`block px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} w-full text-left`}
                          onClick={() => setActiveTab('profile')}
                        >
                          Your Profile
                        </button>
                        <button
                          className={`block px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} w-full text-left`}
                          onClick={() => setActiveTab('settings')}
                        >
                          Settings
                        </button>
                        <button
                          className={`block px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} w-full text-left`}
                          onClick={() => setDarkMode(!darkMode)}
                        >
                          {darkMode ? 'Light Mode' : 'Dark Mode'}
                        </button>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              Welcome back, <span className="text-green-600">{user.username}</span>!
            </h1>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="h-1 bg-gradient-to-r from-green-500 to-green-300 rounded-full mt-2 w-32"
            />
          </div>

          <div className="flex space-x-1 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === 'home' ? 'bg-white text-green-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('exams')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === 'exams' ? 'bg-white text-green-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Exams
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === 'results' ? 'bg-white text-green-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Results
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === 'profile' ? 'bg-white text-green-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === 'about' ? 'bg-white text-green-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
            >
              About
            </button>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setError('')}
                  className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none"
                >
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}
            >
              <div className="text-center mb-8">
                <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Welcome to exAIma</h2>
                <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Your journey to academic excellence starts here!
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 rounded-xl shadow-inner bg-green-50">
                  <h3 className="text-lg font-semibold text-green-700 mb-2">Explore Exams</h3>
                  <p className="text-sm text-gray-600">Dive into a variety of exams.</p>
                  <button onClick={() => setActiveTab('exams')} className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md">View Exams</button>
                </div>
                <div className="p-4 rounded-xl shadow-inner bg-green-50">
                  <h3 className="text-lg font-semibold text-green-700 mb-2">Check Results</h3>
                  <p className="text-sm text-gray-600">Review your performance.</p>
                  <button onClick={() => setActiveTab('results')} className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md">View Results</button>
                </div>
                <div className="p-4 rounded-xl shadow-inner bg-green-50">
                  <h3 className="text-lg font-semibold text-green-700 mb-2">Your Profile</h3>
                  <p className="text-sm text-gray-600">Manage your account.</p>
                  <button onClick={() => setActiveTab('profile')} className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md">Go to Profile</button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'exams' && (
            <motion.div
              key="exams"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {searchTerm && filteredExams.length === 0 ? (
                <div className="text-center py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No exams match your search</h3>
                  <p className="mt-1 text-sm text-gray-500">Try different keywords.</p>
                  <button onClick={() => setSearchTerm('')} className="mt-6 px-4 py-2 bg-green-600 text-white rounded-md">Clear search</button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="col-span-1 sm:col-span-2 lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <AnimatePresence>
                        {filteredExams.map((exam, index) => (
                          <motion.div
                            key={exam.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: 0.1 * index }}
                            whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
                            className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-green-100'} rounded-2xl shadow-lg overflow-hidden border ${selectedExam === exam.id ? 'ring-4 ring-green-400' : ''}`}
                          >
                            <div className="h-2 bg-gradient-to-r from-green-400 to-green-600" />
                            <div className="p-6">
                              <div className="flex justify-between items-start">
                                <h3 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{exam.exam_name}</h3>
                                <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">{exam.difficulty || 'Standard'}</span>
                              </div>
                              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-3 h-12 overflow-hidden`}>{exam.description || 'Test your knowledge'}</p>
                              <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className={`w-10 h-10 flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-green-100'} rounded-full`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </div>
                                  <span className={`ml-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{exam.number_of_questions || 0} Questions</span>
                                </div>
                                <div className="flex items-center">
                                  <div className={`w-10 h-10 flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-green-100'} rounded-full`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </div>
                                  <span className={`ml-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{exam.duration_mins || 60} mins</span>
                                </div>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleStartExam(exam.id)}
                                disabled={selectedExam !== null}
                                className={`mt-6 w-full py-3 rounded-xl font-medium text-white shadow-md transition-all duration-300 
                                  ${selectedExam === exam.id ? 'bg-green-700 cursor-wait' : selectedExam !== null ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'}`}
                              >
                                {selectedExam === exam.id ? (
                                  <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Loading Exam...
                                  </div>
                                ) : (
                                  <>
                                    <span>Start Exam</span>
                                    <span className="ml-2">→</span>
                                  </>
                                )}
                              </motion.button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    <div className="col-span-1 flex flex-col space-y-8 justify-start items-end">
                      <InternetSpeed darkMode={darkMode} />
                      <ExamCount darkMode={darkMode} totalExams={filteredExams.length} />
                    </div>
                  </div>

                  {filteredExams.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full text-center py-10">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-lg">No exams available.</p>
                      <p className="text-gray-400 mt-1">Check back later.</p>
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Exam Results</h2>
              </div>

              {loading ? (
                <div className="text-center py-12">Loading results...</div>
              ) : examHistory.length > 0 ? (
                <div className="space-y-4">
                  {examHistory.map((result, index) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-xl shadow-inner`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Exam ID: {result.exam_id}</h3>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completed At: {new Date(result.completed_at).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{result.obtained_marks}/{result.total_marks}</p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Percentage: {result.percentage}%</p>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-between text-sm">
                        <p className={`text-green-500`}>Correct: {result.correct_answers}</p>
                        <p className={`text-red-500`}>Wrong: {result.wrong_answers}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className={`mt-4 text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>No results yet</h3>
                  <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Complete an exam to see your results.</p>
                  <button onClick={() => setActiveTab('exams')} className="mt-6 px-4 py-2 bg-green-600 text-white rounded-md">Take an Exam</button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}
            >
              <div className="flex flex-col items-center md:flex-row md:items-start">
                <div className="flex flex-col items-center">
                  <div className="h-32 w-32 bg-gradient-to-tr from-green-600 to-green-400 rounded-full flex items-center justify-center shadow-xl text-white text-4xl font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <h2 className={`mt-4 text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{user.username}</h2>
                  <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Student</p>
                </div>

                <div className="mt-6 md:mt-0 md:ml-10 flex-1">
                  <h3 className={`text-xl font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Your Profile</h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>Email</label>
                      <div className={`mt-1 p-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-md`}>{user.email || 'email@example.com'}</div>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>Date Joined</label>
                      <div className={`mt-1 p-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-md`}>March 15, 2025</div>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>Exams Completed</label>
                      <div className={`mt-1 p-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-md`}>{examHistory.length}</div>
                    </div>
                  </div>
                  <button className="mt-6 px-4 py-2 bg-green-600 text-white rounded-md">Edit Profile</button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}
            >
              <div className="text-center mb-8">
                <div className="h-20 w-20 from-green-600 to-green-400 rounded-2xl flex items-center justify-center mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h2 className={`mt-4 text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>ExAIma</h2>
                <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Version 1.0.0</p>
              </div>

              <div className="prose max-w-none mx-auto">
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Cheating is a skill, but no skill lasts forever. True success comes from mastering knowledge and proving yourself through genuine effort. At exAIma, we believe that exams should be a fair test of your abilities, not a loophole to exploit. That’s why we’ve built a powerful proctoring system that ensures integrity while making the exam experience smooth and stress-free.
                </p>
                <h3 className={`mt-6 text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Features</h3>
                <ul className={`mt-3 list-disc pl-5 space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li>Secure examination environment</li>
                  <li>Exam Analytics</li>
                  <li>Timed assessments</li>
                  <li>Instant feedback</li>
                  <li>Mobile-friendly interface</li>
                </ul>
                <br></br>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Our platform is designed with a user-friendly register-login-profile setup, allowing users to manage multiple exams effortlessly. Whether you're a student, educator, or institution, exAIma provides a seamless and secure way to conduct assessments without distractions. By focusing on intuitive design and real-time monitoring, we enhance the overall exam experience while maintaining fairness.
                </p>
                <br></br>
                <p>exAIma was born out of innovation at The Great Bengaluru Hackathon, crafted by our passionate team, Porotta Pythoners. We set out to revolutionize digital proctoring, combining cutting-edge technology with an emphasis on learning. Our goal is simple—help you achieve academic excellence through honest effort and determination.</p>
                <h3 className={`mt-6 text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Contact Support</h3>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Need help? Contact us at <a href="mailto:support@exAIma.com" className="text-green-600 hover:text-green-700">support@exAIma.com</a>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className={`${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-500'} py-8 mt-12`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center">
              <div className="h-8 w-8 from-green-600 to-green-400 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-sm font-medium">exAIma © 2025</span>
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-sm hover:text-green-600">Privacy Policy</a>
              <a href="#" className="text-sm hover:text-green-600">Terms of Service</a>
              <a href="#" className="text-sm hover:text-green-600">Help Center</a>
            </div>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showSuccess && (
          <SuccessPopup
            message="You have been successfully logged out."
            onClose={handlePopupClose}
          />
        )}
      </AnimatePresence>
    </div>
  );
}