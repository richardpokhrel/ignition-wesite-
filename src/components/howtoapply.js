// import React, { useState, useEffect, useRef } from 'react';
// import { motion, useAnimation, AnimatePresence } from 'framer-motion';

// const HowToApplySlide = () => {
//   const [activeStep, setActiveStep] = useState(0);
//   const containerRef = useRef(null);
//   const [isInView, setIsInView] = useState(false);
//   const controls = useAnimation();
  
//   // Application steps data
//   const steps = [
//     {
//       number: 1,
//       title: "Choose Your Program",
//       description: "Browse through our curated selection of global programs and select up to 5 universities that align with your academic goals and aspirations.",
//       icon: (
//         <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//         </svg>
//       ),
//       visual: (
//         <div className="relative">
//           <div className="absolute -top-6 -left-6 w-24 h-24 bg-emerald-400/10 rounded-full blur-xl"></div>
//           <div className="grid grid-cols-2 gap-3">
//             {[1, 2, 3, 4].map((item) => (
//               <div key={item} className="bg-white/5 p-3 rounded-lg border border-white/10 hover:border-emerald-400/30 transition-colors">
//                 <div className="w-full h-2 bg-white/20 rounded mb-2"></div>
//                 <div className="w-3/4 h-2 bg-white/10 rounded"></div>
//                 {item === 1 && (
//                   <div className="mt-2 w-5 h-5 rounded-full bg-emerald-400/20 flex items-center justify-center">
//                     <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
//                     </svg>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       )
//     },
//     {
//       number: 2,
//       title: "Complete Application",
//       description: "Fill out the comprehensive application form and upload all required documents. You can apply to up to 5 universities with a single application.",
//       icon: (
//         <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//         </svg>
//       ),
//       visual: (
//         <div className="relative">
//           <div className="absolute -top-6 -right-6 w-24 h-24 bg-cyan-400/10 rounded-full blur-xl"></div>
//           <div className="bg-white/5 rounded-lg border border-white/10 p-4">
//             <div className="space-y-3">
//               <div className="w-full flex items-center">
//                 <div className="w-20 text-xs text-white/50">Full Name</div>
//                 <div className="flex-1 h-8 bg-black/30 rounded border border-white/10 px-3 flex items-center">
//                   <div className="w-24 h-2 bg-white/20 rounded"></div>
//                 </div>
//               </div>
//               <div className="w-full flex items-center">
//                 <div className="w-20 text-xs text-white/50">Email</div>
//                 <div className="flex-1 h-8 bg-black/30 rounded border border-white/10 px-3 flex items-center">
//                   <div className="w-32 h-2 bg-white/20 rounded"></div>
//                 </div>
//               </div>
//               <div className="w-full flex items-center">
//                 <div className="w-20 text-xs text-white/50">Documents</div>
//                 <div className="flex-1">
//                   <div className="px-3 py-2 border border-dashed border-emerald-400/30 rounded bg-emerald-400/5 text-xs text-center text-white/60">
//                     Drop files here or click to upload
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )
//     },
//     {
//       number: 3,
//       title: "Pay Application Fee",
//       description: "Submit a one-time application fee that covers all your selected universities. Secure payment options are available for your convenience.",
//       icon: (
//         <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
//         </svg>
//       ),
//       visual: (
//         <div className="relative">
//           <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-purple-400/10 rounded-full blur-xl"></div>
//           <div className="bg-white/5 rounded-lg border border-white/10 p-4">
//             <div className="flex justify-between items-center mb-4">
//               <div>
//                 <div className="text-xs text-white/50">Application Fee</div>
//                 <div className="text-lg font-medium">$75.00</div>
//               </div>
//               <div className="h-10 w-10 rounded-full bg-emerald-400/20 flex items-center justify-center">
//                 <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
//                 </svg>
//               </div>
//             </div>
//             <div className="grid grid-cols-4 gap-2 mb-3">
//               {[1, 2, 3, 4].map((i) => (
//                 <div key={i} className="h-10 bg-black/30 rounded border border-white/10 flex items-center justify-center">
//                   <div className="w-4 h-4 rounded-full bg-white/10"></div>
//                 </div>
//               ))}
//             </div>
//             <div className="mt-3">
//               <div className="h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded flex items-center justify-center text-sm font-medium">
//                 Pay Securely
//               </div>
//             </div>
//           </div>
//         </div>
//       )
//     },
//     {
//       number: 4,
//       title: "Review & Submit",
//       description: "Carefully review all your information, make any necessary changes, and submit your application to begin your global education journey.",
//       icon: (
//         <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//         </svg>
//       ),
//       visual: (
//         <div className="relative">
//           <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-400/10 rounded-full blur-xl"></div>
//           <div className="space-y-3">
//             <div className="bg-white/5 rounded-lg border border-white/10 p-3 flex items-center">
//               <div className="w-5 h-5 rounded-full bg-emerald-400/20 flex items-center justify-center mr-3">
//                 <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
//                 </svg>
//               </div>
//               <div>
//                 <div className="text-xs">Personal Details</div>
//                 <div className="w-20 h-1.5 bg-white/10 rounded-full mt-1">
//                   <div className="h-full w-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"></div>
//                 </div>
//               </div>
//             </div>
//             <div className="bg-white/5 rounded-lg border border-white/10 p-3 flex items-center">
//               <div className="w-5 h-5 rounded-full bg-emerald-400/20 flex items-center justify-center mr-3">
//                 <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
//                 </svg>
//               </div>
//               <div>
//                 <div className="text-xs">Academic Records</div>
//                 <div className="w-20 h-1.5 bg-white/10 rounded-full mt-1">
//                   <div className="h-full w-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"></div>
//                 </div>
//               </div>
//             </div>
//             <div className="bg-emerald-400/20 rounded-lg border border-emerald-400/30 p-3 flex justify-between items-center">
//               <div className="text-sm font-medium">Submit Application</div>
//               <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
//               </svg>
//             </div>
//           </div>
//         </div>
//       )
//     }
//   ];
  
//   // Auto-cycle through steps
//   useEffect(() => {
//     if (!isInView) return;
    
//     const interval = setInterval(() => {
//       setActiveStep((prev) => (prev + 1) % steps.length);
//     }, 4000);
    
//     return () => clearInterval(interval);
//   }, [isInView, steps.length]);
  
//   // Check if component is in viewport
//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         setIsInView(entry.isIntersecting);
//         if (entry.isIntersecting) {
//           controls.start("visible");
//         }
//       },
//       { threshold: 0.1 }
//     );
    
//     const currentElement = containerRef.current;
//     if (currentElement) {
//       observer.observe(currentElement);
//     }
    
//     return () => {
//       if (currentElement) {
//         observer.unobserve(currentElement);
//       }
//     };
//   }, [controls]);

//   return (
//     <div 
//       ref={containerRef}
//       className="relative w-full min-h-screen bg-black text-white font-sans py-16 overflow-hidden"
//     >
//       {/* Background Elements */}
//       <div className="absolute inset-0 bg-black">
//         {/* Grid background */}
//         <div className="grid grid-cols-12 gap-4 opacity-10">
//           {Array.from({ length: 24 }).map((_, i) => (
//             <div key={i} className="h-16 border border-emerald-400/10" />
//           ))}
//         </div>
        
//         {/* Abstract shapes */}
//         <motion.div 
//           className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-emerald-400/5 to-cyan-400/5 blur-3xl"
//           animate={{
//             scale: [1, 1.2, 1],
//             opacity: [0.3, 0.5, 0.3],
//           }}
//           transition={{
//             duration: 8,
//             repeat: Infinity,
//             repeatType: "reverse"
//           }}
//         />
//         <motion.div 
//           className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-gradient-to-tl from-purple-400/5 to-cyan-400/5 blur-3xl"
//           animate={{
//             scale: [1, 1.2, 1],
//             opacity: [0.3, 0.5, 0.3],
//           }}
//           transition={{
//             duration: 8,
//             repeat: Infinity,
//             repeatType: "reverse",
//             delay: 2
//           }}
//         />
//       </div>
      
//       {/* Content Section */}
//       <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
//         {/* Heading Section */}
//         <motion.div 
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.7 }}
//           className="text-center mb-16"
//         >
//           <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-emerald-400 to-transparent mb-6" />
          
//           <h2 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight mb-4">
//             How to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Apply</span>
//           </h2>
          
//           <p className="text-base md:text-lg text-white/70 font-light max-w-2xl mx-auto">
//             Our streamlined application process makes it easy to begin your global education journey in just four simple steps
//           </p>
//         </motion.div>
        
//         {/* Application Steps Section */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
//           {/* Left Side: Steps List */}
//           <div className="space-y-4">
//             {steps.map((step, index) => (
//               <motion.div
//                 key={index}
//                 className={`relative rounded-lg p-5 transition-colors duration-300 cursor-pointer
//                   ${activeStep === index 
//                     ? 'bg-gradient-to-r from-emerald-400/20 to-cyan-400/10 border border-emerald-400/30' 
//                     : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
//                 onClick={() => setActiveStep(index)}
//                 whileHover={{
//                   x: 5,
//                   transition: { duration: 0.2 }
//                 }}
//                 animate={{
//                   scale: activeStep === index ? [1, 1.02, 1] : 1,
//                   transition: {
//                     duration: 0.5,
//                     repeat: activeStep === index ? Infinity : 0,
//                     repeatType: "reverse"
//                   }
//                 }}
//               >
//                 <div className="flex items-start">
//                   <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0
//                     ${activeStep === index 
//                       ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-black' 
//                       : 'bg-white/10 text-white/70'}`}
//                   >
//                     {step.number}
//                   </div>
                  
//                   <div>
//                     <h3 className="text-lg font-medium mb-1 flex items-center">
//                       {step.title}
//                       <span className="ml-2">
//                         {step.icon && (
//                           <span className={`w-5 h-5 ${activeStep === index ? 'text-emerald-400' : 'text-white/50'}`}>
//                             {step.icon}
//                           </span>
//                         )}
//                       </span>
//                     </h3>
//                     <p className="text-sm text-white/70 leading-relaxed">
//                       {step.description}
//                     </p>
//                   </div>
//                 </div>
                
//                 {/* Connection line */}
//                 {index < steps.length - 1 && (
//                   <div className="absolute left-7 top-16 w-px h-8 bg-gradient-to-b from-emerald-400/30 to-transparent"></div>
//                 )}
//               </motion.div>
//             ))}
//           </div>
          
//           {/* Right Side: Visual Display */}
//           <div className="relative h-full">
//             <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6 h-full">
//               {/* Step visualizations */}
//               <AnimatePresence mode="wait">
//                 <motion.div
//                   key={activeStep}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: -20 }}
//                   transition={{ duration: 0.5 }}
//                   className="h-full flex items-center justify-center py-4"
//                 >
//                   {steps[activeStep].visual}
//                 </motion.div>
//               </AnimatePresence>
              
//               {/* Progress indicators */}
//               <div className="absolute bottom-4 left-0 right-0 flex justify-center">
//                 <div className="flex space-x-2">
//                   {steps.map((_, index) => (
//                     <motion.div
//                       key={index}
//                       className={`w-2 h-2 rounded-full ${activeStep === index 
//                         ? 'bg-gradient-to-r from-emerald-400 to-cyan-400' 
//                         : 'bg-white/20'}`}
//                       whileHover={{ scale: 1.5 }}
//                       onClick={() => setActiveStep(index)}
//                       initial={{ scale: 1 }}
//                       animate={{ 
//                         scale: activeStep === index ? [1, 1.2, 1] : 1,
//                       }}
//                       transition={{ 
//                         duration: 1.5, 
//                         repeat: activeStep === index ? Infinity : 0,
//                         repeatType: "reverse"
//                       }}
//                     />
//                   ))}
//                 </div>
//               </div>
//             </div>
            
//             {/* Decorative elements */}
//             <div className="absolute -top-8 -right-8 w-16 h-16 border border-emerald-400/20 rounded-lg -rotate-6"></div>
//             <div className="absolute -bottom-8 -left-8 w-16 h-16 border border-cyan-400/20 rounded-lg rotate-12"></div>
            
//             {/* Animated dots */}
//             {Array.from({ length: 6 }).map((_, i) => (
//               <motion.div
//                 key={i}
//                 className="absolute w-1 h-1 bg-emerald-400/50 rounded-full"
//                 style={{
//                   left: `${20 + (i * 10)}%`,
//                   top: `${85 - (i * 12)}%`,
//                 }}
//                 animate={{
//                   y: [0, -10, 0],
//                   opacity: [0.3, 1, 0.3],
//                 }}
//                 transition={{
//                   duration: 2 + i,
//                   repeat: Infinity,
//                   delay: i * 0.2,
//                 }}
//               />
//             ))}
//           </div>
//         </div>
        
//         {/* CTA Button */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.7, delay: 0.5 }}
//           className="text-center mt-16"
//         >
//           <motion.button
//             whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(74, 222, 128, 0.1)" }}
//             whileTap={{ y: 0 }}
//             className="px-8 py-4 text-base tracking-wider rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium inline-flex items-center shadow-lg shadow-emerald-500/10"
//           >
//             Start Your Application
//             <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
//             </svg>
//           </motion.button>
//         </motion.div>
//       </div>
      
//       {/* Particle Effect */}
//       <div className="absolute inset-0 pointer-events-none">
//         {Array.from({ length: 20 }).map((_, i) => (
//           <motion.div
//             key={i}
//             className="absolute w-1 h-1 rounded-full bg-white/30"
//             style={{
//               left: `${Math.random() * 100}%`,
//               top: `${Math.random() * 100}%`,
//             }}
//             animate={{
//               y: [0, -30, 0],
//               opacity: [0, 0.5, 0],
//             }}
//             transition={{
//               duration: 3 + Math.random() * 7,
//               repeat: Infinity,
//               delay: Math.random() * 5,
//             }}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default HowToApplySlide;