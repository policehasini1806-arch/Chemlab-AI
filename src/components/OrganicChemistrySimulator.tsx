import React, { useState, useEffect } from 'react';
import ThreeMoleculeViewer from './ThreeMoleculeViewer';
import { Alkane } from '../data/chemistryData';
import { ALKANE_SERIES } from '../data/chemistryData';
import { CheckCircle, AlertCircle, Award, Sparkles } from 'lucide-react';

interface FunctionalGroupExercise {
  compoundName: string;
  chemicalFormula: string;
  functionalGroup: 'Hydroxyl' | 'Carboxyl' | 'Amino' | 'Carbonyl';
  description: string;
  realWorldUse: string;
  illustrationType: 'ethanol' | 'acetic_acid' | 'methylamine' | 'acetone';
}

const FG_EXERCISES: FunctionalGroupExercise[] = [
  {
    compoundName: 'Ethanol (Alcohol)',
    chemicalFormula: 'CH₃CH₂OH',
    functionalGroup: 'Hydroxyl',
    description: 'Characterized by the polar -OH group bound to a carbon chain.',
    realWorldUse: 'Used globally as an organic solvent, bio-fuel additive, and disinfectant anti-bacterial agent.',
    illustrationType: 'ethanol'
  },
  {
    compoundName: 'Acetic Acid (Vinegar)',
    chemicalFormula: 'CH₃COOH',
    functionalGroup: 'Carboxyl',
    description: 'Consists of a carbonyl and hydroxyl group bound to the same carbon node (-COOH).',
    realWorldUse: 'Main component of table vinegar; key building block in vinyl acetate plastic synthesis.',
    illustrationType: 'acetic_acid'
  },
  {
    compoundName: 'Methylamine (Aliphatic Amine)',
    chemicalFormula: 'CH₃NH₂',
    functionalGroup: 'Amino',
    description: 'Features a nitrogen node with a lone pair bound to hydrogen atoms (-NH₂).',
    realWorldUse: 'Crucial starting material for rubber manufacture, photographic developers, and pharmaceuticals.',
    illustrationType: 'methylamine'
  },
  {
    compoundName: 'Acetone (Nail polish remover)',
    chemicalFormula: 'CH₃COCH₃',
    functionalGroup: 'Carbonyl',
    description: 'Has a double-bonded oxygen atom linking directly to a secondary carbon node (C=O).',
    realWorldUse: 'Strong volatile organic solvent used in paint thinners, cosmetics, and plastics dissolving.',
    illustrationType: 'acetone'
  }
];

export default function OrganicChemistrySimulator() {
  // Homologous Series States
  const [selectedAlkane, setSelectedAlkane] = useState<Alkane>(ALKANE_SERIES[0]); // Methane

  // Functional Group Game States
  const [fgIdx, setFgIdx] = useState<number>(0);
  const activeFg = FG_EXERCISES[fgIdx];
  const [selectedGroup, setSelectedGroup] = useState<'Hydroxyl' | 'Carboxyl' | 'Amino' | 'Carbonyl' | null>(null);
  const [fgFeedback, setFgFeedback] = useState<{ status: 'idle' | 'correct' | 'incorrect'; msg: string }>({ status: 'idle', msg: '' });

  // Reset feedback on changing compounds
  const handleNextFgGame = () => {
    const nextIdx = (fgIdx + 1) % FG_EXERCISES.length;
    setFgIdx(nextIdx);
    setSelectedGroup(null);
    setFgFeedback({ status: 'idle', msg: '' });
  };

  const checkFunctionalGroup = (group: 'Hydroxyl' | 'Carboxyl' | 'Amino' | 'Carbonyl') => {
    setSelectedGroup(group);
    if (group === activeFg.functionalGroup) {
      setFgFeedback({
        status: 'correct',
        msg: `Spectacular! That is indeed the ${group} group. Notice its occurrence: ${activeFg.realWorldUse}`
      });

      // Award organic badge in localStorage
      const storageKey = 'chemlab_badges';
      try {
        const bdgs = JSON.parse(localStorage.getItem(storageKey) || '[]');
        if (!bdgs.includes('badge_m6')) {
          bdgs.push('badge_m6');
          localStorage.setItem(storageKey, JSON.stringify(bdgs));
        }
      } catch (e) {}
    } else {
      setFgFeedback({
        status: 'incorrect',
        msg: `Not quite. Examine the molecular illustration closely. Look for nitrogen, double-bonded oxygens, or hydroxyl terminals.`
      });
    }
  };

  // Render SVG diagrams with highlighted groups
  const renderFormulaIllustration = (type: 'ethanol' | 'acetic_acid' | 'methylamine' | 'acetone') => {
    if (type === 'ethanol') {
      return (
        <svg className="w-full h-36 border border-violet-950/20 bg-slate-950/50 rounded-lg p-2 text-zinc-400 fill-none stroke-current" viewBox="0 0 200 90">
          {/* Ethanol Formula: H3C - CH2 - OH */}
          <g strokeWidth="1.5">
            {/* Hydrogens left */}
            <text x="15" y="47" className="fill-zinc-500 font-mono text-[9px] stroke-none">H</text>
            <line x1="23" y1="44" x2="33" y2="44" />
            
            {/* Carbon 1 */}
            <text x="36" y="48" className="fill-white font-mono text-[11px] font-bold stroke-none">C</text>
            <line x1="41" y1="36" x2="41" y2="24" />
            <text x="38" y="21" className="fill-zinc-500 font-mono text-[9px] stroke-none">H</text>
            <line x1="41" y1="52" x2="41" y2="64" />
            <text x="38" y="72" className="fill-zinc-500 font-mono text-[9px] stroke-none">H</text>

            {/* C-C Bond */}
            <line x1="48" y1="44" x2="68" y2="44" />

            {/* Carbon 2 */}
            <text x="71" y="48" className="fill-white font-mono text-[11px] font-bold stroke-none">C</text>
            <line x1="76" y1="36" x2="76" y2="24" />
            <text x="73" y="21" className="fill-zinc-500 font-mono text-[9px] stroke-none">H</text>
            <line x1="76" y1="52" x2="76" y2="64" />
            <text x="73" y="72" className="fill-zinc-500 font-mono text-[9px] stroke-none">H</text>

            {/* C-O Bond */}
            <line x1="83" y1="44" x2="103" y2="44" />

            {/* THE HYDROXYL FUNCTIONAL GROUP ZONE (Highlighted area on hover/select) */}
            <g className={`cursor-pointer transition-all ${selectedGroup === 'Hydroxyl' ? 'stroke-teal-400' : 'stroke-transparent hover:stroke-violet-500'}`}>
              <rect x="105" y="24" width="55" height="40" rx="4" strokeWidth="1" className="fill-teal-500/5" onClick={() => checkFunctionalGroup('Hydroxyl')} />
              <text x="110" y="48" className="fill-teal-400 font-mono text-[11px] font-bold stroke-none">O</text>
              <line x1="121" y1="44" x2="135" y2="44" />
              <text x="138" y="48" className="fill-teal-400 font-mono text-[11px] font-bold stroke-none">H</text>
              <text x="116" y="18" className="fill-teal-500/70 font-sans text-[8px] stroke-none" textAnchor="middle">Hydroxyl Zone</text>
            </g>
          </g>
        </svg>
      );
    }
    if (type === 'acetic_acid') {
      return (
        <svg className="w-full h-36 border border-violet-950/20 bg-slate-950/50 rounded-lg p-2 text-zinc-400 fill-none stroke-current" viewBox="0 0 200 90">
          <g strokeWidth="1.5">
            {/* Methyl Part H3C- */}
            <text x="15" y="47" className="fill-zinc-500 font-mono text-[9px] stroke-none">H</text>
            <line x1="23" y1="44" x2="33" y2="44" />
            <text x="36" y="48" className="fill-white font-mono text-[11px] font-bold stroke-none">C</text>
            <line x1="41" y1="36" x2="41" y2="24" />
            <text x="38" y="21" className="fill-zinc-500 font-mono text-[9px] stroke-none">H</text>
            <line x1="41" y1="52" x2="41" y2="64" />
            <text x="38" y="72" className="fill-zinc-500 font-mono text-[9px] stroke-none">H</text>

            <line x1="48" y1="44" x2="68" y2="44" />

            {/* Core Acid Carbon */}
            <text x="71" y="48" className="fill-white font-mono text-[11px] stroke-none">C</text>

            {/* Double bonded carbonyl O at top */}
            <line x1="74" y1="35" x2="88" y2="21" />
            <line x1="79" y1="35" x2="93" y2="21" />
            <text x="94" y="19" className="fill-pink-500 font-mono text-[11px] stroke-none">O</text>

            {/* THE CARBOXYL GROUP ZONE CONTAINER */}
            <g className={`cursor-pointer transition-all ${selectedGroup === 'Carboxyl' ? 'stroke-teal-400' : 'stroke-transparent hover:stroke-violet-500'}`}>
              <rect x="65" y="5" width="95" height="75" rx="4" strokeWidth="1" className="fill-pink-500/5" onClick={() => checkFunctionalGroup('Carboxyl')} />
              
              {/* Single bond to OH at bottom right */}
              <line x1="79" y1="52" x2="95" y2="65" />
              <text x="98" y="74" className="fill-pink-400 font-mono text-[11px] stroke-none">O</text>
              <line x1="110" y1="70" x2="124" y2="70" />
              <text x="127" y="74" className="fill-pink-400 font-mono text-[11px] stroke-none">H</text>
              <text x="135" y="40" className="fill-pink-500/70 font-sans text-[8px] stroke-none">Carboxyl Zone</text>
            </g>
          </g>
        </svg>
      );
    }
    if (type === 'methylamine') {
      return (
        <svg className="w-full h-36 border border-violet-950/20 bg-slate-950/50 rounded-lg p-2 text-zinc-400 fill-none stroke-current" viewBox="0 0 200 90">
          <g strokeWidth="1.5">
            {/* Hydrogens left bounding */}
            <text x="15" y="47" className="fill-zinc-500 font-mono text-[9px] stroke-none">H</text>
            <line x1="23" y1="44" x2="33" y2="44" />
            <text x="36" y="48" className="fill-white font-mono text-[11px] font-bold stroke-none">C</text>
            <line x1="41" y1="36" x2="41" y2="24" />
            <text x="38" y="21" className="fill-zinc-500 font-mono text-[9px] stroke-none">H</text>
            <line x1="41" y1="52" x2="41" y2="64" />
            <text x="38" y="72" className="fill-zinc-500 font-mono text-[9px] stroke-none">H</text>

            {/* C-N Bond */}
            <line x1="48" y1="44" x2="68" y2="44" />

            {/* THE AMINO SYSTEM ZONE */}
            <g className={`cursor-pointer transition-all ${selectedGroup === 'Amino' ? 'stroke-teal-400' : 'stroke-transparent hover:stroke-violet-500'}`}>
              <rect x="68" y="10" width="70" height="66" rx="4" strokeWidth="1" className="fill-blue-500/5" onClick={() => checkFunctionalGroup('Amino')} />
              <text x="73" y="48" className="fill-blue-400 font-mono text-[11px] font-bold stroke-none">N</text>
              
              {/* N-H Bond top-right */}
              <line x1="84" y1="38" x2="98" y2="24" />
              <text x="100" y="21" className="fill-blue-400 font-mono text-[9px] stroke-none">H</text>

              {/* N-H Bond bottom right */}
              <line x1="84" y1="52" x2="98" y2="65" />
              <text x="100" y="72" className="fill-blue-400 font-mono text-[9px] stroke-none">H</text>

              <text x="110" y="46" className="fill-blue-400/70 font-sans text-[8px] stroke-none">Amino Zone</text>
            </g>
          </g>
        </svg>
      );
    }
    if (type === 'acetone') {
      return (
        <svg className="w-full h-36 border border-violet-950/20 bg-slate-950/50 rounded-lg p-2 text-zinc-400 fill-none stroke-current" viewBox="0 0 200 90">
          <g strokeWidth="1.5">
            {/* Carbon 1 (left methyl) */}
            <text x="15" y="48" className="fill-zinc-400 font-mono text-[9px] stroke-none">H₃C</text>
            <line x1="38" y1="44" x2="58" y2="44" />

            {/* Central Carbon */}
            <text x="63" y="48" className="fill-white font-mono text-[12px] font-bold stroke-none">C</text>
            
            {/* Carbon 3 (right methyl) */}
            <line x1="75" y1="44" x2="95" y2="44" />
            <text x="98" y="48" className="fill-zinc-400 font-mono text-[9px] stroke-none">CH₃</text>

            {/* DOUBLE BOND CARBOXYL/CARBONYL ZONE (C=O) */}
            <g className={`cursor-pointer transition-all ${selectedGroup === 'Carbonyl' ? 'stroke-teal-400' : 'stroke-transparent hover:stroke-violet-500'}`}>
              <rect x="52" y="5" width="28" height="75" rx="4" strokeWidth="1" className="fill-amber-500/5" onClick={() => checkFunctionalGroup('Carbonyl')} />
              <line x1="64" y1="35" x2="64" y2="18" />
              <line x1="69" y1="35" x2="69" y2="18" />
              <text x="63" y="14" className="fill-amber-400 font-mono text-[12px] font-bold stroke-none">O</text>
              <text x="64" y="72" className="fill-amber-500/70 font-sans text-[7px] stroke-none" textAnchor="middle">Carbonyl</text>
            </g>
          </g>
        </svg>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6" id="organic-chem-dashboard">
      
      {/* Homologous Alkanes Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="organic-homologous">
        
        {/* Left selector menu bar */}
        <div className="bg-slate-900 border border-violet-950/45 p-4 rounded-xl flex flex-col justify-between" id="alkanes-menu">
          <div>
            <span className="text-[10px] font-mono uppercase text-teal-400 tracking-wider">Homologous Series</span>
            <h3 className="text-sm font-bold font-mono text-white mt-0.5 mb-1.5">Alkanes Explorer</h3>
            <p className="text-[11px] text-zinc-500 font-sans leading-relaxed mb-3">
              Observe how adding the <span className="text-white">-CH₂-</span> methylene link stretches the carbon spine programmatically.
            </p>

            <div className="flex flex-col gap-1 max-h-[175px] overflow-y-auto border-y border-violet-950/15 py-1.5" id="alkane-series-wheel">
              {ALKANE_SERIES.map((alk) => (
                <button
                  key={alk.name}
                  onClick={() => setSelectedAlkane(alk)}
                  className={`text-left px-3 py-1.5 rounded-lg border font-mono text-xs transition-all ${
                    selectedAlkane.name === alk.name
                      ? 'border-violet-500 bg-violet-600/10 text-white'
                      : 'border-violet-950/15 bg-slate-950/30 text-zinc-400 hover:border-violet-850'
                  }`}
                  id={`alk-btn-${alk.name.toLowerCase()}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold">{alk.name}</span>
                    <span className="text-[10px] text-teal-400 font-semibold">{alk.formula}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-950 border border-violet-950/20 p-3 rounded-lg text-xs mt-3 select-text leading-relaxed">
            <span className="text-[10px] font-mono text-zinc-500 block mb-1">State & Formula Details:</span>
            <span className="font-mono text-zinc-300">Saturated hydrocarbon bonds.<br />Form: <span className="text-teal-450 font-bold">C_n H_2n+2</span>.<br />Room temperature state: <span className="text-amber-400 font-bold">{selectedAlkane.carbons <= 4 ? 'Compressible Gas' : 'Volatile Liquid'}</span></span>
          </div>
        </div>

        {/* 3D Model Renderer Container */}
        <div className="bg-slate-900 border border-violet-950/45 p-4 rounded-xl md:col-span-2 flex flex-col justify-between" id="alkane-mesh-view">
          <div>
            <span className="text-[10px] font-mono uppercase text-teal-400 tracking-wider">ThreeJS Programmatic Covalent Mesh</span>
            <div className="text-sm font-bold font-mono text-white mt-0.5 mb-1">{selectedAlkane.name} 3D Structure: <span className="text-teal-400 font-bold">{selectedAlkane.formula}</span></div>
          </div>

          {/* Mount ThreeMoleculeViewer inside the canvas container */}
          <div className="my-2 select-none">
            <ThreeMoleculeViewer alkane={selectedAlkane} />
          </div>

          <p className="text-[10px] font-sans text-zinc-500 leading-normal">
            ⚙️ Real-time generated zig-zag carbon positions adhering to tetrahedral <strong>109.5° tetrahedral coordination bond coordinates</strong> dynamically calculated!
          </p>
        </div>
      </div>

      {/* Functional Group matches Identifier Game inside panel */}
      <div className="bg-slate-900 border border-violet-950/45 p-4 rounded-xl" id="functional-groups-game">
        <div className="border-b border-violet-950/20 pb-2 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase text-teal-400">Functional Group Identifier Lab</h3>
            <p className="text-[10px] text-zinc-500 leading-normal font-sans">
              Decipher structures by matching functional zones. Click active zones inside the illustration box.
            </p>
          </div>
          <div className="bg-slate-950 px-3.5 py-1 text-xs font-mono text-zinc-300 rounded border border-violet-950/40 select-text font-bold">
            Target Compound: <span className="text-teal-400">{activeFg.compoundName}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          
          {/* Active illustration SVG block */}
          <div className="space-y-2">
            {renderFormulaIllustration(activeFg.illustrationType)}
            <p className="text-[10px] text-zinc-500 font-mono text-center">💡 Click the highlighted reactive zone outlines directly inside the formula.</p>
          </div>

          {/* Multiple choice category select list */}
          <div className="space-y-4">
            <div className="bg-slate-950/70 p-3 rounded-lg border border-violet-950/15">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">Compound Formula:</span>
              <p className="font-mono text-xs text-white font-bold">{activeFg.chemicalFormula}</p>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans mt-2 select-text">{activeFg.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-2" id="fg-triggers">
              {(['Hydroxyl', 'Carboxyl', 'Amino', 'Carbonyl'] as const).map((group) => {
                const isSelected = selectedGroup === group;
                const isCorrect = group === activeFg.functionalGroup;
                
                let bCls = 'border-violet-950/30 bg-slate-950/40 text-zinc-400 hover:border-violet-850';
                if (selectedGroup !== null) {
                  if (isCorrect) bCls = 'border-teal-500 bg-teal-500/10 text-teal-400 font-bold';
                  else if (isSelected) bCls = 'border-red-500 bg-red-500/10 text-red-400';
                  else bCls = 'border-violet-950/10 opacity-30';
                }

                return (
                  <button
                    key={group}
                    onClick={() => checkFunctionalGroup(group)}
                    disabled={selectedGroup !== null}
                    className={`text-xs py-2.5 rounded-lg border font-mono tracking-wide transition ${bCls}`}
                    id={`fg-btn-${group.toLowerCase()}`}
                  >
                    {group}
                  </button>
                );
              })}
            </div>

            {/* Verdict text indicators feedback details */}
            {fgFeedback.status !== 'idle' && (
              <div className={`p-4 rounded-xl border flex items-start gap-2.5 transition-all text-xs italic ${
                fgFeedback.status === 'correct' ? 'border-teal-500/30 bg-teal-500/5 text-teal-400' : 'border-red-500/30 bg-red-500/5 text-red-400'
              }`} id="fg-feedback-display">
                {fgFeedback.status === 'correct' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                <div>
                  <p className="leading-relaxed select-text font-medium">{fgFeedback.msg}</p>
                </div>
              </div>
            )}

            {selectedGroup !== null && (
              <button
                onClick={handleNextFgGame}
                className="w-full mt-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-mono text-xs font-bold uppercase rounded-lg transition"
                id="organic-next-btn"
              >
                Assemble Next Compound
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
