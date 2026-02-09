
import React, { useMemo } from 'react';

interface Props {
  variability: number;
  collapseFactor: number; // 0 to 1
}

const StateSpaceGeometry: React.FC<Props> = ({ variability, collapseFactor }) => {
  const points = useMemo(() => {
    const p = [];
    const gridSize = 10;
    const spacing = 20;
    const center = (gridSize * spacing) / 2;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const x = i * spacing;
        const y = j * spacing;
        
        // Distortion logic: the closer to the center, the more "collapse" pulls points in
        const dx = x - center;
        const dy = y - center;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const force = (1 - dist / (center * 1.5)) * collapseFactor * 40;
        const angle = Math.atan2(dy, dx);
        
        const px = x - Math.cos(angle) * force + (Math.random() - 0.5) * variability * 5;
        const py = y - Math.sin(angle) * force + (Math.random() - 0.5) * variability * 5;
        
        p.push({ x: px, y: py });
      }
    }
    return p;
  }, [variability, collapseFactor]);

  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-700 flex flex-col items-center justify-center">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-400 mb-4 self-start">
        <i className="fa-solid fa-draw-polygon mr-2"></i>
        Systemic Geometry Reconstruction
      </h3>
      <svg width="220" height="220" viewBox="-10 -10 210 210" className="opacity-80">
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="1.5" fill={collapseFactor > 0.6 ? "#f43f5e" : "#06b6d4"} />
        ))}
        {/* Connection lines to show deformation */}
        {points.map((p, i) => {
          if (i % 10 < 9) {
            return (
              <line 
                key={`h-${i}`} 
                x1={p.x} y1={p.y} x2={points[i+1].x} y2={points[i+1].y} 
                stroke={collapseFactor > 0.6 ? "#f43f5e" : "#06b6d4"} 
                strokeWidth="0.5" 
                strokeOpacity="0.2"
              />
            );
          }
          return null;
        })}
      </svg>
      <div className="mt-4 w-full grid grid-cols-2 gap-2 text-[10px] text-slate-400 uppercase">
        <div className="flex flex-col">
          <span>Entropy</span>
          <span className="text-cyan-400 font-mono">{(1 - collapseFactor).toFixed(3)}</span>
        </div>
        <div className="flex flex-col text-right">
          <span>Constraint Tension</span>
          <span className="text-rose-400 font-mono">{collapseFactor.toFixed(3)}</span>
        </div>
      </div>
    </div>
  );
};

export default StateSpaceGeometry;
