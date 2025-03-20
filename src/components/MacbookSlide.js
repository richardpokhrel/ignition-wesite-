import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MacBookTutorialSlide = () => {
  const containerRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
  
  // Observer to check if component is in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    
    const currentElement = containerRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }
    
    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-black text-white font-sans overflow-hidden flex flex-col">
      {/* Background grid effect */}
      <div className="absolute inset-0 bg-black">
        <div className="grid grid-cols-12 gap-4 opacity-10">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="h-16 border border-emerald-400/10" />
          ))}
        </div>
      </div>
      
      {/* Animated particles in background */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 bg-emerald-400 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 7}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>
      
      {/* Content area with heading positioned higher */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 pt-16 md:pt-24 flex flex-col h-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <div className="h-px bg-gradient-to-r from-transparent via-white to-transparent mb-4 mx-auto w-24" />
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight mb-3">
            See How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Works</span>
          </h2>
          
          <p className="text-base md:text-lg text-white/70 mb-4 font-light max-w-2xl mx-auto">
            Our intuitive platform simplifies your global education journey through intelligent navigation
          </p>
        </motion.div>
        
        {/* Enlarged MacBook Frame */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative mx-auto w-full flex-1 flex flex-col"
          style={{ maxHeight: "calc(100vh - 200px)" }}
        >
          {/* MacBook Top with enlarged screen */}
          <div className="bg-gray-800 rounded-t-lg p-2 pb-0 flex-1 flex flex-col">
            {/* Browser UI */}
            <div className="bg-gray-900 rounded-t-md p-2 flex items-center flex-shrink-0">
              <div className="flex space-x-2 ml-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="mx-auto bg-gray-800 rounded-md py-1 px-8 text-xs text-gray-400 flex items-center">
                <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
                education-portal.app/tutorials
              </div>
            </div>
            
            {/* Video Container - Full Size */}
            <div className="flex-1 bg-black relative">
              {/* This placeholder would be replaced with an actual video */}
              {/* Using a placeholder div with video-like content for demonstration */}
              <div className="absolute inset-0 bg-gray-900/80 flex flex-col">
                {/* Top navigation bar */}
                <div className="px-4 py-3 bg-black/30 backdrop-blur-sm border-b border-white/10 flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-400/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Global Navigator Tutorial</h3>
                      <p className="text-xs text-white/50">Interactive walkthrough</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-400/20 text-emerald-400">Advanced</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/70">5:23</span>
                  </div>
                </div>
                
                {/* Main video content area with demo UI */}
                <div className="flex-1 flex relative">
                  {/* Simulated video content - would be replaced with actual video */}
                  <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                    {/* Animated interface elements to simulate video content */}
                    <div className="w-full h-full flex">
                      {/* Sidebar navigation */}
                      <div className="w-64 bg-gray-900 border-r border-white/10 p-4">
                        <div className="mb-6">
                          <div className="w-24 h-3 bg-white/20 rounded mb-2"></div>
                          <div className="w-32 h-2 bg-white/10 rounded"></div>
                        </div>
                        
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={`mb-4 p-2 rounded ${i === 2 ? 'bg-emerald-400/20 border border-emerald-400/30' : 'hover:bg-white/5'}`}
                          >
                            <div className="flex items-center">
                              <div className="w-6 h-6 rounded bg-white/10 mr-3"></div>
                              <div>
                                <div className="w-20 h-2 bg-white/20 rounded mb-1"></div>
                                <div className="w-16 h-2 bg-white/10 rounded"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Main content area */}
                      <div className="flex-1 p-6 relative">
                        {/* Content header */}
                        <div className="mb-8">
                          <div className="w-64 h-4 bg-white/20 rounded mb-3"></div>
                          <div className="w-96 h-2 bg-white/10 rounded mb-2"></div>
                          <div className="w-80 h-2 bg-white/10 rounded"></div>
                        </div>
                        
                        {/* Interactive elements */}
                        <div className="grid grid-cols-2 gap-6">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <motion.div 
                              key={i}
                              className={`rounded-lg border ${i === 1 ? 'border-emerald-400/40 bg-emerald-400/10' : 'border-white/10 bg-white/5'} p-4`}
                              animate={isInView && i === 1 ? { scale: [1, 1.03, 1] } : {}}
                              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                            >
                              <div className="flex justify-between mb-3">
                                <div className="w-24 h-3 bg-white/20 rounded"></div>
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                  <div className="w-4 h-4 rounded-full bg-emerald-400/50"></div>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="w-full h-2 bg-white/10 rounded"></div>
                                <div className="w-3/4 h-2 bg-white/10 rounded"></div>
                              </div>
                              
                              {i === 1 && (
                                <motion.div 
                                  className="absolute w-6 h-6 rounded-full border-2 border-emerald-400 -m-1"
                                  style={{ 
                                    left: '60%', 
                                    top: '50%',
                                    boxShadow: '0 0 0 4px rgba(74, 222, 128, 0.1)' 
                                  }}
                                  animate={{ 
                                    scale: [1, 1.2, 1],
                                    opacity: [1, 0.8, 1] 
                                  }}
                                  transition={{ 
                                    duration: 1.5, 
                                    repeat: Infinity,
                                    repeatDelay: 3
                                  }}
                                />
                              )}
                            </motion.div>
                          ))}
                        </div>
                        
                        {/* Animated cursor */}
                        <motion.div 
                          className="absolute w-4 h-4 rounded-full bg-white/80 pointer-events-none"
                          initial={{ left: '30%', top: '30%' }}
                          animate={isInView ? { 
                            left: ['30%', '60%', '60%', '40%', '30%'],
                            top: ['30%', '50%', '50%', '70%', '30%']
                          } : {}}
                          transition={{ 
                            duration: 4, 
                            repeat: Infinity,
                            repeatDelay: 1,
                            ease: "easeInOut" 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Video progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                      initial={{ width: "0%" }}
                      animate={isInView ? { width: "75%" } : { width: "0%" }}
                      transition={{ duration: 15, ease: "linear" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* MacBook Bottom */}
          <div className="bg-gray-800 h-4 rounded-b-lg relative flex-shrink-0">
            <div className="absolute left-1/2 top-1 -translate-x-1/2 w-16 h-1 bg-gray-700 rounded-full"></div>
          </div>
          
          {/* MacBook Shadow */}
          <div className="h-4 bg-gradient-to-b from-gray-900 to-transparent rounded-b-full w-4/5 mx-auto flex-shrink-0"></div>
        </motion.div>
      </div>
      
      {/* Animated glowing orb effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-cyan-400/5 rounded-full blur-3xl"></div>
      </div>
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-transparent to-black/70 pointer-events-none"></div>
      
      {/* Global CSS needed for animations */}
      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
          100% {
            transform: translateY(0) translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default MacBookTutorialSlide;