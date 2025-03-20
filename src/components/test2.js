'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InteractiveGlobe from './Globe';
import MaacbookDemoSlide from './MacbookSlide';
import MacBookDemoSlide from './MacbookSlide';

// Enhanced 3D Globe Component with improved positioning and scroll behavior



const Hero121 = () => {
  // State management with optimized defaults
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredSquare, setHoveredSquare] = useState(null);
  const [activeTab, setActiveTab] = useState('programs');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showSecondSlide, setShowSecondSlide] = useState(false);
  const [windowSize, setWindowSize] = useState({ 
    width: typeof window !== 'undefined' ? window.innerWidth : 1200, 
    height: typeof window !== 'undefined' ? window.innerHeight : 800 
  });
  const [isMobile, setIsMobile] = useState(false);

  // References for better performance
  const cursorRef = useRef(null);
  const canvasRef = useRef(null);
  const globeContainerRef = useRef(null);
  const mainRef = useRef(null);
  
  // Configuration constants with improved responsive values
  const SQUARE_SIZE = useMemo(() => isMobile ? 60 : 90, [isMobile]);
  const PARTICLE_NUM = useMemo(() => isMobile ? 2 : 4, [isMobile]);
  const PARTICLE_SIZE = useMemo(() => isMobile ? 3 : 4, [isMobile]);
 
  // Scroll handler to control globe zoom and slide transition
  useEffect(() => {
    const handleScroll = () => {
      if (!mainRef.current) return;
      
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const scrollPercent = Math.min(scrollTop / windowHeight, 1);
      
      setScrollProgress(scrollPercent);
      
      // Transition to second slide when scroll reaches 70%
      if (scrollPercent >= 0.7 && !showSecondSlide) {
        setShowSecondSlide(true);
      } else if (scrollPercent < 0.7 && showSecondSlide) {
        setShowSecondSlide(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showSecondSlide]);

  // Initialize window size and detect device type with optimization
  useEffect(() => {
    // Debounced resize handler for better performance
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        setWindowSize({ width, height });
        setIsMobile(width < 768);
      }, 100);
    };

    // Set initial size with safe check for SSR
    if (typeof window !== 'undefined') {
      handleResize();
      window.addEventListener('resize', handleResize);
    }
    
    return () => {
      clearTimeout(resizeTimeout);
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);
  
  // Canvas and particle system with optimized rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: true });
    let particles = [];
    let animationFrameId;
    let isActive = true;
    
    // Canvas setup with optimized device pixel ratio handling
    const resizeCanvas = () => {
      if (!canvas) return;
      
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * pixelRatio;
      canvas.height = window.innerHeight * pixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(pixelRatio, pixelRatio);
    };
    
    resizeCanvas();
    
    // Throttled resize handler
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 100);
    };
    
    window.addEventListener('resize', handleResize);

    // High-performance Particle class with memory optimization
    class Particle {
      constructor(x, y) {
        this.pos = { x, y };
        this.vel = { 
          x: (Math.random() - 0.5) * 2.5, 
          y: (Math.random() - 0.5) * 2.5 
        };
        this.hue = Math.random() * 140 + 120; // Green-cyan range
        this.life = 1;
        this.decay = 0.01 + Math.random() * 0.015;
        this.size = PARTICLE_SIZE * (0.8 + Math.random() * 0.4);
      }

      update() {
        this.life -= this.decay;
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
        this.vel.y += 0.01; // Subtle gravity effect
        this.hue += 0.5;
      }

      draw() {
        if (!ctx) return;
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = `hsla(${this.hue}, 90%, 60%, ${this.life})`;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      }
    }

    // RAF-optimized animation loop with fps limiting
    let lastFrameTime = 0;
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;
    
    const animate = (timestamp) => {
      if (!isActive || !ctx) return;
      
      const elapsed = timestamp - lastFrameTime;
      
      if (elapsed > frameInterval) {
        lastFrameTime = timestamp - (elapsed % frameInterval);
        
        // Optimized clear with fade effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));

        // Process particles with batch operations
        for (let i = particles.length - 1; i >= 0; i--) {
          particles[i].update();
          particles[i].draw();
          if (particles[i].life <= 0) particles.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };
    
    // Start animation
    animate(0);

    // Memory-optimized mouse move handler
    let lastMove = 0;
    const throttleAmount = isMobile ? 50 : 20; // ms
    
    const handleMouseMove = (e) => {
      const currentTime = Date.now();
      if (currentTime - lastMove < throttleAmount) return;
      lastMove = currentTime;
      
      const x = e.clientX;
      const y = e.clientY;
      
      setMousePosition({ x, y });
      
      // Add new particles with controlled rate and memory management
      const maxParticles = isMobile ? 150 : 300;
      const particlesToAdd = Math.min(particles.length > maxParticles ? 1 : PARTICLE_NUM, 6);
      
      // Clear excess particles if too many accumulate
      if (particles.length > maxParticles * 1.5) {
        particles = particles.slice(-maxParticles);
      }
      
      for (let i = 0; i < particlesToAdd; i++) {
        particles.push(new Particle(x, y));
      }

      // Update hovered square with optimized grid alignment
      const squareX = Math.floor(x / SQUARE_SIZE);
      const squareY = Math.floor(y / SQUARE_SIZE);
      setHoveredSquare(`${squareX}-${squareY}`);
    };

    // Optimized touch handler for mobile
    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        handleMouseMove({
          clientX: e.touches[0].clientX,
          clientY: e.touches[0].clientY
        });
      }
    };

    // Visibility API to pause animations when tab is not visible


    // Visibility API to pause animations when tab is not visible
    const handleVisibilityChange = () => {
      isActive = document.visibilityState === 'visible';
      if (isActive && !animationFrameId) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
      isActive = false;
      clearTimeout(resizeTimeout);
      particles = [];
    };
  }, [isMobile, PARTICLE_NUM, PARTICLE_SIZE, SQUARE_SIZE]);

  // Optimized grid generation with viewport culling
  const backgroundSquares = useMemo(() => {
    if (windowSize.width === 0) return [];
    
    const squares = [];
    const numCols = Math.ceil(windowSize.width / SQUARE_SIZE) + 1;
    const numRows = Math.ceil(windowSize.height / SQUARE_SIZE) + 1;
    
    // Only render visible squares plus a small buffer
    for (let y = 0; y < numRows; y++) {
      for (let x = 0; x < numCols; x++) {
        squares.push({
          id: `${x}-${y}`,
          x: x * SQUARE_SIZE,
          y: y * SQUARE_SIZE,
          isHovered: hoveredSquare === `${x}-${y}`,
          delay: (x + y) * 0.05
        });
      }
    }
    
    return squares;
  }, [windowSize, SQUARE_SIZE, hoveredSquare]);

  // Tab transition effects
  const tabChange = (tab) => {
    setActiveTab(tab);
  };


 

  return (
    <main ref={mainRef} className="antialiased">
    <div className="relative w-full min-h-screen bg-black text-white overflow-hidden font-sans">
      {/* Canvas background */}
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 z-0 w-full h-full" 
        aria-hidden="true"
      />
      
      {/* Grid background - z-index 10 */}
      <div className="fixed inset-0 bg-black z-10">
        {backgroundSquares.map((square) => (
          <div
            key={square.id}
            className="absolute"
            style={{
              left: `${square.x}px`,
              top: `${square.y}px`,
              width: `${SQUARE_SIZE}px`,
              height: `${SQUARE_SIZE}px`,
              border: '1px solid rgba(74, 222, 128, 0.04)',
              transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
              transform: square.isHovered ? 'scale(1.1)' : 'scale(1)',
              backgroundColor: square.isHovered 
                ? 'rgba(74, 222, 128, 0.08)' 
                : 'transparent',
            }}
            aria-hidden="true"
          />
        ))}
      </div>
  
      {/* Interactive Globe - z-index 15 - positioned absolutely to overlay properly */}
      <motion.div
        ref={globeContainerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="fixed inset-0 z-15 flex items-center justify-end pr-10 pointer-events-none"
        style={{
          opacity: 1,
          transform: `scale(${1 + scrollProgress * 1.5})`,
          transformOrigin: 'center right',
          right: `${scrollProgress > 0.7 ? '0%' : '10%'}`,
          transition: 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)'
        }}
      >
        <div className="w-[600px] h-[600px] relative pointer-events-auto">
          <InteractiveGlobe 
            activeTab={activeTab} 
            scrollProgress={scrollProgress} 
            studyDestinations={[
              { city: "London", coordinates: [51.5074, -0.1278], students: 458 },
              { city: "New York", coordinates: [40.7128, -74.0060], students: 376 },
              { city: "Tokyo", coordinates: [35.6762, 139.6503], students: 290 },
              { city: "Sydney", coordinates: [-33.8688, 151.2093], students: 245 },
              { city: "Berlin", coordinates: [52.5200, 13.4050], students: 218 },
              { city: "Toronto", coordinates: [43.6532, -79.3832], students: 187 },
              { city: "Singapore", coordinates: [1.3521, 103.8198], students: 156 },
              { city: "Paris", coordinates: [48.8566, 2.3522], students: 203 }
            ]}
          />
        </div>
      </motion.div>
  
      {/* Custom cursor with z-index 50 */}
      {!isMobile && (
        <motion.div 
          ref={cursorRef}
          className="fixed w-8 h-8 rounded-full border-2 pointer-events-none mix-blend-difference z-50"
          animate={{
            x: mousePosition.x,
            y: mousePosition.y,
            scale: isHovered ? 1.5 : 1,
            backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
            borderColor: isHovered ? 'rgba(74, 222, 128, 0.8)' : 'rgba(255, 255, 255, 0.3)'
          }}
          transition={{
            type: "spring",
            mass: 0.3,
            stiffness: 100,
            damping: 10,
            duration: 0.1
          }}
          aria-hidden="true"
        />
      )}
  
      {/* First slide - Main content - z-index 20 */}
      <div className="relative z-20 max-w-6xl mx-auto h-screen flex flex-col justify-center px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Left Column - Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-6 max-w-2xl"
            style={{ 
              opacity: 1 - scrollProgress * 2, 
              transform: `translateY(${scrollProgress * 100}px)`,
              transition: 'all 0.3s ease-out'
            }}
          >
            <div className="h-px bg-gradient-to-r from-white to-transparent mb-6 w-20" />
  
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight mb-6">
              Your <span className="font-medium">Global</span> Education Journey <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                Reinvented
              </span>
            </h1>
  
            <p className="text-base md:text-lg text-white/70 mb-8 font-light max-w-xl">
              Algorithmic pathways to academic excellence through geometric optimization
            </p>
  
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                className={`px-6 py-3 md:px-8 md:py-4 text-sm tracking-wider rounded-lg
                  backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/50
                  ${activeTab === 'programs' 
                    ? 'bg-emerald-400/20 border border-emerald-400/40' 
                    : 'bg-transparent border border-white/5 hover:border-white/20'}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => tabChange('programs')}
                aria-pressed={activeTab === 'programs'}
              >
                Explore Programs
              </motion.button>
  
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                className={`px-6 py-3 md:px-8 md:py-4 text-sm tracking-wider rounded-lg
                  backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/50
                  ${activeTab === 'consultation' 
                    ? 'bg-emerald-400/20 border border-emerald-400/40' 
                    : 'bg-transparent border border-white/5 hover:border-white/20'}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => tabChange('consultation')}
                aria-pressed={activeTab === 'consultation'}
              >
                Academic Consultation
              </motion.button>
            </div>
          </motion.div>
  
          {/* Right column - removed - globe is now positioned absolutely */}
        </div>
      </div>
      
      {/* Second slide with AnimatePresence for smooth transitions */}
      <AnimatePresence>
        {scrollProgress > 0.7 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: scrollProgress > 0.7 ? (scrollProgress - 0.7) * 3 : 0 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 flex items-center justify-center"
          >
            <MacBookDemoSlide />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center z-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: scrollProgress < 0.5 ? 1 : 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <p className="text-white/40 text-sm mb-2">Scroll to explore</p>
        <div className="w-6 h-10 border border-white/20 rounded-full flex justify-center p-1">
          <motion.div 
            className="w-1 h-2 bg-emerald-400 rounded-full"
            animate={{ 
              y: [0, 6, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </motion.div>
    </div>
    
    {/* Extra spacer to enable scrolling for the transition */}
    <div className="h-screen bg-transparent" aria-hidden="true" />
  </main>
);
};


export default Hero121;