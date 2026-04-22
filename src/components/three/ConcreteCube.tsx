import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface ConcreteCubeProps {
  className?: string;
}

export const ConcreteCube: React.FC<ConcreteCubeProps> = ({ className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.offsetWidth || 600;
    const h = container.offsetHeight || 600;

    // Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    camera.position.set(6, 4, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xfff5e6, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const backLight = new THREE.DirectionalLight(0x4466ff, 0.3);
    backLight.position.set(-5, 5, -5);
    scene.add(backLight);

    // Create abstract concrete cube - 4x4x4
    const cubeGroup = new THREE.Group();
    const geometry = new THREE.BoxGeometry(0.85, 0.85, 0.85);

    // Materials for different cube types
    const concreteMat = new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.95,
      metalness: 0.05,
    });

    const lightConcreteMat = new THREE.MeshStandardMaterial({
      color: 0xbbbbbb,
      roughness: 0.8,
      metalness: 0.1,
    });

    const darkConcreteMat = new THREE.MeshStandardMaterial({
      color: 0x555555,
      roughness: 1.0,
      metalness: 0.0,
    });

    const patternMat = new THREE.MeshStandardMaterial({
      color: 0xaaaaaa,
      roughness: 0.6,
      metalness: 0.2,
    });

    // Noise-based visibility function
    const noise3D = (x: number, y: number, z: number) => {
      return Math.sin(x * 1.7 + 0.3) * Math.cos(y * 1.3 + 0.7) * Math.sin(z * 1.9 + 1.1) +
             Math.sin(x * 2.5 + y * 3.1) * 0.4 +
             Math.cos(z * 2.2 + x * 1.8) * 0.3;
    };

    const materials = [concreteMat, lightConcreteMat, darkConcreteMat, patternMat];

    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 4; y++) {
        for (let z = 0; z < 4; z++) {
          const n = noise3D(x * 0.8, y * 0.8, z * 0.8);

          if (n > -0.4) {
            const matIndex = Math.abs(Math.floor(n * 2)) % materials.length;
            const mesh = new THREE.Mesh(geometry, materials[matIndex]);
            mesh.position.set(
              (x - 1.5) * 1.05,
              (y - 1.5) * 1.05,
              (z - 1.5) * 1.05
            );
            cubeGroup.add(mesh);
          }
        }
      }
    }

    scene.add(cubeGroup);

    // Entrance animation
    cubeGroup.scale.set(0, 0, 0);
    cubeGroup.rotation.y = Math.PI;

    let scaleProgress = 0;
    const animateEntrance = () => {
      if (scaleProgress < 1) {
        scaleProgress += 0.008;
        const eased = 1 - Math.pow(1 - scaleProgress, 3); // ease-out cubic
        const s = 0.8 + eased * 0.2;
        cubeGroup.scale.set(s, s, s);
        cubeGroup.rotation.y = Math.PI * (1 - eased);
      }
    };

    // Main animation loop
    const animate = () => {
      animateEntrance();
      cubeGroup.rotation.y += 0.001;
      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      const newW = container.offsetWidth;
      const newH = container.offsetHeight;
      if (newW > 0 && newH > 0) {
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      concreteMat.dispose();
      lightConcreteMat.dispose();
      darkConcreteMat.dispose();
      patternMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '100%', minHeight: '400px' }}
    />
  );
};

export default ConcreteCube;
