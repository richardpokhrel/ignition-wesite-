'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

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
  const airplaneModels = useRef([]);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);

  // Study abroad locations with program details
  const studyAbroadLocations = [
    { 
      lat: 40.7128, 
      lon: -74.0060, 
      color: 0xff3838, 
      name: "New York University", 
      programs: ["Business", "Arts", "Technology"],
      description: "Experience the vibrant culture of NYC while studying at a top-ranked university."
    },
    { 
      lat: 51.5074, 
      lon: -0.1278, 
      color: 0x4ade80, 
      name: "London School of Economics", 
      programs: ["Economics", "Political Science", "Law"],
      description: "Prestigious institution in the heart of London offering world-class education."
    },
    { 
      lat: 35.6895, 
      lon: 139.6917, 
      color: 0x22d3ee, 
      name: "Tokyo University", 
      programs: ["Engineering", "Asian Studies", "Science"],
      description: "Japan's top university with cutting-edge research and rich cultural immersion."
    },
    { 
      lat: -33.8688, 
      lon: 151.2093, 
      color: 0xffa500, 
      name: "University of Sydney", 
      programs: ["Environmental Science", "Marine Biology", "Business"],
      description: "Study in one of the world's most livable cities with beautiful beaches and landscapes."
    },
    { 
      lat: 19.0760, 
      lon: 72.8777, 
      color: 0xff5e82, 
      name: "IIT Mumbai", 
      programs: ["Technology", "Engineering", "Computer Science"],
      description: "India's premier technology institute with excellent research opportunities."
    },
    { 
      lat: 48.8566, 
      lon: 2.3522, 
      color: 0xc084fc, 
      name: "Sorbonne University", 
      programs: ["Arts", "Humanities", "French Language"],
      description: "Historic Parisian university offering exceptional programs in arts and humanities."
    },
    { 
      lat: 55.7558, 
      lon: 37.6173, 
      color: 0x60a5fa, 
      name: "Moscow State University", 
      programs: ["Russian Studies", "Physics", "Mathematics"],
      description: "Prestigious university with strong programs in sciences and Russian culture."
    },
    { 
      lat: -34.6037, 
      lon: -58.3816, 
      color: 0xfcd34d, 
      name: "University of Buenos Aires", 
      programs: ["Latin American Studies", "Agriculture", "Economics"],
      description: "Experience vibrant South American culture while studying at Argentina's top university."
    }
  ];

  // Utility function to convert latitude/longitude to 3D position
  const latLongToVector3 = (lat, lon, radius) => {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lon + 180) * Math.PI / 180;

    const position = new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );

    // Apply globe's current transformations if available
    if (globe.current) {
      position.applyMatrix4(globe.current.matrixWorld);
    }
    return position;
  };

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
        connectionLine.userData = {
          startLocation: locations[i].name,
          endLocation: locations[j].name,
          isHighlighted: false
        };
        scene.current.add(connectionLine);
        connectionLines.current.push(connectionLine);
        
        // Add airplane to this connection
        addAirplaneToConnection(curve, connectionLine, locations[i], locations[j]);
      }
    }
  };

  // Add airplane model to connection
  const addAirplaneToConnection = (curve, connectionLine, startLocation, endLocation) => {
    // Create a simple airplane model using basic shapes
    const airplaneGroup = new THREE.Group();
    
    // Airplane body
    const bodyGeometry = new THREE.ConeGeometry(0.05, 0.2, 8);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xffffff,
      emissive: 0x444444,
      specular: 0x666666,
      shininess: 30
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = Math.PI / 2;
    airplaneGroup.add(body);
    
    // Wings
    const wingGeometry = new THREE.BoxGeometry(0.2, 0.05, 0.01);
    const wingMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xffffff,
      emissive: 0x222222
    });
    const wings = new THREE.Mesh(wingGeometry, wingMaterial);
    wings.position.y = -0.02;
    airplaneGroup.add(wings);
    
    // Tail
    const tailGeometry = new THREE.BoxGeometry(0.08, 0.08, 0.01);
    const tailMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xffffff,
      emissive: 0x222222
    });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.z = -0.1;
    tail.position.y = 0.03;
    airplaneGroup.add(tail);
    
    // Add to scene
    scene.current.add(airplaneGroup);
    
    // Flight path progress
    const flightProgress = Math.random();
    
    // Store airplane data
    airplaneModels.current.push({
      model: airplaneGroup,
      curve: curve,
      progress: flightProgress,
      speed: 0.0003 + Math.random() * 0.0005,
      connectionLine: connectionLine,
      startLocation: startLocation,
      endLocation: endLocation,
      isVisible: true
    });
  };

  // Create interactive information card
  const createInfoCard = (location) => {
    const infoCard = document.createElement('div');
    infoCard.className = 'absolute pointer-events-auto bg-black/80 text-white p-4 rounded-lg shadow-lg transform -translate-x-1/2 -translate-y-1/2 z-10 max-w-xs';
    infoCard.style.opacity = '0';
    infoCard.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    infoCard.innerHTML = `
      <h3 class="text-lg font-bold mb-2">${location.name}</h3>
      <p class="text-sm mb-2">${location.description}</p>
      <h4 class="text-sm font-semibold mt-3 mb-1">Programs:</h4>
      <ul class="text-xs list-disc list-inside">
        ${location.programs.map(program => `<li>${program}</li>`).join('')}
      </ul>
      <div class="mt-3 flex justify-end">
        <button class="text-xs bg-green-500 hover:bg-green-600 px-3 py-1 rounded mr-2" data-action="learn-more">Learn More</button>
        <button class="text-xs bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded" data-action="apply">Apply Now</button>
      </div>
    `;
    
    // Add event listeners
    const learnMoreButton = infoCard.querySelector('[data-action="learn-more"]');
    learnMoreButton.addEventListener('click', (e) => {
      e.stopPropagation();
      alert(`You clicked Learn More for ${location.name}`);
    });
    
    const applyButton = infoCard.querySelector('[data-action="apply"]');
    applyButton.addEventListener('click', (e) => {
      e.stopPropagation();
      alert(`You clicked Apply Now for ${location.name}`);
    });
    
    containerRef.current.appendChild(infoCard);
    
    return infoCard;
  };

  // Highlight connections for a specific location
  const highlightConnectionsForLocation = (locationName, highlight) => {
    connectionLines.current.forEach(line => {
      if (line.userData.startLocation === locationName || line.userData.endLocation === locationName) {
        if (highlight) {
          line.material.color.set(0xffd700);
          line.material.opacity = 0.8;
          line.userData.isHighlighted = true;
        } else {
          line.material.color.set(0x4ade80);
          line.material.opacity = 0.4;
          line.userData.isHighlighted = false;
        }
      }
    });
    
    // Also highlight related airplanes
    airplaneModels.current.forEach(airplane => {
      if (airplane.startLocation.name === locationName || airplane.endLocation.name === locationName) {
        if (highlight) {
          airplane.model.children.forEach(part => {
            if (part.material) {
              part.material.emissive.set(0xffd700);
              part.material.emissiveIntensity = 0.5;
            }
          });
          airplane.speed *= 2; // Make airplane move faster when highlighted
        } else {
          airplane.model.children.forEach(part => {
            if (part.material) {
              part.material.emissive.set(0x222222);
              part.material.emissiveIntensity = 0.2;
            }
          });
          airplane.speed /= 2; // Return to normal speed
        }
      }
    });
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene Setup
    camera.current = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.current.position.set(4, 0, 10);

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

    // Add background stars
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });
    
    const starsVertices = [];
    for (let i = 0; i < 2000; i++) {
      const x = THREE.MathUtils.randFloatSpread(200);
      const y = THREE.MathUtils.randFloatSpread(200);
      const z = THREE.MathUtils.randFloatSpread(200);
      // Make sure stars are not too close to the globe
      if (Math.sqrt(x*x + y*y + z*z) < 20) continue;
      starsVertices.push(x, y, z);
    }
    
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.current.add(stars);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.current.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 3, 5);
    scene.current.add(directionalLight);

    const backLight = new THREE.DirectionalLight(0x6ae4ff, 0.3);
    backLight.position.set(-5, 2, -5);
    scene.current.add(backLight);

    // Add a point light to improve visibility
    const pointLight = new THREE.PointLight(0xffffff, 0.8, 50);
    pointLight.position.set(0, 10, 0);
    scene.current.add(pointLight);

    // Earth Geometry
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('https://threejsfundamentals.org/threejs/resources/images/world.jpg');
    const bumpTexture = textureLoader.load('https://threejsfundamentals.org/threejs/resources/images/bump.jpg');
    const cloudTexture = textureLoader.load('https://threejsfundamentals.org/threejs/resources/images/clouds.png');
    const specularTexture = textureLoader.load('https://threejsfundamentals.org/threejs/resources/images/specular.jpg');
    const normalTexture = textureLoader.load('https://threejsfundamentals.org/threejs/resources/images/earth_normal.jpg');

    earthTexture.anisotropy = renderer.current.capabilities.getMaxAnisotropy();

    const globeGeometry = new THREE.SphereGeometry(3.5, 64, 64);
    const globeMaterial = new THREE.MeshPhongMaterial({
      map: earthTexture,
      bumpMap: bumpTexture,
      bumpScale: 0.05,
      specularMap: specularTexture,
      normalMap: normalTexture,
      normalScale: new THREE.Vector2(0.05, 0.05),
      specular: new THREE.Color(0x444444),
      shininess: 15,
      reflectivity: 0.2
    });

    globe.current = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.current.add(globe.current);

    // Cloud Layer
    const cloudGeometry = new THREE.SphereGeometry(3.55, 32, 32);
    const cloudMaterial = new THREE.MeshBasicMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });

    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    scene.current.add(clouds);

    // Atmosphere
    const atmosphereGeometry = new THREE.SphereGeometry(3.58, 32, 32);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 4.0);
          float glow = smoothstep(0.0, 1.0, intensity);
          
          // Blue atmosphere with slight gradient
          vec3 atmosphereColor = mix(
            vec3(0.1, 0.5, 1.0), // Light blue
            vec3(0.2, 0.4, 0.8), // Darker blue
            intensity
          );
          
          gl_FragColor = vec4(atmosphereColor, glow * 0.8);
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });

    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.current.add(atmosphere);

    // Create connections between study abroad locations
    createConnections(studyAbroadLocations);

    // Add markers for study abroad locations
    studyAbroadLocations.forEach(location => {
      const markerGroup = new THREE.Group();

      // Main marker
      const markerGeometry = new THREE.SphereGeometry(0.08);
      const markerMaterial = new THREE.MeshBasicMaterial({
        color: location.color,
        transparent: true,
        opacity: 0.8
      });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.userData = { isHovered: false };

      // Halo
      const haloGeometry = new THREE.SphereGeometry(0.1);
      const haloMaterial = new THREE.MeshBasicMaterial({
        color: location.color,
        transparent: true,
        opacity: 0.4
      });
      const halo = new THREE.Mesh(haloGeometry, haloMaterial);

      // Spike
      const spikeGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.3, 8);
      const spikeMaterial = new THREE.MeshBasicMaterial({
        color: location.color,
        transparent: true,
        opacity: 0.6
      });
      const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);

      // Ring
      const ringGeometry = new THREE.RingGeometry(0.14, 0.17, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({ 
        color: location.color, 
        transparent: true, 
        opacity: 0.3,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;

      // Position marker group
      const position = latLongToVector3(location.lat, location.lon, 3.5);
      markerGroup.position.copy(position);
      markerGroup.lookAt(0, 0, 0);
      markerGroup.rotateX(Math.PI / 2);

      // Add spike
      spike.position.y = 0.15;

      // Create info card for this location
      const infoCard = createInfoCard(location);

      // Add text label
      const labelDiv = document.createElement('div');
      labelDiv.className = 'absolute pointer-events-none text-white text-xs px-2 py-1 rounded-lg bg-black/60 whitespace-nowrap transform -translate-x-1/2 -translate-y-1/2';
      labelDiv.textContent = location.name;
      labelDiv.style.opacity = '0';
      labelDiv.style.transition = 'opacity 0.3s ease';
      containerRef.current.appendChild(labelDiv);
      
      textLabels.current.push({
        element: labelDiv,
        infoCard: infoCard,
        position: position.clone(),
        name: location.name,
        lat: location.lat,
        lon: location.lon,
        programs: location.programs
      });

      // Store location data
      markerGroup.userData = {
        lat: location.lat,
        lon: location.lon,
        name: location.name,
        color: location.color,
        isAnimating: true,
        initialScale: 1.0,
        pulsePhase: Math.random() * Math.PI * 2,
        isSelected: false,
        location: location
      };

      markerGroup.add(marker);
      markerGroup.add(halo);
      markerGroup.add(spike);
      markerGroup.add(ring);
      scene.current.add(markerGroup);
      markerMeshes.current.push(markerGroup);
    });

    // Controls
    controls.current = new OrbitControls(camera.current, renderer.current.domElement);
    controls.current.enableDamping = true;
    controls.current.dampingFactor = 0.07;
    controls.current.rotateSpeed = 0.5;
    controls.current.zoomSpeed = 0.8;
    controls.current.autoRotate = activeTab === 'programs';
    controls.current.autoRotateSpeed = 0.4;
    controls.current.minDistance = 5;
    controls.current.maxDistance = 15;
    controls.current.target.set(0, 0, 0);
    globe.current.rotation.y = Math.PI / 8;

    // Animation Loop
    let lastFrameTime = 0;
    const animate = (time) => {
      animationFrameId.current = requestAnimationFrame(animate);

      const elapsed = time - lastFrameTime;
      if (elapsed < 16.7 && elapsed > 0) return;
      lastFrameTime = time;

      // Update marker positions and animations
      markerMeshes.current.forEach(markerGroup => {
        const position = latLongToVector3(
          markerGroup.userData.lat,
          markerGroup.userData.lon,
          3.5
        );
        markerGroup.position.copy(position);
        markerGroup.lookAt(0, 0, 0);
        markerGroup.rotateX(Math.PI / 2);

        const halo = markerGroup.children[1];
        const ring = markerGroup.children[3];
        
        if (markerGroup.userData.isSelected) {
          // Enhanced animation for selected marker
          const pulseScale = 1.0 + 0.5 * Math.sin(time * 0.005 + markerGroup.userData.pulsePhase);
          halo.scale.set(pulseScale, pulseScale, pulseScale);
          
          // Rotate ring for selected marker
          ring.rotation.z += 0.02;
          ring.material.opacity = 0.6 + 0.3 * Math.sin(time * 0.003);
        } else if (markerGroup.userData.isAnimating) {
          // Regular animation for non-selected markers
          const pulseScale = 1.0 + 0.3 * Math.sin(time * 0.003 + markerGroup.userData.pulsePhase);
          halo.scale.set(pulseScale, pulseScale, pulseScale);
          
          ring.rotation.z += 0.005;
          ring.material.opacity = 0.2 + 0.1 * Math.sin(time * 0.002);
        }
      });

      // Update text labels positions
      textLabels.current.forEach(label => {
        const position = latLongToVector3(label.lat, label.lon, 3.5);
        label.position.copy(position);

        if (camera.current && containerRef.current) {
          const vector = position.clone();
          vector.project(camera.current);

          const x = (vector.x * 0.5 + 0.5) * containerRef.current.clientWidth;
          const y = (-vector.y * 0.5 + 0.5) * containerRef.current.clientHeight;

          // Check if this point is on the visible side of the globe (z < 1)
          if (vector.z < 1) {
            const opacity = scrollProgress !== undefined ? Math.max(0, 1 - scrollProgress * 2) : 1;
            label.element.style.opacity = opacity.toString();
            label.element.style.left = `${x}px`;
            label.element.style.top = `${y}px`;
            
            // Update info card position if this is the selected destination
            if (selectedDestination === label.name) {
              label.infoCard.style.left = `${x}px`;
              label.infoCard.style.top = `${y + 40}px`;
              label.infoCard.style.opacity = '1';
              label.infoCard.style.transform = 'translate(-50%, 0)';
            } else {
              label.infoCard.style.opacity = '0';
              label.infoCard.style.transform = 'translate(-50%, 20px)';
            }
          } else {
            // Hide label if it's on the far side of the globe
            label.element.style.opacity = '0';
            if (selectedDestination === label.name) {
              label.infoCard.style.opacity = '0';
            }
          }
        }
      });

      // Animate connection lines
      connectionLines.current.forEach((line, index) => {
        if (line.userData.isHighlighted) {
          // Animated highlighted lines
          line.material.opacity = 0.6 + 0.3 * Math.sin(time * 0.002 + index * 0.5);
        } else {
          // Normal lines
          const baseOpacity = scrollProgress !== undefined ? Math.max(0, 0.4 - scrollProgress * 0.4) : 0.4;
          line.material.opacity = baseOpacity + 0.1 * Math.sin(time * 0.001 + index * 0.5);
        }
      });

      // Update airplane positions along connections
      airplaneModels.current.forEach(airplane => {
        // Update progress along the curve
        airplane.progress += airplane.speed;
        if (airplane.progress > 1) airplane.progress = 0;
        
        // Get position and orientation from curve
        const position = airplane.curve.getPointAt(airplane.progress);
        const direction = airplane.curve.getTangentAt(airplane.progress);
        
        // Position the airplane
        airplane.model.position.copy(position);
        
        // Orient the airplane along the curve
        const lookAt = new THREE.Vector3().addVectors(position, direction);
        airplane.model.lookAt(lookAt);
        
        // Rotate to align with flight path
        airplane.model.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
        
        // Make airplanes invisible if they're too close to far side of globe
        const dot = camera.current.position.clone().normalize().dot(position.clone().normalize());
        if (dot < -0.2) {
          if (airplane.isVisible) {
            airplane.model.visible = false;
            airplane.isVisible = false;
          }
        } else if (!airplane.isVisible) {
          airplane.model.visible = true;
          airplane.isVisible = true;
        }
      });

      // Rotate clouds
      if (clouds) {
        clouds.rotation.y += 0.0002;
      }

      controls.current.update();
      renderer.current.render(scene.current, camera.current);
    };

    animate(0);

    // Interaction - Mouse Move
    const handleMouseMove = (event) => {
      const rect = containerRef.current.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / containerRef.current.clientWidth) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / containerRef.current.clientHeight) * 2 + 1;

      // Save position for tooltip
      setTooltipPosition({ 
        x: event.clientX - rect.left, 
        y: event.clientY - rect.top 
      });

      raycaster.current.setFromCamera(mouse.current, camera.current);
      
      // Check intersections with markers
      const markerIntersects = raycaster.current.intersectObjects(
        markerMeshes.current.flatMap(group => group.children)
      );

      // Reset all markers first
      markerMeshes.current.forEach(group => {
        const marker = group.children[0];
        if (!marker.userData.isHovered) {
          marker.scale.set(1, 1, 1);
        }

        const label = textLabels.current.find(l => l.name === group.userData.name);
        if (label) {
          label.element.style.fontWeight = 'normal';
          label.element.style.backgroundColor =label.element.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
        }
      });

      // Handle marker hover
      let hoveredMarker = null;
      if (markerIntersects.length > 0) {
        // Find the parent group of the intersected object
        const intersectedObject = markerIntersects[0].object;
        const parentGroup = markerMeshes.current.find(group => 
          group.children.includes(intersectedObject)
        );

        if (parentGroup) {
          hoveredMarker = parentGroup;
          const marker = parentGroup.children[0]; // Main marker sphere
          marker.userData.isHovered = true;
          marker.scale.set(1.3, 1.3, 1.3);
          
          // Highlight the label
          const label = textLabels.current.find(l => l.name === parentGroup.userData.name);
          if (label) {
            label.element.style.fontWeight = 'bold';
            label.element.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
          }
          
          // Show tooltip
          setTooltipContent(`${parentGroup.userData.name} - ${parentGroup.userData.location.programs.join(', ')}`);
          setShowTooltip(true);
        }
      } else {
        // Hide tooltip when not hovering over a marker
        setShowTooltip(false);
      }

      // Check intersections with connection lines
      const lineIntersects = raycaster.current.intersectObjects(connectionLines.current);
      if (lineIntersects.length > 0) {
        const connectionLine = lineIntersects[0].object;
        document.body.style.cursor = 'pointer';
        
        // Show tooltip for connection
        if (!hoveredMarker) {
          setTooltipContent(`Connection: ${connectionLine.userData.startLocation} ↔ ${connectionLine.userData.endLocation}`);
          setShowTooltip(true);
        }
      } else if (!hoveredMarker) {
        document.body.style.cursor = 'auto';
      }
    };

    // Add after the click handler
    const handleTouchStart = (event) => {
      event.preventDefault();
      
      // Check if user is tapping on a marker
      if (event.touches.length === 1) {
        const touch = event.touches[0];
        const rect = containerRef.current.getBoundingClientRect();
        mouse.current.x = ((touch.clientX - rect.left) / containerRef.current.clientWidth) * 2 - 1;
        mouse.current.y = -((touch.clientY - rect.top) / containerRef.current.clientHeight) * 2 + 1;
        
        raycaster.current.setFromCamera(mouse.current, camera.current);
        
        // Check intersections with markers
        const markerIntersects = raycaster.current.intersectObjects(
          markerMeshes.current.flatMap(group => group.children)
        );
        
        if (markerIntersects.length > 0) {
          // Find the parent group of the intersected object
          const intersectedObject = markerIntersects[0].object;
          const parentGroup = markerMeshes.current.find(group => 
            group.children.includes(intersectedObject)
          );
          
          if (parentGroup) {
            // Handle marker selection - similar to click handler
            const locationName = parentGroup.userData.name;
            
            // Reset all markers first
            markerMeshes.current.forEach(group => {
              group.userData.isSelected = false;
              
              // Reset marker appearance
              const marker = group.children[0];
              marker.material.color.setHex(group.userData.color);
              
              // Reset ring
              const ring = group.children[3];
              ring.material.color.setHex(group.userData.color);
            });
            
            // Clear previous selection
            if (selectedDestination) {
              highlightConnectionsForLocation(selectedDestination, false);
            }
            
            // If tapping on the already selected marker, deselect it
            if (selectedDestination === locationName) {
              setSelectedDestination(null);
              controls.current.autoRotate = activeTab === 'programs';
            } else {
              // Select the new marker
              parentGroup.userData.isSelected = true;
              setSelectedDestination(locationName);
              controls.current.autoRotate = false;
              
              // Set marker to highlighted state
              const marker = parentGroup.children[0];
              marker.material.color.setHex(0xffd700);
              
              // Highlight ring
              const ring = parentGroup.children[3];
              ring.material.color.setHex(0xffd700);
              
              // Highlight connections
              highlightConnectionsForLocation(locationName, true);
              
              // Show tooltip and position info card
              setTooltipContent(`${parentGroup.userData.name} - ${parentGroup.userData.location.description}`);
              setShowTooltip(true);
              
              // Focus camera on the selected location
              const position = latLongToVector3(
                parentGroup.userData.lat,
                parentGroup.userData.lon,
                3.5
              );
              
              const distanceVector = new THREE.Vector3().subVectors(
                camera.current.position,
                controls.current.target
              );
              
              const newTarget = position.clone().normalize().multiplyScalar(3.5);
              const newPosition = newTarget.clone().add(
                distanceVector.normalize().multiplyScalar(7)
              );
              
              // Animate camera movement
              const startPosition = camera.current.position.clone();
              const startTarget = controls.current.target.clone();
              const animationDuration = 1000; // milliseconds
              let startTime = null;
              
              const animateCamera = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime;
                const progress = Math.min(elapsed / animationDuration, 1);
                
                // Ease in-out function
                const easeProgress = progress < 0.5
                  ? 2 * progress * progress
                  : 1 - Math.pow(-2 * progress + 2, 2) / 2;
                
                // Interpolate position and target
                camera.current.position.lerpVectors(startPosition, newPosition, easeProgress);
                controls.current.target.lerpVectors(startTarget, newTarget, easeProgress);
                controls.current.update();
                
                if (progress < 1) {
                  requestAnimationFrame(animateCamera);
                }
              };
              
              requestAnimationFrame(animateCamera);
            }
          }
        }
      }
    };

    

containerRef.current.addEventListener('touchstart', handleTouchStart);
// Don't forget to remove in cleanup
containerRef.current?.removeEventListener('touchstart', handleTouchStart);

const handleKeyDown = (event) => {
  if (event.key === 'Escape' && selectedDestination) {
    setSelectedDestination(null);
    controls.current.autoRotate = activeTab === 'programs';
  }
  // Add more keyboard controls as needed
};

window.addEventListener('keydown', handleKeyDown);
// Don't forget to remove in cleanup
window.removeEventListener('keydown', handleKeyDown);




    // Interaction - Click
    const handleClick = (event) => {
      const rect = containerRef.current.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / containerRef.current.clientWidth) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / containerRef.current.clientHeight) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, camera.current);
      
      // Check intersections with markers
      const markerIntersects = raycaster.current.intersectObjects(
        markerMeshes.current.flatMap(group => group.children)
      );

      // Reset all markers first
      markerMeshes.current.forEach(group => {
        group.userData.isSelected = false;
        
        // Reset marker appearance
        const marker = group.children[0];
        marker.material.color.setHex(group.userData.color);
        
        // Reset ring
        const ring = group.children[3];
        ring.material.color.setHex(group.userData.color);
      });

      // Clear previous selection
      if (selectedDestination) {
        highlightConnectionsForLocation(selectedDestination, false);
      }

      if (markerIntersects.length > 0) {
        // Find the parent group of the intersected object
        const intersectedObject = markerIntersects[0].object;
        const parentGroup = markerMeshes.current.find(group => 
          group.children.includes(intersectedObject)
        );

        if (parentGroup) {
          const locationName = parentGroup.userData.name;
          
          // If clicking on the already selected marker, deselect it
          if (selectedDestination === locationName) {
            setSelectedDestination(null);
            controls.current.autoRotate = activeTab === 'programs';
          } else {
            // Select the new marker
            parentGroup.userData.isSelected = true;
            setSelectedDestination(locationName);
            controls.current.autoRotate = false;
            
            // Set marker to highlighted state
            const marker = parentGroup.children[0];
            marker.material.color.setHex(0xffd700);
            
            // Highlight ring
            const ring = parentGroup.children[3];
            ring.material.color.setHex(0xffd700);
            
            // Highlight connections
            highlightConnectionsForLocation(locationName, true);
            
            // Focus camera on the selected location
            const position = latLongToVector3(
              parentGroup.userData.lat,
              parentGroup.userData.lon,
              3.5
            );
            
            const distanceVector = new THREE.Vector3().subVectors(
              camera.current.position,
              controls.current.target
            );
            
            const newTarget = position.clone().normalize().multiplyScalar(3.5);
            const newPosition = newTarget.clone().add(
              distanceVector.normalize().multiplyScalar(7)
            );
            
            // Animate camera movement
            const startPosition = camera.current.position.clone();
            const startTarget = controls.current.target.clone();
            const animationDuration = 1000; // milliseconds
            let startTime = null;
            
            const animateCamera = (timestamp) => {
              if (!startTime) startTime = timestamp;
              const elapsed = timestamp - startTime;
              const progress = Math.min(elapsed / animationDuration, 1);
              
              // Ease in-out function
              const easeProgress = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;
              
              // Interpolate position and target
              camera.current.position.lerpVectors(startPosition, newPosition, easeProgress);
              controls.current.target.lerpVectors(startTarget, newTarget, easeProgress);
              controls.current.update();
              
              if (progress < 1) {
                requestAnimationFrame(animateCamera);
              }
            };
            
            requestAnimationFrame(animateCamera);
          }
        }
      } else {
        // If clicked outside of any marker, deselect the current selection
        setSelectedDestination(null);
        controls.current.autoRotate = activeTab === 'programs';
      }
    };

    containerRef.current.addEventListener('mousemove', handleMouseMove);
    containerRef.current.addEventListener('click', handleClick);

    // Window resize handler
    const handleResize = () => {
      if (containerRef.current && camera.current && renderer.current) {
        camera.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
        camera.current.updateProjectionMatrix();
        renderer.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    // Initial focus on a location
    setTimeout(() => {
      if (studyAbroadLocations.length > 0 && markerMeshes.current.length > 0) {
        const initialLocation = studyAbroadLocations[0];
        const initialMarker = markerMeshes.current[0];
        
        // Set initial zoom and rotation
        globe.current.rotation.y = 
          -initialLocation.lon * Math.PI / 180 - Math.PI / 2;
        
        // Smoothly rotate to the initial position
        const targetRotation = -initialLocation.lon * Math.PI / 180 - Math.PI / 2;
        const startRotation = globe.current.rotation.y;
        const rotationDuration = 2000;
        let startRotationTime = null;
        
        const animateRotation = (timestamp) => {
          if (!startRotationTime) startRotationTime = timestamp;
          const elapsed = timestamp - startRotationTime;
          const progress = Math.min(elapsed / rotationDuration, 1);
          
          // Ease in-out function
          const easeProgress = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
          
          // Interpolate rotation
          globe.current.rotation.y = startRotation + (targetRotation - startRotation) * easeProgress;
          
          if (progress < 1) {
            requestAnimationFrame(animateRotation);
          }
        };
        
        requestAnimationFrame(animateRotation);
      }
    }, 500);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeEventListener('mousemove', handleMouseMove);
      containerRef.current?.removeEventListener('click', handleClick);
      
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      
      if (renderer.current) {
        renderer.current.dispose();
      }
      
      // Remove all text labels
      textLabels.current.forEach(label => {
        label.element.remove();
        label.infoCard.remove();
      });
      
      // Dispose of resources
      markerMeshes.current.forEach(group => {
        group.children.forEach(child => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        });
        scene.current.remove(group);
      });
      
      connectionLines.current.forEach(line => {
        if (line.geometry) line.geometry.dispose();
        if (line.material) line.material.dispose();
        scene.current.remove(line);
      });
      
      airplaneModels.current.forEach(airplane => {
        airplane.model.children.forEach(part => {
          if (part.geometry) part.geometry.dispose();
          if (part.material) part.material.dispose();
        });
        scene.current.remove(airplane.model);
      });
      
      globe.current.geometry.dispose();
      globe.current.material.dispose();
      scene.current.remove(globe.current);
      
      // Clear references
      markerMeshes.current = [];
      textLabels.current = [];
      connectionLines.current = [];
      airplaneModels.current = [];
    };
  }, []);

  // Update autorotation when active tab changes
  useEffect(() => {
    if (controls.current) {
      controls.current.autoRotate = activeTab === 'programs' && !selectedDestination;
    }
  }, [activeTab, selectedDestination]);

  // Update visibility based on scroll progress
  useEffect(() => {
    if (scrollProgress === undefined) return;
    
    // Fade out elements as user scrolls down
    const fadeOutThreshold = 0.4;
    const opacity = Math.max(0, 1 - scrollProgress / fadeOutThreshold);
    
    // Fade out markers
    markerMeshes.current.forEach(group => {
      group.children.forEach(child => {
        if (child.material) {
          child.material.opacity = child.material.opacity * opacity;
        }
      });
    });
    
    // Fade out text labels
    textLabels.current.forEach(label => {
      label.element.style.opacity = Math.max(0, opacity - 0.2).toString();
      
      if (label.name === selectedDestination) {
        label.infoCard.style.opacity = opacity.toString();
      }
    });
    
    // Fade out connection lines
    connectionLines.current.forEach(line => {
      line.material.opacity = Math.max(0.1, opacity / 2);
    });
    
    // Fade out airplanes
    airplaneModels.current.forEach(airplane => {
      airplane.model.children.forEach(part => {
        if (part.material) {
          part.material.opacity = Math.max(0.2, opacity);
        }
      });
    });
  }, [scrollProgress, selectedDestination]);

  // Custom tooltip component
  const Tooltip = ({ show, position, content }) => {
    if (!show) return null;
    
    return (
      <div 
        className="absolute pointer-events-none bg-black/80 text-white text-xs px-2 py-1 rounded-md z-10"
        style={{
          left: `${position.x + 10}px`,
          top: `${position.y + 10}px`
        }}
      >
        {content}
      </div>
    );
  };

  return (
    <div className="w-full h-full relative">
      <div className="w-full h-full" ref={containerRef}></div>
      <Tooltip 
        show={showTooltip} 
        position={tooltipPosition} 
        content={tooltipContent} 
      />
    </div>
  );
};

export default InteractiveGlobe;