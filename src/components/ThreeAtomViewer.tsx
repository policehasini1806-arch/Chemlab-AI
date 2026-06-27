import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ElementData } from '../types';

interface ThreeAtomViewerProps {
  element: ElementData;
}

export default function ThreeAtomViewer({ element }: ThreeAtomViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [cloudMode, setCloudMode] = useState<boolean>(false);
  const [activeShell, setActiveShell] = useState<number | null>(null);

  // Keep references to animate
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const electronMeshList = useRef<{ mesh: THREE.Mesh; shellIndex: number; angle: number; speed: number }[]>([]);
  const cloudPointsRef = useRef<THREE.Points | null>(null);
  const ringsRef = useRef<THREE.Line[]>([]);

  // Drag interaction states
  const isDragging = useRef<boolean>(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Clear any previous canvas elements to be absolutely sure no duplicate canvas exists
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    // 1. Create Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = null; // transparent to show beautiful dark panel styling

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 350;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    // Adjusted camera position dynamically based on orbit shell count to ensure full orbital visibility of outer rings without clipping
    const numShells = element.shells.length;
    camera.position.z = 11 + (numShells - 1) * 1.5;
    cameraRef.current = camera;

    // 2. Create Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Create a Group to hold the entire atom
    const atomGroup = new THREE.Group();
    scene.add(atomGroup);
    groupRef.current = atomGroup;

    // 4. Add Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xa855f7, 1.2); // Electric Violet light
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x0284c7, 0.8); // Teal blue secondary light
    dirLight2.position.set(-5, -5, 5);
    scene.add(dirLight2);

    // 5. Generate Nucleus (Proton Cluster & Neutron Cluster)
    const nucleusGroup = new THREE.Group();
    atomGroup.add(nucleusGroup);

    const protonCount = element.number;
    const neutronCount = Math.round(element.mass) - protonCount;
    const totalNucleons = Math.max(protonCount + neutronCount, 1);

    const protonMat = new THREE.MeshPhongMaterial({
      color: 0xef4444, // Red
      emissive: 0x450a0a,
      shininess: 90,
    });
    const neutronMat = new THREE.MeshPhongMaterial({
      color: 0xf87171, // Light Red/Rose to differentiate protons from neutrons visually
      emissive: 0x450a0a,
      shininess: 50,
    });

    const nucleonRadius = 0.18;
    const nucleusRadius = 0.18 * Math.pow(totalNucleons, 1 / 3) + 0.1;

    // Put them in a random cluster
    for (let i = 0; i < totalNucleons; i++) {
      const isProton = i < protonCount;
      const geom = new THREE.SphereGeometry(nucleonRadius, 16, 16);
      const mesh = new THREE.Mesh(geom, isProton ? protonMat : neutronMat);

      // Distribute spherically
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.random() * nucleusRadius * 0.7;

      mesh.position.x = r * Math.sin(phi) * Math.cos(theta);
      mesh.position.y = r * Math.sin(phi) * Math.sin(theta);
      mesh.position.z = r * Math.cos(phi);

      nucleusGroup.add(mesh);
    }

    // 6. Generate Electron Shells & Electrons
    electronMeshList.current = [];
    ringsRef.current = [];

    const ringMaterial = new THREE.LineBasicMaterial({
      color: 0x5b21fa, // Vivid violet orbit line
      transparent: true,
      opacity: 0.35,
    });

    const activeRingMaterial = new THREE.LineBasicMaterial({
      color: 0x00bfa6, // Teal active highlighted orbit line
      transparent: true,
      opacity: 0.9,
    });

    // Determine radii
    const shells = element.shells;
    shells.forEach((electronsInShell, shellIndex) => {
      const shellNum = shellIndex + 1;
      const radius = 1.3 + shellNum * 0.9;

      // Draw Bohr Orbit Ring
      const ringGeom = new THREE.BufferGeometry();
      const points: THREE.Vector3[] = [];
      const segments = 64;
      for (let j = 0; j <= segments; j++) {
        const theta = (j / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
      }
      ringGeom.setFromPoints(points);
      const ringMesh = new THREE.Line(ringGeom, ringMaterial);
      // Give each ring slightly staggered tilt to look organic/cosmic
      ringMesh.rotation.x = Math.PI * 0.1 * shellNum;
      ringMesh.rotation.z = Math.PI * 0.05 * shellNum;
      atomGroup.add(ringMesh);
      ringsRef.current.push(ringMesh);

      // Save references inside properties
      (ringMesh as any).shellNum = shellNum;

      // Populate Electrons for this shell
      const electronGeom = new THREE.SphereGeometry(0.12, 16, 16);
      const electronMat = new THREE.MeshPhongMaterial({
        color: 0xf59e0b, // Amber electron
        emissive: 0x451a03,
        shininess: 90,
        specular: 0xffffff,
        transparent: true,
        opacity: cloudMode ? 0.0 : 1.0,
      });

      for (let eIdx = 0; eIdx < electronsInShell; eIdx++) {
        const eMesh = new THREE.Mesh(electronGeom, electronMat);
        atomGroup.add(eMesh);

        // Stagger orbital start positions
        const angle = (eIdx / electronsInShell) * Math.PI * 2 + Math.random() * 0.5;
        const speed = 0.6 / (radius * radius); // speed inversely proportional to radius square

        electronMeshList.current.push({
          mesh: eMesh,
          shellIndex,
          angle,
          speed,
        });
      }
    });

    // 7. Generate Cloud Mode Points
    const cloudCount = element.number * 40; // Dense clouds proportional to protons
    const cloudGeom = new THREE.BufferGeometry();
    const cloudPositions = new Float32Array(cloudCount * 3);
    const cloudColors = new Float32Array(cloudCount * 3);

    for (let c = 0; c < cloudCount; c++) {
      // Spherically cluster based on shell dimensions
      const randomShell = Math.floor(Math.random() * shells.length);
      const maxRadius = 1.3 + (randomShell + 1) * 0.9;
      const minRadius = 1.3 + randomShell * 0.9;
      const r = minRadius + Math.random() * (maxRadius - minRadius);

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      cloudPositions[c * 3] = x;
      cloudPositions[c * 3 + 1] = y;
      cloudPositions[c * 3 + 2] = z;

      // Color nodes: fade inner violet to outer teal
      const ratio = r / (1.3 + shells.length * 0.9);
      cloudColors[c * 3] = THREE.MathUtils.lerp(0.48, 0.0, ratio); // r
      cloudColors[c * 3 + 1] = THREE.MathUtils.lerp(0.18, 0.9, ratio); // g
      cloudColors[c * 3 + 2] = THREE.MathUtils.lerp(1.0, 0.8, ratio); // b
    }

    cloudGeom.setAttribute('position', new THREE.BufferAttribute(cloudPositions, 3));
    cloudGeom.setAttribute('color', new THREE.BufferAttribute(cloudColors, 3));

    const cloudMaterial = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: cloudMode ? 0.7 : 0.0,
      blending: THREE.AdditiveBlending,
    });

    const cloudPoints = new THREE.Points(cloudGeom, cloudMaterial);
    atomGroup.add(cloudPoints);
    cloudPointsRef.current = cloudPoints;

    // 8. Animation & Render Loop
    let animationFrameId: number;
    let autoRotateAngle = 0.002;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Slow Idle rotation of entire cluster if not editing
      if (!isDragging.current) {
        atomGroup.rotation.y += autoRotateAngle;
        atomGroup.rotation.x += autoRotateAngle * 0.3;
      }

      // Protons/Neutrons vibrate slightly in core
      nucleusGroup.children.forEach((nNode) => {
        nNode.position.x += (Math.random() - 0.5) * 0.002;
        nNode.position.y += (Math.random() - 0.5) * 0.002;
        nNode.position.z += (Math.random() - 0.5) * 0.002;
      });

      // Animate classical orbits if cloudMode is off
      electronMeshList.current.forEach((el) => {
        if (!cloudMode) {
          el.angle += el.speed;
          // Calculate radius corresponding to the shell
          const shellNum = el.shellIndex + 1;
          const radius = 1.3 + shellNum * 0.9;

          // Align positions directly to the staggered rings' tilt orientation
          const ring = ringsRef.current[el.shellIndex];
          const localPos = new THREE.Vector3(Math.cos(el.angle) * radius, 0, Math.sin(el.angle) * radius);
          // Apply rings' tilt rotation properties
          localPos.applyEuler(ring.rotation);

          el.mesh.position.copy(localPos);
          el.mesh.visible = true;
        } else {
          el.mesh.visible = false;
        }
      });

      // Stagger orbital speed overlays
      if (cloudPointsRef.current && cloudMode) {
        cloudPointsRef.current.rotation.y += 0.01;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Handling
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;

      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      scene.clear();
      renderer.dispose();
    };
  }, [element, cloudMode]);

  // Adjust materials if shell selection highlights
  useEffect(() => {
    if (!ringsRef.current.length) return;
    ringsRef.current.forEach((ring, idx) => {
      const isHighlighted = activeShell === idx + 1;
      (ring.material as THREE.LineBasicMaterial).color.setHex(isHighlighted ? 0x00bfa6 : 0x5b21fa);
      (ring.material as THREE.LineBasicMaterial).opacity = isHighlighted ? 0.9 : 0.35;
    });
  }, [activeShell]);

  // Mouse drag event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    previousMousePosition.current = {
      x: e.clientX,
      y: e.clientY,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !groupRef.current) return;

    const deltaMove = {
      x: e.clientX - previousMousePosition.current.x,
      y: e.clientY - previousMousePosition.current.y,
    };

    groupRef.current.rotation.y += deltaMove.x * 0.007;
    groupRef.current.rotation.x += deltaMove.y * 0.007;

    previousMousePosition.current = {
      x: e.clientX,
      y: e.clientY,
    };
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
  };

  return (
    <div className="w-full bg-slate-900 border border-violet-950/45 p-6 rounded-xl relative overflow-hidden" id="b4-bohr-simulation-panel">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        
        {/* LEFT COLUMN: Controls & info */}
        <div className="flex flex-col justify-between gap-4" id="bohr-left-column">
          <div className="space-y-3">
            <span className="text-[10px] font-mono uppercase text-teal-400 tracking-wider font-semibold block">
              3D SUBATOMIC ORBITAL SIMULATION
            </span>
            <h3 className="text-lg md:text-xl font-bold font-mono text-white leading-tight">
              Bohr / Cloud Particle Model
            </h3>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Click any element above to explore its atomic structure
            </p>
          </div>

          {/* Toggle buttons */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider block font-bold">
              Visualization Model:
            </span>
            <div className="flex bg-slate-950 border border-violet-950/40 rounded-lg p-1 w-fit" id="view-mode-toggle">
              <button
                onClick={() => setCloudMode(false)}
                className={`px-4 py-1.5 text-xs rounded-md transition font-medium ${
                  !cloudMode ? 'bg-violet-600 text-white shadow' : 'text-zinc-400 hover:text-white'
                }`}
                id="bohr-mode-btn"
              >
                Bohr Orbit
              </button>
              <button
                onClick={() => setCloudMode(true)}
                className={`px-4 py-1.5 text-xs rounded-md transition font-medium ${
                  cloudMode ? 'bg-violet-600 text-white shadow' : 'text-zinc-400 hover:text-white'
                }`}
                id="cloud-mode-btn"
              >
                Electron Cloud
              </button>
            </div>
          </div>

          {/* Clickable Electron Shells */}
          <div className="space-y-2 mt-2" id="clickable-electron-shells-container">
            <span 
              className="text-[10px] font-mono uppercase tracking-wider block"
              style={{ color: '#000000', fontWeight: 700 }}
            >
              CLICKABLE ELECTRON SHELLS:
            </span>
            {!cloudMode ? (
              <div className="flex flex-wrap gap-2" id="shell-nav-buttons">
                {element.shells.map((capacity, index) => {
                  const shellNum = index + 1;
                  const designations = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];
                  const letter = designations[index] || `Shell ${shellNum}`;
                  const isActive = activeShell === shellNum;

                  return (
                    <button
                      key={shellNum}
                      onClick={() => setActiveShell(isActive ? null : shellNum)}
                      className="flex-1 min-w-[70px] flex flex-col items-center justify-center py-2 px-3 rounded-lg border font-mono transition text-xs"
                      style={{
                        backgroundColor: isActive ? '#EDE9FE' : '#F4F7FF',
                        borderColor: isActive ? '#5B21FA' : '#CBD5F0',
                      }}
                      id={`shell-btn-${shellNum}`}
                    >
                      <span 
                        className="text-[10px]" 
                        style={{ color: isActive ? '#5B21FA' : '#000000', fontWeight: 700 }}
                      >
                        {letter}
                      </span>
                      <span 
                        style={{ color: isActive ? '#5B21FA' : '#000000', fontWeight: isActive ? 700 : 600 }}
                      >
                        n={shellNum} ({capacity}e⁻)
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-[11px] font-mono italic" style={{ color: '#000000' }}>
                Electron Shell selection is only active in Bohr Orbit mode.
              </div>
            )}

            {!cloudMode && activeShell !== null && (
              <div 
                className="text-[11px] font-mono mt-2 px-3 py-2 rounded-lg max-w-md animate-in fade-in" 
                style={{
                  backgroundColor: '#F0F4FF',
                  border: '1px solid #DCE4FF',
                  color: '#000000'
                }}
                id="shell-info-card"
              >
                ❇️ <span className="font-bold" style={{ color: '#000000' }}>Shell {['K', 'L', 'M', 'N', 'O', 'P', 'Q'][activeShell - 1] || activeShell}</span> is at energy level n={activeShell}. It houses <span className="font-bold" style={{ color: '#000000' }}>{element.shells[activeShell - 1]} active electrons</span> (maximum capacity: {2 * activeShell * activeShell}e⁻).
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Three.js canvas & Hint */}
        <div className="flex flex-col items-center justify-between relative bg-slate-950/30 border border-violet-950/20 rounded-xl p-4 h-full min-h-[300px] md:min-h-[420px]" id="bohr-right-column">
          <div className="w-full h-[300px] md:h-[380px] overflow-visible relative flex items-center justify-center animate-pulse-once" id="three-atoms-viewport-warp">
            <div
              ref={mountRef}
              className="w-full h-full cursor-grab active:cursor-grabbing relative overflow-visible flex items-center justify-center"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              aria-label={`3D atom depiction of ${element.name}`}
            />
          </div>
          <div className="text-[10px] font-mono text-zinc-400 mt-2 select-none text-center bg-slate-950/50 px-3 py-1 rounded-md border border-violet-950/20 shadow-md">
            Click & drag to spin
          </div>
        </div>

      </div>
    </div>
  );
}
