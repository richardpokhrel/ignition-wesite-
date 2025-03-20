// components/CustomCursor.js
'use client';
import { useState, useEffect, useRef } from 'react';

 export const CustomCursor = () => {
    const cursorRef = useRef(null);
    const innerCursorRef = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    // const [isHovered, setIsHovered] = useState(false);
    const particles = useRef([]);

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

    
  
    useEffect(() => {
      const mouseMove = (e) => {
        setPosition({ x: e.clientX, y: e.clientY });
        
        // Add particle trail
        if (particles.current.length < 20) {
          const particle = document.createElement('div');
          particle.className = 'cursor-particle';
          document.body.appendChild(particle);
          particles.current.push({
            el: particle,
            x: e.clientX,
            y: e.clientY,
            life: 1
          });
        }
      };
  
      window.addEventListener('mousemove', mouseMove);
  
      // Particle animation
      const animate = () => {
        particles.current.forEach((particle, index) => {
          if (particle.life <= 0) {
            document.body.removeChild(particle.el);
            particles.current.splice(index, 1);
          } else {
            particle.x += (Math.random() - 0.5) * 4;
            particle.y += (Math.random() - 0.5) * 4;
            particle.life -= 0.03;
            
            particle.el.style.transform = `translate(${particle.x}px, ${particle.y}px)`;
            particle.el.style.opacity = particle.life;
          }
        });
        requestAnimationFrame(animate);
      };
      animate();
  
      return () => {
        window.removeEventListener('mousemove', mouseMove);
        particles.current.forEach(particle => {
          document.body.removeChild(particle.el);
        });
      };
    }, []);

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
  
    useEffect(() => {
      if (cursorRef.current && innerCursorRef.current) {
        cursorRef.current.style.transform = `translate(${position.x}px, ${position.y}px)`;
        innerCursorRef.current.style.transform = `translate(${position.x}px, ${position.y}px)`;
      }
    }, [position]);
  
    return (
      <>
        {/* Main cursor */}
        <div
          ref={cursorRef}
          className="fixed w-8 h-8 border-2 border-orange-500 rounded-full pointer-events-none z-50 
            transition-all duration-300 mix-blend-difference"
          style={{
            opacity: isHovered ? 0.8 : 0.3,
            transform: `translate(${position.x}px, ${position.y}px)`
          }}
        >
          {/* Inner orange circle */}
          <div
            ref={innerCursorRef}
            className="absolute w-4 h-4 bg-orange-500 rounded-full top-1/2 left-1/2 
              transform -translate-x-1/2 -translate-y-1/2"
          />
        </div>
  
        <style jsx global>{`
          .cursor-particle {
            position: fixed;
            width: 4px;
            height: 4px;
            background: rgba(249, 115, 22, 0.6);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            transition: opacity 0.3s ease;
          }
  
          @keyframes cursorPulse {
            0% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.2); opacity: 0.4; }
            100% { transform: scale(1); opacity: 0.8; }
          }
        `}</style>
      </>
    );
  };
  