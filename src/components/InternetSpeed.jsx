import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const InternetSpeed = ({ darkMode }) => {
  const [downloadSpeed, setDownloadSpeed] = useState(null);
  const [uploadSpeed, setUploadSpeed] = useState(null);
  const [latency, setLatency] = useState(null);
  const [status, setStatus] = useState('Checking...');
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  const checkDownloadSpeed = async () => {
    const startTime = new Date().getTime();
    try {
      const response = await fetch('https://speed.cloudflare.com/__down?bytes=10000000', {
        cache: 'no-store',
        mode: 'cors',
      });
      if (!response.ok) throw new Error('Download failed');
      const fileSizeMB = 10; // 10MB
      await response.blob();
      const duration = (new Date().getTime() - startTime) / 1000;
      const speedMbps = (fileSizeMB * 8) / duration;
      return speedMbps;
    } catch (error) {
      console.error('Download error:', error.message);
      return 0;
    }
  };

  const checkUploadSpeed = async () => {
    const data = new Blob([new ArrayBuffer(1000000)]); // 1MB
    const startTime = new Date().getTime();
    try {
      const response = await fetch('https://httpbin.org/post', {
        method: 'POST',
        body: data,
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('Upload failed');
      const duration = (new Date().getTime() - startTime) / 1000;
      return (1 * 8) / duration;
    } catch (error) {
      console.error('Upload error:', error.message);
      return 0;
    }
  };

  const checkLatency = async () => {
    const startTime = new Date().getTime();
    try {
      await fetch('https://speed.cloudflare.com/__down?bytes=1000', { cache: 'no-store' });
      return new Date().getTime() - startTime;
    } catch (error) {
      console.error('Latency error:', error.message);
      return null;
    }
  };

  const runTests = async () => {
    setIsLoading(true);
    const [downSpeed, upSpeed, lat] = await Promise.all([
      checkDownloadSpeed(),
      checkUploadSpeed(),
      checkLatency(),
    ]);

    setDownloadSpeed(downSpeed.toFixed(1));
    setUploadSpeed(upSpeed.toFixed(1));
    setLatency(lat);
    setStatus(downSpeed < 1 ? 'Weak' : downSpeed < 5 ? 'Moderate' : 'Good');
    setIsLoading(false);
  };

  // Handle retest button click
  const handleRetest = (e) => {
    e.stopPropagation(); // Prevent card toggle
    runTests();
  };

  useEffect(() => {
    runTests();
    const interval = setInterval(runTests, 60000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'Weak': return 'red';
      case 'Moderate': return 'yellow';
      case 'Good': return 'green';
      default: return 'gray';
    }
  };

  const getSpeedPercentage = (speed) => {
    if (!speed) return 0;
    const numSpeed = parseFloat(speed);
    // Consider 100 Mbps as 100%
    return Math.min(numSpeed / 100 * 100, 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      className={`w-80 rounded-3xl shadow-2xl border backdrop-blur-sm ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 text-white' 
          : 'bg-gradient-to-br from-white to-gray-50 border-green-100 text-gray-800'
      } flex flex-col items-center justify-center overflow-hidden`}
      whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
      onClick={() => setShowDetails(!showDetails)}
    >
      {/* Top gradient bar with animation */}
      <motion.div 
        className="h-2 w-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"
        animate={{ 
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{ 
          duration: 5, 
          repeat: Infinity,
          ease: "linear"
        }}
        style={{ backgroundSize: '200% 200%' }}
      />
      
      <div className="w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <motion.div
              animate={{ 
                rotate: isLoading ? 360 : 0,
              }}
              transition={{ 
                duration: 2, 
                repeat: isLoading ? Infinity : 0,
                ease: "linear"
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-10 w-10 text-${getStatusColor()}-500 mr-3`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z"
                />
              </svg>
            </motion.div>
            <div>
              <h2 className="text-lg font-bold">Internet Speed</h2>
              <p className={`text-sm font-medium text-${getStatusColor()}-500`}>
                {isLoading ? "Analyzing..." : status}
              </p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: showDetails ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </motion.div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <motion.div
              className="w-12 h-12 rounded-full border-4 border-t-blue-500 border-r-purple-500 border-b-pink-500 border-l-green-500"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Download</span>
                <span className="text-sm font-bold">{downloadSpeed} Mbps</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <motion.div 
                  className={`bg-purple-500 h-2.5 rounded-full`}
                  initial={{ width: "0%" }}
                  animate={{ width: `${getSpeedPercentage(downloadSpeed)}%` }}
                  transition={{ duration: 1, type: "spring" }}
                />
              </div>
            </div>

            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Upload</span>
                      <span className="text-sm font-bold">{uploadSpeed} Mbps</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <motion.div 
                        className="bg-purple-500 h-2.5 rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: `${getSpeedPercentage(uploadSpeed)}%` }}
                        transition={{ duration: 1, type: "spring", delay: 0.2 }}
                      />
                    </div>
                  </div>

                  <div className="mb-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Latency</span>
                      <span className="text-sm font-bold">{latency ? `${latency} ms` : 'N/A'}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <motion.div 
                        className="bg-purple-500 h-2.5 rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: latency ? `${Math.min(100 - (latency / 5), 100)}%` : "0%" }}
                        transition={{ duration: 1, type: "spring", delay: 0.4 }}
                      />
                    </div>
                  </div>
                  
                  <motion.div 
                    className="mt-4 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <motion.button
                      className={`px-4 py-2 rounded-full text-sm font-medium ${
                        darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                      } text-white transition-colors duration-300`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleRetest}
                    >
                      Retest Speed
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
      
      {/* Bottom decorative elements */}
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

export default InternetSpeed;