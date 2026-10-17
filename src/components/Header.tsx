import React from 'react';
import { Shield, Terminal, Database, FileText, Cpu, Download } from 'lucide-react';

export type ActiveTab = 'architecture' | 'repair_pipeline' | 'database_schema' | 'hardware_engine' | 'pdf_report' | 'full_doc';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenPricing: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, onOpenPricing }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-md shadow-cyan-500/20">
            <Shield className="h-5 w-5 text-slate-950" />
          </div>
          <button 
            onClick={() => onTabChange('architecture')}
            className="text-left group cursor-pointer"
          >
            <span className="text-base font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
              PulsePC Architect
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          <button
            onClick={() => onTabChange('architecture')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'architecture'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700/80 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            <span>1. Architecture & Sécurité</span>
          </button>

          <button
            onClick={() => onTabChange('repair_pipeline')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'repair_pipeline'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700/80 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>2. Scripts de Réparation</span>
          </button>

          <button
            onClick={() => onTabChange('database_schema')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'database_schema'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700/80 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            <span>3. Schéma SQL Supabase</span>
          </button>

          <button
            onClick={() => onTabChange('hardware_engine')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'hardware_engine'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700/80 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Cpu className="h-3.5 w-3.5" />
            <span>Moteur Matériel (Plan 3)</span>
          </button>

          <button
            onClick={() => onTabChange('pdf_report')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'pdf_report'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700/80 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>4. Rapport PDF Généré</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenPricing}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-700/80 rounded-lg hover:border-cyan-500/50 hover:text-white transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Tarification & Plans</span>
          </button>

          <button
            onClick={() => onTabChange('repair_pipeline')}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 active:scale-98 rounded-lg shadow-sm shadow-cyan-400/20 transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Terminal className="h-4 w-4" />
            <span>Simulateur Agent</span>
          </button>
        </div>
      </div>

      {/* Subnav for mobile / tablet screens */}
      <div className="lg:hidden flex overflow-x-auto gap-2 px-4 py-2 border-t border-slate-800/80 bg-slate-950/60 no-scrollbar">
        <button
          onClick={() => onTabChange('architecture')}
          className={`px-3 py-1 text-xs rounded-md whitespace-nowrap ${
            activeTab === 'architecture' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400'
          }`}
        >
          1. Architecture
        </button>
        <button
          onClick={() => onTabChange('repair_pipeline')}
          className={`px-3 py-1 text-xs rounded-md whitespace-nowrap ${
            activeTab === 'repair_pipeline' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400'
          }`}
        >
          2. Scripts
        </button>
        <button
          onClick={() => onTabChange('database_schema')}
          className={`px-3 py-1 text-xs rounded-md whitespace-nowrap ${
            activeTab === 'database_schema' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400'
          }`}
        >
          3. Base SQL
        </button>
        <button
          onClick={() => onTabChange('hardware_engine')}
          className={`px-3 py-1 text-xs rounded-md whitespace-nowrap ${
            activeTab === 'hardware_engine' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400'
          }`}
        >
          Moteur Matériel
        </button>
        <button
          onClick={() => onTabChange('pdf_report')}
          className={`px-3 py-1 text-xs rounded-md whitespace-nowrap ${
            activeTab === 'pdf_report' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400'
          }`}
        >
          4. Rapport PDF
        </button>
      </div>
    </header>
  );
};
