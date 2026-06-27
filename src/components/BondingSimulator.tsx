import React, { useState } from 'react';
import { Sparkles, HelpCircle, CheckCircle2, Zap } from 'lucide-react';

interface ElementBondConfig {
  symbol: string;
  name: string;
  electronegativity: number;
  type: 'metal' | 'nonmetal';
  valence: number;
}

const ELEMENT_BOND_POOL: ElementBondConfig[] = [
  { symbol: 'Na', name: 'Sodium', electronegativity: 0.93, type: 'metal', valence: 1 },
  { symbol: 'Cl', name: 'Chlorine', electronegativity: 3.16, type: 'nonmetal', valence: 7 },
  { symbol: 'H', name: 'Hydrogen', electronegativity: 2.20, type: 'nonmetal', valence: 1 },
  { symbol: 'O', name: 'Oxygen', electronegativity: 3.44, type: 'nonmetal', valence: 6 },
  { symbol: 'Li', name: 'Lithium', electronegativity: 0.98, type: 'metal', valence: 1 },
  { symbol: 'F', name: 'Fluorine', electronegativity: 3.98, type: 'nonmetal', valence: 7 }
];

export default function BondingSimulator() {
  // Simulator state variables
  const [atom1, setAtom1] = useState<ElementBondConfig>(ELEMENT_BOND_POOL[0]); // Na
  const [atom2, setAtom2] = useState<ElementBondConfig>(ELEMENT_BOND_POOL[1]); // Cl
  const [showBondResult, setShowBondResult] = useState<boolean>(true);

  // Lewis Dot exercise state
  const [lewisElement, setLewisElement] = useState<ElementBondConfig>(ELEMENT_BOND_POOL[3]); // Oxygen
  const [lewisDots, setLewisDots] = useState<boolean[]>([false, false, false, false, false, false, false, false]); // 8 potential dots positions
  const [lewisFeedback, setLewisFeedback] = useState<{ status: 'idle' | 'correct' | 'incorrect'; msg: string }>({ status: 'idle', msg: '' });

  // Calculate bond properties
  const eleDiff = Math.abs(atom1.electronegativity - atom2.electronegativity);
  
  let bondType: 'Ionic' | 'Polar Covalent' | 'Nonpolar Covalent' | 'Metallic' = 'Polar Covalent';
  let bondDesc = '';

  if (atom1.type === 'metal' && atom2.type === 'metal') {
    bondType = 'Metallic';
    bondDesc = 'Forms a metallic crystalline lattice held together by a shared sea of loose, highly conductive valence electrons.';
  } else if (eleDiff >= 1.7) {
    bondType = 'Ionic';
    bondDesc = 'The metal completely surrenders its valence electron to the hungry non-metal, forming electrostatic positive/negative attraction!';
  } else if (eleDiff >= 0.4) {
    bondType = 'Polar Covalent';
    bondDesc = 'Electrons are shared unequally between the atoms. Due to electronegativity difference, the poles harbor partial delta +/- charges.';
  } else {
    bondType = 'Nonpolar Covalent';
    bondDesc = 'Electrons are shared equally between the atoms. There are virtually no electrical poles inside standard diatomic environments.';
  }

  // Handle Lewis dot builder click
  const toggleDot = (idx: number) => {
    const updated = [...lewisDots];
    updated[idx] = !updated[idx];
    setLewisDots(updated);
    setLewisFeedback({ status: 'idle', msg: '' });
  };

  const checkLewisStructure = () => {
    const activeDotCount = lewisDots.filter(Boolean).length;
    const requiredValence = lewisElement.valence;

    if (activeDotCount === requiredValence) {
      setLewisFeedback({
        status: 'correct',
        msg: `Spectacular! 🌟 ${lewisElement.name} requires ${requiredValence} valence shell dots in its outer electron shell. Your Lewis structure glows green!`
      });
    } else {
      setLewisFeedback({
        status: 'incorrect',
        msg: `Keep trying. ${lewisElement.name} belongs to Group valence constraints and requires exactly ${requiredValence} dots. (You placed ${activeDotCount})`
      });
    }
  };

  const resetLewisGame = () => {
    setLewisDots([false, false, false, false, false, false, false, false]);
    setLewisFeedback({ status: 'idle', msg: '' });
  };

  return (
    <div className="space-y-6" id="bonding-sim-component">
      {/* HUD Header card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: Selectors */}
        <div className="bg-slate-900 border border-violet-950/45 p-4 rounded-xl flex flex-col justify-between" id="bonding-selectors">
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase text-teal-400">Select combining elements:</h3>
            
            {/* Atom 1 Selection */}
            <div>
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">Atom A (Left):</label>
              <select
                value={atom1.symbol}
                onChange={(e) => {
                  const el = ELEMENT_BOND_POOL.find(item => item.symbol === e.target.value);
                  if (el) setAtom1(el);
                }}
                className="w-full bg-slate-950 border border-violet-950/40 text-xs text-white p-2 rounded-lg focus:outline-none focus:border-violet-500 font-mono"
                id="atom-1-select"
              >
                {ELEMENT_BOND_POOL.map(el => (
                  <option key={el.symbol} value={el.symbol}>{el.name} ({el.symbol})</option>
                ))}
              </select>
              <p className="text-[10px] font-mono text-zinc-400 mt-1">Electronegativity: <span className="text-violet-400 font-semibold">{atom1.electronegativity}</span></p>
            </div>

            {/* Atom 2 Selection */}
            <div>
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">Atom B (Right):</label>
              <select
                value={atom2.symbol}
                onChange={(e) => {
                  const el = ELEMENT_BOND_POOL.find(item => item.symbol === e.target.value);
                  if (el) setAtom2(el);
                }}
                className="w-full bg-slate-950 border border-violet-950/40 text-xs text-white p-2 rounded-lg focus:outline-none focus:border-violet-500 font-mono"
                id="atom-2-select"
              >
                {ELEMENT_BOND_POOL.map(el => (
                  <option key={el.symbol} value={el.symbol}>{el.name} ({el.symbol})</option>
                ))}
              </select>
              <p className="text-[10px] font-mono text-zinc-400 mt-1">Electronegativity: <span className="text-violet-400 font-semibold">{atom2.electronegativity}</span></p>
            </div>
          </div>

          <div className="border-t border-violet-950/30 pt-3 mt-4 bg-violet-600/5 p-2 rounded-lg border">
            <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider block">Electronegativity Difference:</span>
            <div className="text-lg font-bold font-mono text-teal-400 mt-0.5" id="en-difference-hud">{eleDiff.toFixed(2)}</div>
            <p className="text-[10px] font-sans text-zinc-400 leading-normal mt-1">
              If difference <span className="text-white">≥ 1.7</span>: Bond is Ionic.<br />
              If difference <span className="text-white">0.4 - 1.7</span>: Polar Covalent.<br />
              If value <span className="text-white">&lt; 0.4</span>: Nonpolar Covalent.
            </p>
          </div>
        </div>

        {/* Middle and Right: Bond Visualizer Display */}
        <div className="bg-slate-900 border border-violet-950/45 p-4 rounded-xl md:col-span-2 flex flex-col items-center justify-between min-h-[300px]" id="bonding-visuals">
          <div className="w-full text-center pb-2 border-b border-violet-950/20">
            <span className="text-[10px] font-mono uppercase text-teal-400 tracking-widest block">BONDING CHAMBER APPARATUS</span>
            <div className="text-sm font-bold font-mono text-white mt-0.5" id="chamber-header">{atom1.symbol} + {atom2.symbol} Combined state</div>
          </div>

          {/* Interactive animated bond representations using React inline SVGs */}
          <div className="w-full relative h-[160px] flex items-center justify-center bg-slate-950/40 rounded-xl my-3 border border-violet-950/15 overflow-hidden">
            {bondType === 'Ionic' && (
              <svg className="w-full h-full" viewBox="0 0 300 120">
                {/* Positively charged metal atom */}
                <circle cx="90" cy="60" r="28" className="stroke-red-500 fill-none" strokeWidth="2" />
                <circle cx="90" cy="60" r="18" className="fill-red-500/20 stroke-none" />
                <text x="90" y="64" className="fill-white font-mono text-xs font-bold" textAnchor="middle">{atom1.symbol}⁺</text>
                <text x="90" y="24" className="fill-red-400 font-mono text-[9px]" textAnchor="middle">Metal (Cation)</text>

                {/* Negatively charged non-metal atom */}
                <circle cx="210" cy="60" r="34" className="stroke-teal-400 fill-none" strokeWidth="2" />
                <circle cx="210" cy="60" r="24" className="fill-teal-400/20 stroke-none" />
                <text x="210" y="64" className="fill-white font-mono text-xs font-bold" textAnchor="middle">{atom2.symbol}⁻</text>
                <text x="210" y="24" className="fill-teal-400 font-mono text-[9px]" textAnchor="middle">Nonmetal (Anion)</text>

                {/* Electrostatic attraction wave lines */}
                <path d="M125 55 Q150 45 175 55" className="stroke-amber-400 fill-none" strokeDasharray="3,3" />
                <path d="M125 65 Q150 75 175 65" className="stroke-amber-400 fill-none" strokeDasharray="3,3" />

                {/* Transferred electron dot animation */}
                <g className="animate-pulse">
                  <circle cx="178" cy="60" r="3" className="fill-yellow-400 stroke-none" />
                  <text x="178" y="72" className="fill-yellow-400 font-mono text-[8px] font-bold" textAnchor="middle">e⁻</text>
                </g>
              </svg>
            )}

            {bondType === 'Polar Covalent' && (
              <svg className="w-full h-full" viewBox="0 0 300 120">
                {/* Overlapped shared electron cloud outline */}
                <path d="M 68 60 A 30 30 0 1 1 232 60 A 30 30 0 1 1 68 60 Z" className="stroke-violet-800 fill-none stroke-1" />
                <path d="M 120 60 Q 150 40 180 60 Q 150 80 120 60" className="fill-violet-500/10 stroke-none" />

                {/* Atom spheres slightly overlapping */}
                <circle cx="110" cy="60" r="24" className="stroke-zinc-500 fill-slate-900" strokeWidth="1.5" />
                <text x="110" y="63" className="fill-white font-mono text-xs font-bold" textAnchor="middle">{atom1.symbol}</text>
                <text x="110" y="28" className="fill-zinc-400 font-mono text-[9px]" textAnchor="middle">𝛿⁺</text>

                <circle cx="190" cy="60" r="28" className="stroke-teal-400 fill-slate-900" strokeWidth="1.5" />
                <text x="190" y="63" className="fill-white font-mono text-xs font-bold" textAnchor="middle">{atom2.symbol}</text>
                <text x="190" y="28" className="fill-teal-400 font-mono text-[9px]" textAnchor="middle">𝛿⁻</text>

                {/* Shared electron pair rotating within oval sharing margin */}
                <g className="animate-spin" style={{ transformOrigin: '150px 60px', animationDuration: '4s' }}>
                  <circle cx="150" cy="46" r="2.5" className="fill-yellow-400" />
                  <circle cx="150" cy="74" r="2.5" className="fill-yellow-400" />
                </g>
              </svg>
            )}

            {bondType === 'Nonpolar Covalent' && (
              <svg className="w-full h-full" viewBox="0 0 300 120">
                {/* Atom spheres overlapping symmetry */}
                <path d="M 110 60 Q 150 35 190 60 Q 150 85 110 60" className="fill-teal-500/10 stroke-none" />

                <circle cx="115" cy="60" r="24" className="stroke-teal-400 fill-slate-900" strokeWidth="1.5" />
                <text x="115" y="63" className="fill-white font-mono text-xs font-bold" textAnchor="middle">{atom1.symbol}</text>

                <circle cx="185" cy="60" r="24" className="stroke-teal-400 fill-slate-900" strokeWidth="1.5" />
                <text x="185" y="63" className="fill-white font-mono text-xs font-bold" textAnchor="middle">{atom2.symbol}</text>

                {/* Symmetrical shared electrons */}
                <g className="animate-spin" style={{ transformOrigin: '150px 60px', animationDuration: '6s' }}>
                  <circle cx="150" cy="50" r="2.5" className="fill-yellow-300" />
                  <circle cx="150" cy="70" r="2.5" className="fill-yellow-300" />
                </g>
              </svg>
            )}

            {bondType === 'Metallic' && (
              <svg className="w-full h-full" viewBox="0 0 300 120">
                {/* 2D crystal grid representing solid lattice with swimming electron bubbles */}
                <g className="stroke-violet-850" strokeWidth="1">
                  <line x1="50" y1="30" x2="250" y2="30" />
                  <line x1="50" y1="90" x2="250" y2="90" />
                  <line x1="100" y1="30" x2="100" y2="90" />
                  <line x1="200" y1="30" x2="200" y2="90" />
                </g>

                {/* Cations */}
                {[50, 100, 150, 200, 250].map((x) => (
                  <g key={x}>
                    <circle cx={x} cy="30" r="10" className="fill-slate-800 stroke-violet-500" />
                    <text x={x} y="33" className="fill-zinc-300 font-mono text-[8px] font-bold" textAnchor="middle">Na⁺</text>

                    <circle cx={x} cy="90" r="10" className="fill-slate-800 stroke-violet-500" />
                    <text x={x} y="93" className="fill-zinc-300 font-mono text-[8px] font-bold" textAnchor="middle">Na⁺</text>
                  </g>
                ))}

                {/* Free electron particles buzzing */}
                <circle cx="75" cy="45" r="2" className="fill-teal-300 animate-ping" />
                <circle cx="125" cy="75" r="2" className="fill-teal-300 animate-pulse" />
                <circle cx="175" cy="45" r="2" className="fill-teal-300 animate-ping" />
                <circle cx="225" cy="75" r="2" className="fill-teal-300 animate-pulse" />
                
                <text x="150" y="15" className="fill-teal-400 font-mono text-[9px] font-bold animate-pulse text-center" textAnchor="middle">
                  Mobility Delocalized Electron Sea
                </text>
              </svg>
            )}
          </div>

          <div className="w-full bg-slate-950 border border-violet-950/30 p-3 rounded-lg text-xs">
            <div className="flex gap-1.5 items-center">
              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="font-mono text-zinc-100 font-bold">Bond Verdict: <span className="text-teal-400">{bondType}</span></span>
            </div>
            <p className="text-zinc-400 mt-1.5 font-sans leading-relaxed select-text">{bondDesc}</p>
          </div>
        </div>
      </div>

      {/* SECTION 2: Drag and Drop Lewis Dot Builder Game */}
      <div className="bg-slate-900 border border-violet-950/45 p-4 rounded-xl" id="lewis-dot-builder">
        <div className="border-b border-violet-950/20 pb-2 mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase text-teal-400">Lewis Dot Structure Architect</h3>
            <p className="text-[10px] text-zinc-500 leading-normal font-sans">
              Match the valence requirements of Group elements by placing outer shell electron dot nodes.
            </p>
          </div>
          <div className="flex bg-slate-950 p-1 rounded-lg border border-violet-950/40" id="lewis-target-picker">
            {ELEMENT_BOND_POOL.map((el) => (
              <button
                key={el.symbol}
                onClick={() => {
                  setLewisElement(el);
                  resetLewisGame();
                }}
                className={`px-2 py-1 text-[10px] font-mono rounded transition-all ${
                  lewisElement.symbol === el.symbol ? 'bg-violet-600 text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                id={`lewis-el-${el.symbol}`}
              >
                {el.symbol}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          
          {/* Active Lewis Board */}
          <div className="flex flex-col items-center">
            
            {/* Structural Builder Canvas panel */}
            <div className="relative w-44 h-44 border border-violet-950/30 rounded-2xl bg-slate-950/40 flex items-center justify-center">
              {/* Central Nucleus Node */}
              <div className={`w-14 h-14 rounded-full border flex items-center justify-center font-mono text-base font-bold transition-all duration-300 ${
                lewisFeedback.status === 'correct' ? 'border-teal-500 bg-teal-500/10 text-teal-400 shadow-[0_0_20px_rgba(0,229,204,0.3)]' : 'border-slate-800 bg-slate-900 text-zinc-200'
              }`} id="lewis-central-node">
                {lewisElement.symbol}
              </div>

              {/* 8 surrounding clickable electron dot positions */}
              {/* Positions organized: Top-left, Top-right, Right-top, Right-bottom, Bottom-right, Bottom-left, Left-bottom, Left-top */}
              {[
                { top: '15px', left: '50px' }, // Top left
                { top: '15px', left: '105px' }, // Top right
                { top: '50px', left: '140px' }, // Right top
                { top: '105px', left: '140px' }, // Right bottom
                { top: '140px', left: '105px' }, // Bottom right
                { top: '140px', left: '50px' }, // Bottom left
                { top: '105px', left: '15px' }, // Left bottom
                { top: '50px', left: '15px' }  // Left top
              ].map((pos, idx) => {
                const isActive = lewisDots[idx];
                return (
                  <button
                    key={idx}
                    onClick={() => toggleDot(idx)}
                    className={`absolute w-3.5 h-3.5 rounded-full border transition-all duration-200 ${
                      isActive
                        ? 'bg-amber-400 border-amber-300 shadow-[0_0_8px_rgba(255,170,0,0.6)]'
                        : 'bg-slate-900 border-violet-950/30 hover:border-amber-400/50'
                    }`}
                    style={{ top: pos.top, left: pos.left }}
                    id={`dot-trigger-${idx}`}
                    title="Toggle Valence Electron Dot"
                  />
                );
              })}
            </div>

            <p className="text-[10px] font-mono text-zinc-500 mt-2">Click surrounding coordinate dots to add/remove outer electrons.</p>
          </div>

          {/* Guidelines and verdict panel */}
          <div className="space-y-4">
            <div className="bg-slate-950/50 p-3 rounded-lg border border-violet-950/15">
              <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Architect Objectives:</span>
              <ul className="text-[11px] text-zinc-400 space-y-1 font-sans list-disc pl-4 leading-relaxed">
                <li>Active Element: <span className="text-white font-mono">{lewisElement.name} ({lewisElement.symbol})</span></li>
                <li>Group Valence Criteria: <span className="text-teal-400 font-mono font-bold">{lewisElement.valence} electrons</span></li>
                <li>Current layout: <span className="text-amber-400 font-mono font-bold">{lewisDots.filter(Boolean).length} placed</span></li>
              </ul>
            </div>

            {/* Verification Hud */}
            {lewisFeedback.status !== 'idle' && (
              <div className={`p-3 rounded-xl border flex items-start gap-2 ${
                lewisFeedback.status === 'correct' ? 'border-teal-500/30 bg-teal-500/5 text-teal-400' : 'border-red-500/30 bg-red-500/5 text-red-400'
              }`}>
                {lewisFeedback.status === 'correct' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <HelpCircle className="w-5 h-5 shrink-0" />}
                <p className="text-[11px] font-sans leading-relaxed italic">{lewisFeedback.msg}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={checkLewisStructure}
                className="flex-1 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-mono font-bold tracking-wider text-xs uppercase shadow transition"
                id="check-lewis-btn"
              >
                Validate Dot Count
              </button>
              <button
                onClick={resetLewisGame}
                className="px-3 py-2 rounded-lg border border-violet-850 hover:bg-slate-950 text-zinc-400 hover:text-white font-mono text-xs transition"
                id="clear-lewis-btn"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
