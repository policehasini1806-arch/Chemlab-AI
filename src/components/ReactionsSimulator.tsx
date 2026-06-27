import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, CheckCircle2, RefreshCw, Zap } from 'lucide-react';

interface EquationConfig {
  id: string;
  name: string;
  reactantsText: string;
  productsText: string;
  unbalancedText: string;
  reactantsAtomFormula: (coefs: number[]) => Record<string, number>;
  productsAtomFormula: (coefs: number[]) => Record<string, number>;
  correctCoefs: number[]; // index 0: reactant A, 1: reactant B, 2: product A, etc.
}

const EQUATIONS_POOL: EquationConfig[] = [
  {
    id: 'eq1',
    name: 'Synthesis of Water',
    reactantsText: 'H₂ + O₂',
    productsText: 'H₂O',
    unbalancedText: 'H₂ + O₂ → H₂O',
    correctCoefs: [2, 1, 2],
    reactantsAtomFormula: (c) => ({ H: c[0] * 2, O: c[1] * 2 }),
    productsAtomFormula: (c) => ({ H: c[2] * 2, O: c[2] * 1 })
  },
  {
    id: 'eq2',
    name: 'Synthesis of Ammonia',
    reactantsText: 'N₂ + H₂',
    productsText: 'NH₃',
    unbalancedText: 'N₂ + H₂ → NH₃',
    correctCoefs: [1, 3, 2],
    reactantsAtomFormula: (c) => ({ N: c[0] * 2, H: c[1] * 2 }),
    productsAtomFormula: (c) => ({ N: c[2] * 1, H: c[2] * 3 })
  },
  {
    id: 'eq3',
    name: 'Combustion of Methane',
    reactantsText: 'CH₄ + O₂',
    productsText: 'CO₂ + H₂O',
    unbalancedText: 'CH₄ + O₂ → CO₂ + H₂O',
    correctCoefs: [1, 2, 1, 2],
    reactantsAtomFormula: (c) => ({ C: c[0] * 1, H: c[0] * 4, O: c[1] * 2 }),
    productsAtomFormula: (c) => ({ C: c[2] * 1, H: c[3] * 2, O: c[2] * 2 + c[3] * 1 })
  }
];

interface ClassificationGame {
  formula: string;
  type: 'Synthesis' | 'Decomposition' | 'Single Replacement' | 'Double Replacement' | 'Combustion';
  options: string[];
}

const CLASSIFICATION_EXERCISES: ClassificationGame[] = [
  { formula: '2H₂ + O₂ ➔ 2H₂O', type: 'Synthesis', options: ['Synthesis', 'Decomposition', 'Single Replacement'] },
  { formula: '2H₂O ➔ 2H₂ + O₂', type: 'Decomposition', options: ['Synthesis', 'Decomposition', 'Double Replacement'] },
  { formula: 'Zn + 2HCl ➔ ZnCl₂ + H₂', type: 'Single Replacement', options: ['Single Replacement', 'Double Replacement', 'Combustion'] },
  { formula: 'HCl + NaOH ➔ NaCl + H₂O', type: 'Double Replacement', options: ['Synthesis', 'Double Replacement', 'Combustion'] },
  { formula: 'CH₄ + 2O₂ ➔ CO₂ + 2H₂O', type: 'Combustion', options: ['Decomposition', 'Single Replacement', 'Combustion'] }
];

export default function ReactionsSimulator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Equation Balancer states
  const [eqIdx, setEqIdx] = useState<number>(0);
  const activeEq = EQUATIONS_POOL[eqIdx];
  const [coefs, setCoefs] = useState<number[]>([1, 1, 1, 1]); // reactants count, products count

  // Classifier Game states
  const [classIdx, setClassIdx] = useState<number>(0);
  const activeClass = CLASSIFICATION_EXERCISES[classIdx];
  const [classSelected, setClassSelected] = useState<string | null>(null);
  const [classFeedback, setClassFeedback] = useState<{ status: 'idle' | 'correct' | 'incorrect'; msg: string }>({ status: 'idle', msg: '' });

  // Reset values when switching equation
  useEffect(() => {
    setCoefs([1, 1, 1, 1]);
  }, [eqIdx]);

  // Compute live atom tallies
  const leftTallies = activeEq.reactantsAtomFormula(coefs);
  const rightTallies = activeEq.productsAtomFormula(coefs);

  // Check if fully balanced matching coefficients index values
  let isBalanced = true;
  Object.keys(leftTallies).forEach((atom) => {
    if (leftTallies[atom] !== rightTallies[atom]) isBalanced = false;
  });

  // Badge rewards helper
  useEffect(() => {
    if (isBalanced) {
      const storageKey = 'chemlab_badges';
      try {
        const bdgs = JSON.parse(localStorage.getItem(storageKey) || '[]');
        if (!bdgs.includes('badge_m4')) {
          bdgs.push('badge_m4');
          localStorage.setItem(storageKey, JSON.stringify(bdgs));
        }
      } catch (e) {}
    }
  }, [isBalanced]);

  // Handle classification answer check
  const handleClassify = (choice: string) => {
    setClassSelected(choice);
    if (choice === activeClass.type) {
      setClassFeedback({
        status: 'correct',
        msg: `Excellent! That is indeed a ${choice} reaction pattern.`
      });
    } else {
      setClassFeedback({
        status: 'incorrect',
        msg: `Incorrect. Observe how reactants join, break down, or swap parts.`
      });
    }
  };

  const handleNextClassExercise = () => {
    const nextIdx = (classIdx + 1) % CLASSIFICATION_EXERCISES.length;
    setClassIdx(nextIdx);
    setClassSelected(null);
    setClassFeedback({ status: 'idle', msg: '' });
  };

  // Canvas collision rearrangement simulator animation loop (Water Synthesis)
  const isAnimating = useRef<boolean>(true);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    // Define coordinate bodies
    // Starts with: Two separate H2 molecules (four blue spheres) + One O2 molecule (two red spheres)
    const h1 = { x: 40, y: 35, vx: 2, vy: 1.5, type: 'H', bound: true };
    const h2 = { x: 55, y: 45, vx: 2, vy: 1.5, type: 'H', bound: true };
    
    const h3 = { x: 50, y: 150, vx: 1.8, vy: -1.2, type: 'H', bound: true };
    const h4 = { x: 65, y: 160, vx: 1.8, vy: -1.2, type: 'H', bound: true };

    const o1 = { x: 260, y: 80, vx: -1.5, vy: 0.5, type: 'O', bound: true };
    const o2 = { x: 284, y: 95, vx: -1.5, vy: 0.5, type: 'O', bound: true };

    const particles = [h1, h2, h3, h4, o1, o2];
    let showCovalentArcs = false;

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      const width = canvas.width;
      const height = canvas.height;

      // Draw background containment grid lines
      ctx.strokeStyle = 'rgba(124, 58, 237, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      const reactantPhase = frame < 120;
      const collisionPhase = frame >= 120 && frame < 160;
      const productPhase = frame >= 160;

      // A. Movement of reactant molecules before impact
      if (reactantPhase) {
        // Move with constraint bounding bonds to molecules
        h1.x += h1.vx; h1.y += h1.vy;
        h2.x = h1.x + 15 * Math.sin(frame * 0.15);
        h2.y = h1.y + 15 * Math.cos(frame * 0.15);

        h3.x += h3.vx; h3.y += h3.vy;
        h4.x = h3.x + 15 * Math.sin(frame * 0.15 + 1);
        h4.y = h3.y + 15 * Math.cos(frame * 0.15 + 1);

        o1.x += o1.vx; o1.y += o1.vy;
        o2.x = o1.x + 24 * Math.sin(frame * 0.05);
        o2.y = o1.y + 24 * Math.cos(frame * 0.05);

        // draw lines linking compound structures
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(h1.x, h1.y); ctx.lineTo(h2.x, h2.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(h3.x, h3.y); ctx.lineTo(h4.x, h4.y); ctx.stroke();
        
        ctx.strokeStyle = '#ef4444'; // oxygen covalent bond
        ctx.beginPath(); ctx.moveTo(o1.x, o1.y); ctx.lineTo(o2.x, o2.y); ctx.stroke();
      } else if (collisionPhase) {
        // Particles merge at centering impact node
        const targetX = width / 2;
        const targetY = height / 2;

        particles.forEach((p) => {
          p.x += (targetX - p.x) * 0.12;
          p.y += (targetY - p.y) * 0.12;
        });

        // Flash sparking energy reaction trigger
        ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
        ctx.beginPath();
        ctx.arc(targetX, targetY, 40 + Math.sin(frame) * 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('ACTIVATION ENERGY THRESHOLD', targetX - 65, targetY - 45);

        // Draw electrical spark spikes
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(targetX - 20, targetY - 20);
        ctx.lineTo(targetX + 25, targetY + 25);
        ctx.moveTo(targetX + 20, targetY - 20);
        ctx.lineTo(targetX - 25, targetY + 25);
        ctx.stroke();
      } else {
        // Product Phase: Reconstructed into two independent H2O (Water) molecules.
        // H2O #1 (Carbon/Oxygen core is o1; hydrogen components are h1 & h2)
        const centroid1X = 100 + Math.sin(frame * 0.01) * 30;
        const centroid1Y = 100 + Math.cos(frame * 0.01) * 10;
        o1.x += (centroid1X - o1.x) * 0.1;
        o1.y += (centroid1Y - o1.y) * 0.1;

        h1.x += (centroid1X - 25 * Math.sin(0.4) - h1.x) * 0.15;
        h1.y += (centroid1Y + 20 * Math.cos(0.4) - h1.y) * 0.15;

        h2.x += (centroid1X + 25 * Math.sin(0.4) - h2.x) * 0.15;
        h2.y += (centroid1Y + 20 * Math.cos(0.4) - h2.y) * 0.15;

        // H2O #2 (Oxygen core is o2; hydrogen components are h3 & h4)
        const centroid2X = 280 + Math.cos(frame * 0.015) * 30;
        const centroid2Y = 110 + Math.sin(frame * 0.015) * 10;
        o2.x += (centroid2X - o2.x) * 0.1;
        o2.y += (centroid2Y - o2.y) * 0.1;

        h3.x += (centroid2X - 25 * Math.sin(0.4) - h3.x) * 0.15;
        h3.y += (centroid2Y + 20 * Math.cos(0.4) - h3.y) * 0.15;

        h4.x += (centroid2X + 25 * Math.sin(0.4) - h4.x) * 0.15;
        h4.y += (centroid2Y + 20 * Math.cos(0.4) - h4.y) * 0.15;

        // Draw polar covalent water bonds (Single lines)
        ctx.strokeStyle = '#00e5cc';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(o1.x, o1.y); ctx.lineTo(h1.x, h1.y);
        ctx.moveTo(o1.x, o1.y); ctx.lineTo(h2.x, h2.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(o2.x, o2.y); ctx.lineTo(h3.x, h3.y);
        ctx.moveTo(o2.x, o2.y); ctx.lineTo(h4.x, h4.y);
        ctx.stroke();

        ctx.fillStyle = '#00e5cc';
        ctx.font = 'bold 8px monospace';
        ctx.fillText('Product #1 (H₂O)', o1.x - 30, o1.y - 18);
        ctx.fillText('Product #2 (H₂O)', o2.x - 30, o2.y - 18);
      }

      // Draw all element atomic circle beads
      particles.forEach((p) => {
        if (p.type === 'H') {
          ctx.fillStyle = '#38bdf8'; // bright soft blue
          ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 7px sans-serif';
          ctx.fillText('H', p.x - 3, p.y + 2.5);
        } else {
          ctx.fillStyle = '#ef4444'; // rich red for oxygen
          ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 8px sans-serif';
          ctx.fillText('O', p.x - 3.5, p.y + 3);
        }
      });

      // Loop over infinite cycle
      if (frame > 350) frame = 0;

      animId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="space-y-6" id="reactions-balancer-dashboard">
      
      {/* Balancer module interactive layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left column: Equations selection & balancer sliders */}
        <div className="bg-slate-900 border border-violet-950/45 p-4 rounded-xl flex flex-col justify-between" id="balancer-sidebar">
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase text-teal-400">Choose Unbalanced Reaction:</h3>
              <div className="flex flex-col gap-1.5 mt-2" id="equations-picker">
                {EQUATIONS_POOL.map((eq, idx) => (
                  <button
                    key={eq.id}
                    onClick={() => {
                      setEqIdx(idx);
                    }}
                    className={`text-left px-3 py-2 border rounded-lg transition-all font-mono text-xs ${
                      idx === eqIdx
                        ? 'border-violet-500 bg-violet-600/10 text-violet-400'
                        : 'border-violet-950/20 bg-slate-950/40 text-zinc-400 hover:border-violet-800'
                    }`}
                    id={`balancer-eq-${idx}`}
                  >
                    <span>{eq.name}</span>
                    <span className="block text-[10px] text-zinc-500 mt-0.5">{eq.unbalancedText}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Balancing Sliders triggers */}
            <div className="space-y-3" id="sliders-container">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Balance Coefficients:</span>
              
              {/* Reactant A */}
              <div className="flex items-center justify-between gap-2.5">
                <span className="text-xs font-mono text-zinc-300 w-14 truncate">{activeEq.reactantsText.split('+')[0].trim()}</span>
                <div className="flex items-center bg-slate-950 px-2 py-1 border border-violet-950/50 rounded-lg flex-1">
                  <input
                    type="range"
                    min="1"
                    max="4"
                    value={coefs[0]}
                    onChange={(e) => {
                      const updated = [...coefs];
                      updated[0] = parseInt(e.target.value);
                      setCoefs(updated);
                    }}
                    className="w-full accent-violet-600 mr-2"
                  />
                  <span className="text-[11px] font-mono text-teal-400 font-bold">{coefs[0]}</span>
                </div>
              </div>

              {/* Reactant B */}
              {activeEq.reactantsText.includes('+') && (
                <div className="flex items-center justify-between gap-2.5">
                  <span className="text-xs font-mono text-zinc-300 w-14 truncate">{activeEq.reactantsText.split('+')[1].trim()}</span>
                  <div className="flex items-center bg-slate-950 px-2 py-1 border border-violet-950/50 rounded-lg flex-1">
                    <input
                      type="range"
                      min="1"
                      max="4"
                      value={coefs[1]}
                      onChange={(e) => {
                        const updated = [...coefs];
                        updated[1] = parseInt(e.target.value);
                        setCoefs(updated);
                      }}
                      className="w-full accent-violet-600 mr-2"
                    />
                    <span className="text-[11px] font-mono text-teal-400 font-bold">{coefs[1]}</span>
                  </div>
                </div>
              )}

              {/* Product A */}
              <div className="flex items-center justify-between gap-2.5">
                <span className="text-xs font-mono text-zinc-300 w-14 truncate">{activeEq.productsText.split('+')[0].trim()}</span>
                <div className="flex items-center bg-slate-950 px-2 py-1 border border-violet-950/50 rounded-lg flex-1">
                  <input
                    type="range"
                    min="1"
                    max="4"
                    value={coefs[2]}
                    onChange={(e) => {
                      const updated = [...coefs];
                      updated[2] = parseInt(e.target.value);
                      setCoefs(updated);
                    }}
                    className="w-full accent-violet-600 mr-2"
                  />
                  <span className="text-[11px] font-mono text-teal-400 font-bold">{coefs[2]}</span>
                </div>
              </div>

              {/* Product B */}
              {activeEq.productsText.includes('+') && (
                <div className="flex items-center justify-between gap-2.5">
                  <span className="text-xs font-mono text-zinc-300 w-14 truncate">{activeEq.productsText.split('+')[1].trim()}</span>
                  <div className="flex items-center bg-slate-950 px-2 py-1 border border-violet-950/50 rounded-lg flex-1">
                    <input
                      type="range"
                      min="1"
                      max="4"
                      value={coefs[3]}
                      onChange={(e) => {
                        const updated = [...coefs];
                        updated[3] = parseInt(e.target.value);
                        setCoefs(updated);
                      }}
                      className="w-full accent-violet-600 mr-2"
                    />
                    <span className="text-[11px] font-mono text-teal-400 font-bold">{coefs[3]}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setCoefs([1, 1, 1, 1])}
            className="w-full py-1.5 border border-violet-950 rounded-lg text-xs font-mono hover:bg-slate-950 text-zinc-400 transition flex items-center justify-center gap-1.5 mt-4"
            id="balancer-reset-btn"
          >
            <RefreshCw className="w-3 h-3" /> Reset Slider Coefficients
          </button>
        </div>

        {/* Balancing canvas output HUD display */}
        <div className="bg-slate-900 border border-violet-950/45 p-4 rounded-xl md:col-span-2 flex flex-col justify-between" id="balancer-display">
          <div>
            <span className="text-[10px] font-mono uppercase text-teal-400 tracking-wider">LIVE EQUATION BALANCER OUTPUT</span>
            
            {/* Unbalanced values rendered */}
            <div className="bg-slate-950/80 p-4 border border-violet-950/35 rounded-xl flex items-center justify-center my-3 relative overflow-hidden" id="equation-display-card">
              <div className="font-mono text-sm tracking-wider flex items-center gap-2 select-text">
                {/* Reactant A */}
                <span className="text-teal-400 font-bold">{coefs[0]}</span>
                <span className="text-white">{activeEq.reactantsText.split('+')[0].trim()}</span>
                
                {/* Reactant B */}
                {activeEq.reactantsText.includes('+') && (
                  <>
                    <span className="text-zinc-600">+</span>
                    <span className="text-teal-400 font-bold">{coefs[1]}</span>
                    <span className="text-white">{activeEq.reactantsText.split('+')[1].trim()}</span>
                  </>
                )}

                <span className="text-zinc-500 font-bold px-1">➔</span>

                {/* Product A */}
                <span className="text-teal-400 font-bold">{coefs[2]}</span>
                <span className="text-white">{activeEq.productsText.split('+')[0].trim()}</span>

                {/* Product B */}
                {activeEq.productsText.includes('+') && (
                  <>
                    <span className="text-zinc-600">+</span>
                    <span className="text-teal-400 font-bold">{coefs[3]}</span>
                    <span className="text-white">{activeEq.productsText.split('+')[1].trim()}</span>
                  </>
                )}
              </div>

              {/* Status Indicator glows */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {isBalanced ? (
                  <span className="bg-teal-500/10 border border-teal-500 text-teal-400 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider animate-pulse flex items-center gap-1">
                     Balanced
                  </span>
                ) : (
                  <span className="bg-red-500/10 border border-red-500/40 text-red-400 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                    Unbalanced
                  </span>
                )}
              </div>
            </div>

            {/* Atomic Tally meters */}
            <div className="grid grid-cols-2 gap-4 mt-3" id="atomic-tally-board">
              <div className="bg-slate-950 border border-violet-950/20 p-3 rounded-lg">
                <span className="text-[10px] font-mono text-zinc-500 block mb-1">Reactants (Left Side):</span>
                <div className="space-y-1">
                  {Object.entries(leftTallies).map(([atom, val]) => (
                    <div key={atom} className="flex justify-between font-mono text-xs text-zinc-300">
                      <span>Atom {atom}:</span>
                      <span className={leftTallies[atom] === rightTallies[atom] ? 'text-teal-400 font-bold' : 'text-zinc-400'}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950 border border-violet-950/20 p-3 rounded-lg">
                <span className="text-[10px] font-mono text-zinc-500 block mb-1">Products (Right Side):</span>
                <div className="space-y-1">
                  {Object.entries(rightTallies).map(([atom, val]) => (
                    <div key={atom} className="flex justify-between font-mono text-xs text-zinc-300">
                      <span>Atom {atom}:</span>
                      <span className={leftTallies[atom] === rightTallies[atom] ? 'text-teal-400 font-bold' : 'text-zinc-400'}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {isBalanced && (
            <div className="bg-teal-500/5 border border-teal-500/25 p-3 rounded-lg flex items-start gap-2 text-teal-400 mt-4" id="balanced-success-card">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <p className="text-[11px] font-sans leading-relaxed">
                <strong>Congratulations! Atoms match globally!</strong> Equation fully balances adhering strictly to the Law of Conservation of Mass (+100 XP to balance counters!).
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Kinetic collision rearrangement visual simulator viewport */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="reactive-visualizer">
        
        {/* Kinetic Canvas Reactor */}
        <div className="bg-slate-900 border border-violet-950/45 p-4 rounded-xl md:col-span-2 flex flex-col items-center" id="reactor-canvas-panel">
          <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-violet-950/20">
            <span className="text-[10px] font-mono uppercase text-teal-400 tracking-wider font-bold">KINETIC COLLISION IMPACT RECONSTRUCTOR</span>
            <span className="text-[9px] font-mono text-zinc-500">Water Synthesis: 2H₂ + O₂ ➔ 2H₂O</span>
          </div>

          <canvas
            ref={canvasRef}
            width={380}
            height={180}
            className="w-full h-[180px] bg-slate-950 rounded-lg border border-violet-950/20 shadow-inner"
            aria-label="Water reaction covalent collision canvas"
          />
          <p className="text-[10px] font-mono text-zinc-500 mt-1.5 self-start">🔄 Animating infinite collision, impact energy flash, and hydrogen polar rearrangement.</p>
        </div>

        {/* Reaction Type Classifier Mini-Game */}
        <div className="bg-slate-900 border border-violet-950/45 p-4 rounded-xl flex flex-col justify-between" id="classifier-widget">
          <div>
            <span className="text-[10px] font-mono uppercase text-teal-400 block mb-1">Reaction Classifier Game</span>
            <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">Determine the classification representing the shown formula equation:</p>
            
            <div className="bg-slate-950 p-3 rounded-xl border border-violet-950/30 text-center font-mono my-3 font-semibold text-xs text-white" id="classifier-formula-card">
              {activeClass.formula}
            </div>

            <div className="flex flex-col gap-1.5" id="classifier-options">
              {activeClass.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleClassify(option)}
                  disabled={classSelected !== null}
                  className={`w-full text-center py-2.5 rounded-lg border text-xs font-mono tracking-wide transition ${
                    classSelected === option
                      ? option === activeClass.type
                        ? 'bg-teal-500/15 border-teal-500 text-teal-400'
                        : 'bg-red-500/15 border-red-500 text-red-400'
                      : classSelected !== null && option === activeClass.type
                      ? 'border-teal-500/60 text-teal-400 font-bold'
                      : 'border-violet-950/30 bg-slate-950/35 hover:border-violet-700 text-zinc-300'
                  }`}
                  id={`class-btn-${option}`}
                >
                  {option}
                </button>
              ))}
            </div>

            {classFeedback.status !== 'idle' && (
              <div className={`mt-3 p-3 rounded-lg border text-[11px] font-sans leading-relaxed ${
                classFeedback.status === 'correct' ? 'border-teal-500/30 bg-teal-500/5 text-teal-400' : 'border-red-500/30 bg-red-500/5 text-red-400'
              }`} id="classifier-feedback-hud">
                {classFeedback.msg}
              </div>
            )}
          </div>

          {classSelected !== null && (
            <button
              onClick={handleNextClassExercise}
              className="w-full mt-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-mono text-xs font-bold uppercase rounded-lg transition"
              id="classifier-next-btn"
            >
              Next Exercise
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
