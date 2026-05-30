import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const PARTICLE_COUNT = 60;
const SPREAD = 18;

interface ParticleData {
  rotAxis: THREE.Vector3;
  rotSpeed: number;
  driftX: number;
  driftY: number;
  driftZ: number;
  phase: number;
}

export const ConcreteParticleField: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef     = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.offsetWidth  || 800;
    const h = container.offsetHeight || 600;

    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(55, w / h, 0.1, 200);
    camera.position.set(0, 0, 22);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
    container.appendChild(renderer.domElement);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(10, 20, 10);
    scene.add(dir);
    const fill = new THREE.DirectionalLight(0x8899aa, 0.3);
    fill.position.set(-10, -5, -10);
    scene.add(fill);

    // Concrete color palette — grey tones matching a dark section
    const concretePalette = [0x5a5a5a, 0x4a4a4a, 0x666666, 0x3d3d3d, 0x595959, 0x505050];

    const geom = new THREE.BoxGeometry(1, 1, 1);

    const meshes: THREE.Mesh[]   = [];
    const particles: ParticleData[] = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const color = concretePalette[i % concretePalette.length];
      const mat   = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.95,
        metalness: 0.02,
        transparent: true,
        opacity: 0.18 + Math.random() * 0.14,
      });

      const scale = 0.25 + Math.random() * 0.6;
      const mesh  = new THREE.Mesh(geom, mat);
      mesh.scale.setScalar(scale);

      mesh.position.set(
        (Math.random() - 0.5) * SPREAD,
        (Math.random() - 0.5) * SPREAD * 0.7,
        (Math.random() - 0.5) * SPREAD * 0.5
      );
      mesh.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );

      scene.add(mesh);
      meshes.push(mesh);
      particles.push({
        rotAxis:  new THREE.Vector3(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5
        ).normalize(),
        rotSpeed: (0.0008 + Math.random() * 0.0012) * (Math.random() > 0.5 ? 1 : -1),
        driftX:   (Math.random() - 0.5) * 0.003,
        driftY:   (Math.random() - 0.5) * 0.002,
        driftZ:   (Math.random() - 0.5) * 0.001,
        phase:    Math.random() * Math.PI * 2,
      });
    }

    let t = 0;
    const quat = new THREE.Quaternion();

    const animate = () => {
      t += 0.01;
      meshes.forEach((mesh, i) => {
        const p = particles[i];
        quat.setFromAxisAngle(p.rotAxis, p.rotSpeed);
        mesh.quaternion.multiplyQuaternions(quat, mesh.quaternion);

        mesh.position.x += p.driftX + Math.sin(t * 0.3 + p.phase) * 0.002;
        mesh.position.y += p.driftY + Math.cos(t * 0.25 + p.phase) * 0.0015;
        mesh.position.z += p.driftZ;

        // Wrap particles back into view when they drift too far
        const half = SPREAD * 0.6;
        if (Math.abs(mesh.position.x) > half) mesh.position.x *= -0.9;
        if (Math.abs(mesh.position.y) > half * 0.7) mesh.position.y *= -0.9;
        if (Math.abs(mesh.position.z) > SPREAD * 0.4) mesh.position.z *= -0.9;
      });

      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      const nw = container.offsetWidth;
      const nh = container.offsetHeight;
      if (nw > 0 && nh > 0) {
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geom.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
    />
  );
};

export default ConcreteParticleField;
