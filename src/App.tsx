import React, { useState } from 'react';
import { Header, ActiveTab } from './components/Header';
import { ArchitectureView } from './components/ArchitectureView';
import { RepairPipelineView } from './components/RepairPipelineView';
import { DatabaseSchemaView } from './components/DatabaseSchemaView';
import { HardwareEngineView } from './components/HardwareEngineView';
import { PdfReportView } from './components/PdfReportView';
import { TechnicalWhitepaperView } from './components/TechnicalWhitepaperView';
import { PricingModal } from './components/PricingModal';
import { PlanTier } from './types/pc-saas';
import { ShieldCheck, BookOpen, Layers, Terminal, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('architecture');
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [activePlanTier, setActivePlanTier] = useState<PlanTier>('pro_ultimate');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenPricing={() => setIsPricingOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-8">
        {activeTab === 'architecture' && <ArchitectureView />}
        {activeTab === 'repair_pipeline' && <RepairPipelineView />}
        {activeTab === 'database_schema' && <DatabaseSchemaView />}
        {activeTab === 'hardware_engine' && <HardwareEngineView />}
        {activeTab === 'pdf_report' && <PdfReportView />}
        {activeTab === 'full_doc' && <TechnicalWhitepaperView />}
      </main>

      {/* Pricing Modal */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        onSelectPlan={(plan) => {
          setActivePlanTier(plan);
        }}
      />

      {/* Footer */}
      <footer className="no-print border-t border-slate-800/80 bg-slate-950 py-8 px-4 sm:px-6 mt-12">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">PulsePC Architect</span>
            <span aria-hidden="true">·</span>
            <span>Spécification Micro-services & Agent Windows .NET 8 AOT</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('full_doc')}
              className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Dossier Technique Exhaustif</span>
            </button>
            <span aria-hidden="true">·</span>
            <span>Supabase PostgreSQL + Stripe Billing</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
