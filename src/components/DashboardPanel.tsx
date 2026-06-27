import React, { useState, useEffect } from 'react';
import { Badge, ModuleId } from '../types';
import { BADGES } from '../data/chemistryData';
import { Award, Zap, Shield, Sparkles, RefreshCw, Layers, Clock, FileDown, BookOpen } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface DashboardPanelProps {
  onResetProgress: () => void;
  studyTimes: Record<ModuleId, number>;
}

const MODULES_LIST = [
  { id: 'm1', label: 'Atomic Structure' },
  { id: 'm2', label: 'Chemical Bonding' },
  { id: 'm3', label: 'Matter & Kinetic' },
  { id: 'm4', label: 'Reactions & Mass' },
  { id: 'm5', label: 'Acids & Bases' },
  { id: 'm6', label: 'Organic Chemistry' },
];

export default function DashboardPanel({ onResetProgress, studyTimes }: DashboardPanelProps) {
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [completedQuizzesCount, setCompletedQuizzesCount] = useState<number>(0);
  const [quizScoresTotal, setQuizScoresTotal] = useState<number>(0);

  // Notes state
  const [notes, setNotes] = useState<Record<string, string>>({
    m1: '', m2: '', m3: '', m4: '', m5: '', m6: ''
  });
  const [activeNoteTab, setActiveNoteTab] = useState<string>('m1');

  // Read badge completions and notes
  useEffect(() => {
    try {
      const storedBadges = JSON.parse(localStorage.getItem('chemlab_badges') || '[]');
      setUnlockedBadges(storedBadges);

      // Read quiz scores
      let count = 0;
      let totalPoints = 0;
      for (let i = 1; i <= 6; i++) {
        const score = parseInt(localStorage.getItem(`chemlab_quiz_best_m${i}`) || '-1');
        if (score >= 0) {
          count++;
          totalPoints += score;
        }
      }
      setCompletedQuizzesCount(count);
      setQuizScoresTotal(totalPoints);

      // Read notes
      const loadedNotes: Record<string, string> = { m1: '', m2: '', m3: '', m4: '', m5: '', m6: '' };
      for (let i = 1; i <= 6; i++) {
        const val = localStorage.getItem(`chemlab_notes_m${i}`) || '';
        loadedNotes[`m${i}`] = val;
      }
      setNotes(loadedNotes);
    } catch (e) {}
  }, []);

  // Note changer with auto-saving status
  const handleNoteChange = (moduleId: string, text: string) => {
    setNotes((prev) => ({
      ...prev,
      [moduleId]: text,
    }));
    try {
      localStorage.setItem(`chemlab_notes_${moduleId}`, text);
    } catch (e) {}
  };

  // Sum up all module study times for metrics
  const totalStudySeconds = Object.keys(studyTimes)
    .filter((k) => k !== 'dashboard')
    .reduce((acc, curr) => acc + (studyTimes[curr as ModuleId] || 0), 0);

  const formatTotalTime = (totalSecs: number) => {
    if (totalSecs === 0) return '0s';
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    
    const parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 || parts.length === 0) parts.push(`${s}s`);
    return parts.join(' ');
  };

  // Compute total chemistry XP
  const badgeXP = unlockedBadges.length * 100;
  const quizXP = quizScoresTotal * 30;
  const totalXP = badgeXP + quizXP;

  // Level thresholds
  let level = 1;
  let rankTitle = 'Novice Alchemist';
  let badgeRankEmoji = '🧪';
  let nextLevelXP = 200;
  let prgRatio = 0;

  if (totalXP < 200) {
    level = 1;
    rankTitle = 'Novice Alchemist';
    badgeRankEmoji = '🧪';
    nextLevelXP = 200;
    prgRatio = (totalXP / 200) * 100;
  } else if (totalXP >= 200 && totalXP < 450) {
    level = 2;
    rankTitle = 'Atomic Squire';
    badgeRankEmoji = '⚛️';
    nextLevelXP = 450;
    prgRatio = ((totalXP - 200) / 250) * 100;
  } else if (totalXP >= 450 && totalXP < 750) {
    level = 3;
    rankTitle = 'Molecular Vanguard';
    badgeRankEmoji = '🧬';
    nextLevelXP = 750;
    prgRatio = ((totalXP - 450) / 300) * 100;
  } else {
    level = 4;
    rankTitle = 'Savant Catalyst';
    badgeRankEmoji = '👑';
    nextLevelXP = 1200; // Cap
    prgRatio = Math.min((totalXP / 1200) * 100, 100);
  }

  const handleResetClick = () => {
    if (confirm('Are you absolutely sure you want to scrub all chemistry lab notebook records, reset badges, and wipe level stats?')) {
      onResetProgress();
      setUnlockedBadges([]);
      setCompletedQuizzesCount(0);
      setQuizScoresTotal(0);
      setNotes({ m1: '', m2: '', m3: '', m4: '', m5: '', m6: '' });
      for (let i = 1; i <= 6; i++) {
        try {
          localStorage.removeItem(`chemlab_notes_m${i}`);
        } catch (e) {}
      }
    }
  };

  // Programmatic PDF Exporter
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Drawing function helper
      const drawHeader = (pageNum: number) => {
        // Primary title banner
        doc.setFillColor(91, 33, 250); // Violet
        doc.rect(0, 0, 210, 14, 'F');
        
        doc.setFillColor(0, 191, 166); // Teal accent line
        doc.rect(0, 14, 210, 1.5, 'F');

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.text('CHEMLAB INTERACTIVE SUITE - EXPERIMENTAL REPORT & PROGRESS LOG', 15, 9);
        
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(`Page ${pageNum}`, 190, 9);
      };

      // Page 1 Header
      drawHeader(1);

      let y = 28;

      // Document Title
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(20, 24, 33);
      doc.text('LABORATORY PROGRESS JOURNAL', 15, y);
      y += 7;

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(110, 120, 135);
      const stamp = new Date().toLocaleString('en-US', { timeZone: 'UTC' });
      doc.text(`Generated on: ${stamp} UTC`, 15, y);
      y += 10;

      // Border Divider
      doc.setDrawColor(225, 230, 242);
      doc.setLineWidth(0.4);
      doc.line(15, y, 195, y);
      y += 8;

      // Student Rank Summary Box
      doc.setFillColor(245, 247, 254);
      doc.roundedRect(15, y, 180, 28, 1.5, 1.5, 'F');

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(91, 33, 250);
      doc.text('STUDENT CLASSIFICATION AND PERFORMANCE DATA', 20, y + 6.5);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(50, 60, 75);
      doc.text(`Academic Class: Level ${level} - ${rankTitle}`, 20, y + 13.5);
      doc.text(`Total Accumulated XP: ${totalXP} XP`, 20, y + 19.5);

      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(2, 172, 149);
      doc.text(`Cumulative Lab Focus: ${formatTotalTime(totalStudySeconds)}`, 125, y + 13.5);
      
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(50, 60, 75);
      doc.text(`Evaluations: ${completedQuizzesCount} / 6 Quizzes Taken`, 125, y + 19.5);
      y += 36;

      // Performance Matrix Table
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(20, 24, 33);
      doc.text('SIMULATION LOG & STATUS MATRIX', 15, y);
      y += 5;

      // Columns header background
      doc.setFillColor(235, 240, 252);
      doc.rect(15, y, 180, 7, 'F');
      
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(50, 60, 80);
      doc.text('Module ID', 18, y + 5);
      doc.text('Experimental Module Name', 42, y + 5);
      doc.text('Session Engagement', 120, y + 5);
      doc.text('Best Assessment Score', 160, y + 5);
      y += 7;

      MODULES_LIST.forEach((mod) => {
        // Alternating rows
        doc.setFillColor(253, 254, 255);
        doc.rect(15, y, 180, 7.5, 'F');
        doc.setDrawColor(242, 245, 252);
        doc.line(15, y + 7.5, 195, y + 7.5);

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(60, 70, 85);
        doc.text(`Mod ${mod.id.substring(1).toUpperCase()}`, 18, y + 5);
        doc.text(mod.label, 42, y + 5);
        
        const secs = studyTimes[mod.id as ModuleId] || 0;
        doc.text(formatTotalTime(secs), 120, y + 5);
        
        const score = localStorage.getItem(`chemlab_quiz_best_${mod.id}`);
        const scoreText = score ? `${score} / 5 Points` : 'Not Evaluated';
        doc.text(scoreText, 160, y + 5);
        
        y += 7.5;
      });
      y += 11;

      // Achievements section
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(20, 24, 33);
      doc.text('AWARDED LABORATORY MILESTONES', 15, y);
      y += 5;

      const earnedBadgesDetails = BADGES.filter(b => unlockedBadges.includes(b.id));
      if (earnedBadgesDetails.length === 0) {
        doc.setFont('Helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(130, 135, 145);
        doc.text('No simulation badges unlocked yet. Keep studying structural simulators to earn achievements!', 15, y);
        y += 7;
      } else {
        earnedBadgesDetails.forEach((bdg) => {
          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(0, 160, 140);
          doc.text(`[✓] ${bdg.name}`, 15, y);
          
          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(80, 90, 105);
          doc.text(` - ${bdg.description}`, 55, y);
          y += 5.5;
        });
      }
      y += 11;

      // Observations Pages
      if (y > 210) {
        doc.addPage();
        drawHeader(2);
        y = 25;
      }

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(20, 24, 33);
      doc.text('LAB OBSERVATION NOTES & INTERACTION JOURNALS', 15, y);
      y += 7;

      let pCounter = (y === 25) ? 2 : 1;

      MODULES_LIST.forEach((mod) => {
        const modNote = notes[mod.id] ? notes[mod.id].trim() : '';

        // Prevent overflow
        if (y > 245) {
          doc.addPage();
          pCounter++;
          drawHeader(pCounter);
          y = 25;
        }

        doc.setFillColor(244, 244, 247);
        doc.rect(15, y, 180, 6, 'F');
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(91, 33, 250);
        doc.text(`Module ${mod.id.substring(1).toUpperCase()}: ${mod.label}`, 18, y + 4.2);
        y += 8;

        if (!modNote) {
          doc.setFont('Helvetica', 'italic');
          doc.setFontSize(8.5);
          doc.setTextColor(140, 145, 155);
          doc.text('No experimental observational notes logged in this notebook section.', 18, y);
          y += 6.5;
        } else {
          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(50, 60, 75);
          
          const splitObs = doc.splitTextToSize(modNote, 172);
          const blockHeight = splitObs.length * 4.2;
          
          if (y + blockHeight > 280) {
            doc.addPage();
            pCounter++;
            drawHeader(pCounter);
            y = 25;
          }

          doc.text(splitObs, 18, y);
          y += blockHeight + 5.5;
        }
      });

      doc.save('Chemistry_Suite_Lab_Report.pdf');

    } catch (error) {
      console.error('PDF Export Error: ', error);
      alert('Error building PDF document: ' + error);
    }
  };

  return (
    <div className="space-y-6" id="student-progress-dashboard shadow-lg">
      
      {/* Top XP / level overview header block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Card: Main Level Progress HUD */}
        <div className="bg-slate-900 border border-violet-950/45 p-5 rounded-xl md:col-span-2 flex flex-col justify-between relative overflow-hidden" id="level-hud-panel">
          {/* Ambient Glow */}
          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-32 h-32 bg-violet-600/10 blur-xl rounded-full pointer-events-none" />

          <div className="flex items-start justify-between border-b border-violet-950/20 pb-3">
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Academic Rank Progress</span>
              <h2 className="text-lg font-bold font-mono text-zinc-100 flex items-center gap-1.5 leading-none select-none">
                <span>{badgeRankEmoji}</span>
                <span>{rankTitle}</span>
              </h2>
            </div>
            <div className="bg-slate-950 px-3 py-1 bg-violet-600/10 border border-violet-950/30 rounded text-center" id="hud-level-badge">
              <span className="text-[9px] font-mono text-zinc-500 uppercase block">Level</span>
              <span className="text-base font-mono font-black text-violet-400">{level}</span>
            </div>
          </div>

          <div className="my-4 space-y-2">
            <div className="flex justify-between font-mono text-xs select-none">
              <span className="text-zinc-500">Total chemistry XP accumulated:</span>
              <span className="text-teal-400 font-bold">{totalXP} <span className="text-zinc-500 text-[10px]">/ {nextLevelXP} XP</span></span>
            </div>
            
            {/* Visual Progress bar container */}
            <div className="relative w-full h-2.5 bg-slate-950 border border-violet-950/30 rounded-full overflow-hidden" id="level-progress-meter">
              <div
                className="h-full bg-gradient-to-r from-violet-600 to-teal-400 rounded-full transition-all duration-300"
                style={{ width: `${prgRatio}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center bg-slate-950/50 p-2 border border-violet-950/15 rounded-lg text-[10px]" id="prog-quickstats">
            <span className="text-zinc-500 text-sans">Complete lab modules and score highly on academic quizzes to unlock rank milestones!</span>
            <span className="text-violet-400 font-mono font-bold shrink-0 pl-4">{nextLevelXP - totalXP} XP to Level UP!</span>
          </div>
        </div>

        {/* Right Card: Quick Overview stats */}
        <div className="bg-slate-900 border border-violet-950/45 p-5 rounded-xl flex flex-col justify-between" id="overview-card">
          <span className="text-[10px] font-mono text-teal-400 uppercase tracking-widest block font-bold mb-3 border-b border-violet-950/20 pb-1.5">Lab Notebook Audit</span>
          
          <div className="space-y-3 font-mono text-xs text-zinc-300">
            <div className="flex justify-between border-b border-violet-950/25 pb-1">
              <span>Unlocked Badges:</span>
              <span className="text-teal-400 font-bold">{unlockedBadges.length} / 6</span>
            </div>
            <div className="flex justify-between border-b border-violet-950/25 pb-1">
              <span>Completed Quizzes:</span>
              <span className="text-teal-400 font-bold">{completedQuizzesCount} / 6</span>
            </div>
            <div className="flex justify-between border-b border-violet-950/25 pb-1">
              <span>Quiz point total:</span>
              <span className="text-teal-400 font-bold">{quizScoresTotal} / 30</span>
            </div>
            <div className="flex justify-between border-b border-violet-950/25 pb-1">
              <span>Completed Modules ratio:</span>
              <span className="text-teal-400 font-bold">{((unlockedBadges.length + completedQuizzesCount) / 12 * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Total Study Focus:</span>
              <span className="text-violet-400 font-bold text-right truncate">{formatTotalTime(totalStudySeconds)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 mt-4" id="overview-actions">
            <button
              onClick={handleExportPDF}
              className="w-full py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded text-[10px] uppercase font-mono tracking-wider transition-colors flex items-center justify-center gap-1.5"
              id="export-pdf-report-btn"
            >
              <FileDown className="w-3.5 h-3.5 text-white" /> EXPORT REPORT (PDF)
            </button>
            <button
              onClick={handleResetClick}
              className="w-full py-1 border border-red-950/40 text-red-500/80 hover:bg-red-500/10 rounded text-[9px] uppercase font-mono tracking-wider transition-colors flex items-center justify-center gap-1.5"
              id="wipe-progress-btn"
            >
              <RefreshCw className="w-2.5 h-2.5" /> WIPE ALL RECORDS
            </button>
          </div>
        </div>
      </div>

      {/* ⏱️ Core Study Time Distribution & Performance Mappings */}
      <div className="bg-slate-900 border border-violet-950/45 p-5 rounded-xl" id="study-time-distribution-segment">
        <div className="border-b border-violet-950/20 pb-2 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase text-teal-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-400 " />
              <span>Laboratory Study Focus Dynamics</span>
            </h3>
            <p className="text-[10px] text-zinc-500 font-sans leading-relaxed">
              Real-time persistent monitoring of active focus sessions spent in each experimental simulation module.
            </p>
          </div>
          <div className="text-left sm:text-right bg-slate-950/50 px-3.5 py-1 border border-violet-950/30 rounded-lg">
            <span className="text-[9px] font-mono text-zinc-500 uppercase block tracking-wider leading-none">Total Active Time</span>
            <span className="text-xs font-mono font-bold text-violet-400 mt-0.5 block">{formatTotalTime(totalStudySeconds)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5" id="module-time-distribution-cards">
          {MODULES_LIST.map((mod) => {
            const secs = studyTimes[mod.id as ModuleId] || 0;
            const ratio = totalStudySeconds > 0 ? (secs / totalStudySeconds) * 100 : 0;
            return (
              <div 
                key={mod.id} 
                className="p-3.5 bg-slate-950/40 border border-violet-950/20 hover:border-violet-500/25 rounded-xl flex flex-col justify-between transition"
                id={`mod-time-card-${mod.id}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase font-bold tracking-wider truncate">Mod {mod.id.substring(1)}</span>
                    <span className="text-[8px] font-mono px-1 py-0.5 bg-violet-600/10 border border-violet-500/15 rounded text-violet-400 font-bold shrink-0">
                      {ratio.toFixed(0)}%
                    </span>
                  </div>
                  <h4 className="text-[11px] font-sans font-bold text-zinc-300 mt-1.5 leading-tight line-clamp-1 truncate" title={mod.label}>
                    {mod.label}
                  </h4>
                </div>
                
                <div className="mt-3.5">
                  <span className="text-xs font-mono text-teal-400 font-bold block">
                    {formatTotalTime(secs)}
                  </span>
                  
                  {/* Indicator bar */}
                  <div className="w-full bg-slate-900 border border-violet-950/15 h-1.5 rounded-full mt-2 overflow-hidden" id={`mod-bar-bg-${mod.id}`}>
                    <div 
                      className="bg-gradient-to-r from-violet-600 to-teal-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(ratio, secs > 0 ? 3 : 0)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 📓 Interactive Science Journals & Lab Notes Cabinet */}
      <div className="bg-slate-900 border border-violet-950/45 p-5 rounded-xl" id="personal-lab-notes-board">
        <div className="border-b border-violet-950/20 pb-2 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase text-teal-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-teal-400" />
              <span>Interactive Chemistry Science Journals & Observations</span>
            </h3>
            <p className="text-[10px] text-zinc-500 font-sans leading-relaxed">
              Jot down experimental findings, molecular formulas, kinetic values, and acid titration notes. Your journals auto-save on the fly.
            </p>
          </div>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 text-xs font-mono font-bold text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 px-3 py-1 rounded-lg transition active:scale-95 shrink-0"
            id="notes-export-pdf-shortcut"
          >
            <FileDown className="w-3.5 h-3.5" /> Export PDF
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="lab-notes-workspace-grid">
          {/* List of tabs on the left */}
          <div className="md:col-span-1 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible gap-1.5 border-b md:border-b-0 md:border-r border-violet-950/20 pb-2 md:pb-0 md:pr-3 scrollbar-none" id="notes-module-tabs">
            {MODULES_LIST.map((mod) => {
              const noteText = notes[mod.id] || '';
              const hasNotes = noteText.trim().length > 0;
              const isActive = activeNoteTab === mod.id;

              return (
                <button
                  key={mod.id}
                  onClick={() => setActiveNoteTab(mod.id)}
                  className={`w-full text-left p-2 rounded-lg border text-xs font-mono transition flex items-center justify-between gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'border-violet-500 bg-violet-600/10 text-violet-400 font-bold'
                      : 'border-violet-950/15 bg-slate-950/20 text-zinc-400 hover:bg-slate-950/40 hover:text-zinc-350'
                  }`}
                  id={`notes-tab-trigger-${mod.id}`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="opacity-70">Mod {mod.id.substring(1)}</span>
                    <span className="truncate max-w-[80px] md:max-w-none text-zinc-300 font-sans leading-none">{mod.label}</span>
                  </div>
                  {hasNotes && (
                    <span className="w-2 h-2 rounded-full bg-teal-400 shrink-0 select-none animate-pulse" title="Observations written" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active note area on the right */}
          <div className="md:col-span-3 flex flex-col justify-between space-y-3" id="active-note-scratchpad">
            <div>
              <div className="flex items-center justify-between border-b border-violet-950/15 pb-1.5">
                <span className="text-[10px] font-mono text-violet-400 uppercase tracking-wider font-bold">
                  Editing Module {activeNoteTab.substring(1)} Lab Journal
                </span>
                <span className="text-[9px] font-mono text-zinc-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block animate-pulse" /> Auto-saved
                </span>
              </div>
              
              <div className="relative mt-2">
                <textarea
                  value={notes[activeNoteTab] || ''}
                  onChange={(e) => handleNoteChange(activeNoteTab, e.target.value)}
                  placeholder={`Record your critical experimental thoughts, Lewis/Bohr findings, formulas, and observations for ${MODULES_LIST.find(m => m.id === activeNoteTab)?.label} here...`}
                  className="w-full h-32 bg-slate-950/70 border border-violet-950/30 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-550 focus:outline-none focus:border-violet-500/50 font-sans resize-none transition-all leading-relaxed"
                  id={`note-editor-input-${activeNoteTab}`}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1" id="scratchpad-editor-footer">
              <span>{notes[activeNoteTab]?.length || 0} characters typed</span>
              <span className="italic text-[9px] text-zinc-650">Saved locally in browser sandbox</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid cabinet showcasing the Badge list */}
      <div className="bg-slate-900 border border-violet-950/45 p-5 rounded-xl" id="badges-grid-section">
        <div className="border-b border-violet-950/20 pb-2 mb-4">
          <h3 className="text-xs font-mono font-bold uppercase text-teal-400">Awarded Chemistry Badges</h3>
          <p className="text-[10px] text-zinc-500 font-sans leading-relaxed">
            Locked achievements display requirements. Explore simulations and correct structure dot designs to earn them!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" id="badges-cabinet-shelf">
          {BADGES.map((bdg) => {
            const isUnlocked = unlockedBadges.includes(bdg.id);
            
            return (
              <div
                key={bdg.id}
                className={`p-4 border rounded-xl flex items-start gap-3.5 transition-all duration-300 relative overflow-hidden select-none ${
                  isUnlocked
                    ? 'border-teal-500 bg-teal-500/5 shadow-[0_4px_16px_rgba(0,229,204,0.1)]'
                    : 'border-violet-950/30 bg-slate-950/40 opacity-55'
                }`}
                id={`badge-card-${bdg.id}`}
                title={isUnlocked ? 'Unlocked!' : 'Required Milestone Locked'}
              >
                {/* Visual badge sphere icon */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border shrink-0 text-lg transition-all duration-300 ${
                  isUnlocked
                    ? 'border-teal-500 bg-teal-500/10 text-teal-400 shadow-[0_0_12px_rgba(0,229,204,0.25)]'
                    : 'border-violet-950/50 bg-slate-900 text-zinc-600'
                }`}>
                  {isUnlocked ? '🥇' : '🔒'}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className={`text-xs font-bold font-mono tracking-wide ${isUnlocked ? 'text-teal-450' : 'text-zinc-400'}`}>
                      {bdg.name}
                    </h4>
                    {isUnlocked && <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />}
                  </div>
                  
                  <p className="text-[11px] text-zinc-400 font-sans leading-normal select-text">
                    {bdg.description}
                  </p>

                  <span className={`text-[8px] font-mono uppercase tracking-widest block font-bold mt-1 ${isUnlocked ? 'text-teal-500' : 'text-zinc-600'}`}>
                    {isUnlocked ? 'Completed • +100 XP' : 'Locked • Study simulations'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
