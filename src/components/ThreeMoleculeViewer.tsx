import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Alkane } from '../data/chemistryData';

interface ThreeMoleculeViewerProps {
  alkane: Alkane;
}

export default function ThreeMoleculeViewer({ alkane }: ThreeMoleculeViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  // Keep references to animate
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);

  // Drag interaction states
  const isDragging = useRef<boolean>(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!mountRef.current) return;

    // Capture the mount div container to prevent race conditions during cleanup
    const container = mountRef.current;

    // 0. Clear previous canvas elements completely to ensure hot-swaps work perfectly
    container.innerHTML = '';

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = null;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 300;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    
    // Dynamic camera fitting: pull back more for longer carbon chains
    camera.position.z = Math.max(3.5 + alkane.carbons * 1.0, 5.0);
    cameraRef.current = camera;

    // 2. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Molecule Outer Group
    const molGroup = new THREE.Group();
    scene.add(molGroup);
    groupRef.current = molGroup;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xa855f7, 1.2); // Violet highlight
    dirLight1.position.set(10, 10, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x00e5cc, 0.8); // Teal highlight
    dirLight2.position.set(-10, -10, 10);
    scene.add(dirLight2);

    // 5. Build Ball-and-Stick Geometry Programmatically
    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x222222, // Dark graphite as requested
      roughness: 0.2,
      metalness: 0.1,
    });

    const hydrogenMat = new THREE.MeshStandardMaterial({
      color: 0xAAAAEE, // Light grey-blue as requested
      roughness: 0.3,
      metalness: 0.1,
    });

    const bondMat = new THREE.MeshStandardMaterial({
      color: 0x555555, // Grey bonds as requested
      roughness: 0.4,
    });

    const carbonGeometry = new THREE.SphereGeometry(0.35, 32, 32); // Radius 0.35
    const hydrogenGeometry = new THREE.SphereGeometry(0.22, 24, 24); // Radius 0.22

    const atoms: { pos: THREE.Vector3; type: 'C' | 'H' }[] = [];
    const bondRays: { from: THREE.Vector3; to: THREE.Vector3 }[] = [];

    // Programmatic staggered tetrahedral generator for full-series alkanes
    const C_DIST = 1.40; // bond spacing distance
    const H_DIST = 1.00; // bond spacing distance

    const cPositions: THREE.Vector3[] = [];

    // A. Generate Carbons in a zig-zag chain
    for (let i = 0; i < alkane.carbons; i++) {
      const x = i * C_DIST * 0.8165;
      const y = (i % 2 === 0 ? 0.28 : -0.28);
      const z = 0;
      cPositions.push(new THREE.Vector3(x, y, z));
    }

    // Centroid centering: shift all carbons so center of gravity is exactly at (0,0,0)
    const centroid = new THREE.Vector3(0, 0, 0);
    if (cPositions.length > 0) {
      cPositions.forEach((pos) => centroid.add(pos));
      centroid.divideScalar(cPositions.length);
      cPositions.forEach((pos) => pos.sub(centroid));
    }

    // Add carbons to atoms list and C-C bonds to rays list
    for (let i = 0; i < alkane.carbons; i++) {
      atoms.push({ pos: cPositions[i], type: 'C' });
      if (i > 0) {
        bondRays.push({ from: cPositions[i - 1], to: cPositions[i] });
      }
    }

    // B. Generate Hydrogens satisfying stoichiometry (C_n H_2n+2) & exact tetrahedral angles (109.5°)
    if (alkane.carbons === 1) {
      // Single Carbon Methane CH4: perfect tetrahedron
      const cPos = cPositions[0];
      const directions = [
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0.9428, -0.3333, 0),
        new THREE.Vector3(-0.4714, -0.3333, 0.8165),
        new THREE.Vector3(-0.4714, -0.3333, -0.8165),
      ];
      directions.forEach((dir) => {
        const hPos = new THREE.Vector3().copy(cPos).addScaledVector(dir, H_DIST);
        atoms.push({ pos: hPos, type: 'H' });
        bondRays.push({ from: cPos, to: hPos });
      });
    } else if (alkane.carbons > 1) {
      for (let i = 0; i < alkane.carbons; i++) {
        const cPos = cPositions[i];
        
        // Find adjacent carbon bonding direction vectors
        let v_prev: THREE.Vector3 | null = null;
        let v_next: THREE.Vector3 | null = null;
        
        if (i > 0) {
          v_prev = new THREE.Vector3().subVectors(cPositions[i - 1], cPos).normalize();
        }
        if (i < alkane.carbons - 1) {
          v_next = new THREE.Vector3().subVectors(cPositions[i + 1], cPos).normalize();
        }

        if (v_prev && v_next) {
          // Middle carbon: 2 hydrogens
          const S = new THREE.Vector3().addVectors(v_prev, v_next);
          const u = new THREE.Vector3().copy(S).negate().normalize();
          const w = new THREE.Vector3(0, 0, 1); // Normal to XY plane

          // 2 tetrahedral directions in 109.5° configuration
          const dir1 = new THREE.Vector3().addScaledVector(u, 0.5774).addScaledVector(w, 0.8165);
          const dir2 = new THREE.Vector3().addScaledVector(u, 0.5774).addScaledVector(w, -0.8165);

          [dir1, dir2].forEach((dir) => {
            const hPos = new THREE.Vector3().copy(cPos).addScaledVector(dir.normalize(), H_DIST);
            atoms.push({ pos: hPos, type: 'H' });
            bondRays.push({ from: cPos, to: hPos });
          });
        } else {
          // End carbon: 3 hydrogens
          const v_neigh = v_prev || v_next; // there's exactly one neighbor
          if (v_neigh) {
            const u = new THREE.Vector3().copy(v_neigh).negate().normalize();
            
            // Define two perpendicular vectors
            const a = new THREE.Vector3(-u.y, u.x, 0).normalize();
            const b = new THREE.Vector3(0, 0, 1);

            // Three symmetric tripod direction vectors to complete tetrahedron
            const dir1 = new THREE.Vector3().addScaledVector(u, 0.3333).addScaledVector(a, 0.9428);
            const dir2 = new THREE.Vector3().addScaledVector(u, 0.3333).addScaledVector(
              new THREE.Vector3().addScaledVector(a, -0.5).addScaledVector(b, 0.866),
              0.9428
            );
            const dir3 = new THREE.Vector3().addScaledVector(u, 0.3333).addScaledVector(
              new THREE.Vector3().addScaledVector(a, -0.5).addScaledVector(b, -0.866),
              0.9428
            );

            [dir1, dir2, dir3].forEach((dir) => {
              const hPos = new THREE.Vector3().copy(cPos).addScaledVector(dir.normalize(), H_DIST);
              atoms.push({ pos: hPos, type: 'H' });
              bondRays.push({ from: cPos, to: hPos });
            });
          }
        }
      }
    }

    // C. Add Atom Spheres to Scene
    atoms.forEach((atom) => {
      const mesh = new THREE.Mesh(
        atom.type === 'C' ? carbonGeometry : hydrogenGeometry,
        atom.type === 'C' ? carbonMat : hydrogenMat
      );
      mesh.position.copy(atom.pos);
      molGroup.add(mesh);
    });

    // D. Helper to draw bond cylinders connecting joint coordinates
    const addBondCylinder = (from: THREE.Vector3, to: THREE.Vector3) => {
      const distance = from.distanceTo(to);
      const cylinderGeom = new THREE.CylinderGeometry(0.08, 0.08, distance, 16); // Radius 0.08
      const mesh = new THREE.Mesh(cylinderGeom, bondMat);

      // Math to rotate cylinder along connecting vector axis
      const midpoint = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
      mesh.position.copy(midpoint);

      const direction = new THREE.Vector3().subVectors(to, from).normalize();
      const alignAxis = new THREE.Vector3(0, 1, 0); // initial cylinder orientation
      const quaternion = new THREE.Quaternion().setFromUnitVectors(alignAxis, direction);
      mesh.setRotationFromQuaternion(quaternion);

      molGroup.add(mesh);
    };

    bondRays.forEach((bond) => {
      addBondCylinder(bond.from, bond.to);
    });

    // 6. Animation Frame
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Slow Idle spin
      if (!isDragging.current) {
        molGroup.rotation.y += 0.01;
        molGroup.rotation.z = Math.sin(Date.now() * 0.0005) * 0.1;
      }

      renderer.render(scene, camera);
    };
    animate();

    // 7. Resize Event listener
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;

      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup and complete disposal
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      // Traversal cleanup to prevent memory leaks from geometries and materials
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((mat) => mat.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });

      carbonGeometry.dispose();
      hydrogenGeometry.dispose();
      carbonMat.dispose();
      hydrogenMat.dispose();
      bondMat.dispose();

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      scene.clear();
      renderer.dispose();
    };
  }, [alkane]);

  // Drag interaction
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
    <div className="relative w-full h-[240px] md:h-[280px] rounded-xl border border-[#DCE4FF] bg-[#F0F4FF] overflow-hidden flex items-center justify-center">
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        aria-label={`3D ball and stick structural model of ${alkane.name}`}
      />
      <div className="absolute top-2 right-2 text-[10px] font-mono text-[#7A8DB0] bg-white/90 border border-[#DCE4FF] px-2 py-0.5 rounded shadow-xs">
        🖱️ Orbit model
      </div>
      <div className="absolute bottom-2 left-2 flex gap-3 text-[10px] font-mono text-[#3D5080] bg-white/95 px-2.5 py-1 rounded-md border border-[#DCE4FF] shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-slate-500 block" /> Carbon (C)
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-slate-200 block" /> Hydrogen (H)
        </div>
      </div>
    </div>
  );
}
