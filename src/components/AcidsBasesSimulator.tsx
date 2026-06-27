import React, { useState, useEffect } from 'react';
import { HelpCircle, Check, Play, Square, Award, RefreshCw } from 'lucide-react';

interface Substance {
  name: string;
  ph: number;
  color: string;
  desc: string;
  emoji: string;
}

const SUBSTANCES: Substance[] = [
  { name: 'Stomach Acid', ph: 1.5, color: '#f87171', desc: 'Highly acidic digestive fluid composed mainly of Hydrochloric Acid (HCl).', emoji: '🤢' },
  { name: 'Lemon Juice', ph: 2.2, color: '#facc15', desc: 'Acidic citrus juice rich in Citric Acid.', emoji: '🍋' },
  { name: 'Black Coffee', ph: 5.0, color: '#b45309', desc: 'Mildly acidic beverage containing caffeic and chloregenic compounds.', emoji: '☕' },
  { name: 'Pure Water', ph: 7.0, color: '#38bdf8', desc: 'Perfectly neutral balance where hydronium equals hydroxide ions.', emoji: '💧' },
  { name: 'Human Blood', ph: 7.4, color: '#ef4444', desc: 'Slightly alkaline biological buffer strictly controlled by kidneys.', emoji: '🩸' },
  { name: 'Household Soap', ph: 10.0, color: '#818cf8', desc: 'Alkaline lipid surfactant that binds oils to clean dirt surfaces.', emoji: '🧼' },
  { name: 'Bleach Cleanser', ph: 12.5, color: '#c084fc', desc: 'Extremely strong basic oxidation solution of Sodium Hypochlorite.', emoji: '🧴' }
];

export default function AcidsBasesSimulator() {
  const [selectedSubstance, setSelectedSubstance] = useState<Substance | null>(null);
  const [placedSubstances, setPlacedSubstances] = useState<Substance[]>([]);
  const [hintMsg, setHintMsg] = useState<string>('Select substances below to snap them onto the pH scale explorer!');

  // Titration states
  const [isTitrating, setIsTitrating] = useState<boolean>(false);
  const [acidVolume, setAcidVolume] = useState<number>(0); // ml added (0 to 50 ml)
  const [beakerPH, setBeakerPH] = useState<number>(12.0); // starts strongly basic (pH 12 NaOH)
  const [titrationStatus, setTitrationStatus] = useState<'idle' | 'running' | 'success' | 'overshot'>('idle');
  const [stopPressed, setStopPressed] = useState<boolean>(false);
  const [titrationPoints, setTitrationPoints] = useState<{ vol: number; ph: number }[]>([]);

  // Snap substance onto scale
  const handleSnapSubstance = (sub: Substance) => {
    setSelectedSubstance(sub);
    if (!placedSubstances.find((item) => item.name === sub.name)) {
      setPlacedSubstances((prev) => [...prev, sub]);
    }
    setHintMsg(`Excellent! Snapped ${sub.name} directly onto its pH marker value of ${sub.ph}!`);
  };

  // Titration ticker loop simulation
  useEffect(() => {
    if (!isTitrating || stopPressed) return;

    const interval = setInterval(() => {
      setAcidVolume((prevVol) => {
        const nextVol = prevVol + 0.35; // incremental drops added
        
        // Calculate non-linear titration curve pH drop
        // Strong base - strong acid curve model
        let nextPH = 12.0;

        if (nextVol < 22) {
          // Slow buffering drop
          nextPH = 12.0 - (nextVol / 22) * 1.5;
        } else if (nextVol >= 22 && nextVol <= 26) {
          // Sharp equivalence threshold drop
          const t = (nextVol - 22) / 4; // 0 to 1
          nextPH = 10.5 - t * 7.5; // plunges from 10.5 down to 3.0!
        } else {
          // Acid plateau range
          const t = (nextVol - 26) / 24;
          nextPH = 3.0 - t * 1.5;
        }

        // Clamp pH floor
        nextPH = Math.max(nextPH, 1.5);

        // Track graph plotted coordinate points
        setTitrationPoints((prevPts) => [...prevPts, { vol: nextVol, ph: nextPH }]);
        setBeakerPH(nextPH);

        if (nextVol >= 50) {
          setIsTitrating(false);
          setTitrationStatus('overshot');
          return 50;
        }

        return nextVol;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [isTitrating, stopPressed]);

  // Stopping addition checks
  const handleStopTitrating = () => {
    setStopPressed(true);
    setIsTitrating(false);

    // Score evaluation
    // Ideal equivalence point (neutral, turning point occurs around pH 7.0 / Volume 24ml)
    if (beakerPH >= 6.2 && beakerPH <= 7.8) {
      setTitrationStatus('success');
      
      // award equivalence badge completion
      const storageKey = 'chemlab_badges';
      try {
        const bdgs = JSON.parse(localStorage.getItem(storageKey) || '[]');
        if (!bdgs.includes('badge_m5')) {
          bdgs.push('badge_m5');
          localStorage.setItem(storageKey, JSON.stringify(bdgs));
        }
      } catch (e) {}
    } else {
      setTitrationStatus('overshot');
    }
  };

  const handleResetTitration = () => {
    setAcidVolume(0);
    setBeakerPH(12.0);
    setIsTitrating(false);
    setStopPressed(false);
    setTitrationStatus('idle');
    setTitrationPoints([]);
  };

  const getPhenolphthaleinColor = (ph: number) => {
    if (ph >= 10) return 'rgba(236, 72, 153, 0.7)'; // Deep hot pink base state
    if (ph > 8.2 && ph < 10) {
      const ratio = (ph - 8.2) / 1.8;
      return `rgba(236, 72, 153, ${0.1 + ratio * 0.6})`; // Staging light blush
    }
    return 'rgba(240, 244, 255, 0.15)'; // Completely clear / light white acid phase
  };

  return (
    <div className="space-y-6" id="acids-bases-component">
      
      {/* Interactive Drag/Click Snap pH Scale Explorer (0-14) */}
      <div className="bg-slate-900 border border-violet-950/45 p-4 rounded-xl" id="ph-scale-explorer">
        <div>
          <span className="text-[10px] font-mono uppercase text-teal-400 tracking-wider">Acids and Alkalis Spectrum Scale</span>
          <h3 className="text-sm font-bold font-mono text-white mt-0.5">Substance pH Snap Board</h3>
        </div>

        {/* The 0-14 interactive bar */}
        <div className="relative w-full h-10 rounded-lg overflow-hidden flex my-4 border border-violet-950/20 shadow-lg" id="ph-spectrum-bar">
          {Array.from({ length: 15 }).map((_, phVal) => {
            // Spectrum shifts red -> yellow -> green -> blue -> purple
            let bgClr = '#38bdf8';
            if (phVal < 3) bgClr = '#ef4444'; // strong acid
            else if (phVal < 6) bgClr = '#facc15'; // weak acid
            else if (phVal === 7) bgClr = '#10b981'; // neutral equilibrium
            else if (phVal < 11) bgClr = '#6366f1'; // weak base
            else bgClr = '#a855f7'; // strong base

            return (
              <div
                key={phVal}
                className="flex-1 h-full flex flex-col justify-between items-center py-1.5 cursor-pointer hover:opacity-90 relative"
                style={{ backgroundColor: bgClr }}
              >
                {/* Tick markers */}
                <span className="text-[10px] font-mono text-slate-950 font-extrabold select-none">{phVal}</span>
                <span className="w-px h-1.5 bg-slate-950/40 block" />

                {/* Sub snapped indicator icons */}
                {placedSubstances.map((ps) => {
                  if (Math.round(ps.ph) === phVal) {
                    return (
                      <span
                        key={ps.name}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSubstance(ps);
                        }}
                        className="absolute bottom-1 w-3 h-3 text-[8px] flex items-center justify-center animate-bounce shadow"
                        title={ps.name}
                      >
                        {ps.emoji}
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
            );
          })}
        </div>

        {/* Substances Selector grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2" id="substances-pool">
          {SUBSTANCES.map((sub) => {
            const isSnapped = placedSubstances.find((p) => p.name === sub.name) !== undefined;
            return (
              <button
                key={sub.name}
                onClick={() => handleSnapSubstance(sub)}
                className={`py-2 px-1 rounded-lg border font-mono text-[10px] font-bold text-center flex flex-col items-center justify-center gap-1 transition-all ${
                  isSnapped
                    ? 'border-teal-500/50 bg-teal-500/10 text-teal-400'
                    : 'border-violet-950/25 bg-slate-950/40 text-zinc-400 hover:border-violet-750'
                }`}
                id={`substance-snap-btn-${sub.name.replace(' ', '-')}`}
              >
                <span className="text-sm select-none">{sub.emoji}</span>
                <span>{sub.name}</span>
                <span className="text-[9px] text-zinc-500 font-normal">pH {sub.ph}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Substance detail readout */}
        <div className="bg-slate-950 border border-violet-950/30 p-3.5 rounded-xl mt-4 min-h-[60px]" id="selected-detail-card">
          {selectedSubstance ? (
            <div className="flex gap-3">
              <span className="text-xl select-none mt-0.5">{selectedSubstance.emoji}</span>
              <div>
                <div className="flex justify-between items-center bg-slate-900 border border-violet-950/20 px-3 py-1 rounded">
                  <span className="font-mono text-xs text-white font-bold">{selectedSubstance.name}</span>
                  <span className="font-mono text-xs font-extrabold" style={{ color: selectedSubstance.color }}>pH {selectedSubstance.ph}</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans select-text mt-2">{selectedSubstance.desc}</p>
              </div>
            </div>
          ) : (
            <p className="text-xs font-mono text-zinc-500 italic select-text p-1 text-center">{hintMsg}</p>
          )}
        </div>
      </div>

      {/* Titration Simulator laboratory */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="titration-apparatus">
        
        {/* Burette & Beaker visual rendering in column 1 */}
        <div className="bg-slate-900 border border-violet-950/45 p-4 rounded-xl flex flex-col items-center justify-around min-h-[350px]" id="lab-fluidics">
          <div className="w-full text-center border-b border-violet-950/20 pb-2">
            <span className="text-[9px] font-mono text-teal-400 uppercase tracking-wider block">Fluidics Viewport</span>
            <span className="text-xs font-bold font-mono text-white select-none">HCl ➔ NaOH Acid dripping</span>
          </div>

          {/* Inline SVG drawing Burette and dripping beaker */}
          <div className="relative w-full h-[220px] flex justify-center py-2">
            <svg className="w-36 h-full stroke-current text-zinc-700 fill-none" viewBox="0 0 100 200">
              {/* Burette Glass Column tube containing Acid */}
              <rect x="44" y="10" width="12" height="110" rx="2" className="stroke-zinc-800 fill-slate-950/30" />
              {/* Floating acidic column liquid inside tube (H2O HCl) */}
              <rect x="45" y={(10 + (acidVolume / 50) * 110)} width="10" height={(110 - (acidVolume / 50) * 110)} className="fill-sky-400/20 stroke-none" />
              {/* Burette volume tick marks */}
              {[20, 40, 60, 80, 100].map((y) => (
                <line key={y} x1="44" y1={y} x2="48" y2={y} strokeWidth="0.5" className="stroke-zinc-500" />
              ))}

              {/* Stopcock tap valve */}
              <rect x="41" y="120" width="18" height="6" rx="1" className="fill-zinc-600 stroke-none" />
              <line x1="50" y1="120" x2="50" y2="135" className="stroke-zinc-500" />

              {/* Falling dripping liquid animation */}
              {isTitrating && (
                <g className="animate-bounce">
                  <line x1="50" y1="135" x2="50" y2="155" strokeWidth="1" className="stroke-sky-400" />
                  <circle cx="50" cy="155" r="2.5" className="fill-sky-400 stroke-none" />
                </g>
              )}

              {/* Dripping endpoint Beaker base NaOH */}
              <path d="M 30 160 L 35 195 A 5 5 0 0 0 40 200 L 60 200 A 5 5 0 0 0 65 195 L 70 160 Z" className="stroke-zinc-500 fill-slate-900" strokeWidth="1.5" />
              {/* Reactive Indicator Beaker fluid changing color depending-on pH state */}
              <path
                d="M 32 175 L 35 195 A 3 3 0 0 0 38 198 L 62 198 A 3 3 0 0 0 65 195 L 68 175 Z"
                className="stroke-none transition-colors duration-200"
                style={{ fill: getPhenolphthaleinColor(beakerPH) }}
              />
            </svg>

            {/* Float HUD values over columns */}
            <div className="absolute top-4 left-2 text-[9px] font-mono text-zinc-500 bg-slate-950 p-2 border border-violet-950/20 rounded-md" id="burette-hud">
              <span className="text-sky-400 block uppercase font-bold">Acid (HCl) Added:</span>
              <span className="text-white text-xs font-bold">{acidVolume.toFixed(2)} ml</span>
            </div>

            <div className="absolute bottom-4 right-2 text-[9px] font-mono text-zinc-500 bg-slate-950 p-2 border border-violet-950/20 rounded-md" id="beaker-hud">
              <span className="text-pink-400 block uppercase font-bold">Beaker pH (NaOH):</span>
              <span className="text-xs font-semibold" style={{ color: beakerPH <= 7 ? '#10b981' : '#ec4899' }}>{beakerPH.toFixed(2)} pH</span>
            </div>
          </div>

          {/* Interactive Tap controls */}
          <div className="flex gap-2 w-full mt-2" id="pipette-tap-bar">
            {titrationStatus === 'idle' || titrationStatus === 'running' ? (
              <>
                <button
                  onClick={() => {
                    setIsTitrating(true);
                    setTitrationStatus('running');
                  }}
                  disabled={isTitrating}
                  className="flex-1 py-1.5 bg-violet-600 hover:bg-violet-500 text-white font-mono text-[10px] font-bold uppercase rounded-lg shadow-md disabled:opacity-40 transition flex items-center justify-center gap-1"
                  id="open-burette-btn"
                >
                  <Play className="w-3 h-3" /> Drip Tap Open
                </button>
                <button
                  onClick={handleStopTitrating}
                  disabled={!isTitrating}
                  className="flex-1 py-1.5 bg-red-600 hover:bg-red-500 text-white font-mono text-[10px] font-bold uppercase rounded-lg shadow-md disabled:opacity-40 transition flex items-center justify-center gap-1"
                  id="stop-burette-btn"
                >
                  <Square className="w-3 h-3" /> CHOKE Stop Tap
                </button>
              </>
            ) : (
              <button
                onClick={handleResetTitration}
                className="w-full py-1.5 border border-violet-950 rounded-lg text-xs font-mono hover:bg-slate-950 text-zinc-400 transition flex items-center justify-center gap-1.5"
                id="reset-titrate-btn"
              >
                <RefreshCw className="w-3 h-3" /> Re-titrate Acid/Base
              </button>
            )}
          </div>
        </div>

        {/* Real-time updating Titration curve graph */}
        <div className="bg-slate-900 border border-violet-950/45 p-4 rounded-xl md:col-span-2 flex flex-col justify-between" id="lab-graphs">
          <div>
            <span className="text-[10px] font-mono text-teal-400 uppercase tracking-wider block">REALTIME PH TITRATION PLOT GRID</span>
            <div className="text-xs font-sans text-zinc-400 leading-normal mb-3">Eq bounds: Stop titration at equivalence point (approx pH 7.0) to pass the lab experiment successfully.</div>

            {/* SVG Titration Curve plot */}
            <div className="relative w-full h-44 bg-slate-950 border border-violet-950/30 rounded-xl p-2 flex flex-col justify-between overflow-hidden">
              <svg className="w-full h-[140px] absolute inset-0 p-4" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Graph grid lines */}
                <line x1="0" y1="58.3" x2="100" y2="58.3" stroke="rgba(124, 58, 237, 0.08)" strokeWidth="0.5" /> {/* neutrality pH 7 */}

                {/* Plotting points */}
                <path
                  d={`M 0,0 ${titrationPoints.map((pt) => {
                    const xPerc = (pt.vol / 50) * 100;
                    // Map pH 14 down to 0 onto 0 to 100 percent coordinate space
                    const yPerc = 100 - (pt.ph / 12) * 100;
                    return `L ${xPerc},${yPerc}`;
                  }).join(' ')}`}
                  className="stroke-teal-400 fill-none transition-all duration-100"
                  strokeWidth="1.5"
                />

                {/* Draw active position projection dots */}
                {acidVolume > 0 && (
                  <circle
                    cx={(acidVolume / 50) * 100}
                    cy={100 - (beakerPH / 12) * 100}
                    r="3"
                    className="fill-pink-500 stroke-none"
                  />
                )}
              </svg>
              {/* Axis markers */}
              <div className="absolute top-2 left-2 text-[8px] font-mono text-zinc-600 block">pH 12 (Base NaOH)</div>
              <div className="absolute bottom-6 left-2 text-[8px] font-mono text-zinc-600 block">pH 2 (Acidic Plateau HCl)</div>
              <div className="absolute right-2 bottom-5 text-[8px] font-mono text-zinc-600 block">50 ml added</div>

              <div className="w-full h-px bg-violet-950" />
              <div className="flex justify-between w-full font-mono text-[8px] text-zinc-500 relative z-10 p-1">
                <span>0 ml (Start)</span>
                <span className="text-teal-500 font-bold">Equivalence Point (pH 7)</span>
                <span>50 ml HCl</span>
              </div>
            </div>
          </div>

          {/* Titration results diagnostics and explanations */}
          <div className="mt-4" id="titration-verdict-hud">
            {titrationStatus === 'success' && (
              <div className="p-3 rounded-lg border border-teal-500/30 bg-teal-500/5 text-teal-400 flex items-start gap-2 text-[11px]" id="titration-success-card">
                <Award className="w-5 h-5 shrink-0" />
                <p>
                  <strong>Perfect Eq Stop! 🏆</strong> You deactivated the stop valve at <strong>pH {beakerPH.toFixed(2)}</strong>! The phenolphthalein indicator blushes light neutral pink clear! (+100 XP titration pioneer unlocks!)
                </p>
              </div>
            )}

            {titrationStatus === 'overshot' && (
              <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/5 text-red-400 flex items-start gap-2 text-[11px]" id="titration-error-card">
                <Square className="w-5 h-5 shrink-0" />
                <p>
                  <strong>Unsuccessful titration buffers.</strong> Beaker overshot past equivalence points down into strong acidic ranges (<strong>pH {beakerPH.toFixed(2)}</strong>). HCl acid overpowers base completely. Reset and try again!
                </p>
              </div>
            )}

            {titrationStatus === 'running' && (
              <div className="p-3 rounded-lg border border-violet-950 bg-slate-950/20 text-indigo-300 flex items-center gap-2 text-[10px] animate-pulse" id="titrating-active">
                <span>🧪 Titrometer: Adding HCl acid dropwise into basic beaker NaOH... Watch curve drop in real-time.</span>
              </div>
            )}
            
            {titrationStatus === 'idle' && (
              <p className="text-[10px] font-mono text-zinc-500 text-center">Open tap slider above to begin dripping chemical assay reactants.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
