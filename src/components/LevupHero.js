'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';


/**
 * LevuppHero - Advanced interactive hero section for educational platform
 * 
 * Features:
 * - Responsive design with performance optimization
 * - Interactive particle system with canvas rendering
 * - Animated grid background with hover effects
 * - Tabbed content interface with smooth transitions
 * - Accessible form controls
 * 
 * 
 * 
 */




/**
 * UniversitySlider - Infinite horizontal slider for displaying universities
 */

const LevuppHero = () => {
  // Core state management
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredSquare, setHoveredSquare] = useState(null);
  const [activeTab, setActiveTab] = useState('programs');
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);
  
  // References
  const cursorRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Configuration constants
  const SQUARE_SIZE = useMemo(() => isMobile ? 60 : 90, [isMobile]);
  const PARTICLE_NUM = useMemo(() => isMobile ? 2 : 4, [isMobile]);
  const PARTICLE_SIZE = useMemo(() => isMobile ? 3 : 4, [isMobile]);
  const FORM_INITIAL_STATE = { name: '', email: '', interest: '', message: '' };
  
  // Form state
  const [formData, setFormData] = useState(FORM_INITIAL_STATE);
  const [formErrors, setFormErrors] = useState({});
  
  // Initialize window size and detect device type
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setWindowSize({ width, height });
      setIsMobile(width < 768);
    };

    handleResize(); // Set initial size
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Canvas and particle system
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;
    let isActive = true;
    
    // Canvas setup with device pixel ratio for sharpness
    const resizeCanvas = () => {
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * pixelRatio;
      canvas.height = window.innerHeight * pixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(pixelRatio, pixelRatio);
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Performance-optimized Particle class
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
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = `hsla(${this.hue}, 90%, 60%, ${this.life})`;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      }
    }

    // Optimized animation loop with throttling
    const animate = () => {
      if (!isActive) return;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));

      // Process particles with optimized batch operations
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].life <= 0) particles.splice(i, 1);
      }

      animationFrameId = requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();

    // Throttled mouse move handler for performance
    let lastMove = 0;
    const throttleAmount = isMobile ? 50 : 20; // ms
    
    const handleMouseMove = (e) => {
      const currentTime = Date.now();
      if (currentTime - lastMove < throttleAmount) return;
      lastMove = currentTime;
      
      const x = e.clientX;
      const y = e.clientY;
      
      setMousePosition({ x, y });
      
      // Add new particles with controlled rate
      const particlesToAdd = Math.min(particles.length > 200 ? 1 : PARTICLE_NUM, 6);
      for (let i = 0; i < particlesToAdd; i++) {
        particles.push(new Particle(x, y));
      }

      // Update hovered square with grid alignment
      const squareX = Math.floor(x / SQUARE_SIZE);
      const squareY = Math.floor(y / SQUARE_SIZE);
      setHoveredSquare(`${squareX}-${squareY}`);
    };

    // Touch move handler for mobile devices
    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        handleMouseMove({
          clientX: e.touches[0].clientX,
          clientY: e.touches[0].clientY
        });
      }
    };

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
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
      isActive = false;
    };
  }, [isMobile, PARTICLE_NUM, PARTICLE_SIZE, SQUARE_SIZE]);

  // Memoized grid generation for performance
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

  // Rich content data with improved structure
  const tabContent = {
    programs: {
      title: "Academic Programs",
      description: "Explore our curated selection of global educational programs optimized for your career path.",
      items: [
        { 
          name: "Computer Science", 
          level: "Advanced",
          icon: "💻", 
          tags: ["AI", "Cloud", "Web Dev"] 
        },
        { 
          name: "Business Analytics", 
          level: "Intermediate",
          icon: "📊", 
          tags: ["Data", "Strategy"] 
        },
        { 
          name: "Digital Marketing", 
          level: "Beginner",
          icon: "🚀", 
          tags: ["SEO", "Social"] 
        },
        { 
          name: "Data Science", 
          level: "Advanced",
          icon: "🧠", 
          tags: ["ML", "Analytics"] 
        }
      ]
    },
    consultation: {
      title: "Academic Consultation",
      description: "Connect with our advisors to create a personalized educational roadmap for your career goals.",
      form: {
        fields: [
          { name: "name", label: "Full Name", type: "text", required: true },
          { name: "email", label: "Email Address", type: "email", required: true },
          { name: "interest", label: "Area of Interest", type: "select", required: true, 
            options: [
              { value: "", label: "Select Your Interest" },
              { value: "technology", label: "Technology & Computing" },
              { value: "business", label: "Business & Management" },
              { value: "arts", label: "Arts & Design" },
              { value: "science", label: "Science & Research" }
            ]
          },
          { name: "message", label: "Your Message", type: "textarea", required: false }
        ]
      }
    }
  };

  // Form handlers with validation
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is being edited
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = () => {
    const errors = {};
    const { name, email, interest } = formData;
    
    if (!name.trim()) errors.name = 'Name is required';
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
    }
    if (!interest) errors.interest = 'Please select an area of interest';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Form submission logic would go here
      console.log('Form submitted:', formData);
      // Reset form after successful submission
      setFormData(FORM_INITIAL_STATE);
    }
  };

  return (
    <main className="antialiased">
      <div className="relative w-full h-screen bg-black text-white overflow-hidden font-sans">
        {/* High-performance particle canvas */}
        <canvas 
          ref={canvasRef}
          className="absolute inset-0 z-10 pointer-events-none"
          aria-hidden="true"
        />

        {/* Optimized grid background */}
        <div className="absolute inset-0 bg-black">
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
                zIndex: 10
              }}
              aria-hidden="true"
            />
          ))}
        </div>

        {/* Custom cursor (hidden on mobile) */}
        {!isMobile && (
          <div 
            ref={cursorRef}
            className="fixed w-8 h-8 rounded-full border-2 pointer-events-none transition-all duration-300 mix-blend-difference z-50"
            style={{
              left: `${mousePosition.x}px`,
              top: `${mousePosition.y}px`,
              backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              borderColor: isHovered ? 'rgba(74, 222, 128, 0.8)' : 'rgba(255, 255, 255, 0.3)',
              transform: `translate(-50%, -50%) scale(${isHovered ? 1.5 : 1})`
            }}
            aria-hidden="true"
          />
        )}

        <div className="relative z-20 max-w-6xl mx-auto h-full flex flex-col justify-center px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="md:col-span-6 max-w-2xl"
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
                  onClick={() => setActiveTab('programs')}
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
                  onClick={() => setActiveTab('consultation')}
                  aria-pressed={activeTab === 'consultation'}
                >
                  Academic Consultation
                </motion.button>
              </div>
            </motion.div>

            {/* Responsive Tab Content */}
            <div className="md:col-span-6 w-full">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/5 backdrop-blur-md rounded-lg p-6 border border-white/10 w-full"
                >
                  {activeTab === 'programs' && (
                    <div>
                      <h3 className="text-xl font-medium text-emerald-400 mb-3">{tabContent.programs.title}</h3>
                      <p className="text-white/70 mb-6">{tabContent.programs.description}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {tabContent.programs.items.map((program, index) => (
                          <motion.div 
                            key={index}
                            whileHover={{ x: 5 }}
                            whileTap={{ x: 0 }}
                            className="flex flex-col p-4 border border-white/10 rounded-md hover:border-emerald-400/30 transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="flex items-center gap-2">
                                <span className="text-lg">{program.icon}</span>
                                <span className="font-medium">{program.name}</span>
                              </span>
                              <span className="text-xs px-2 py-1 rounded bg-white/10 text-emerald-400 group-hover:bg-emerald-400/20 transition-colors">
                                {program.level}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {program.tags.map((tag, i) => (
                                <span key={i} className="text-xs px-2 py-1 bg-white/5 rounded-full text-white/60">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'consultation' && (
                    <div>
                      <h3 className="text-xl font-medium text-emerald-400 mb-3">{tabContent.consultation.title}</h3>
                      <p className="text-white/70 mb-4">{tabContent.consultation.description}</p>
                      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                        {tabContent.consultation.form.fields.map((field) => (
                          <div key={field.name} className="space-y-1">
                            <label 
                              htmlFor={field.name} 
                              className="text-sm text-white/80 block mb-1"
                            >
                              {field.label} {field.required && <span className="text-emerald-400">*</span>}
                            </label>
                            
                            {field.type === 'textarea' ? (
                              <textarea 
                                id={field.name}
                                name={field.name}
                                value={formData[field.name]}
                                onChange={handleFormChange}
                                placeholder={`Enter your ${field.label.toLowerCase()}`}
                                rows="3"
                                className={`w-full p-3 bg-black/20 border ${formErrors[field.name] ? 'border-red-400/50' : 'border-white/10'} rounded-md focus:border-emerald-400/50 focus:outline-none transition-colors`}
                                aria-invalid={!!formErrors[field.name]}
                              />
                            ) : field.type === 'select' ? (
                              <select 
                                id={field.name}
                                name={field.name}
                                value={formData[field.name]}
                                onChange={handleFormChange}
                                className={`w-full p-3 bg-black/20 border ${formErrors[field.name] ? 'border-red-400/50' : 'border-white/10'} rounded-md focus:border-emerald-400/50 focus:outline-none transition-colors`}
                                aria-invalid={!!formErrors[field.name]}
                              >
                                {field.options.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input 
                                id={field.name}
                                type={field.type} 
                                name={field.name}
                                value={formData[field.name]}
                                onChange={handleFormChange}
                                placeholder={`Enter your ${field.label.toLowerCase()}`}
                                className={`w-full p-3 bg-black/20 border ${formErrors[field.name] ? 'border-red-400/50' : 'border-white/10'} rounded-md focus:border-emerald-400/50 focus:outline-none transition-colors`}
                                aria-invalid={!!formErrors[field.name]}
                              />
                            )}
                            
                            {formErrors[field.name] && (
                              <p className="text-sm text-red-400 mt-1" role="alert">
                                {formErrors[field.name]}
                              </p>
                            )}
                          </div>
                        ))}
                        
                        <motion.button
                          whileHover={{ y: -2 }}
                          whileTap={{ y: 0 }}
                          className="`px-6 py-3 md:px-8 md:py-4 text-sm tracking-wider rounded-lg
                    backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/50
                    ${activeTab === 'consultation' 
                      ? 'bg-emerald-400/20 border border-emerald-400/40' 
                      : 'bg-transparent border border-white/5 hover:border-white/20'}`"
                          onMouseEnter={() => setIsHovered(true)}
                          onMouseLeave={() => setIsHovered(false)}
                          type="submit"
                        >
                          Submit Request
                        </motion.button>
                      </form>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

        
        </div>
      </div>
    </main>
  );
};

export default LevuppHero;