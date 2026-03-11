import React, { Suspense, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Box, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

const Rack = ({ position, color = "#444", onSelect, isSelected, zone }: { position: [number, number, number], color?: string, onSelect: () => void, isSelected: boolean, zone?: string }) => {
  const zoneColor = zone === 'Picking' ? '#F27D26' : zone === 'Cold Storage' ? '#00AEEF' : color;
  
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
      {/* Vertical supports */}
      <Box args={[0.2, 4, 0.2]} position={[-1, 2, -1]}><meshStandardMaterial color={isSelected ? "#F27D26" : zoneColor} /></Box>
      <Box args={[0.2, 4, 0.2]} position={[1, 2, -1]}><meshStandardMaterial color={isSelected ? "#F27D26" : zoneColor} /></Box>
      <Box args={[0.2, 4, 0.2]} position={[-1, 2, 1]}><meshStandardMaterial color={isSelected ? "#F27D26" : zoneColor} /></Box>
      <Box args={[0.2, 4, 0.2]} position={[1, 2, 1]}><meshStandardMaterial color={isSelected ? "#F27D26" : zoneColor} /></Box>
      
      {/* Shelves */}
      {[0.5, 1.5, 2.5, 3.5].map((y) => (
        <Box key={y} args={[2.2, 0.1, 2.2]} position={[0, y, 0]}>
          <meshStandardMaterial color={isSelected ? "#F27D26" : "#666"} opacity={isSelected ? 0.8 : 1} transparent={isSelected} />
        </Box>
      ))}

      {/* Pallets */}
      {[0.7, 1.7, 2.7].map((y, i) => (
        <group key={y} position={[0, y, 0]}>
          <Box args={[0.8, 0.4, 0.8]} position={[-0.5, 0, -0.5]}>
            <meshStandardMaterial color={i % 2 === 0 ? "#8B4513" : "#D2691E"} />
          </Box>
          <Box args={[0.8, 0.4, 0.8]} position={[0.5, 0, 0.5]}>
            <meshStandardMaterial color={i % 3 === 0 ? "#F27D26" : "#004A99"} />
          </Box>
        </group>
      ))}

      {/* Zone Label */}
      {zone && (
        <Text
          position={[0, 4.5, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {zone}
        </Text>
      )}
    </group>
  );
};

interface Warehouse3DProps {
  warehouse?: any;
  onViewDetails?: (details: any) => void;
  onAuditRack?: (rackId: string) => void;
  onRelocateItems?: (rackId: string) => void;
  externalAction?: { type: 'audit' | 'relocate', rackId: string, timestamp: number } | null;
}

export const Warehouse3D = ({ warehouse, onViewDetails, onAuditRack, onRelocateItems, externalAction }: Warehouse3DProps) => {
  const [selectedRack, setSelectedRack] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'normal' | 'heatmap' | 'status'>('normal');
  const [isScanning, setIsScanning] = useState(false);
  const [isRelocating, setIsRelocating] = useState(false);
  const [actionResult, setActionResult] = useState<{ type: 'audit' | 'relocate', msg: string } | null>(null);

  const layout = warehouse?.layout || { racks: { rows: 5, cols: 8 }, docks: 4, zones: [] };

  // Handle external actions from modals
  useEffect(() => {
    if (externalAction) {
      setSelectedRack(externalAction.rackId);
      setActionResult(null);
      if (externalAction.type === 'audit') {
        setIsScanning(true);
      } else {
        setIsRelocating(true);
      }
    }
  }, [externalAction]);

  // Reset action result when selection or mode changes
  useEffect(() => {
    setActionResult(null);
    setIsScanning(false);
    setIsRelocating(false);
  }, [selectedRack, viewMode]);

  useEffect(() => {
    if (isScanning && selectedRack) {
      const timer = setTimeout(() => {
        setIsScanning(false);
        setActionResult({
          type: 'audit',
          msg: `Audit Complete for Rack ${selectedRack}. Found 12 pallets. 1 discrepancy resolved (SKU-004 quantity corrected from 148 to 150). System synchronized with inventory database.`
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isScanning, selectedRack]);

  useEffect(() => {
    if (isRelocating && selectedRack) {
      const timer = setTimeout(() => {
        setIsRelocating(false);
        setActionResult({
          type: 'relocate',
          msg: `Relocation Complete for Rack ${selectedRack}. Items moved to Zone A-04-B. Reason: Optimization for high-velocity picking (15% path reduction). AI pathfinding confirmed new location.`
        });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isRelocating, selectedRack]);

  return (
    <div className="w-full h-[600px] bg-slate-900 rounded-2xl overflow-hidden relative border border-white/10 shadow-2xl group/canvas">
      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-10">
        <Canvas camera={{ position: [20, 20, 20], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <spotLight position={[-10, 20, 10]} angle={0.15} penumbra={1} />
          
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          
          {/* Floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} onClick={() => setSelectedRack(null)}>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="#111" />
          </mesh>
          
          <gridHelper args={[100, 50, "#333", "#222"]} />

          {/* Racks */}
          {Array.from({ length: layout.racks.rows }).map((_, i) => (
            Array.from({ length: layout.racks.cols }).map((_, j) => {
              const rackId = `${i}-${j}`;
              const zone = layout.zones?.find(z => z.racks.includes(rackId));
              const isTarget = selectedRack === rackId;
              const mockZone = (i < 2) ? 'Picking' : (i > 3) ? 'Cold Storage' : 'Standard';
              
              let color = "#444";
              if (isScanning && isTarget) {
                color = "#10b981"; // Green for scanning
              } else if (isRelocating && isTarget) {
                color = "#3b82f6"; // Blue for relocating
              } else if (viewMode === 'heatmap') {
                color = i % 2 === 0 ? "#F27D26" : "#004A99";
              } else if (viewMode === 'status') {
                color = (i + j) % 5 === 0 ? "#ef4444" : "#10b981";
              } else if (zone) {
                color = zone.color;
              }

              return (
                <Rack 
                  key={rackId} 
                  position={[i * 4 - (layout.racks.rows * 2), 0, j * 4 - (layout.racks.cols * 2)]} 
                  onSelect={() => setSelectedRack(rackId)}
                  isSelected={isTarget}
                  color={color} 
                  zone={mockZone}
                />
              );
            })
          ))}

          {/* Loading Docks */}
          <group position={[layout.racks.rows * 2 + 5, 0, 0]}>
            {Array.from({ length: layout.docks }).map((_, i) => (
              <group key={i} position={[0, 0, i * 6 - (layout.docks * 3)]}>
                <Box args={[2, 4, 4]} position={[0, 2, 0]}>
                  <meshStandardMaterial color="#222" />
                </Box>
                <Box args={[0.1, 3.8, 3.8]} position={[-1.05, 2, 0]}>
                  <meshStandardMaterial color="#F27D26" emissive="#F27D26" emissiveIntensity={0.5} />
                </Box>
              </group>
            ))}
          </group>

          <OrbitControls makeDefault />
        </Canvas>
      </div>

      {/* UI Overlay Layer - HIGHER Z-INDEX AND SEPARATE CONTAINER */}
      <div className="absolute inset-0 z-50 pointer-events-none p-6 flex flex-col justify-between">
        <div className="flex flex-col gap-3 w-fit pointer-events-auto">
          <div className="bg-black/60 backdrop-blur-xl p-4 rounded-2xl border border-white/20 shadow-2xl">
            <h3 className="text-white font-bold text-base">{warehouse?.name || 'Interactive 3D Layout'}</h3>
            <p className="text-white/40 text-xs">{warehouse?.location || 'Real-time occupancy visualization'}</p>
          </div>
          
          <div className="flex gap-1 bg-black/60 backdrop-blur-xl p-1.5 rounded-xl border border-white/10 shadow-xl">
            {(['normal', 'heatmap', 'status'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${viewMode === mode ? 'bg-porteo-orange text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
              >
                {mode}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {selectedRack && (
              <motion.div 
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                className="bg-porteo-blue/90 backdrop-blur-2xl p-4 rounded-2xl border border-white/20 text-white w-56 pointer-events-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-porteo-orange">Rack {selectedRack}</p>
                    <p className="text-[10px] text-white/60">Zone A • High Density</p>
                  </div>
                  <div className="bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded text-[8px] font-bold">ACTIVE</div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-white/40">Occupancy</span>
                    <span className="font-bold">85%</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-porteo-orange w-[85%]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onViewDetails?.({ id: selectedRack });
                    }}
                    className="text-[10px] bg-porteo-orange py-2 rounded-xl font-bold hover:bg-porteo-orange/80 transition-all shadow-lg active:scale-95"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsScanning(true);
                      setActionResult(null);
                      alert(`SUCCESS: Audit Track initiated for Rack ${selectedRack}. Scanning unit...`);
                      onAuditRack?.(selectedRack);
                    }}
                    className="text-[10px] bg-white/10 py-2 rounded-xl font-bold hover:bg-white/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    {isScanning ? <div className="w-3 h-3 border-2 border-white border-t-transparent animate-spin rounded-full" /> : null}
                    {isScanning ? 'Scanning...' : 'Audit Track'}
                  </button>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsRelocating(true);
                      setActionResult(null);
                      alert(`SUCCESS: Relocation workflow started for Rack ${selectedRack}. AI pathfinding active.`);
                      onRelocateItems?.(selectedRack);
                    }}
                    className="text-[10px] bg-white/10 py-2 rounded-xl font-bold hover:bg-white/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    {isRelocating ? <div className="w-3 h-3 border-2 border-white border-t-transparent animate-spin rounded-full" /> : null}
                    {isRelocating ? 'Relocating...' : 'Relocate Items'}
                  </button>
                </div>

                {actionResult && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 p-3 rounded-xl border text-[10px] leading-relaxed ${actionResult.type === 'audit' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-porteo-blue/10 border-porteo-blue/30 text-porteo-blue-light'}`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold uppercase tracking-widest">{actionResult.type === 'audit' ? 'Audit Findings' : 'Relocation Logic'}</span>
                      <button onClick={() => setActionResult(null)} className="text-white/40 hover:text-white">×</button>
                    </div>
                    {actionResult.msg}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-between items-end pointer-events-none">
          <div className="bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/10 text-[10px] text-white/60 pointer-events-auto">
            <p>Left Click: Rotate</p>
            <p>Right Click: Pan</p>
            <p>Scroll: Zoom</p>
          </div>
          <div className="bg-porteo-orange/10 backdrop-blur-md p-3 rounded-xl border border-porteo-orange/20 text-[10px] text-porteo-orange font-bold pointer-events-auto">
            LIVE TELEMETRY ACTIVE
          </div>
        </div>
      </div>
    </div>
  );
};
