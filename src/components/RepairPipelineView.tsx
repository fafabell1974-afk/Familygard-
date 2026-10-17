import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Play, RotateCcw, ShieldCheck, CheckCircle2, AlertTriangle, HardDrive, Cpu, FileCode, Check } from 'lucide-react';
import { REPAIR_PIPELINE_COMMANDS } from '../data/mock-data';
import { PlanTier, RepairCommandStep } from '../types/pc-saas';

export const RepairPipelineView: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>('pro_ultimate');
  const [activeTab, setActiveTab] = useState<'pipeline_spec' | 'interactive_terminal'>('interactive_terminal');
  
  // Terminal Simulator State
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    'PulsePC Native Agent v2.4.0 (Windows x64 Native AOT)',
    'Type: Authenticated Execution Pipeline',
    'Machine: DESKTOP-TITAN-MK3 [Verified Fingerprint]',
    'Statut: En attente d\'ordre d\'exécution...'
  ]);
  const [diskFreedMb, setDiskFreedMb] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const filteredCommands = REPAIR_PIPELINE_COMMANDS.filter((cmd) => {
    if (selectedPlan === 'essential') {
      return cmd.planRequired === 'essential';
    }
    return true; // pro_ultimate includes both essential and pro_ultimate
  });

  const runSimulation = () => {
    if (isRunning) return;
    setIsRunning(true);
    setIsCompleted(false);
    setCurrentStepIndex(0);
    setDiskFreedMb(0);
    setConsoleLogs([
      `[INIT] Démarrage du pipeline de réparation pour ${selectedPlan === 'essential' ? 'PLAN 2 (ESSENTIEL · 3,50 €)' : 'PLAN 3 (PRO ULTIMATE · 9,90 €)'}`,
      '[SECURITY] Vérification du token d\'autorisation d\'exécution cryptographique... VALIDE',
      '[UAC] Élévation Administrateur confirmée (SeShutdownPrivilege, SeBackupPrivilege, SeRestorePrivilege)',
      '--------------------------------------------------------------------------------'
    ]);
  };

  const resetTerminal = () => {
    setIsRunning(false);
    setCurrentStepIndex(-1);
    setIsCompleted(false);
    setDiskFreedMb(0);
    setConsoleLogs([
      'PulsePC Native Agent v2.4.0 (Windows x64 Native AOT)',
      'Console réinitialisée.',
      'Sélectionnez un plan et cliquez sur "Lancer la Réparation Virtuelle".'
    ]);
  };

  useEffect(() => {
    if (!isRunning || currentStepIndex < 0) return;

    if (currentStepIndex >= filteredCommands.length) {
      setIsRunning(false);
      setIsCompleted(true);
      setConsoleLogs((prev) => [
        ...prev,
        '--------------------------------------------------------------------------------',
        `[SUCCESS] Pipeline terminé avec succès !`,
        `[AUDIT] Espace total assaini & libéré : ${(diskFreedMb / 1024).toFixed(2)} Go`,
        `[HEALTH] Score de santé recalculé : 94 / 100 (+40 pts)`,
        '[SECURITY] Journal d\'exécution archivé dans C:\\ProgramData\\PulsePC\\logs\\repair_audit.json'
      ]);
      return;
    }

    const currentStep = filteredCommands[currentStepIndex];
    
    // Simulate command running
    const timer = setTimeout(() => {
      setConsoleLogs((prev) => [
        ...prev,
        `[STEP ${currentStep.stepNumber}/${filteredCommands.length}] Exécution : ${currentStep.title}`,
        `> ${currentStep.command}`,
        currentStep.category === 'restore_point' 
          ? '  -> Snapshot VSS créé : "PulsePC Pre-Repair Snapshot" (Point de restauration système prêt).'
          : currentStep.category === 'dism'
          ? '  -> DISM : Magasin des composants analysé. 14 bibliothèques CBS corrompues réparées avec succès (ExitCode 0).'
          : currentStep.category === 'sfc'
          ? '  -> SFC : Protection des ressources Windows a trouvé des fichiers endommagés et les a réparés.'
          : currentStep.category === 'registry'
          ? '  -> Registre : 187 clés orphelines éradiquées. Ruche sauvegardée dans C:\\ProgramData\\PulsePC\\backup\\.'
          : currentStep.category === 'services'
          ? '  -> Services : DiagTrack et assistants OEM désactivés. 280 Mo de RAM résidente libérés.'
          : currentStep.category === 'storage_trim'
          ? '  -> Storage : ReTrim complété sur le SSD C: (465 Go). ComponentCleanup ResetBase a libéré 11.2 Go.'
          : currentStep.category === 'ghost_drivers'
          ? '  -> Pilotes : 18 pilotes OEM déconnectés obsolètes purgés du DriverStore.'
          : '  -> Caches : Caches shaders DirectX et SoftwareDistribution vidés (3.4 Go récupérés).'
      ]);

      // Add to freed disk
      if (currentStep.category === 'storage_trim') {
        setDiskFreedMb((prev) => prev + 11400);
      } else if (currentStep.category === 'deep_cache' || currentStep.category === 'registry') {
        setDiskFreedMb((prev) => prev + 3400);
      }

      setCurrentStepIndex((prev) => prev + 1);
    }, 1100);

    return () => clearTimeout(timer);
  }, [isRunning, currentStepIndex]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleLogs]);

  return (
    <div className="space-y-8">
      {/* Editorial Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-2">
          <span>SECTION 02</span>
          <span aria-hidden="true">·</span>
          <span>SPÉCIFICATION DES COMMANDES SYSTÈME</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white text-balance">
          Spécification des Scripts de Réparation (Plans 2 & 3)
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-4xl leading-relaxed">
          Ordonnancement chirurgical des commandes système Windows natives (DISM, SFC, ReTrim, ResetBase, sanitization registre).
          Chaque intervention est protégée par un instantané Shadow Copy (VSS) préalable et exécutée dans un processus C# isolé.
        </p>
      </div>

      {/* Plan Selector & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">
            Plan Ciblé :
          </span>
          <button
            onClick={() => { setSelectedPlan('essential'); resetTerminal(); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedPlan === 'essential'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Plan 2 · Essentiel (3,50 €)
          </button>
          <button
            onClick={() => { setSelectedPlan('pro_ultimate'); resetTerminal(); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedPlan === 'pro_ultimate'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Plan 3 · Pro Ultimate (9,90 €)
          </button>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('interactive_terminal')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'interactive_terminal' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Terminal Interactif & Simulator
          </button>
          <button
            onClick={() => setActiveTab('pipeline_spec')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'pipeline_spec' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Spécification Détaillée des Commandes
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'interactive_terminal' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Terminal Console (2 Cols) */}
          <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl flex flex-col h-[520px]">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80"></div>
                  <div className="h-3 w-3 rounded-full bg-amber-500/80"></div>
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80"></div>
                </div>
                <span className="text-xs font-mono text-slate-400 ml-2">
                  PulsePC Windows Service Console · Admin Elevated
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isRunning && (
                  <span className="text-xs text-cyan-400 animate-pulse font-mono flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
                    Exécution étape {currentStepIndex + 1}/{filteredCommands.length}
                  </span>
                )}
                {isCompleted && (
                  <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Terminé avec succès
                  </span>
                )}
              </div>
            </div>

            {/* Terminal Output */}
            <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-1.5 text-slate-300 bg-slate-950">
              {consoleLogs.map((log, index) => (
                <div
                  key={index}
                  className={`leading-relaxed ${
                    log.startsWith('[INIT]') || log.startsWith('[SECURITY]') || log.startsWith('[UAC]')
                      ? 'text-cyan-400'
                      : log.startsWith('[STEP')
                      ? 'text-amber-300 font-semibold pt-1'
                      : log.startsWith('>')
                      ? 'text-slate-400 pl-2'
                      : log.startsWith('  ->')
                      ? 'text-emerald-300 pl-4'
                      : log.startsWith('[SUCCESS]') || log.startsWith('[HEALTH]')
                      ? 'text-emerald-400 font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  {log}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>

            {/* Terminal Controls */}
            <div className="p-3 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>Espace récupéré :</span>
                <span className="font-mono font-bold text-cyan-400 tabular-nums">
                  {(diskFreedMb / 1024).toFixed(2)} Go
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={resetTerminal}
                  disabled={isRunning}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Réinitialiser</span>
                </button>
                <button
                  onClick={runSimulation}
                  disabled={isRunning}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded shadow-sm shadow-cyan-400/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>{isRunning ? 'Exécution en cours...' : 'Lancer la Réparation Virtuelle'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Safety & Execution Guarantees (1 Col) */}
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center gap-2 text-emerald-400 mb-3">
                <ShieldCheck className="h-4 w-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Garanties de Non-Régression
                </h3>
              </div>
              <ul className="text-xs text-slate-400 space-y-2.5 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span><strong>Point de Restauration VSS obligatoire</strong> créé avant toute opération de registre ou DISM.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span><strong>Sauvegarde de ruche (.reg)</strong> horodatée pour annuler immédiatement tout nettoyage de registre.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span><strong>Zéro script tiers douteux</strong> : exécution stricte des exécutables système signés par Microsoft.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span><strong>Gestion du Code 3010</strong> : interprétation correcte de la demande de redémarrage sans fausse alerte d'erreur.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center gap-2 text-cyan-400 mb-3">
                <HardDrive className="h-4 w-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Différence Plan 2 vs Plan 3
                </h3>
              </div>
              <div className="text-xs space-y-2 text-slate-400">
                <p>
                  <strong className="text-blue-300">Plan 2 (3,50 €) :</strong> Corrige les erreurs Windows (DISM, SFC, Registre, Bloatwares). Idéal pour réparer les crashs et lenteurs logicielles courantes.
                </p>
                <p>
                  <strong className="text-cyan-300">Plan 3 (9,90 €) :</strong> Ajoute l'optimisation physique des SSD (TRIM réel), la purge massive du dossier WinSxS (jusqu'à 12 Go), le nettoyage des pilotes fantômes et le moteur d'upgrades matériels.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Detailed Command Pipeline Table */
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200">
                Inventaire Exhaustif des Commandes Exécutées ({filteredCommands.length} étapes)
              </h3>
              <span className="text-xs text-slate-400">
                Mode d'exécution : PowerShell 7+ / CMD Admin en arrière-plan non-bloquant
              </span>
            </div>

            <div className="divide-y divide-slate-800">
              {filteredCommands.map((step) => (
                <div key={step.id} className="p-5 hover:bg-slate-900/40 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center h-6 w-6 rounded-full bg-slate-800 text-cyan-400 text-xs font-bold font-mono">
                        {step.stepNumber}
                      </span>
                      <h4 className="text-sm font-semibold text-white">{step.title}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded font-mono ${
                        step.planRequired === 'essential'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      }`}>
                        {step.planRequired === 'essential' ? 'Dès Plan 2 (3,50 €)' : 'Exclusif Plan 3 (9,90 €)'}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">~{step.estimatedDurationSec}s</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                    {step.description}
                  </p>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-xs text-cyan-300 overflow-x-auto mb-3">
                    <code>{step.command}</code>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-2 rounded bg-slate-950/40 border border-slate-800/40">
                      <span className="text-slate-500 block mb-0.5 font-medium">Contrôle de Sécurité :</span>
                      <span className="text-slate-300">{step.safetyCheck}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-950/40 border border-slate-800/40">
                      <span className="text-slate-500 block mb-0.5 font-medium">Stratégie Rollback :</span>
                      <span className="text-slate-300">{step.rollbackStrategy}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
