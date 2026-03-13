import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  Grid,
  GizmoHelper,
  GizmoViewport,
  ContactShadows,
} from '@react-three/drei';
import * as THREE from 'three';
import { useSceneStore } from '../store/sceneStore';
import { createRingGeometry } from '../lib/cadKernel';
import { createGemstoneGeometry } from '../lib/cadKernel';
import { createGemMaterial, createMetalMaterial } from '../lib/gemPrimitives';
import type { SceneObject, GemCut, GemType, RingParams } from '../types';

// ─── Individual mesh for a scene object ──────────────────────────────────────
function SceneMesh({ obj, selected, onSelect, wireframe }: {
  obj: SceneObject;
  selected: boolean;
  onSelect: (id: string) => void;
  wireframe: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    if (obj.type === 'ring') {
      const p = obj.parameters as unknown as RingParams & Record<string, number | string | boolean>;
      return createRingGeometry({
        innerDiameter: (p.innerDiameter as number) ?? 17.35,
        bandWidth: (p.bandWidth as number) ?? 3,
        bandThickness: (p.bandThickness as number) ?? 2,
        style: (p.style as RingParams['style']) ?? 'plain',
      });
    }
    if (obj.type === 'gemstone') {
      return createGemstoneGeometry({
        cut: (obj.parameters.cut as GemCut) ?? 'round-brilliant',
        gemType: (obj.parameters.gemType as GemType) ?? 'diamond',
        size: (obj.parameters.size as number) ?? 6,
        depth: (obj.parameters.depth as number) ?? 4,
        carats: (obj.parameters.carats as number) ?? 1,
        color: (obj.parameters.color as string) ?? '#E8F4FD',
      });
    }
    return new THREE.SphereGeometry(1, 32, 32);
  }, [obj]);

  const material = useMemo(() => {
    if (obj.type === 'gemstone') {
      return createGemMaterial((obj.parameters.gemType as GemType) ?? 'diamond');
    }
    const mat = createMetalMaterial(obj.material);
    if (wireframe) {
      return new THREE.MeshBasicMaterial({ color: '#4ade80', wireframe: true });
    }
    return mat;
  }, [obj.type, obj.material, obj.parameters, wireframe]);

  // Selection outline pulse
  useFrame((_, delta) => {
    if (meshRef.current && selected) {
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  if (!obj.visible) return null;

  const scale: [number, number, number] = [
    obj.scale[0] * 0.1,
    obj.scale[1] * 0.1,
    obj.scale[2] * 0.1,
  ];

  return (
    <group position={obj.position} rotation={obj.rotation as unknown as [number, number, number]}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        scale={scale}
        castShadow
        receiveShadow
        onClick={(e) => { e.stopPropagation(); onSelect(obj.id); }}
      />
      {selected && (
        <mesh geometry={geometry} scale={[scale[0] * 1.04, scale[1] * 1.04, scale[2] * 1.04]}>
          <meshBasicMaterial color="#FFD700" wireframe transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}

// ─── Scene content ────────────────────────────────────────────────────────────
function SceneContent() {
  const { objects, selectedId, selectObject, viewMode } = useSceneStore();
  const { gl } = useThree();
  const wireframe = viewMode === 'wireframe';

  useEffect(() => {
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.2;
  }, [gl]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={100}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <pointLight position={[-10, 10, -10]} intensity={0.8} color="#FFE4B5" />
      <pointLight position={[10, -5, 10]} intensity={0.3} color="#B0C4DE" />
      <spotLight position={[0, 30, 0]} angle={0.3} penumbra={0.5} intensity={1.0} castShadow />

      {/* Environment */}
      <Environment preset="studio" background={false} />

      {/* Scene objects */}
      {objects.map((obj) => (
        <SceneMesh
          key={obj.id}
          obj={obj}
          selected={obj.id === selectedId}
          onSelect={selectObject}
          wireframe={wireframe}
        />
      ))}

      {/* Empty scene placeholder */}
      {objects.length === 0 && (
        <group>
          <mesh position={[0, 0, 0]}>
            <torusGeometry args={[1.7, 0.2, 32, 64]} />
            <meshStandardMaterial color="#FFD700" metalness={0.95} roughness={0.08} />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <sphereGeometry args={[0.35, 32, 32]} />
            <meshPhysicalMaterial
              color="#E8F4FD"
              transparent
              opacity={0.9}
              transmission={0.6}
              ior={2.4}
              roughness={0.0}
            />
          </mesh>
        </group>
      )}

      {/* Ground */}
      <ContactShadows
        position={[0, -2.5, 0]}
        opacity={0.4}
        scale={20}
        blur={2}
        far={10}
      />
      <Grid
        position={[0, -2.5, 0]}
        args={[30, 30]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#374151"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#4B5563"
        fadeDistance={25}
        fadeStrength={1}
        infiniteGrid
      />

      {/* Controls */}
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.05}
        minDistance={2}
        maxDistance={50}
        target={[0, 0, 0]}
      />

      {/* Click on empty space to deselect */}
      <mesh
        position={[0, -2.5, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        visible={false}
        onClick={() => selectObject(null)}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial />
      </mesh>
    </>
  );
}

// ─── Keyboard handler component ───────────────────────────────────────────────
function KeyboardHandler() {
  const { selectedId, removeObject, undo, redo, canUndo, canRedo } = useSceneStore();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) removeObject(selectedId);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (canUndo()) undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        if (canRedo()) redo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId, removeObject, undo, redo, canUndo, canRedo]);

  return null;
}

// ─── Main Workspace3D component ───────────────────────────────────────────────
export default function Workspace3D() {
  const viewMode = useSceneStore((s) => s.viewMode);
  const bgColor = '#111827';

  return (
    <div className="relative w-full h-full">
      <KeyboardHandler />
      <Canvas
        shadows
        camera={{ position: [8, 6, 8], fov: 45, near: 0.1, far: 1000 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: bgColor }}
      >
        <color attach="background" args={[bgColor]} />
        <fog attach="fog" args={[bgColor, 30, 80]} />
        <SceneContent />
        <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
          <GizmoViewport
            axisColors={['#ef4444', '#22c55e', '#3b82f6']}
            labelColor="white"
          />
        </GizmoHelper>
      </Canvas>

      {/* View mode badge */}
      {viewMode !== 'shaded' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 text-xs px-3 py-1 rounded-full backdrop-blur-sm">
          {viewMode.toUpperCase()} MODE
        </div>
      )}
    </div>
  );
}
