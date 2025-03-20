import React from 'react';
import { motion } from 'framer-motion';

const Features = () => {
  return (
    <div>
      {/* Other content */}
      <motion.button
        whileHover={{ y: -2 }}
        whileTap={{ y: 0 }}
        className="px-8 py-3 text-sm tracking-wider rounded-lg
          bg-gradient-to-r from-emerald-400/80 to-cyan-400/80 
          hover:from-emerald-400 hover:to-cyan-400
          transition-all duration-300"
      >
        Get Started Now
      </motion.button>
      {/* Other content */}
    </div>
  );
};

export default Features;
