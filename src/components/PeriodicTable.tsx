import React, { useState } from 'react';
import { ElementData } from '../types';
import { ELEMENTS_DATA } from '../data/chemistryData';

interface PeriodicTableProps {
  activeElement: ElementData | null;
  onElementSelect: (el: ElementData) => void;
}

export default function PeriodicTable({ activeElement, onElementSelect }: PeriodicTableProps) {
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);

  // Periodic categorization classes helper
  const getCategoryColor = (category: string, isGroupFiltered: boolean) => {
    if (isGroupFiltered) {
      return 'bg-[#EEF2FF] text-[#5B21FA] border-[#5B21FA] shadow-[0_2px_12px_rgba(91,33,250,0.08)]';
    }
    switch (category) {
      case 'metal':
        return 'bg-[#DBEAFE] border-[#CBD5F0] text-[#1D4ED8] hover:bg-[#EEF2FF] hover:border-[#5B21FA] hover:text-[#5B21FA]';
      case 'nonmetal':
        return 'bg-[#DCFCE7] border-[#CBD5F0] text-[#166534] hover:bg-[#EEF2FF] hover:border-[#5B21FA] hover:text-[#5B21FA]';
      case 'metalloid':
        return 'bg-[#FEF9C3] border-[#CBD5F0] text-[#854D0E] hover:bg-[#EEF2FF] hover:border-[#5B21FA] hover:text-[#5B21FA]';
      case 'noble-gas':
        return 'bg-[#F3E8FF] border-[#CBD5F0] text-[#6B21A8] hover:bg-[#EEF2FF] hover:border-[#5B21FA] hover:text-[#5B21FA]';
      default:
        return 'bg-[#FFFFFF] border-[#CBD5F0] text-[#0D1B4B] hover:bg-[#EEF2FF] hover:border-[#5B21FA] hover:text-[#5B21FA]';
    }
  };

  // Helper to map visual element positions in 18-column grid slots
  // Grid coordinates map from group (1 to 18) and period (1 to 3)
  const getGridSlotStyle = (g: number, p: number) => {
    return {
      gridColumnStart: g,
      gridRowStart: p,
    };
  };

  return (
    <div className="space-y-4" id="periodic-table-panel">
      {/* Visual Legendary Category Filter */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3.5 rounded-xl border border-[#DCE4FF] shadow-sm" id="table-category-legend">
        <span className="text-[13px] font-mono text-[#7A8DB0] uppercase tracking-wider font-bold">Highlight Groups:</span>
        
        <button
          onMouseEnter={() => setHoveredGroup('metal')}
          onMouseLeave={() => setHoveredGroup(null)}
          className="flex items-center gap-1.5 focus:outline-none"
          id="legend-metal-btn"
        >
          <span className="w-2.5 h-2.5 rounded bg-[#DBEAFE] border border-[#CBD5F0] block" />
          <span className="text-[13px] font-mono hover:text-[#5B21FA] text-[#3D5080] transition">Alkali & Alkaline Metals</span>
        </button>

        <button
          onMouseEnter={() => setHoveredGroup('nonmetal')}
          onMouseLeave={() => setHoveredGroup(null)}
          className="flex items-center gap-1.5 focus:outline-none"
          id="legend-nonmetal-btn"
        >
          <span className="w-2.5 h-2.5 rounded bg-[#DCFCE7] border border-[#CBD5F0] block" />
          <span className="text-[13px] font-mono hover:text-[#5B21FA] text-[#3D5080] transition">Reactive Nonmetals</span>
        </button>

        <button
          onMouseEnter={() => setHoveredGroup('metalloid')}
          onMouseLeave={() => setHoveredGroup(null)}
          className="flex items-center gap-1.5 focus:outline-none"
          id="legend-metalloid-btn"
        >
          <span className="w-2.5 h-2.5 rounded bg-[#FEF9C3] border border-[#CBD5F0] block" />
          <span className="text-[13px] font-mono hover:text-[#5B21FA] text-[#3D5080] transition">Metalloids</span>
        </button>

        <button
          onMouseEnter={() => setHoveredGroup('noble-gas')}
          onMouseLeave={() => setHoveredGroup(null)}
          className="flex items-center gap-1.5 focus:outline-none"
          id="legend-noble-btn"
        >
          <span className="w-2.5 h-2.5 rounded bg-[#F3E8FF] border border-[#CBD5F0] block" />
          <span className="text-[13px] font-mono hover:text-[#5B21FA] text-[#3D5080] transition">Noble Gases</span>
        </button>
      </div>

      {/* Grid container with horizontal scroll handling overflow for mobile screens */}
      <div className="w-full overflow-x-auto border border-[#DCE4FF] bg-white p-3.5 rounded-xl shadow-sm select-none pb-4" id="table-scroll-wrapper">
        <div className="grid grid-cols-18 gap-1.5 min-w-[700px]" id="periodic-table-grid">
          
          {/* Elements list rendering inside grid */}
          {ELEMENTS_DATA.map((el) => {
            const isActive = activeElement ? activeElement.symbol === el.symbol : false;
            const isGroupHovered = hoveredGroup === el.category;
            const colorClass = getCategoryColor(el.category, isActive || isGroupHovered);
            const activeClass = isActive ? 'border-2 border-[#5B21FA]! bg-[#E0E7FF]! text-[#5B21FA]! shadow-[0_2px_12px_rgba(91,33,250,0.15)] scale-105 z-10' : '';

            return (
              <button
                key={el.symbol}
                onClick={() => {
                  onElementSelect(el);
                  
                  // Award atomic explorer badge
                  const storageKey = 'chemlab_badges';
                  try {
                    const bdgs = JSON.parse(localStorage.getItem(storageKey) || '[]');
                    if (!bdgs.includes('badge_m1')) {
                      bdgs.push('badge_m1');
                      localStorage.setItem(storageKey, JSON.stringify(bdgs));
                    }
                  } catch (e) {}
                }}
                className={`aspect-square p-1.5 rounded border flex flex-col justify-between items-start text-left cursor-pointer transition-all duration-250 outline-none ${colorClass} ${activeClass}`}
                style={getGridSlotStyle(el.group, el.period)}
                id={`el-card-${el.symbol}`}
              >
                {/* Atomic number top left */}
                <span className="text-[9px] font-mono font-bold leading-none select-none opacity-80">{el.number}</span>
                
                {/* Central Lettering */}
                <div className="w-full text-center">
                  <span className="text-[18px] font-bold font-mono leading-none tracking-tight block">{el.symbol}</span>
                  <span className="text-[9px] truncate max-w-full block select-none uppercase tracking-[0.05em] opacity-90 mt-0.5">{el.name}</span>
                </div>
                
                {/* Atomic Mass bottom boundary detail */}
                <span className="text-[9px] font-mono select-none opacity-80 tracking-tighter self-end">{el.mass.toFixed(2)}</span>
              </button>
            );
          })}

          {/* Fill Group empty visual indices representing periods 1,2,3 for clean layout references if needed */}
          {/* Group 1-18 numbers above the table */}
          {Array.from({ length: 18 }).map((_, idx) => {
            const groupNum = idx + 1;
            return (
              <div
                key={`group-header-${groupNum}`}
                className="text-center font-mono text-[7px] font-bold text-zinc-500 mb-1"
                style={{ gridColumnStart: groupNum, gridRowStart: 1, transform: 'translateY(-14px)' }}
              >
                {groupNum}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
