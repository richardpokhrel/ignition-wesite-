'use client';

import React, { useMemo, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

const CountrySlider = () => {
  const controls = useAnimation();
  const sliderRef = useRef(null);

  // Country data with flags
  const countries = useMemo(() => [
    { name: "United States", flag: "🇺🇸", code: "US" },
    { name: "Canada", flag: "🇨🇦", code: "CA" },
    { name: "United Kingdom", flag: "🇬🇧", code: "UK" },
    { name: "Germany", flag: "🇩🇪", code: "DE" },
    { name: "France", flag: "🇫🇷", code: "FR" },
    { name: "Japan", flag: "🇯🇵", code: "JP" },
    { name: "Australia", flag: "🇦🇺", code: "AU" },
    { name: "India", flag: "🇮🇳", code: "IN" },
  ], []);

  // Infinite scroll animation
  useEffect(() => {
    const startAnimation = () => {
      controls.start({
        x: '-50%',
        transition: {
          duration: 40,
          ease: 'linear',
          repeat: Infinity,
        }
      });
    };

    startAnimation();
    return () => controls.stop();
  }, [controls]);

  return (
    <div className="relative w-full overflow-hidden py-12 mt-20">
      {/* Gradient overlays */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-30 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-30 pointer-events-none" />

      {/* Slider container */}
      <motion.div 
        ref={sliderRef}
        className="flex w-max"
        animate={controls}
        onHoverStart={() => controls.stop()}
        onHoverEnd={() => controls.start({
          x: '-50%',
          transition: { duration: 40, ease: 'linear', repeat: Infinity }
        })}
      >
        {/* Double the array for seamless looping */}
        {[...countries, ...countries].map((country, index) => (
          <motion.div 
            key={`${country.code}-${index}`}
            className="flex-shrink-0 mx-4 w-64 h-48 rounded-xl bg-gradient-to-br from-white/5 to-black/5 backdrop-blur-sm border border-white/10 hover:border-emerald-400/30 relative overflow-hidden group transition-all duration-300 cursor-pointer"
            whileHover={{ scale: 1.05 }}
          >
            {/* Animated background */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-cyan-400/10 animate-pulse" />
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-geometric.png')] opacity-10 mix-blend-soft-light" />
            </div>

            {/* Card content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 text-center">
              {/* Country flag */}
              <motion.div 
                className="text-6xl mb-4"
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.2, rotate: 10 }}
              >
                {country.flag}
              </motion.div>

              {/* Country name */}
              <div className="text-xl font-medium text-white/90 mb-2">{country.name}</div>

              {/* Country code */}
              <div className="text-sm text-emerald-400/80 font-mono">{country.code}</div>
            </div>

            {/* Hover effect lines */}
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default CountrySlider;