import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ProctoringPage() {
  const [isClosed, setIsClosed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check system preference for dark mode
  useEffect(() => {
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDarkMode);
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
    // Simulating loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle theme toggle
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  if (isClosed) return null;
  
  if (isLoading) {
    return (
      <div className={`w-full h-screen ${darkMode ? 'bg-gray-900' : 'bg-white'} flex flex-col items-center justify-center`}>
         <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full min-h-screen bg-gradient-to-br from-green-50 to-white flex flex-col items-center justify-center"
      >
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
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
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "200px" }}
          transition={{ delay: 0.8, duration: 1.5 }}
          className="h-1 bg-gradient-to-r from-green-500 to-green-300 rounded-full mt-8"
        />
      </div>
    );
  }

  return (
    <div className={`w-full min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} flex flex-col transition-colors duration-300`}>
      {/* Particles Background Effect */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${darkMode ? 'bg-green-500' : 'bg-green-300'} opacity-20`}
            style={{
              width: Math.random() * 10 + 5,
              height: Math.random() * 10 + 5,
              left: `${Math.random() * 100}vw`,
              top: `${Math.random() * 100}vh`,
            }}
            animate={{
              y: [0, -Math.random() * 100 - 50],
              x: [0, (Math.random() - 0.5) * 50],
              opacity: [0.2, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "loop",
            }}
          />
        ))}
      </div>

      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className={`w-full ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg p-4 flex justify-between items-center z-10`}
      >
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="flex items-center"
        >
          <motion.div
            whileHover={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
          >
            {/* <div className="h-8 w-8 bg-gradient-to-r from-green-400 to-green-600 rounded-lg flex items-center justify-center shadow-md mr-2"> */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            {/* </div> */}
          </motion.div>
          <h1 className={`m-1 text-xl font-light ${darkMode ? 'text-green-400' : 'text-green-600'}`}>exAIma</h1>
        </motion.div>
        
        <div className="flex items-center space-x-4">
          {/* Dark Mode Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-100 text-gray-700'}`}
          >
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </motion.button>
        </div>
      </motion.nav>
      
      {/* Main Content */}
      <div className="flex flex-1 justify-center items-center p-8 relative z-10">
        <div className="max-w-6xl flex flex-col md:flex-row items-center gap-8">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 text-center md:text-left"
          >
            <h2 className={`text-4xl md:text-5xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-green-500 inline-block"
              >
                AI Powered
              </motion.span>
              {" "}Proctor <br />
              Exams, Anywhere Anytime
            </h2>
            
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100px" }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className={`h-1 bg-gradient-to-r from-green-500 to-green-300 rounded-full mt-4 ${!darkMode && 'hidden md:block'}`}
            />
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className={`text-lg mt-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
            >
              exAIma provides secure, AI-powered proctoring to
              safeguard exam integrity while offering flexibility and convenience.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
            >
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: darkMode ? '#16a34a' : '#16a34a' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className={`px-8 py-3 bg-green-600 text-white rounded-lg shadow-lg transition duration-300 ${darkMode ? 'hover:bg-green-700' : 'hover:bg-green-700'} flex items-center justify-center`}
              >
                <span>Sign in</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/register')}
                className={`px-8 py-3 ${darkMode ? 'bg-gray-800 border border-green-500 text-green-500' : 'bg-white border border-green-600 text-green-600'} rounded-lg shadow-lg hover:shadow-xl transition duration-300 flex items-center justify-center`}
              >
                <span>Sign up</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>
              </motion.button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              {[
                { icon: "🔒", title: "Secure", desc: "End-to-end encryption" },
                { icon: "🤖", title: "AI-Powered", desc: "Advanced monitoring" },
                { icon: "🌐", title: "Global", desc: "Access anywhere" }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                  className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}
                >
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{feature.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
          
          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex-1 md:ml-8 relative"
          >
            {/* Abstract shape decorations */}
            <motion.div
              animate={{
                rotate: [0, 10, 0, -10, 0],
              }}
              transition={{ repeat: Infinity, duration: 20 }}
              className="absolute -top-10 -right-10 w-40 h-40 bg-green-300 rounded-full filter blur-3xl opacity-30 z-0"
            />
            <motion.div
              animate={{
                rotate: [0, -10, 0, 10, 0],
              }}
              transition={{ repeat: Infinity, duration: 15 }}
              className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-300 rounded-full filter blur-3xl opacity-30 z-0"
            />
            
            {/* Main image */}
            <div className={`relative z-10 rounded-xl overflow-hidden shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} p-4`}>
              <img
                src="/exam_home.png"
                alt="AI Proctoring System"
                className="rounded-lg w-full object-cover"
              />
              
              {/* Overlay elements */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="absolute top-4 right-4 bg-green-500 text-white p-2 rounded-lg shadow-lg text-sm"
                >
                  {/* Live Monitoring */}
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.7 }}
                  className="absolute bottom-4 left-4 bg-white bg-opacity-90 p-2 rounded-lg shadow-lg flex items-center space-x-2"
                >
                  {/* <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" /> */}
                  {/* <span className="text-sm font-medium text-gray-800">Secure Session</span> */}
                </motion.div>
              </div>
            </div>
            
            {/* Stats below image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className={`mt-6 grid grid-cols-2 gap-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}
            >
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
                <h4 className="text-sm text-gray-500">Universities</h4>
                <p className="text-2xl font-bold">250+</p>
              </div>
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
                <h4 className="text-sm text-gray-500">Exams Proctored</h4>
                <p className="text-2xl font-bold">2M+</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className={`w-full ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 mt-auto z-10`}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            {/* <div className="h-6 w-6 bg-gradient-to-r from-green-400 to-green-600 rounded-md flex items-center justify-center shadow-md mr-2"> */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            {/* </div> */}
            <p className={`m-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              © {new Date().getFullYear()} exAIma. All rights reserved.
            </p>
          </div>
          
          <div className="flex space-x-6">
            {['Privacy', 'Terms', 'Support', 'Contact'].map((item, i) => (
              <motion.a
                key={i}
                whileHover={{ y: -2 }}
                className={`text-sm ${darkMode ? 'text-gray-400 hover:text-green-400' : 'text-gray-500 hover:text-green-600'} cursor-pointer`}
              >
                {item}
              </motion.a>
            ))}
          </div>
        </div>
      </motion.footer>
      
      {/* "Close" button - only visible on small screens */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2 }}
        onClick={() => setIsClosed(true)}
        className="md:hidden fixed bottom-4 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-full p-3 z-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </motion.button>
    </div>
  );
}