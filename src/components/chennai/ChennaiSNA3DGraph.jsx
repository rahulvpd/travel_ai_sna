// src/components/chennai/ChennaiSNA3DGraph.jsx
// 3D Heritage Network Visualization using Three.js / React Three Fiber
// Interactive 3D space with nodes, edges, and dynamic camera controls

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Line, Billboard, Html } from '@react-three/drei';
import { Suspense } from 'react';
import * as THREE from 'three';
import { dynastyHex } from '../../utils/dynastyColors';

// ─────────────────────────────────────────────────────────────
// 3D NODE COMPONENT
// ─────────────────────────────────────────────────────────────
function Node3D({ node, metrics, position, onClick, selected, highlight }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  const color = dynastyHex[node.dynasty] || '#888888';
  const size = useMemo(() => {
    const baseSize = 0.3;
    const centralityBonus = (metrics?.degreeCentrality || 0) * 0.4;
    const popularityBonus = (metrics?.visitorPopularity || 0) * 0.2;
    return baseSize + centralityBonus + popularityBonus;
  }, [metrics]);

  // Animate on hover/select
  useFrame((state) => {
    if (meshRef.current) {
      const targetScale = hovered || selected ? 1.5 : highlight ? 1.3 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.05;
    }
  });

  return (
    <group position={position}>
      {/* Main sphere */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick(node);
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered || selected ? 0.5 : 0.2}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
      
      {/* Glow effect */}
      <mesh scale={1.2}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Node label */}
      {(hovered || selected || highlight) && (
        <Billboard>
          <Text
            position={[0, size + 0.3, 0]}
            fontSize={0.15}
            color="white"
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.02}
            outlineColor="#000"
          >
            {node.name}
          </Text>
        </Billboard>
      )}

      {/* Tooltip on hover */}
      {hovered && (
        <Html position={[0, size + 0.6, 0]} center>
          <div className="bg-black/90 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap border border-white/20">
            <div className="font-semibold">{node.name}</div>
            <div className="text-white/60">{node.dynasty} · {node.placeType}</div>
            {metrics && (
              <div className="text-white/40 text-[10px] mt-1">
                Links: {metrics.degree} | Score: {metrics.recommendationScore?.toFixed(2)}
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────
// 3D EDGE COMPONENT
// ─────────────────────────────────────────────────────────────
function Edge3D({ start, end, weight, type, highlight }) {
  const points = useMemo(() => {
    const midPoint = new THREE.Vector3(
      (start[0] + end[0]) / 2,
      (start[1] + end[1]) / 2 + 0.2,
      (start[2] + end[2]) / 2
    );
    return [
      new THREE.Vector3(...start),
      midPoint,
      new THREE.Vector3(...end)
    ];
  }, [start, end]);

  const edgeColors = {
    dynasty: '#FFCC00',
    type: '#00C9B1',
    geographic: '#4F8EFF',
    era: '#FF6B6B',
    spiritual: '#A855F7',
    temporal: '#10B981',
    cultural: '#EC4899'
  };

  return (
    <Line
      points={points}
      color={edgeColors[type] || '#555'}
      lineWidth={Math.min(weight * 0.5, 3)}
      opacity={highlight ? 0.9 : 0.3}
      transparent
    />
  );
}

// ─────────────────────────────────────────────────────────────
// CAMERA CONTROLLER
// ─────────────────────────────────────────────────────────────
function CameraController({ target }) {
  const { camera } = useThree();
  
  useEffect(() => {
    if (target) {
      const targetPos = new THREE.Vector3(target[0], target[1], target[2] + 5);
      camera.position.lerp(targetPos, 0.1);
    }
  }, [target, camera]);

  return null;
}

// ─────────────────────────────────────────────────────────────
// NETWORK SCENE
// ─────────────────────────────────────────────────────────────
function NetworkScene({ snaData, selectedNode, onSelectNode }) {
  const nodePositions = useMemo(() => {
    if (!snaData?.nodes) return {};
    
    const positions = {};
    const nodeCount = snaData.nodes.length;
    const radius = 5;
    
    // Position nodes in a sphere formation
    snaData.nodes.forEach((node, i) => {
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;
      
      positions[node.id] = [
        radius * Math.cos(theta) * Math.sin(phi),
        radius * Math.sin(theta) * Math.sin(phi),
        radius * Math.cos(phi)
      ];
    });
    
    return positions;
  }, [snaData]);

  const highlightNeighbours = useMemo(() => {
    if (!selectedNode || !snaData?.metrics) return new Set();
    const neighbours = snaData.metrics[selectedNode.id]?.neighbours || [];
    return new Set([selectedNode.id, ...neighbours]);
  }, [selectedNode, snaData]);

  if (!snaData) return null;

  return (
    <>
      {/* Ambient and directional lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#FFCC00" />

      {/* Render all edges */}
      {snaData.edges?.slice(0, 50).map((edge) => {
        const startPos = nodePositions[edge.source];
        const endPos = nodePositions[edge.target];
        if (!startPos || !endPos) return null;
        
        return (
          <Edge3D
            key={edge.id}
            start={startPos}
            end={endPos}
            weight={edge.weight}
            type={edge.primaryType}
            highlight={
              selectedNode && 
              (edge.source === selectedNode.id || edge.target === selectedNode.id)
            }
          />
        );
      })}

      {/* Render all nodes */}
      {snaData.nodes?.map((node) => (
        <Node3D
          key={node.id}
          node={node}
          metrics={snaData.metrics?.[node.id]}
          position={nodePositions[node.id] || [0, 0, 0]}
          onClick={onSelectNode}
          selected={selectedNode?.id === node.id}
          highlight={highlightNeighbours.has(node.id)}
        />
      ))}

      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={20}
        autoRotate={!selectedNode}
        autoRotateSpeed={0.5}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN 3D COMPONENT
// ─────────────────────────────────────────────────────────────
export default function ChennaiSNA3DGraph({ snaData }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [showLegend, setShowLegend] = useState(true);

  if (!snaData) {
    return (
      <div className="h-[500px] flex items-center justify-center bg-white/5 rounded-2xl border border-white/10">
        <div className="text-center">
          <div className="text-4xl mb-4">🌐</div>
          <p className="text-white/50">Loading 3D visualization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 3D Canvas */}
      <div className="h-[600px] bg-gradient-to-b from-black to-gray-900 rounded-2xl overflow-hidden border border-white/10">
        <Canvas
          camera={{ position: [0, 0, 12], fov: 50 }}
          gl={{ antialias: true }}
        >
          <Suspense fallback={null}>
            <NetworkScene
              snaData={snaData}
              selectedNode={selectedNode}
              onSelectNode={setSelectedNode}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Controls overlay */}
      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur rounded-xl p-4 border border-white/10">
        <div className="text-xs text-white/40 mb-2 uppercase tracking-wide">Controls</div>
        <div className="text-xs text-white/60 space-y-1">
          <div>🖱️ Left-click + drag: Rotate</div>
          <div>🖱️ Right-click + drag: Pan</div>
          <div>🖱️ Scroll: Zoom</div>
          <div>👆 Click node: Select & highlight</div>
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur rounded-xl p-4 border border-white/10">
          <div className="text-xs text-white/40 mb-2 uppercase tracking-wide">Dynasties</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(dynastyHex).slice(0, 6).map(([dynasty, color]) => (
              <div key={dynasty} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-white/70">{dynasty}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected node info panel */}
      {selectedNode && (
        <div className="absolute top-4 right-4 bg-black/90 backdrop-blur rounded-xl p-4 border border-vibrant-gold/30 max-w-xs">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="font-semibold text-white">{selectedNode.name}</div>
              <div className="text-xs text-white/50">{selectedNode.dynasty} · {selectedNode.placeType}</div>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-white/40 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          {snaData.metrics?.[selectedNode.id] && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-white/40">Connections</div>
                <div className="text-white font-semibold">
                  {snaData.metrics[selectedNode.id].degree}
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-white/40">Tourism Score</div>
                <div className="text-white font-semibold">
                  {snaData.metrics[selectedNode.id].recommendationScore?.toFixed(2)}
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-white/40">Accessibility</div>
                <div className="text-white font-semibold">
                  {((selectedNode.accessibility || 0.5) * 100).toFixed(0)}%
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-white/40">Neighbours</div>
                <div className="text-white font-semibold">
                  {snaData.metrics[selectedNode.id].neighbours?.length || 0}
                </div>
              </div>
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-white/10">
            <button
              onClick={() => setSelectedNode(null)}
              className="w-full text-center text-xs bg-vibrant-gold/20 hover:bg-vibrant-gold/30 text-vibrant-gold py-2 rounded-lg transition-colors"
            >
              View Full Details →
            </button>
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur rounded-xl px-4 py-2 border border-white/10">
        <div className="flex gap-4 text-xs">
          <div className="text-center">
            <div className="text-white font-semibold">{snaData.nodes?.length || 0}</div>
            <div className="text-white/40">Nodes</div>
          </div>
          <div className="text-center">
            <div className="text-white font-semibold">{snaData.edges?.length || 0}</div>
            <div className="text-white/40">Edges</div>
          </div>
          <div className="text-center">
            <div className="text-white font-semibold">{snaData.communities?.length || 0}</div>
            <div className="text-white/40">Communities</div>
          </div>
        </div>
      </div>
    </div>
  );
}
