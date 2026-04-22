import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface MixerTruck3DProps {
  scrollProgress: number;
}

export const MixerTruck3D: React.FC<MixerTruck3DProps> = ({ scrollProgress }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const truckGroupRef = useRef<THREE.Group | null>(null);
  const wheelsRef = useRef<THREE.Mesh[]>([]);
  const drumRef = useRef<THREE.Group | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x0a0a0a, 10, 50);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3, 12);
    camera.lookAt(0, 1, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(5, 10, 7);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xc41e3a, 0.3);
    fillLight.position.set(-5, 0, -5);
    scene.add(fillLight);

    const rimLight = new THREE.SpotLight(0xffffff, 0.8);
    rimLight.position.set(0, 5, -10);
    rimLight.lookAt(0, 0, 0);
    scene.add(rimLight);

    // Truck Group
    const truckGroup = new THREE.Group();
    truckGroupRef.current = truckGroup;
    scene.add(truckGroup);

    // Materials
    const cabMaterial = new THREE.MeshStandardMaterial({
      color: 0xc41e3a,
      roughness: 0.3,
      metalness: 0.4,
    });

    const metalMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a4a4a,
      roughness: 0.5,
      metalness: 0.7,
    });

    const darkMetalMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a2a,
      roughness: 0.6,
      metalness: 0.5,
    });

    const drumMaterial = new THREE.MeshStandardMaterial({
      color: 0x6a6a6a,
      roughness: 0.4,
      metalness: 0.3,
    });

    const tireMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.9,
      metalness: 0.1,
    });

    const glassMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.1,
      metalness: 0.9,
    });

    // === CHASSIS ===
    const chassisGeo = new THREE.BoxGeometry(7, 0.3, 1.5);
    const chassis = new THREE.Mesh(chassisGeo, darkMetalMaterial);
    chassis.position.y = 0.8;
    chassis.castShadow = true;
    truckGroup.add(chassis);

    // === CAB ===
    const cabGroup = new THREE.Group();
    cabGroup.position.set(-2.5, 1.8, 0);
    truckGroup.add(cabGroup);

    // Main cab body
    const cabGeo = new THREE.BoxGeometry(1.8, 2, 1.6);
    const cab = new THREE.Mesh(cabGeo, cabMaterial);
    cab.castShadow = true;
    cabGroup.add(cab);

    // Cab roof slope
    const roofGeo = new THREE.BoxGeometry(1, 0.1, 1.4);
    const roof = new THREE.Mesh(roofGeo, cabMaterial);
    roof.position.set(-0.4, 1.05, 0);
    roof.rotation.z = -0.2;
    cabGroup.add(roof);

    // Windshield
    const windshieldGeo = new THREE.BoxGeometry(0.1, 1, 1.4);
    const windshield = new THREE.Mesh(windshieldGeo, glassMaterial);
    windshield.position.set(-0.9, 0.3, 0);
    windshield.rotation.z = -0.3;
    cabGroup.add(windshield);

    // Side windows
    const sideWindowGeo = new THREE.BoxGeometry(1, 0.6, 1.65);
    const sideWindow = new THREE.Mesh(sideWindowGeo, glassMaterial);
    sideWindow.position.set(0, 0.4, 0);
    cabGroup.add(sideWindow);

    // Headlights
    const headlightGeo = new THREE.BoxGeometry(0.1, 0.2, 0.3);
    const headlightLeft = new THREE.Mesh(headlightGeo, new THREE.MeshStandardMaterial({ color: 0xffffaa, emissive: 0xffffaa, emissiveIntensity: 0.5 }));
    headlightLeft.position.set(-0.95, -0.5, 0.5);
    cabGroup.add(headlightLeft);

    const headlightRight = new THREE.Mesh(headlightGeo, new THREE.MeshStandardMaterial({ color: 0xffffaa, emissive: 0xffffaa, emissiveIntensity: 0.5 }));
    headlightRight.position.set(-0.95, -0.5, -0.5);
    cabGroup.add(headlightRight);

    // Grill
    const grillGeo = new THREE.BoxGeometry(0.05, 0.6, 0.8);
    const grill = new THREE.Mesh(grillGeo, darkMetalMaterial);
    grill.position.set(-0.92, -0.3, 0);
    cabGroup.add(grill);

    // === MIXER DRUM ===
    const drumGroup = new THREE.Group();
    drumGroup.position.set(1, 2.2, 0);
    truckGroup.add(drumGroup);
    drumRef.current = drumGroup;

    // Create conical drum using multiple cylinders
    const drumParts = [
      { radiusTop: 1.0, radiusBottom: 1.2, height: 0.8, x: -1.5 },
      { radiusTop: 1.2, radiusBottom: 1.4, height: 1.0, x: -0.5 },
      { radiusTop: 1.4, radiusBottom: 1.3, height: 1.2, x: 0.7 },
      { radiusTop: 1.3, radiusBottom: 1.0, height: 0.8, x: 1.8 },
    ];

    drumParts.forEach((part, i) => {
      const geo = new THREE.CylinderGeometry(part.radiusTop, part.radiusBottom, part.height, 32);
      const mesh = new THREE.Mesh(geo, drumMaterial);
      mesh.rotation.z = Math.PI / 2;
      mesh.position.x = part.x;
      mesh.castShadow = true;
      drumGroup.add(mesh);

      // Add spiral fins
      if (i < 3) {
        const finGeo = new THREE.BoxGeometry(0.8, 0.05, 1.0);
        for (let j = 0; j < 3; j++) {
          const fin = new THREE.Mesh(finGeo, metalMaterial);
          fin.position.x = part.x;
          fin.rotation.x = (j * Math.PI * 2) / 3 + i * 0.5;
          fin.rotation.z = 0.1;
          drumGroup.add(fin);
        }
      }
    });

    // Front ring
    const frontRingGeo = new THREE.TorusGeometry(1.1, 0.15, 16, 32);
    const frontRing = new THREE.Mesh(frontRingGeo, metalMaterial);
    frontRing.position.x = 2.5;
    frontRing.rotation.y = Math.PI / 2;
    drumGroup.add(frontRing);

    // Back ring
    const backRingGeo = new THREE.TorusGeometry(0.9, 0.15, 16, 32);
    const backRing = new THREE.Mesh(backRingGeo, metalMaterial);
    backRing.position.x = -2;
    backRing.rotation.y = Math.PI / 2;
    drumGroup.add(backRing);

    // Support stands
    const standGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.5, 16);
    const stand1 = new THREE.Mesh(standGeo, metalMaterial);
    stand1.position.set(1.5, 0.8, 0.8);
    stand1.rotation.x = -0.3;
    truckGroup.add(stand1);

    const stand2 = new THREE.Mesh(standGeo, metalMaterial);
    stand2.position.set(1.5, 0.8, -0.8);
    stand2.rotation.x = 0.3;
    truckGroup.add(stand2);

    const stand3 = new THREE.Mesh(standGeo, metalMaterial);
    stand3.position.set(-0.5, 0.8, 0.6);
    stand3.rotation.x = -0.3;
    truckGroup.add(stand3);

    const stand4 = new THREE.Mesh(standGeo, metalMaterial);
    stand4.position.set(-0.5, 0.8, -0.6);
    stand4.rotation.x = 0.3;
    truckGroup.add(stand4);

    // === WHEELS ===
    const wheelGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.4, 32);
    wheelGeo.rotateZ(Math.PI / 2);

    // Front wheel
    const frontWheel = new THREE.Mesh(wheelGeo, tireMaterial);
    frontWheel.position.set(-2.5, 0.6, 0);
    frontWheel.castShadow = true;
    truckGroup.add(frontWheel);
    wheelsRef.current.push(frontWheel);

    // Hubcap front
    const hubGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.45, 16);
    hubGeo.rotateZ(Math.PI / 2);
    const frontHub = new THREE.Mesh(hubGeo, metalMaterial);
    frontHub.position.set(-2.5, 0.6, 0);
    truckGroup.add(frontHub);

    // Rear wheels (dual)
    const rearWheel1 = new THREE.Mesh(wheelGeo, tireMaterial);
    rearWheel1.position.set(2, 0.6, 0.4);
    rearWheel1.castShadow = true;
    truckGroup.add(rearWheel1);
    wheelsRef.current.push(rearWheel1);

    const rearWheel2 = new THREE.Mesh(wheelGeo, tireMaterial);
    rearWheel2.position.set(2, 0.6, -0.4);
    rearWheel2.castShadow = true;
    truckGroup.add(rearWheel2);
    wheelsRef.current.push(rearWheel2);

    const rearWheel3 = new THREE.Mesh(wheelGeo, tireMaterial);
    rearWheel3.position.set(3.2, 0.6, 0.4);
    rearWheel3.castShadow = true;
    truckGroup.add(rearWheel3);
    wheelsRef.current.push(rearWheel3);

    const rearWheel4 = new THREE.Mesh(wheelGeo, tireMaterial);
    rearWheel4.position.set(3.2, 0.6, -0.4);
    rearWheel4.castShadow = true;
    truckGroup.add(rearWheel4);
    wheelsRef.current.push(rearWheel4);

    // Hubcaps rear
    [2, 3.2].forEach((x) => {
      const hub = new THREE.Mesh(hubGeo, metalMaterial);
      hub.position.set(x, 0.6, 0);
      truckGroup.add(hub);
    });

    // === EXHAUST ===
    const exhaustGeo = new THREE.CylinderGeometry(0.08, 0.08, 2, 16);
    const exhaust = new THREE.Mesh(exhaustGeo, metalMaterial);
    exhaust.position.set(-2, 2.5, 0.7);
    truckGroup.add(exhaust);

    // Exhaust cap
    const exhaustCapGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.2, 16);
    const exhaustCap = new THREE.Mesh(exhaustCapGeo, metalMaterial);
    exhaustCap.position.set(-2, 3.5, 0.7);
    truckGroup.add(exhaustCap);

    // === CHUTE ===
    const chuteGeo = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 16);
    const chute = new THREE.Mesh(chuteGeo, metalMaterial);
    chute.position.set(3.5, 1.5, 0);
    chute.rotation.z = Math.PI / 4;
    truckGroup.add(chute);

    // Resize handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation loop
    let lastScrollProgress = 0;
    const animate = () => {
      // Rotate drum continuously
      if (drumRef.current) {
        drumRef.current.rotation.x += 0.02;
      }

      // Update truck position based on scroll
      if (truckGroup && scrollProgress !== lastScrollProgress) {
        lastScrollProgress = scrollProgress;

        // Calculate position based on scroll phase
        let xPos, rotateY, rotateX, scale;

        if (scrollProgress < 0.3) {
          // Enter from left
          const enterProgress = scrollProgress / 0.3;
          xPos = -15 + enterProgress * 15;
          rotateY = 0.8 - enterProgress * 0.8;
          rotateX = 0.1 - enterProgress * 0.1;
          scale = 0.7 + enterProgress * 0.3;
        } else if (scrollProgress < 0.7) {
          // Center with subtle rotation
          const centerProgress = (scrollProgress - 0.3) / 0.4;
          xPos = 0;
          rotateY = Math.sin(centerProgress * Math.PI * 2) * 0.3;
          rotateX = 0.05;
          scale = 1;
        } else {
          // Exit to right
          const exitProgress = (scrollProgress - 0.7) / 0.3;
          xPos = exitProgress * 15;
          rotateY = -0.8 * exitProgress;
          rotateX = 0.1 * exitProgress;
          scale = 1 - exitProgress * 0.2;
        }

        truckGroup.position.x = xPos;
        truckGroup.rotation.y = rotateY;
        truckGroup.rotation.x = rotateX;
        truckGroup.scale.setScalar(scale);

        // Rotate wheels based on movement
        const wheelRotation = scrollProgress * 20;
        wheelsRef.current.forEach((wheel) => {
          wheel.rotation.x = wheelRotation;
        });
      }

      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameRef.current);
      if (renderer && container) {
        container.removeChild(renderer.domElement);
        renderer.dispose();
      }
    };
  }, [scrollProgress]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{ zIndex: 1 }}
    />
  );
};

export default MixerTruck3D;
