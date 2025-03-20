'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Enhanced 3D Globe Component with improved positioning and scroll behavior
const InteractiveGlobe = ({ activeTab, scrollProgress }) => {
    const containerRef = useRef();
    const scene = useRef(new THREE.Scene());
    const renderer = useRef();
    const camera = useRef();
    const globe = useRef();
    const controls = useRef();
    const raycaster = useRef(new THREE.Raycaster());
    const mouse = useRef(new THREE.Vector2());
    const markerMeshes = useRef([]);
    const textLabels = useRef([]);
    const connectionLines = useRef([]);
    const animationFrameId = useRef();
  
    // Create connection lines between locations
    const createConnections = (locations) => {
      // Clear existing connections
      connectionLines.current.forEach(line => {
        scene.current.remove(line);
        if (line.geometry) line.geometry.dispose();
        if (line.material) line.material.dispose();
      });
      connectionLines.current = [];
  
      // Create new connections
      for (let i = 0; i < locations.length; i++) {
        for (let j = i + 1; j < locations.length; j++) {
          const startPos = latLongToVector3(locations[i].lat, locations[i].lon, 3.5);
          const endPos = latLongToVector3(locations[j].lat, locations[j].lon, 3.5);
          
          // Create curved line between points
          const curvePoints = [];
          const segments = 50;
          
          for (let k = 0; k <= segments; k++) {
            const t = k / segments;
            
            // Linear interpolation
            const x = startPos.x * (1 - t) + endPos.x * t;
            const y = startPos.y * (1 - t) + endPos.y * t;
            const z = startPos.z * (1 - t) + endPos.z * t;
            
            // Add curve by pushing point outward
            const midPoint = t * (1 - t);
            const elevation = 0.3;
            
            const point = new THREE.Vector3(
              x, 
              y + midPoint * elevation,
              z
            );
            
            // Normalize to surface of globe
            point.normalize().multiplyScalar(3.6 + midPoint * 0.5);
            curvePoints.push(point);
          }
          
          // Create line geometry and material
          const curve = new THREE.CatmullRomCurve3(curvePoints);
          const geometry = new THREE.TubeGeometry(curve, 20, 0.02, 8, false);
          const material = new THREE.MeshBasicMaterial({
            color: 0x4ade80,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending
          });
          
          const connectionLine = new THREE.Mesh(geometry, material);
          scene.current.add(connectionLine);
          connectionLines.current.push(connectionLine);
        }
      }
    };
  
    useEffect(() => {
      if (!containerRef.current) return;
  
      // Scene Setup with improved parameters
      camera.current = new THREE.PerspectiveCamera(
        45,
        containerRef.current.clientWidth / containerRef.current.clientHeight,
        0.1,
        1000
      );
      // Position camera to show globe on the right side initially
      camera.current.position.set(4, 0, 10); // Moved further right and back for better initial view
  
      renderer.current = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        precision: "highp"
      });
      renderer.current.setSize(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight
      );
      renderer.current.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      containerRef.current.appendChild(renderer.current.domElement);
  
      // Enhanced Lighting for better realism
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.current.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
      directionalLight.position.set(5, 3, 5);
      scene.current.add(directionalLight);
      
      // Add subtle rim lighting for better depth
      const backLight = new THREE.DirectionalLight(0x6ae4ff, 0.3);
      backLight.position.set(-5, 2, -5);
      scene.current.add(backLight);
  
      // Earth Geometry with improved textures and materials
      const textureLoader = new THREE.TextureLoader();
      // Pre-load textures to avoid flickering
      const earthTexture = textureLoader.load('https://threejsfundamentals.org/threejs/resources/images/world.jpg');
      const bumpTexture = textureLoader.load('https://threejsfundamentals.org/threejs/resources/images/bump.jpg');
      // Add subtle cloud and specular maps
      const cloudTexture = textureLoader.load('https://threejsfundamentals.org/threejs/resources/images/clouds.png');
      
      earthTexture.anisotropy = renderer.current.capabilities.getMaxAnisotropy();
      
      const globeGeometry = new THREE.SphereGeometry(3.5, 64, 64);
      const globeMaterial = new THREE.MeshPhongMaterial({
        map: earthTexture,
        bumpMap: bumpTexture,
        bumpScale: 0.05,
        specular: new THREE.Color(0x444444),
        shininess: 15,
        reflectivity: 0.2
      });
      
      globe.current = new THREE.Mesh(globeGeometry, globeMaterial);
      scene.current.add(globe.current);
      
      // Optional cloud layer
      const cloudGeometry = new THREE.SphereGeometry(3.55, 32, 32);
      const cloudMaterial = new THREE.MeshBasicMaterial({
        map: cloudTexture,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
      });
      
      const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
      scene.current.add(clouds);
  
      // Improved atmosphere glow effect
      const atmosphereGeometry = new THREE.SphereGeometry(3.58, 32, 32);
      const atmosphereMaterial = new THREE.ShaderMaterial({
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          void main() {
            float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
            gl_FragColor = vec4(0.3, 0.8, 1.0, 1.0) * intensity;
          }
        `,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true
      });
      
      const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
      scene.current.add(atmosphere);
  
      // Enhanced Interactive Markers with hover effects and visible labels
      const locations = [
        { lat: 40.7128, lon: -74.0060, color: 0xff3838, name: "New York" }, // New York
        { lat: 51.5074, lon: -0.1278, color: 0x4ade80, name: "London" },    // London
        { lat: 35.6895, lon: 139.6917, color: 0x22d3ee, name: "Tokyo" },    // Tokyo
        { lat: -33.8688, lon: 151.2093, color: 0xffa500, name: "Sydney" },  // Sydney
        { lat: 19.0760, lon: 72.8777, color: 0xff5e82, name: "Mumbai" }     // Mumbai
      ];
  
      // Create connection lines between locations
      createConnections(locations);
  
      // Add location markers with labels
      locations.forEach(location => {
        // Create marker group
        const markerGroup = new THREE.Group();
        
        // Main marker
        const markerGeometry = new THREE.SphereGeometry(0.08);
        const markerMaterial = new THREE.MeshBasicMaterial({ 
          color: location.color,
          transparent: true,
          opacity: 0.8
        });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        
        // Pulsing halo
        const haloGeometry = new THREE.SphereGeometry(0.1);
        const haloMaterial = new THREE.MeshBasicMaterial({
          color: location.color,
          transparent: true,
          opacity: 0.4
        });
        const halo = new THREE.Mesh(haloGeometry, haloMaterial);
        
        // Create location pin spike
        const spikeGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.3, 8);
        const spikeMaterial = new THREE.MeshBasicMaterial({
          color: location.color,
          transparent: true,
          opacity: 0.6
        });
        const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
        
        // Position the marker group
        const position = latLongToVector3(location.lat, location.lon, 3.5);
        markerGroup.position.copy(position);
        
        // Calculate orientation to point away from globe center
        markerGroup.lookAt(0, 0, 0);
        markerGroup.rotateX(Math.PI / 2);
        
        // Position spike slightly above marker
        spike.position.y = 0.15;
        
        // Add text label (using HTML overlay for better visibility)
        const labelDiv = document.createElement('div');
        labelDiv.className = 'absolute pointer-events-none text-white text-xs px-2 py-1 rounded-lg bg-black/60 whitespace-nowrap transform -translate-x-1/2 -translate-y-1/2';
        labelDiv.textContent = location.name;
        labelDiv.style.opacity = '0';
        labelDiv.style.transition = 'opacity 0.3s ease';
        containerRef.current.appendChild(labelDiv);
        textLabels.current.push({
          element: labelDiv,
          position: position.clone(),
          name: location.name
        });
        
        markerGroup.userData = { 
          location: location.name,
          isAnimating: true,
          initialScale: 1.0,
          pulsePhase: Math.random() * Math.PI * 2 // Randomize pulse phase
        };
        
        markerGroup.add(marker);
        markerGroup.add(halo);
        markerGroup.add(spike);
        scene.current.add(markerGroup);
        markerMeshes.current.push(markerGroup);
      });
  
      // Enhanced Controls with better damping and limits
      controls.current = new OrbitControls(camera.current, renderer.current.domElement);
      controls.current.enableDamping = true;
      controls.current.dampingFactor = 0.07;
      controls.current.rotateSpeed = 0.5;
      controls.current.zoomSpeed = 0.8;
      controls.current.autoRotate = activeTab === 'programs';
      controls.current.autoRotateSpeed = 0.4;
      
      // Limit zoom range for better UX
      controls.current.minDistance = 5;
      controls.current.maxDistance = 15;
      
      // Smoothly orient the globe to show most continents
      controls.current.target.set(0, 0, 0);
      globe.current.rotation.y = Math.PI / 8;
  
      // Animation Loop with performance optimizations
      let lastFrameTime = 0;
      const animate = (time) => {
        animationFrameId.current = requestAnimationFrame(animate);
        
        // Throttle updates for better performance
        const elapsed = time - lastFrameTime;
        if (elapsed < 16.7 && elapsed > 0) return; // aim for ~60fps
        lastFrameTime = time;
        
        // Animate marker pulses
        markerMeshes.current.forEach(markerGroup => {
          if (markerGroup.userData.isAnimating) {
            const halo = markerGroup.children[1];
            const pulseScale = 1.0 + 0.3 * Math.sin(time * 0.003 + markerGroup.userData.pulsePhase);
            halo.scale.set(pulseScale, pulseScale, pulseScale);
            
            // Subtle hover effect
            const marker = markerGroup.children[0];
            marker.rotation.y += 0.01;
          }
        });
        
        // Update text labels positions
        if (textLabels.current.length > 0) {
          textLabels.current.forEach(label => {
            if (camera.current && containerRef.current) {
              // Project 3D position to 2D screen coordinates
              const vector = label.position.clone();
              vector.project(camera.current);
              
              // Convert to screen coordinates
              const x = (vector.x * 0.5 + 0.5) * containerRef.current.clientWidth;
              const y = (- vector.y * 0.5 + 0.5) * containerRef.current.clientHeight;
              
              // Check if the point is in front of the camera (visible)
              if (vector.z < 1) {
                // Make labels fade out as we zoom in
                const opacity = scrollProgress !== undefined ? Math.max(0, 1 - scrollProgress * 2) : 1;
                label.element.style.opacity = opacity.toString();
                label.element.style.left = `${x}px`;
                label.element.style.top = `${y}px`;
              } else {
                label.element.style.opacity = '0';
              }
            }
          });
        }
        
        // Animate connection lines
        connectionLines.current.forEach((line, index) => {
          // Make connection lines fade out as we zoom in
          const baseOpacity = scrollProgress !== undefined ? Math.max(0, 0.4 - scrollProgress * 0.4) : 0.4;
          line.material.opacity = baseOpacity + 0.2 * Math.sin(time * 0.001 + index * 0.5);
        });
        
        // Subtle cloud rotation
        if (clouds) {
          clouds.rotation.y += 0.0002;
        }
        
        controls.current.update();
        renderer.current.render(scene.current, camera.current);
      };
      
      // Start the animation loop
      animate(0);
  
      // Enhanced interaction with hover effects
      const handleMouseMove = (event) => {
        const rect = containerRef.current.getBoundingClientRect();
        mouse.current.x = ((event.clientX - rect.left) / containerRef.current.clientWidth) * 2 - 1;
        mouse.current.y = -((event.clientY - rect.top) / containerRef.current.clientHeight) * 2 + 1;
        
        // Raycast to detect marker hover
        raycaster.current.setFromCamera(mouse.current, camera.current);
        const intersects = raycaster.current.intersectObjects(
          markerMeshes.current.flatMap(group => group.children)
        );
        
        // Reset all markers
        markerMeshes.current.forEach(group => {
          const marker = group.children[0];
          if (!marker.userData.isHovered) {
            marker.scale.set(1, 1, 1);
          }
          
          // Hide all labels by default
          const label = textLabels.current.find(l => l.name === group.userData.location);
          if (label) {
            label.element.style.fontWeight = 'normal';
            label.element.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
          }
        });
        
        // Handle intersections
        if (intersects.length > 0) {
          const markerObj = intersects[0].object;
          const parentGroup = markerObj.parent;
          if (parentGroup) {
            const marker = parentGroup.children[0];
            marker.userData.isHovered = true;
            marker.scale.set(1.3, 1.3, 1.3);
            
            // Highlight the label
            const label = textLabels.current.find(l => l.name === parentGroup.userData.location);
            if (label) {
              label.element.style.fontWeight = 'bold';
              label.element.style.backgroundColor = 'rgba(74, 222, 128, 0.4)';
            }
            
            document.body.style.cursor = 'pointer';
          }
        } else {
          document.body.style.cursor = 'default';
        }
      };
  
      containerRef.current.addEventListener('mousemove', handleMouseMove);
  
      // Resize Handler with debounce
      let resizeTimeout;
      const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          if (!containerRef.current) return;
          
          camera.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
          camera.current.updateProjectionMatrix();
          renderer.current.setSize(
            containerRef.current.clientWidth,
            containerRef.current.clientHeight
          );
          renderer.current.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }, 250);
      };
      
      window.addEventListener('resize', handleResize);
  
      return () => {
        window.removeEventListener('resize', handleResize);
        containerRef.current?.removeEventListener('mousemove', handleMouseMove);
        
        // Clean up text labels
        textLabels.current.forEach(label => {
          if (label.element && label.element.parentNode) {
            label.element.parentNode.removeChild(label.element);
          }
        });
        textLabels.current = [];
        
        // Proper cleanup for better memory management
        controls.current?.dispose();
        
        if (globe.current) {
          if (globe.current.geometry) globe.current.geometry.dispose();
          if (globe.current.material) {
            if (Array.isArray(globe.current.material)) {
              globe.current.material.forEach(m => m.dispose());
            } else {
              globe.current.material.dispose();
            }
          }
        }
        
        markerMeshes.current.forEach(group => {
          group.children.forEach(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
          });
        });
        
        connectionLines.current.forEach(line => {
          if (line.geometry) line.geometry.dispose();
          if (line.material) line.material.dispose();
        });
        
        scene.current.clear();
        renderer.current?.dispose();
        containerRef.current?.removeChild(renderer.current?.domElement);
        cancelAnimationFrame(animationFrameId.current);
      };
    }, []);
  
    // Update camera position and zoom based on scroll progress
    useEffect(() => {
      if (!camera.current || scrollProgress === undefined) return;
      
      // Calculate new camera position based on scroll
      if (scrollProgress > 0) {
        // Start with globe positioned to the right, then zoom in and center as scroll progresses
        // At scrollProgress = 1, we want the globe to fill the entire screen
        
        // Calculate target zoom level (z position)
        // Start far away (10), end very close (1.5)
        const targetZ = 10 - (scrollProgress * 8.5);
        
        // Start with X offset to the right (4), end centered (0)
        const targetX = 4 - (scrollProgress * 4);
        
        // Start with Y offset at 0, end slightly raised (-1)
        const targetY = 0 - (scrollProgress * 1);
        
        // Smooth transitions
        const easeOutQuad = (t) => t * (2 - t); // Easing function for smoother feel
        const easedProgress = easeOutQuad(scrollProgress);
        
        // Apply smoothing to camera movement
        camera.current.position.z = THREE.MathUtils.lerp(camera.current.position.z, targetZ, 0.05);
        camera.current.position.x = THREE.MathUtils.lerp(camera.current.position.x, targetX, 0.05);
        camera.current.position.y = THREE.MathUtils.lerp(camera.current.position.y, targetY, 0.05);
        
        // Scale the globe slightly as we zoom in for more immersive feel
        const scaleMultiplier = 1 + (scrollProgress * 0.15);
        globe.current.scale.set(scaleMultiplier, scaleMultiplier, scaleMultiplier);
        
        // Disable auto-rotate at higher zoom levels
        if (controls.current) {
          controls.current.autoRotate = scrollProgress < 0.3;
        }
      }
    }, [scrollProgress]);
  
    // Update controls when activeTab changes
    useEffect(() => {
      if (!controls.current) return;
      
      // Smooth transition to autorotate state
      const targetAutoRotate = activeTab === 'programs' && (scrollProgress === undefined || scrollProgress < 0.3);
      const currentAutoRotate = controls.current.autoRotate;
      
      if (targetAutoRotate !== currentAutoRotate) {
        // Smoothly transition to new state
        let t = 0;
        const smoothTransition = () => {
          t += 0.05;
          if (t >= 1) {
            controls.current.autoRotate = targetAutoRotate;
            controls.current.autoRotateSpeed = targetAutoRotate ? 0.5 : 0.2;
            return;
          }
          
          // Smooth easing
          const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
          controls.current.autoRotateSpeed = targetAutoRotate ? 
            ease * 0.5 : 
            (1 - ease) * 0.5;
          
          requestAnimationFrame(smoothTransition);
        };
        
        smoothTransition();
      }
    }, [activeTab, scrollProgress]);
  
    // Utility function to convert latitude/longitude to 3D position
    const latLongToVector3 = (lat, lon, radius) => {
      const phi = (90 - lat) * Math.PI / 180;
      const theta = (lon + 180) * Math.PI / 180;
      return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    };
  
    return (
      <div 
        ref={containerRef} 
        className="w-full h-full absolute inset-0 transition-opacity duration-500"
        style={{ opacity: 1 }}
      />
    );
  };
const SecondSlide = () => {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.6 }}
        className="fixed inset-0 z-30 bg-black/90 flex items-center justify-center"
      >
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            {/* Left content for second slide */}
            <div className="md:col-span-7">
              <h2 className="text-3xl md:text-5xl font-light mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  Global Academic Network
                </span>
              </h2>
              <p className="text-white/70 mb-8 text-base md:text-lg">
                Our network spans across five continents, connecting students with world-class educational institutions and opportunities. Explore how our global connections can transform your academic journey.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                {[
                  { title: "International Partners", count: "130+" },
                  { title: "Countries Represented", count: "45" },
                  { title: "Student Success Rate", count: "94%" },
                  { title: "Global Scholarships", count: "$2.4M" }
                ].map((stat, index) => (
                  <div 
                    key={index}
                    className="p-4 border border-white/10 rounded-lg backdrop-blur-sm bg-white/5 hover:bg-white/10 transition"
                  >
                    <p className="text-emerald-400 text-3xl font-medium mb-2">{stat.count}</p>
                    <p className="text-white/60 text-sm">{stat.title}</p>
                  </div>
                ))}
              </div>
              
              <motion.button
                whileHover={{ y: -2, backgroundColor: "rgba(74, 222, 128, 0.3)" }}
                whileTap={{ y: 0 }}
                className="px-8 py-4 text-sm tracking-wider rounded-lg
                  bg-emerald-400/20 border border-emerald-400/40 
                  backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                Schedule a Consultation
              </motion.button>
            </div>
            
            {/* Right content for second slide - keep the globe but reposition it */}
            <div className="md:col-span-5 w-full h-[400px] md:h-[600px]">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7 }}
                className="w-full h-full relative"
              >
                {/* This will reuse the existing globe with different settings */}
                <InteractiveGlobe activeTab="consultation" scrollProgress={1} />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

const Hero122 = () => {
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
      {/* Interactive canvas background */}
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 z-0 w-full h-full" 
        aria-hidden="true"
      />
      
      {/* Grid background with optimized rendering and proper z-index */}
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
              zIndex: 10
            }}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Enhanced custom cursor with smoother animations */}
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

      {/* First slide - Main content with improved z-index and layout */}
      <div className="relative z-20 max-w-6xl mx-auto h-screen flex flex-col justify-center px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Left Column - Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-6 max-w-2xl"
            style={{ opacity: showSecondSlide ? 0 : 1, transition: 'opacity 0.5s ease' }}
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
       
           

          {/* Right Column - Interactive Globe with proper positioning and z-index */}
          <div className="md:col-span-6 w-full h-[500px] md:h-[700px] relative" 
            style={{ opacity: showSecondSlide ? 0 : 1, transition: 'opacity 0.5s ease' }}>
            <motion.div
              ref={globeContainerRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="w-full h-full relative z-20"
            >
              <InteractiveGlobe activeTab={activeTab} scrollProgress={scrollProgress} />
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Second slide with AnimatePresence for smooth transitions */}
      <AnimatePresence>
        {showSecondSlide && <SecondSlide />}
      </AnimatePresence>
      
      {/* Scroll indicator for better UX */}
      <motion.div 
        className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center z-30 transition-opacity duration-500 ${
          showSecondSlide ? 'opacity-0' : 'opacity-100'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
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


export default Hero122;