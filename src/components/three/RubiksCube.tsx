import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface RubiksCubeProps {
  className?: string;
}

export const RubiksCube: React.FC<RubiksCubeProps> = ({ className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const scrollProgressRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.offsetWidth || 400;
    const h = container.offsetHeight || 400;

    // Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(5, 4, 6);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 8, 5);
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0x6688cc, 0.3);
    fillLight.position.set(-5, 3, -5);
    scene.add(fillLight);

    // Create 3x3x3 cube
    const cubeGroup = new THREE.Group();
    const geometry = new THREE.BoxGeometry(0.85, 0.85, 0.85);

    // 6 shades of gray for faces
    const grayShades = [
      0xf5f5f5, // very light
      0xd0d0d0, // light
      0xa0a0a0, // medium-light
      0x707070, // medium
      0x404040, // dark
      0x202020, // very dark
    ];

    const materials = grayShades.map(
      (color) =>
        new THREE.MeshStandardMaterial({
          color,
          roughness: 0.7,
          metalness: 0.15,
        })
    );

    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        for (let z = 0; z < 3; z++) {
          // Create a multi-material cube
          const mesh = new THREE.Mesh(geometry, materials);
          mesh.position.set(
            (x - 1) * 0.95,
            (y - 1) * 0.95,
            (z - 1) * 0.95
          );

          // Slightly rotate each cube for visual interest
          mesh.rotation.set(
            Math.random() * 0.05,
            Math.random() * 0.05,
            Math.random() * 0.05
          );

          cubeGroup.add(mesh);
        }
      }
    }

    scene.add(cubeGroup);

    // Scroll handler
    const handleScroll = () => {
      const section = container.closest('section');
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const viewHeight = window.innerHeight;
      const progress = Math.max(0, Math.min(1, -rect.top / (rect.height - viewHeight)));
      scrollProgressRef.current = progress;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Animation loop
    const animate = () => {
      // Rotate based on scroll
      const targetRotX = scrollProgressRef.current * Math.PI * 2;
      const targetRotY = scrollProgressRef.current * Math.PI * 3;

      cubeGroup.rotation.x += (targetRotX - cubeGroup.rotation.x) * 0.05;
      cubeGroup.rotation.y += (targetRotY - cubeGroup.rotation.y) * 0.05;

      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Resize handler
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
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      materials.forEach((m) => m.dispose());
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '100%', minHeight: '350px' }}
    />
  );
};

export default RubiksCube;
