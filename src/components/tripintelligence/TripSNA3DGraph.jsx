import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EDGE_CONFIG } from '../../services/chennaiTripIntelligence';
import { dynastyHex } from '../../utils/dynastyColors';

export default function TripSNA3DGraph({ subgraph }) {
  const canvasRef = useRef(null);
  const cleanupRef = useRef(() => {});
  const animationRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!subgraph || !canvasRef.current) {
      return undefined;
    }

    let mounted = true;
    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    const initialWidth = canvas.clientWidth || 600;
    const height = 380;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(initialWidth, height);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, initialWidth / height, 0.1, 100);
    camera.position.set(0, 0, 6);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const keyLight = new THREE.PointLight(0xffcc00, 2, 20);
    keyLight.position.set(4, 4, 4);
    scene.add(keyLight);
    const fillLight = new THREE.PointLight(0x00c9b1, 1.5, 20);
    fillLight.position.set(-4, -4, 2);
    scene.add(fillLight);

    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 400;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let index = 0; index < particleCount; index += 1) {
      particlePositions[index * 3] = (Math.random() - 0.5) * 20;
      particlePositions[index * 3 + 1] = (Math.random() - 0.5) * 20;
      particlePositions[index * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(
      particlesGeometry,
      new THREE.PointsMaterial({ size: 0.04, color: 0xffcc00, transparent: true, opacity: 0.4, sizeAttenuation: true })
    );
    scene.add(particles);

    const nodePositions = {};
    const nodeMeshes = [];
    const resources = [];
    const count = Math.max(subgraph.nodes.length, 1);
    const radiusBase = Math.max(2.2, subgraph.nodes.length * 0.28);

    subgraph.nodes.forEach((node, index) => {
      const golden = Math.PI * (3 - Math.sqrt(5));
      const y = 1 - (index / Math.max(count - 1, 1)) * 2;
      const ringRadius = Math.sqrt(1 - y * y);
      const theta = golden * index;
      const x = Math.cos(theta) * ringRadius * radiusBase;
      const z = Math.sin(theta) * ringRadius * radiusBase;
      const yPos = y * radiusBase;
      nodePositions[node.id] = new THREE.Vector3(x, yPos, z);

      const metrics = subgraph.metrics[node.id] || {};
      const sphereRadius = 0.15 + Math.min((metrics.weightedDegree || 0) * 0.025, 0.25);
      const colorValue = parseInt((dynastyHex[node.dynasty] || '#888888').replace('#', ''), 16);

      const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 16, 16);
      const sphereMaterial = new THREE.MeshPhongMaterial({ color: colorValue, emissive: colorValue, emissiveIntensity: 0.3, transparent: true, opacity: 0.92 });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.set(x, yPos, z);
      sphere.userData = { node, metrics };
      scene.add(sphere);
      nodeMeshes.push(sphere);
      resources.push(sphereGeometry, sphereMaterial);

      if ((metrics.degreeCentrality || 0) > 0.6) {
        const ringGeometry = new THREE.TorusGeometry(sphereRadius + 0.08, 0.02, 8, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({ color: colorValue, transparent: true, opacity: 0.4 });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.set(x, yPos, z);
        scene.add(ring);
        resources.push(ringGeometry, ringMaterial);
      }

      const labelCanvas = document.createElement('canvas');
      labelCanvas.width = 256;
      labelCanvas.height = 64;
      const context = labelCanvas.getContext('2d');
      context.clearRect(0, 0, 256, 64);
      context.font = 'bold 28px Outfit, sans-serif';
      context.fillStyle = 'rgba(255,255,255,0.85)';
      context.textAlign = 'center';
      context.fillText(node.name.split(' ')[0], 128, 36);

      const labelTexture = new THREE.CanvasTexture(labelCanvas);
      const labelGeometry = new THREE.PlaneGeometry(0.8, 0.2);
      const labelMaterial = new THREE.MeshBasicMaterial({ map: labelTexture, transparent: true, depthTest: false, side: THREE.DoubleSide });
      const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
      labelMesh.position.set(x, yPos + sphereRadius + 0.18, z);
      scene.add(labelMesh);
      resources.push(labelTexture, labelGeometry, labelMaterial);
    });

    subgraph.edges.forEach((edge) => {
      const start = nodePositions[edge.source];
      const end = nodePositions[edge.target];
      if (!start || !end) {
        return;
      }

      const config = EDGE_CONFIG[edge.primaryType] || EDGE_CONFIG.dynasty;
      const colorValue = parseInt((config.color || '#FFCC00').replace('#', ''), 16);
      const midpoint = new THREE.Vector3((start.x + end.x) * 0.2, (start.y + end.y) * 0.2, (start.z + end.z) * 0.2);
      const curve = new THREE.QuadraticBezierCurve3(start, midpoint, end);
      const points = curve.getPoints(20);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: colorValue, transparent: true, opacity: 0.55 * Math.sqrt((edge.weight || 1) / 3) });
      const line = new THREE.Line(geometry, material);
      scene.add(line);
      resources.push(geometry, material);
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let previousMouse = { x: 0, y: 0 };
    let rotationX = 0;
    let rotationY = 0;
    let autoRotate = true;
    let readyTimer = null;

    const setMouseFromEvent = (event) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handleMouseDown = (event) => {
      isDragging = true;
      autoRotate = false;
      previousMouse = { x: event.clientX, y: event.clientY };
    };

    const handleMouseMove = (event) => {
      if (isDragging) {
        rotationY += (event.clientX - previousMouse.x) * 0.008;
        rotationX += (event.clientY - previousMouse.y) * 0.008;
        previousMouse = { x: event.clientX, y: event.clientY };
      }

      setMouseFromEvent(event);
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(nodeMeshes);
      if (hits.length > 0) {
        const { node, metrics } = hits[0].object.userData;
        setTooltip({ x: event.clientX, y: event.clientY, node, metrics });
        canvas.style.cursor = 'pointer';
      } else {
        setTooltip(null);
        canvas.style.cursor = 'grab';
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleMouseLeave = () => {
      isDragging = false;
      setTooltip(null);
    };

    const handleClick = (event) => {
      setMouseFromEvent(event);
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(nodeMeshes);
      if (hits.length > 0) {
        setSelected(hits[0].object.userData.node);
      }
    };

    const handleWheel = (event) => {
      camera.position.z = Math.max(2, Math.min(12, camera.position.z + event.deltaY * 0.01));
    };

    const handleResize = () => {
      const width = canvas.clientWidth || initialWidth;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('wheel', handleWheel);
    window.addEventListener('resize', handleResize);

    let tick = 0;
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      tick += 0.005;
      particles.rotation.y = tick * 0.1;
      particles.rotation.x = tick * 0.05;
      if (autoRotate) {
        rotationY += 0.004;
      }
      scene.rotation.y = rotationY;
      scene.rotation.x = Math.max(-0.6, Math.min(0.6, rotationX));
      renderer.render(scene, camera);
    };

    animate();
    readyTimer = window.setTimeout(() => {
      if (mounted) {
        setReady(true);
      }
    }, 0);

    cleanupRef.current = () => {
      if (readyTimer) {
        window.clearTimeout(readyTimer);
      }
      cancelAnimationFrame(animationRef.current);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      resources.forEach((resource) => {
        resource.dispose?.();
      });
      renderer.dispose();
    };

    return () => {
      mounted = false;
      cleanupRef.current();
    };
  }, [subgraph]);

  return (
    <div className="space-y-3">
      <div className="relative rounded-2xl overflow-hidden border border-white/10" style={{ background: 'rgba(5,5,15,0.95)' }}>
        {!ready && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-vibrant-gold/30 border-t-vibrant-gold rounded-full animate-spin" />
              <p className="text-xs text-white/40">Building 3D heritage network...</p>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="w-full block" style={{ height: 380 }} />

        <div className="absolute bottom-3 right-3 text-xs text-white/20 pointer-events-none">
          Drag to rotate · Scroll to zoom · Click node to inspect
        </div>
        <div className="absolute top-3 left-3 text-xs text-white/20 pointer-events-none">
          3D SNA Network · {subgraph.totalNodes} nodes · {subgraph.totalEdges} edges
        </div>
      </div>

      {selected && (
        <div className="p-4 rounded-2xl border" style={{ background: `${dynastyHex[selected.dynasty] || '#888888'}10`, borderColor: `${dynastyHex[selected.dynasty] || '#888888'}30` }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-syne font-bold text-white">{selected.name}</p>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${dynastyHex[selected.dynasty] || '#888888'}20`, color: dynastyHex[selected.dynasty] || '#888888', border: `1px solid ${dynastyHex[selected.dynasty] || '#888888'}40` }}>
                {selected.dynasty}
              </span>
            </div>
            <button type="button" onClick={() => setSelected(null)} className="text-xl text-white/30 hover:text-white">x</button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Degree', value: subgraph.metrics[selected.id]?.degree || 0, color: '#FFCC00' },
              { label: 'Centrality', value: `${((subgraph.metrics[selected.id]?.degreeCentrality || 0) * 100).toFixed(0)}%`, color: '#00C9B1' },
              { label: 'Betweenness', value: `${((subgraph.metrics[selected.id]?.betweennessCentrality || 0) * 100).toFixed(0)}%`, color: '#4F8EFF' },
              { label: 'Clustering', value: (subgraph.metrics[selected.id]?.clusteringCoeff || 0).toFixed(2), color: '#A855F7' },
            ].map((item) => (
              <div key={item.label} className="bg-white/5 rounded-xl p-2 text-center border border-white/5">
                <div className="text-base font-bold font-syne" style={{ color: item.color }}>{item.value}</div>
                <div className="text-xs text-white/40 mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>

          {selected.significance && (
            <p className="mt-3 pl-3 text-xs text-white/50 leading-relaxed border-l-2" style={{ borderColor: `${dynastyHex[selected.dynasty] || '#888888'}50` }}>
              {selected.significance}
            </p>
          )}
        </div>
      )}

      {tooltip && (
        <div className="fixed z-50 pointer-events-none" style={{ left: tooltip.x + 14, top: tooltip.y - 54 }}>
          <div className="bg-black/92 backdrop-blur-xl border border-white/15 rounded-xl px-4 py-3 text-xs shadow-2xl">
            <div className="font-semibold text-white mb-1">{tooltip.node.name}</div>
            <div className="text-white/50 mb-1">{tooltip.node.dynasty} · {tooltip.node.placeType}</div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
              <span className="text-white/40">Connections</span>
              <span className="text-vibrant-gold font-medium">{tooltip.metrics?.degree || 0}</span>
              <span className="text-white/40">Centrality</span>
              <span className="text-vibrant-gold font-medium">{((tooltip.metrics?.degreeCentrality || 0) * 100).toFixed(0)}%</span>
              <span className="text-white/40">Clustering</span>
              <span className="text-teal-400 font-medium">{(tooltip.metrics?.clusteringCoeff || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {[...new Set(subgraph.nodes.map((node) => node.dynasty))].map((dynasty) => (
          <span key={dynasty} className="flex items-center gap-1.5 text-xs text-white/50">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: dynastyHex[dynasty] || '#888888' }} />
            {dynasty} ({subgraph.nodes.filter((node) => node.dynasty === dynasty).length})
          </span>
        ))}
      </div>
    </div>
  );
}
