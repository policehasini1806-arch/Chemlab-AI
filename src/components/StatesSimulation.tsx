import React, { useEffect, useRef, useState } from 'react';
import { HelpCircle, Zap, Flame, Snowflake } from 'lucide-react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

export default function StatesSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Interactive control properties
  const [temperature, setTemperature] = useState<number>(298); // Kelvin (50K to 1200K)
  const [pressure, setPressure] = useState<number>(1); // Atmospheres (1 to 10)
  const [phase, setPhase] = useState<'Solid' | 'Liquid' | 'Gas' | 'Plasma'>('Gas');
  const [collisionCount, setCollisionCount] = useState<number>(0);
  const [showChallengeMsg, setShowChallengeMsg] = useState<boolean>(false);
  const [challengeSuccess, setChallengeSuccess] = useState<boolean>(false);

  // Challenge goal: Cause condensation (Gas -> Liquid)
  // Trick: Needs low temp (e.g. below 120 K) and compressed pressure (above 5 atm)
  useEffect(() => {
    if (temperature < 150 && pressure > 6) {
      setChallengeSuccess(true);
      // set completion award trigger
      const storageKey = 'chemlab_badges';
      try {
        const bdgs = JSON.parse(localStorage.getItem(storageKey) || '[]');
        if (!bdgs.includes('badge_m3')) {
          bdgs.push('badge_m3');
          localStorage.setItem(storageKey, JSON.stringify(bdgs));
        }
      } catch (e) {}
    } else {
      setChallengeSuccess(false);
    }
  }, [temperature, pressure]);

  // Handle phase categorization dynamically as sliders shift
  useEffect(() => {
    if (temperature < 140) {
      setPhase('Solid');
    } else if (temperature >= 140 && temperature < 350) {
      setPhase('Liquid');
    } else if (temperature >= 350 && temperature < 850) {
      setPhase('Gas');
    } else {
      setPhase('Plasma');
    }
  }, [temperature]);

  // Main particle animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particleCount = 200;
    const particles: Particle[] = [];

    const width = canvas.width;
    const height = canvas.height;

    // Reset particles on phase or dimension updates
    const initializeParticles = () => {
      particles.length = 0;
      for (let i = 0; i < particleCount; i++) {
        let x = 0, y = 0;
        
        // Solid phase: regular crystal structure distribution
        if (phase === 'Solid') {
          const spacing = 12;
          const cols = 20;
          const col = i % cols;
          const row = Math.floor(i / cols);
          x = 40 + col * spacing;
          y = (height - 60) - row * spacing;
        } else if (phase === 'Liquid') {
          // Liquid particles stay pooled in bottom
          x = 20 + Math.random() * (width - 60);
          y = (height - 10) - Math.random() * 80;
        } else {
          // Gas/Plasma distribute everywhere
          x = 20 + Math.random() * (width - 40);
          y = 20 + Math.random() * (height - 45);
        }

        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          color: '',
        });
      }
    };

    initializeParticles();

    let collisions = 0;
    let collisionCalcTimer = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // A. Draw Container Bounds (Responsive right wall contracts as pressure raises)
      // Max compression decreases width down to 60%
      const compressedWidth = width - (pressure - 1) * 22; // 500 down to ~300
      
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, compressedWidth - 20, height - 20);

      // Draw Compressed Wall indicator line
      ctx.strokeStyle = '#7c3aed'; // Violet
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(compressedWidth - 10, 10);
      ctx.lineTo(compressedWidth - 10, height - 10);
      ctx.stroke();

      // B. Animate and bounce particle objects
      particles.forEach((p, idx) => {
        // Temperature governs particle speeds
        // Base velocity calculations scale proportionally to temperature root
        const speedScale = Math.sqrt(temperature / 298);

        // Render solid lattices vs liquid slushes vs ionized flows
        if (phase === 'Solid') {
          // Solid vibrates slightly on their grid slots
          const spacing = 12;
          const cols = 20;
          const col = idx % cols;
          const row = Math.floor(idx / cols);
          const gridX = 40 + col * spacing;
          const gridY = (height - 40) - row * spacing;

          p.x = gridX + (Math.random() - 0.5) * speedScale * 0.8;
          p.y = gridY + (Math.random() - 0.5) * speedScale * 0.8;
          p.color = '#38bdf8'; // Ice blue
        } else {
          // Apply velocity movements
          p.x += p.vx * speedScale;
          p.y += p.vy * speedScale;

          // Phase boundary constraints
          if (phase === 'Liquid') {
            // Liquid pooled at bottom with high friction
            p.vy += 0.05; // soft gravity force pull
            p.vx *= 0.98; // sliding friction factor
            p.color = '#00e5cc'; // Glowing teal
          } else if (phase === 'Gas') {
            p.color = '#e2e8f0'; // Clean gas grey
          } else {
            // Plasma colors shift hot pink/violet
            p.color = idx % 2 === 0 ? '#ff007f' : '#7b2fff';
            
            // Random sparks/trails inside plasma state
            if (idx % 15 === 0 && Math.random() > 0.85) {
              ctx.strokeStyle = 'rgba(0, 229, 204, 0.35)';
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p.x + (Math.random() - 0.5) * 12, p.y + (Math.random() - 0.5) * 12);
              ctx.stroke();
            }
          }

          // Container Collision Bounces
          const leftBound = 16;
          const rightBound = compressedWidth - 16;
          const topBound = 16;
          const bottomBound = height - 16;

          if (p.x < leftBound) {
            p.x = leftBound;
            p.vx = -p.vx;
            collisions++;
          } else if (p.x > rightBound) {
            p.x = rightBound;
            p.vx = -p.vx;
            collisions++;
          }

          if (p.y < topBound) {
            p.y = topBound;
            p.vy = -p.vy;
            collisions++;
          } else if (p.y > bottomBound) {
            p.y = bottomBound;
            p.vy = -p.vy;
            collisions++;
          }
        }

        // Draw particle node
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, phase === 'Plasma' ? 3 : 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update collisions ticker once a second
      collisionCalcTimer++;
      if (collisionCalcTimer >= 60) {
        setCollisionCount(collisions);
        collisions = 0;
        collisionCalcTimer = 0;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [temperature, pressure, phase]);

  return (
    <div className="space-y-6" id="states-of-matter-dashboard">
      
      {/* Simulation Box HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Particle Canvas viewport container */}
        <div className="bg-slate-900 border border-violet-950/45 p-4 rounded-xl lg:col-span-2 flex flex-col items-center relative" id="canvas-wrapper">
          <div className="w-full flex items-center justify-between pb-2 mb-3 border-b border-violet-950/20">
            <div className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full block ${
                phase === 'Solid' ? 'bg-sky-400' : phase === 'Liquid' ? 'bg-teal-400' : phase === 'Gas' ? 'bg-zinc-300' : 'bg-pink-500 animate-ping'
              }`} />
              <span className="font-mono text-xs text-white font-bold uppercase">PHYSICAL STATE: <span className="text-teal-400">{phase}</span></span>
            </div>
            <div className="text-[10px] font-mono text-zinc-500">
              📊 Wall Collisions / sec: <span className="text-amber-400 font-bold">{collisionCount}</span>
            </div>
          </div>

          <canvas
            ref={canvasRef}
            width={510}
            height={220}
            className="w-full h-[220px] bg-slate-950 border border-violet-950/25 rounded-lg shadow-inner block"
            aria-label="Liquid solid and gaseous state molecular particle visualizer"
          />

          <div className="absolute top-16 right-6 flex flex-col gap-1 text-[10px] font-mono bg-black/70 p-2 rounded border border-violet-950/40" id="legend-overlay">
            <span className="text-zinc-500 font-bold uppercase">Thermal Legend:</span>
            <div className="flex items-center gap-1.5 text-sky-400"><Snowflake className="w-3 h-3" /> Solid (Ice) &lt; 140K</div>
            <div className="flex items-center gap-1.5 text-teal-400">💧 Liquid (Fluid) 140K - 350K</div>
            <div className="flex items-center gap-1.5 text-zinc-300">💨 Gas (Drift) 350K - 850K</div>
            <div className="flex items-center gap-1.5 text-pink-500"><Zap className="w-3 h-3" /> Plasma (Ion) &gt; 850K</div>
          </div>
        </div>

        {/* Sliders and Stats Panels */}
        <div className="bg-slate-900 border border-violet-950/45 p-4 rounded-xl flex flex-col justify-between" id="kinetic-sliders">
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase text-teal-400">Environment Gauges:</h3>
            
            {/* Temperature Slider */}
            <div>
              <div className="flex justify-between font-mono text-xs text-zinc-400 mb-1">
                <span>Temperature (K):</span>
                <span className="text-teal-400 font-bold">{temperature} K</span>
              </div>
              <input
                type="range"
                min="50"
                max="1200"
                value={temperature}
                onChange={(e) => setTemperature(parseInt(e.target.value))}
                className="w-full accent-violet-600 cursor-pointer h-1 bg-slate-950 rounded-lg appearance-none"
                id="temp-slider"
              />
              <div className="flex justify-between text-[9px] font-mono text-zinc-600 mt-1">
                <span>50 K (Cryogenic)</span>
                <span>1200 K (Thermal Star)</span>
              </div>
            </div>

            {/* Pressure Slider */}
            <div>
              <div className="flex justify-between font-mono text-xs text-zinc-400 mb-1">
                <span>Wall Pressure (atm):</span>
                <span className="text-teal-400 font-bold">{pressure} atm</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={pressure}
                onChange={(e) => setPressure(parseInt(e.target.value))}
                className="w-full accent-violet-600 cursor-pointer h-1 bg-slate-950 rounded-lg appearance-none"
                id="pressure-slider"
              />
              <div className="flex justify-between text-[9px] font-mono text-zinc-600 mt-1">
                <span>1 atm (Ambient)</span>
                <span>10 atm (Compressed)</span>
              </div>
            </div>
          </div>

          {/* Kinetic Energy linear plot simulation representation */}
          <div className="border-t border-violet-950/30 pt-3 mt-4" id="graph-panel">
            <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">Kinetic Energy vs Temperature:</span>
            <div className="relative w-full h-16 border border-violet-950/20 bg-slate-950/50 rounded-lg p-2.5 flex items-end">
              {/* Linear Diagonal Graph Grid */}
              <div className="absolute inset-0 border-b border-l border-violet-950/40 m-2 pointer-events-none" />
              <svg className="w-full h-full absolute inset-0 p-2 animate-pulse" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Diagonal plot trail */}
                <line x1="0" y1="100" x2="100" y2="0" stroke="rgba(124, 58, 237, 0.4)" strokeWidth="1" />
                {/* Current temperature marker dot plotting */}
                <circle cx={((temperature - 50) / 1150) * 100} cy={100 - ((temperature - 50) / 1150) * 100} r="4" className="fill-teal-400 stroke-none" />
              </svg>
              <div className="flex justify-between w-full font-mono text-[8px] text-zinc-600 relative z-10 select-none">
                <span>Low KE</span>
                <span>High KE (Scale)</span>
              </div>
            </div>
            <p className="text-[10px] font-sans text-zinc-400 mt-1.5 leading-normal">
              Kinetic molecules speed scales linearly with Temperature: <span className="text-teal-400 font-semibold">KE = 3/2 kT</span>. Raising temp forces high velocity wall collisions.
            </p>
          </div>
        </div>
      </div>

      {/* Condensation Academic Challenge Task Quest */}
      <div className={`p-4 border rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300 ${
        challengeSuccess 
          ? 'border-teal-500 bg-teal-500/5 text-teal-400' 
          : 'border-violet-950/30 bg-slate-950/40 text-zinc-400'
      }`} id="condensation-quest-box">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-violet-600/10 border border-violet-950/40 rounded-lg text-lg select-none">
            🎯
          </div>
          <div>
            <h4 className="text-xs font-bold font-mono uppercase tracking-wide text-zinc-200">Challenge Quest: Condense the Vapor</h4>
            <p className="text-[11px] font-sans leading-relaxed text-zinc-400 mt-1 select-text">
              Alter environment conditions (adjust gauges) to <span className="text-white">cause condensation</span>. You must force gas molecules to pool together (Liquid phase) by reducing temperature and rising container pressure!
            </p>
          </div>
        </div>

        {/* Challenge success badge card */}
        {challengeSuccess ? (
          <div className="flex items-center gap-1.5 bg-teal-500/10 border border-teal-500/30 px-3 py-1.5 rounded-lg shrink-0" id="quest-success">
            <Flame className="w-4 h-4 text-teal-400 animate-bounce" />
            <span className="font-mono text-xs font-bold uppercase text-teal-400">Quest Complete! Badges Unlocked (+100 XP)</span>
          </div>
        ) : (
          <div className="text-[10px] font-mono text-zinc-500 shrink-0 border border-violet-950/30 px-2 py-1 bg-slate-900 rounded" id="quest-hint">
            💡 Setup checklist: Temp &lt; 150K and Pressure &gt; 6atm
          </div>
        )}
      </div>
    </div>
  );
}
