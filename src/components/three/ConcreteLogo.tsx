import React, { useRef, useEffect, memo } from 'react';
import * as THREE from 'three';

interface ConcreteLogoProps {
  size?: number;
  className?: string;
}

export const ConcreteLogo: React.FC<ConcreteLogoProps> = memo(({ size = 40, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(4, 3, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Create cube group - 4x4x4 with noise-based visibility
    const cubeGroup = new THREE.Group();
    const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);

    // Concrete-like material
    const material = new THREE.MeshStandardMaterial({
      color: 0x999999,
      roughness: 0.9,
      metalness: 0.1,
    });

    const visibleMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.7,
      metalness: 0.15,
    });

    // Simple noise function
    const noise = (x: number, y: number, z: number) => {
      return Math.sin(x * 1.5) * Math.cos(y * 1.5) * Math.sin(z * 1.5) +
             Math.sin(x * 3.1 + y * 2.3) * 0.5;
    };

    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 4; y++) {
        for (let z = 0; z < 4; z++) {
          const n = noise(x, y, z);
          if (n > -0.3) {
            const mesh = new THREE.Mesh(
              geometry,
              n > 0.2 ? visibleMaterial : material
            );
            mesh.position.set(x - 1.5, y - 1.5, z - 1.5);
            cubeGroup.add(mesh);
          }
        }
      }
    }

    scene.add(cubeGroup);

    // Animation loop
    const animate = () => {
      cubeGroup.rotation.y += 0.003;
      cubeGroup.rotation.x += 0.001;
      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      visibleMaterial.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [size]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: size, height: size }}
    />
  );
});

ConcreteLogo.displayName = 'ConcreteLogo';

export default ConcreteLogo;
