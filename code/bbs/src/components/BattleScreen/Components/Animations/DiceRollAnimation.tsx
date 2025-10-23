import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface DiceRollAnimationProps {
  onComplete: () => void;
  rollResult?: number; // The number that was rolled (1-20)
}

export const DiceRollAnimation: React.FC<DiceRollAnimationProps> = ({ 
  onComplete,
  rollResult = 20 // Default to 20 for now
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [showResult, setShowResult] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0.8);
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(5, 5, 5);
    scene.add(directionalLight1);
    
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-5, -5, -5);
    scene.add(directionalLight2);

    // Create D20 geometry
    const geometry = new THREE.IcosahedronGeometry(2, 0);
    
    // Create material with color
    const material = new THREE.MeshPhongMaterial({
      color: 0x8b0000,
      shininess: 100,
      specular: 0x444444,
    });
    
    const dice = new THREE.Mesh(geometry, material);
    scene.add(dice);

    // Add edge lines for better definition
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
    const wireframe = new THREE.LineSegments(edges, lineMaterial);
    dice.add(wireframe);

    camera.position.z = 8;

    // Animation variables
    let rotationSpeedX = 0.3;
    let rotationSpeedY = 0.25;
    let rotationSpeedZ = 0.2;
    let spinTime = 0;
    const spinDuration = 2.5; // Spin for 2.5 seconds
    let animationComplete = false;

    // Animation loop
    const animate = () => {
      if (!mountRef.current) return;
      
      requestAnimationFrame(animate);
      
      spinTime += 0.016; // Approximate 60fps
      
      if (spinTime < spinDuration) {
        // Spinning phase - gradually slow down
        const slowdownFactor = 1 - (spinTime / spinDuration) * 0.7;
        dice.rotation.x += rotationSpeedX * slowdownFactor;
        dice.rotation.y += rotationSpeedY * slowdownFactor;
        dice.rotation.z += rotationSpeedZ * slowdownFactor;
      } else if (!animationComplete) {
        // Landing phase - settle to final position
        animationComplete = true;
        
        // Smooth transition to final rotation
        const targetRotation = new THREE.Euler(0.3, 0.5, 0);
        dice.rotation.x += (targetRotation.x - dice.rotation.x) * 0.1;
        dice.rotation.y += (targetRotation.y - dice.rotation.y) * 0.1;
        dice.rotation.z += (targetRotation.z - dice.rotation.z) * 0.1;
        
        // Show the result number after a brief delay
        setTimeout(() => {
          setShowResult(true);
          
          // Start fade out after showing result
          setTimeout(() => {
            setFadeOut(true);
            
            // Complete animation
            setTimeout(() => {
              onComplete();
            }, 500);
          }, 1500);
        }, 300);
      }
      
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [onComplete]);

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.5s ease-out',
        pointerEvents: 'none'
      }}
    >
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      
      {showResult && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '120px',
            fontWeight: 'bold',
            color: '#ffffff',
            textShadow: '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(139, 0, 0, 0.6)',
            animation: 'resultPop 0.3s ease-out',
            pointerEvents: 'none'
          }}
        >
          {rollResult}
        </div>
      )}
      
      <style>{`
        @keyframes resultPop {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default DiceRollAnimation;