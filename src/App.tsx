import React, { useState, useEffect } from 'react';
import { ElementData, ModuleId } from './types';
import { ELEMENTS_DATA } from './data/chemistryData';

// Import All Lab Modules
import PeriodicTable from './components/PeriodicTable';
import ThreeAtomViewer from './components/ThreeAtomViewer';
import BondingSimulator from './components/BondingSimulator';
import StatesSimulation from './components/StatesSimulation';
import ReactionsSimulator from './components/ReactionsSimulator';
import AcidsBasesSimulator from './components/AcidsBasesSimulator';
import OrganicChemistrySimulator from './components/OrganicChemistrySimulator';

// Import HUD & AI Panels
import ChatPanel from './components/ChatPanel';
import QuizPanel from './components/QuizPanel';
import DashboardPanel from './components/DashboardPanel';

import { Award, Layers, Zap, Flame, Compass, MessageSquare, BookOpen, Volume2, Shield, Sparkles, Clock, Sun, Moon } from 'lucide-react';

interface ModuleConfig {
  id: ModuleId;
  name: string;
  description: string;
  difficulty: 'Basic' | 'Intermediate' | 'Advanced';
}

const MODULES_INDEX: ModuleConfig[] = [
  { id: 'm1', name: 'Atomic Structure & Periodic Table', description: 'Explore Bohr orbits, electron configuration shells, and hover elements.', difficulty: 'Basic' },
  { id: 'm2', name: 'Chemical Bonding Laws', description: 'Construct valence Lewis structures and study electronegativity attraction.', difficulty: 'Basic' },
  { id: 'm3', name: 'Matter & Kinetic Theory', description: 'Compress particle canisters to observe phase states, plasma, and condensation.', difficulty: 'Intermediate' },
  { id: 'm4', name: 'Reactions & Mass Balance', description: 'Balance molecular coefficient multipliers and trigger kinetic collision impact rearrangements.', difficulty: 'Intermediate' },
  { id: 'm5', name: 'Acids, Bases & pH Assay', description: 'Snap substances along a pH scale and run high-precision phenolphthalein titrators.', difficulty: 'Advanced' },
  { id: 'm6', name: 'Organic Chemistry Fundamentals', description: 'Render tetrahedral alkanes and match organic functional compound zones.', difficulty: 'Advanced' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ModuleId | 'dashboard'>('m1');
  const [activeElement, setActiveElement] = useState<ElementData>(ELEMENTS_DATA[0]); // Hydrogen default
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  
  // Track personal best scores for quizzes per module (saved dynamically to localStorage)
  const [quizBests, setQuizBests] = useState<Record<ModuleId, number>>({
    m1: 0, m2: 0, m3: 0, m4: 0, m5: 0, m6: 0, dashboard: 0
  });

  const [totalXP, setTotalXP] = useState<number>(0);

  // Persistent Theme State (default: light)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('chemlab_theme');
      return saved === 'dark' ? 'dark' : 'light';
    } catch (e) {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('chemlab_theme', theme);
    } catch (e) {}
  }, [theme]);

  // Focus Study Times (saved dynamically to localStorage)
  const [studyTimes, setStudyTimes] = useState<Record<ModuleId, number>>({
    m1: 0, m2: 0, m3: 0, m4: 0, m5: 0, m6: 0, dashboard: 0
  });

  // Load study times on mount
  useEffect(() => {
    const initialTimes: Record<ModuleId, number> = { m1: 0, m2: 0, m3: 0, m4: 0, m5: 0, m6: 0, dashboard: 0 };
    for (const mod of ['m1', 'm2', 'm3', 'm4', 'm5', 'm6'] as const) {
      try {
        const val = localStorage.getItem(`chemlab_time_spent_${mod}`);
        if (val) {
          initialTimes[mod] = parseInt(val, 10) || 0;
        }
      } catch (e) {}
    }
    setStudyTimes(initialTimes);
  }, []);

  // Interval to increment study times
  useEffect(() => {
    if (activeTab === 'dashboard') return;

    const timer = setInterval(() => {
      setStudyTimes((prev) => {
        const updatedTime = prev[activeTab as ModuleId] + 1;
        try {
          localStorage.setItem(`chemlab_time_spent_${activeTab}`, updatedTime.toString());
        } catch (e) {}
        return {
          ...prev,
          [activeTab as ModuleId]: updatedTime,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTab]);

  const formatTimer = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return [
      h > 0 ? String(h).padStart(2, '0') : null,
      String(m).padStart(2, '0'),
      String(s).padStart(2, '0')
    ].filter(Boolean).join(':');
  };

  // Read progress metrics on startup
  useEffect(() => {
    refreshProgress();
  }, [activeTab]);

  const refreshProgress = () => {
    try {
      const bests: Record<ModuleId, number> = { m1: 0, m2: 0, m3: 0, m4: 0, m5: 0, m6: 0, dashboard: 0 };
      let quizPoints = 0;
      MODULES_INDEX.forEach((mod) => {
        const storedScore = parseInt(localStorage.getItem(`chemlab_quiz_best_${mod.id}`) || '-1');
        if (storedScore >= 0) {
          bests[mod.id] = storedScore;
          quizPoints += storedScore;
        }
      });
      setQuizBests(bests);

      const badgesCount = JSON.parse(localStorage.getItem('chemlab_badges') || '[]').length;
      setTotalXP(badgesCount * 100 + quizPoints * 30);
    } catch (e) {}
  };

  // Callback of quiz endings
  const handleQuizEnding = (moduleId: ModuleId, score: number) => {
    const currentBest = quizBests[moduleId] || 0;
    if (score > currentBest) {
      try {
        localStorage.setItem(`chemlab_quiz_best_${moduleId}`, score.toString());
      } catch (e) {}
      refreshProgress();
    }
  };

  const handleResetProgressGlobal = () => {
    try {
      localStorage.removeItem('chemlab_badges');
      MODULES_INDEX.forEach((mod) => {
        localStorage.removeItem(`chemlab_quiz_best_${mod.id}`);
        localStorage.removeItem(`chemlab_time_spent_${mod.id}`);
      });
      setQuizBests({ m1: 0, m2: 0, m3: 0, m4: 0, m5: 0, m6: 0, dashboard: 0 });
      setStudyTimes({ m1: 0, m2: 0, m3: 0, m4: 0, m5: 0, m6: 0, dashboard: 0 });
      setTotalXP(0);
      setActiveTab('m1');
    } catch (e) {}
  };

  const activeModuleMeta = MODULES_INDEX.find((m) => m.id === activeTab);

  // Compute rank tier label for header
  const getRankDetails = (xp: number) => {
    if (xp < 200) return { label: 'Novice Alchemist', emoji: '🧪' };
    if (xp < 450) return { label: 'Atomic Squire', emoji: '⚛️' };
    if (xp < 750) return { label: 'Molecular Vanguard', emoji: '🧬' };
    return { label: 'Savant Catalyst', emoji: '👑' };
  };

  const rank = getRankDetails(totalXP);

  // Dynamically set active module text for ChemAI prompt guidance
  const activeNameForAi = activeModuleMeta ? activeModuleMeta.name : "Interactive Chemistry Dashboard";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative antialiased selection:bg-violet-600/30selection:text-teal-400 overflow-x-hidden" id="chemlab-root">
      
      {/* Background stars / dust ambient overlay */}
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-violet-950/20 to-transparent pointer-events-none" />

      {/* Main HUD Header Navbar */}
      <header className="border-b border-violet-950/40 bg-slate-950/80 backdrop-blur-md py-3.5 px-6 sticky top-0 z-50 flex items-center justify-between shadow-md" id="master-header">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-teal-400 p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.3)] animate-pulse" id="beaker-launcher-logo">
            <span className="text-xl select-none">⚗️</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-wider uppercase font-mono text-zinc-100 font-display">ChemLab AI</h1>
              <span className="px-1.5 py-0.5 text-[8px] tracking-wide font-mono bg-violet-600/10 border border-violet-500/20 rounded-md text-violet-400 uppercase font-bold">Lab Console</span>
            </div>
            <p className="text-[10px] text-zinc-500 font-sans mt-0.5 leading-none">Immersive Full-Stack Chemistry Laboratory Simulator</p>
          </div>
        </div>

        {/* Ask ChemAI and Level/XP HUD Badge block */}
        <div className="flex items-center gap-3">
          {/* Persistent Theme Toggle Button */}
          <button
            onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
            className="flex items-center justify-center w-9 h-9 bg-slate-900/60 border border-violet-950/40 rounded-xl hover:bg-violet-600/10 hover:border-violet-500/30 transition-all duration-200 active:scale-95 shadow-sm"
            id="theme-toggle-btn"
            title={theme === 'light' ? 'Switch to Deep Laboratory Dark Mode' : 'Switch to Light Lab Mode'}
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-violet-600" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
            )}
          </button>
          {/* Active Module Study Timer */}
          {activeTab !== 'dashboard' && (
            <div className="flex items-center gap-2 bg-slate-900/60 p-1.5 px-3 border border-violet-950/40 rounded-xl" id="hud-timer-widget">
              <Clock className="w-3.5 h-3.5 text-teal-400 animate-pulse animate-duration-1000" />
              <div className="text-left select-none" id="focus-mod-container">
                <span className="text-[9px] font-mono text-zinc-500 uppercase block tracking-wider leading-none focus-label">Focus: Mod {activeTab.substring(1)}</span>
                <span className="text-[11px] font-mono text-zinc-100 font-bold leading-none focus-value">{formatTimer(studyTimes[activeTab])}</span>
              </div>
            </div>
          )}

          <button
            onClick={() => setIsChatOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-violet-600 hover:bg-violet-555 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] shadow-md border border-violet-500/20"
            id="header-chat-btn"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Ask ChemAI</span>
          </button>

          {/* Level & XP HUD Badge */}
          <div className="flex items-center gap-3 bg-slate-900/60 p-1.5 px-3 border border-violet-950/40 rounded-xl" id="hud-stats-widget">
            <div className="text-right select-none">
              <span className="text-[9px] font-mono text-zinc-500 uppercase block tracking-wider leading-none">Your Standing</span>
              <span className="text-[11px] font-mono text-zinc-300 font-bold leading-none">{rank.emoji} {rank.label}</span>
            </div>
            <div className="w-px h-6 bg-violet-950" />
            <div>
              <span className="text-[9px] font-mono text-zinc-500 uppercase block tracking-wider leading-none">XP Meter</span>
              <span className="text-[11px] font-mono text-teal-400 font-bold leading-none" id="global-xp-hud">{totalXP} XP</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main visual laboratory full-width layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 relative z-10" id="cockpit-layout">
        
        {/* Left Area: Controls & Multi-Tab View */}
        <div 
          className={`${!isChatOpen ? 'w-full' : 'w-full lg:max-w-full'} transition-all duration-300 space-y-6`} 
          id="simulator-workbench"
        >
          
          {/* Main Top Tab Switcher HUD */}
          <div className="overflow-x-auto select-none pb-1" id="tab-strip-scroller">
            <div className="flex gap-1 bg-slate-900 border border-violet-950/40 p-1 rounded-xl min-w-[720px]" id="modules-tab-strip">
              {MODULES_INDEX.map((mod) => {
                const isActive = activeTab === mod.id;
                let activeBorder = 'border-transparent text-zinc-500 hover:text-zinc-300';
                if (isActive) {
                  activeBorder = 'border-violet-500/30 bg-violet-600/10 text-violet-400 shadow-[0_2px_8px_rgba(124,58,237,0.1)]';
                }
                return (
                  <button
                    key={mod.id}
                    onClick={() => setActiveTab(mod.id)}
                    className={`flex-1 py-2 px-1 focus:outline-none rounded-lg border text-center transition-all duration-200 cursor-pointer ${activeBorder}`}
                    id={`mod-tab-btn-${mod.id}`}
                  >
                    <div className="text-[10px] font-mono tracking-wider font-extrabold flex items-center justify-center gap-1">
                      {mod.id === 'm1' && '⚛️'}
                      {mod.id === 'm2' && '🔗'}
                      {mod.id === 'm3' && '💨'}
                      {mod.id === 'm4' && '⚡'}
                      {mod.id === 'm5' && '🧪'}
                      {mod.id === 'm6' && '🧬'}
                      <span>Mod {mod.id.substring(1)}</span>
                    </div>
                    <span className="text-[8px] block font-sans truncate px-1 mt-0.5 max-w-[110px] mx-auto opacity-70">{mod.name.split('&')[0].trim()}</span>
                  </button>
                );
              })}

              <div className="w-px h-6 bg-violet-950/40 self-center mx-1" />

              {/* Student Notebook dashboard tab */}
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-2 px-3 focus:outline-none rounded-lg border transition-all duration-200 cursor-pointer text-xs font-mono font-bold flex items-center gap-1.5 ${
                  activeTab === 'dashboard'
                    ? 'border-teal-500/30 bg-teal-500/10 text-teal-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
                id="mod-tab-btn-dashboard"
              >
                <span>🏆</span>
                <span>My Notebook</span>
              </button>
            </div>
          </div>

          {/* Tab Subtitle Card */}
          {activeTab !== 'dashboard' && activeModuleMeta && (
            <div className="bg-slate-900 border border-violet-950/35 p-4 rounded-xl flex items-center justify-between" id="active-module-label-banner">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold font-mono tracking-wide text-zinc-200 select-none uppercase">Module {activeTab.substring(1)}: {activeModuleMeta.name}</h2>
                  <span className={`px-1.5 py-0.5 text-[8px] font-mono font-bold border rounded uppercase ${
                    activeModuleMeta.difficulty === 'Basic' ? 'border-sky-500/30 bg-sky-500/10 text-sky-400' :
                    activeModuleMeta.difficulty === 'Intermediate' ? 'border-amber-500/30 bg-amber-500/10 text-amber-500' :
                    'border-pink-500/30 bg-pink-500/10 text-pink-500'
                  }`}>{activeModuleMeta.difficulty}</span>
                </div>
                <p className="text-xs text-zinc-400 font-sans mt-1 select-text leading-relaxed">{activeModuleMeta.description}</p>
              </div>

              {/* Score ticker over banner */}
              <div className="text-right shrink-0 select-none px-3 border-l border-violet-950" id="mod-score-ticker">
                <span className="text-[8px] font-mono text-zinc-500 uppercase block">Notebook Level Score</span>
                <span className="text-xs font-mono font-black text-teal-400">{(quizBests[activeTab as ModuleId] || 0)} / 5</span>
              </div>
            </div>
          )}

          {/* ACTIVE CONTENT VIEW CONTAINER */}
          <div className="space-y-6" id="simulation-activeview">
            
            {/* 1. MODULE 1: Atomic Structure & Period Table explorer */}
            {activeTab === 'm1' && (
              <div className="space-y-6" id="module-1-grid-view">
                
                {/* BLOCK 3 — Full width Periodic Table */}
                <div className="w-full">
                  <PeriodicTable activeElement={activeElement} onElementSelect={setActiveElement} />
                </div>

                {/* BLOCK 4 — 3D Bohr Simulation Panel (Full width, internal 50/50 partition) */}
                <div className="w-full">
                  <ThreeAtomViewer element={activeElement} />
                </div>

                {/* BLOCK 5 — Chemical Scorecard (Placed directly below, three columns side-by-side on desktop, vertical stack on mobile) */}
                <div className="bg-slate-900 border border-violet-950/45 p-5 rounded-xl relative overflow-hidden w-full" id="element-expanded-scorecard">
                  <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 text-8xl font-mono text-violet-950/10 uppercase select-none font-extrabold p-2">
                    {activeElement.symbol}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    
                    {/* LEFT Column */}
                    <div className="flex flex-col justify-between" id="element-names-score">
                      <div>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">Chemical Scorecard</span>
                        <h4 className="text-lg font-black text-white font-mono mt-1">{activeElement.name}</h4>
                        <span className="text-xs text-zinc-400 font-mono italic block mt-2">
                          Electron configuration: <br />
                          <span className="text-teal-400 font-semibold">{activeElement.electronConfig}</span>
                        </span>
                      </div>
                      <div className="mt-4 text-[11px] font-mono text-zinc-500">
                        Period <span className="text-zinc-200">{activeElement.period}</span> ❖ Group <span className="text-zinc-200">{activeElement.group}</span>
                      </div>
                    </div>

                    {/* MIDDLE Column */}
                    <div className="bg-slate-950/60 p-4 rounded-lg border border-violet-950/20 flex flex-col justify-between" id="element-physics-stats">
                      <div>
                        <span className="text-[10px] font-mono text-teal-400 uppercase tracking-widest block font-bold mb-2">Physical Metrics</span>
                        <div className="space-y-2 text-xs font-mono text-zinc-300">
                          <div className="flex justify-between border-b border-violet-950/20 pb-1">
                            <span>Atomic Number:</span>
                            <span className="font-bold text-white">{activeElement.number}</span>
                          </div>
                          <div className="flex justify-between border-b border-violet-950/20 pb-1">
                            <span>Atomic Mass:</span>
                            <span className="font-bold text-white">{activeElement.mass} u</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Valence Shells:</span>
                            <span className="font-bold text-teal-400">{activeElement.shells?.join(', ')}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT Column */}
                    <div className="bg-slate-950/80 border border-violet-950/30 p-4 rounded-lg flex flex-col justify-between" id="element-fun-fact">
                      <div>
                        <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block font-bold mb-2">ChemAI Fun Fact</span>
                        <p className="text-xs leading-relaxed text-zinc-400 select-text font-sans mt-1">
                          {activeElement.funFact}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {/* 2. MODULE 2: Chemical Bonding laws */}
            {activeTab === 'm2' && <BondingSimulator />}

            {/* 3. MODULE 3: Matter and kinetic phase states canvas */}
            {activeTab === 'm3' && <StatesSimulation />}

            {/* 4. MODULE 4: Reactions coefficient balances */}
            {activeTab === 'm4' && <ReactionsSimulator />}

            {/* 5. MODULE 5: Acids/Bases and pH indicators */}
            {activeTab === 'm5' && <AcidsBasesSimulator />}

            {/* 6. MODULE 6: Organic compounds structure zigzags */}
            {activeTab === 'm6' && <OrganicChemistrySimulator />}

            {/* 7. PROGRESS TRACKER: Dashboard Cabinet view */}
            {activeTab === 'dashboard' && (
              <DashboardPanel onResetProgress={handleResetProgressGlobal} studyTimes={studyTimes} />
            )}

            {/* Interactive Module Quiz Card (Appended to all standard module tabs under simulation views) */}
            {activeTab !== 'dashboard' && activeModuleMeta && (
              <div className="mt-8 border-t border-violet-950/30 pt-6" id="quiz-assessment-footer-holder">
                <div className="bg-gradient-to-r from-violet-600/5 to-transparent p-5 border border-violet-950/35 rounded-xl flex flex-col md:flex-row items-center justify-between gap-5 select-none mb-6">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-violet-600/10 border border-violet-950/40 rounded-xl text-2xl">
                      📝
                    </div>
                    <div>
                      <h4 className="text-sm font-bold font-mono text-zinc-200 uppercase tracking-widest leading-none">Lesson Assessment Challenge</h4>
                      <p className="text-[10px] text-zinc-550 leading-normal font-sans mt-1">
                        Demonstrate your mastery over {activeModuleMeta.name} by answering a <strong>5-question chemistry certification exam</strong>! Correct completions award +100 bonus XP.
                      </p>
                    </div>
                  </div>
                  
                  <div className="shrink-0 flex items-center gap-1 bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 rounded-lg text-teal-400 font-mono text-[11px] font-bold">
                    <Award className="w-4 h-4" /> Personal Best: {quizBests[activeTab as ModuleId]} / 5 Score
                  </div>
                </div>

                {/* Sub-rendered Quiz Card */}
                <QuizPanel
                  moduleId={activeTab as ModuleId}
                  moduleName={activeModuleMeta.name}
                  onQuizCompleted={(score) => handleQuizEnding(activeTab as ModuleId, score)}
                  bestScore={quizBests[activeTab as ModuleId] || 0}
                />
              </div>
            )}
          </div>

        </div>

      </main>

      {/* Backdrop overlay for active chat */}
      {isChatOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity duration-300"
          onClick={() => setIsChatOpen(false)}
        />
      )}

      {/* Floating or slide-in ChemAI Chat Panel */}
      <div 
        className={`fixed top-0 right-0 h-full z-50 transition-all duration-300 ease-in-out ${
          isChatOpen 
            ? 'translate-x-0 opacity-100' 
            : 'translate-x-full opacity-0 pointer-events-none'
        } w-full sm:w-[420px] md:w-[460px] bg-slate-950 border-l border-violet-950/40 shadow-2xl flex flex-col`}
        style={{ display: isChatOpen ? 'flex' : 'none' }}
        id="cockpit-ai-panel"
      >
        <ChatPanel 
          moduleId={activeTab} 
          moduleName={activeNameForAi} 
          onClose={() => setIsChatOpen(false)} 
        />
      </div>

      {/* Expand Floating ASK CHEMAI Badge Widget when closed */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 flex items-center justify-center gap-2 px-4 h-12 bg-violet-600 hover:bg-violet-550 text-white rounded-full shadow-lg border border-violet-550/20 z-50 hover:scale-105 active:scale-95 transition-all duration-300 animate-bounce"
          id="expand-chat-btn"
        >
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-wider uppercase">Ask ChemAI</span>
        </button>
      )}

      {/* Footer Credentials */}
      <footer className="mt-12 py-6 px-6 border-t border-violet-950/35 bg-slate-950 text-center font-mono text-[9px] text-zinc-500 tracking-wider relative z-10 select-none flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl w-full mx-auto" id="master-footer">
        <p>© 2026 ChemLab AI • Interactive Physics-Driven Chemistry Platform for students.</p>
        <div className="flex gap-4">
          <span>Version 1.0.8 (Stable API Sync)</span>
          <span>Google AI Studio Powered</span>
        </div>
      </footer>
    </div>
  );
}
