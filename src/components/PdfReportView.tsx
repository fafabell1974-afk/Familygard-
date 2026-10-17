import React, { useState } from 'react';
import { Printer, Download, ShieldCheck, AlertCircle, HardDrive, Cpu, Zap, Activity, ExternalLink, CheckCircle2 } from 'lucide-react';
import { SAMPLE_PC_SCANS, SAMPLE_HARDWARE_RECOMMENDATIONS } from '../data/mock-data';
import { ScanDiagnostic } from '../types/pc-saas';

export const PdfReportView: React.FC = () => {
  const [selectedScanIndex, setSelectedScanIndex] = useState<number>(0);
  const scan: ScanDiagnostic = SAMPLE_PC_SCANS[selectedScanIndex];

  const handlePrint = () => {
    window.print();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 50) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'EXCELLENT · SYSTÈME SAIN';
    if (score >= 50) return 'DÉGRADÉ · OPTIMISATION REQUISE';
    return 'CRITIQUE · ACTION IMMÉDIATE';
  };

  return (
    <div className="space-y-8">
      {/* Editorial Title & Controls (Hidden in Print) */}
      <div className="no-print">
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-2">
          <span>SECTION 04</span>
          <span aria-hidden="true">·</span>
          <span>MODÈLE DE SYNTHÈSE VECTORIELLE</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white text-balance">
              Structure du Rapport PDF Généré
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-3xl leading-relaxed">
              Maquette haute fidélité du document PDF délivré à l'utilisateur : Score de santé pondéré (0-100),
              analyse d'usure des disques S.M.A.R.T, audit de corruption Windows et propositions d'upgrades matériels.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Profile Selector */}
            <select
              value={selectedScanIndex}
              onChange={(e) => setSelectedScanIndex(Number(e.target.value))}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value={0}>Profil 1 : PC Gaming Dégradé (Plan 3 Pro Ultimate)</option>
              <option value={1}>Profil 2 : PC Bureautique HDD Épuisé (Plan 1 Gratuit)</option>
            </select>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm shadow-cyan-400/20 transition-all cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Imprimer / Exporter PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* The Printable A4 Report Canvas */}
      <div className="mx-auto max-w-4xl bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl p-6 sm:p-10 space-y-8 print:p-0 print:border-none print:shadow-none print:bg-white print:text-slate-900">
        {/* PDF Header / Cartouche */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800 print:border-slate-300">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded bg-cyan-500 text-slate-950 font-black flex items-center justify-center text-sm">
                P
              </div>
              <span className="text-lg font-extrabold tracking-tight text-white print:text-slate-900">
                PulsePC Health Diagnostic Report
              </span>
            </div>
            <div className="text-xs text-slate-400 print:text-slate-600 font-mono">
              Scan ID: <strong className="text-cyan-400 print:text-slate-900">{scan.scanId}</strong> · Horodatage UTC: {scan.createdAt}
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold font-mono uppercase ${
              scan.plan === 'pro_ultimate'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}>
              {scan.plan === 'pro_ultimate' ? 'PLAN 3 · PRO ULTIMATE' : 'PLAN 1 · DIAGNOSTIC GRATUIT'}
            </span>
            <div className="text-xs text-slate-400 print:text-slate-600 font-mono">
              Agent x64 Native AOT v2.4.0
            </div>
          </div>
        </div>

        {/* Machine Identity Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs p-4 rounded-xl bg-slate-900/60 print:bg-slate-100 border border-slate-800/80 print:border-slate-300">
          <div>
            <span className="text-slate-500 print:text-slate-600 block">Nom d'Hôte</span>
            <span className="font-mono font-bold text-white print:text-slate-900">{scan.machineHostname}</span>
          </div>
          <div>
            <span className="text-slate-500 print:text-slate-600 block">Système d'Exploitation</span>
            <span className="font-bold text-white print:text-slate-900">{scan.hardware.os.edition}</span>
          </div>
          <div>
            <span className="text-slate-500 print:text-slate-600 block">Processeur CPU</span>
            <span className="font-bold text-white print:text-slate-900 truncate block">{scan.hardware.cpu.name}</span>
          </div>
          <div>
            <span className="text-slate-500 print:text-slate-600 block">Carte Mère Détectée</span>
            <span className="font-bold text-white print:text-slate-900 truncate block">
              {scan.hardware.motherboard.vendor} {scan.hardware.motherboard.product}
            </span>
          </div>
        </div>

        {/* Section 1: Health Score Box */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 print:from-slate-50 print:to-slate-100 border border-slate-800 print:border-slate-300">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className={`h-24 w-24 rounded-2xl border-2 flex flex-col items-center justify-center font-mono ${getScoreColor(scan.healthScore)}`}>
                <span className="text-3xl font-extrabold tracking-tight tabular-nums">{scan.healthScore}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400">sur 100</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 print:text-cyan-700">
                  {getScoreLabel(scan.healthScore)}
                </span>
                <h3 className="text-base font-bold text-white print:text-slate-900">
                  Synthèse Globale de Santé de la Machine
                </h3>
                <p className="text-xs text-slate-400 print:text-slate-600 max-w-md leading-relaxed">
                  Calculé sur 4 piliers d'ingénierie : intégrité des binaires Windows, endurance S.M.A.R.T, surcharge au démarrage et adéquation de la bande passante RAM.
                </p>
              </div>
            </div>

            {/* Score Breakdown Bars */}
            <div className="w-full md:w-64 space-y-2 text-xs font-mono">
              <div>
                <div className="flex justify-between text-slate-400 print:text-slate-700 mb-1">
                  <span>Intégrité Système</span>
                  <span className="text-white print:text-slate-900 font-bold">{scan.scoreBreakdown.systemIntegrity} / 40</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400" style={{ width: `${(scan.scoreBreakdown.systemIntegrity / 40) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 print:text-slate-700 mb-1">
                  <span>Santé Disque S.M.A.R.T</span>
                  <span className="text-white print:text-slate-900 font-bold">{scan.scoreBreakdown.diskHealth} / 30</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400" style={{ width: `${(scan.scoreBreakdown.diskHealth / 30) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 print:text-slate-700 mb-1">
                  <span>Surcharge Boot & Services</span>
                  <span className="text-white print:text-slate-900 font-bold">{scan.scoreBreakdown.startupAndServices} / 15</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400" style={{ width: `${(scan.scoreBreakdown.startupAndServices / 15) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 print:text-slate-700 mb-1">
                  <span>Équilibre Matériel & RAM</span>
                  <span className="text-white print:text-slate-900 font-bold">{scan.scoreBreakdown.hardwareBalance} / 15</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-400" style={{ width: `${(scan.scoreBreakdown.hardwareBalance / 15) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Critical Alerts Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-slate-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-400" />
              <span>Anomalies Prioritaires Détectées ({scan.criticalAlerts.length})</span>
            </h4>
            <span className="text-xs text-slate-500 font-mono">Ordre de criticité décroissant</span>
          </div>

          <div className="divide-y divide-slate-800 print:divide-slate-200 rounded-xl border border-slate-800 print:border-slate-300 overflow-hidden">
            {scan.criticalAlerts.map((alert, i) => (
              <div key={i} className="p-4 bg-slate-900/40 print:bg-white flex items-start gap-4">
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold shrink-0 ${
                  alert.level === 'critical'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {alert.level}
                </span>
                <div className="space-y-1 flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <strong className="text-white print:text-slate-900">{alert.title}</strong>
                    <span className="text-slate-500 print:text-slate-600 font-mono text-[11px]">
                      {alert.category}
                    </span>
                  </div>
                  <p className="text-slate-400 print:text-slate-600">{alert.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Detailed Subsystem Diagnostic */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-slate-800">
            Détail des Métriques Collectées par l'Agent
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Storage S.M.A.R.T telemetry */}
            <div className="p-4 rounded-xl border border-slate-800 print:border-slate-300 bg-slate-900/40 print:bg-white space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="font-bold text-white print:text-slate-900 flex items-center gap-1.5">
                  <HardDrive className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Stockage & Endurance S.M.A.R.T</span>
                </span>
                <span className="text-[11px] font-mono text-cyan-400">
                  {scan.hardware.storage.length} volume(s)
                </span>
              </div>
              {scan.hardware.storage.map((disk) => (
                <div key={disk.id} className="space-y-1 text-[11px] text-slate-400 print:text-slate-600">
                  <div className="flex justify-between font-mono">
                    <strong className="text-slate-200 print:text-slate-900">{disk.driveLetter} {disk.model}</strong>
                    <span className={disk.smartStatus === 'OK' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {disk.smartStatus}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Espace Libre : {disk.freeGb} Go / {disk.totalGb} Go ({Math.round((disk.freeGb / disk.totalGb) * 100)}%)</span>
                    <span>Santé : {disk.healthPct}% · {disk.temperatureC}°C</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Secteurs réalloués : {disk.reallocatedSectors}</span>
                    <span>Heures en service : {disk.powerOnHours} h</span>
                  </div>
                </div>
              ))}
            </div>

            {/* RAM & Hardware Topology */}
            <div className="p-4 rounded-xl border border-slate-800 print:border-slate-300 bg-slate-900/40 print:bg-white space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="font-bold text-white print:text-slate-900 flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5 text-purple-400" />
                  <span>Mémoire Vive & Slots Carte Mère</span>
                </span>
                <span className="text-[11px] font-mono text-purple-400">
                  {scan.hardware.ram.channelMode}
                </span>
              </div>
              <div className="space-y-1.5 text-[11px] text-slate-400 print:text-slate-600">
                <div className="flex justify-between">
                  <span>Capacité Installée :</span>
                  <strong className="text-white print:text-slate-900 font-mono">{scan.hardware.ram.totalGb} Go {scan.hardware.motherboard.ramType}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Fréquence Horloge :</span>
                  <span className="text-white print:text-slate-900 font-mono">{scan.hardware.ram.speedMhz} MHz</span>
                </div>
                <div className="flex justify-between">
                  <span>Occupation des Slots :</span>
                  <span className="text-amber-400 font-mono font-bold">
                    {scan.hardware.motherboard.ramSlotsUsed} sur {scan.hardware.motherboard.ramSlotsTotal} slots DIMM
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Capacité Max Carte Mère :</span>
                  <span className="text-slate-300 print:text-slate-700 font-mono">{scan.hardware.motherboard.ramMaxCapacityGb} Go</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Hardware Upgrades Recommendations (Exclusive Plan 3) */}
        {scan.plan === 'pro_ultimate' && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 print:text-cyan-800 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span>Recommandations Matérielles 100% Compatibles (Plan 3)</span>
              </h4>
              <span className="text-[11px] text-slate-500 font-mono">Socket & QVL vérifiés</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SAMPLE_HARDWARE_RECOMMENDATIONS.map((upg) => (
                <div
                  key={upg.id}
                  className="p-3.5 rounded-xl border border-slate-800 print:border-slate-300 bg-slate-900/60 print:bg-slate-50 flex flex-col justify-between space-y-2 text-xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono font-bold">
                        {upg.componentType}
                      </span>
                      <span className="font-mono font-bold text-white print:text-slate-900">
                        {upg.targetPriceEur.toFixed(2)} €
                      </span>
                    </div>
                    <strong className="text-white print:text-slate-900 block text-xs">{upg.title}</strong>
                    <p className="text-[11px] text-slate-400 print:text-slate-600 mt-1 leading-relaxed">
                      {upg.estimatedPerformanceBoost}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-800/60 text-[10px] text-emerald-400 print:text-emerald-700 font-mono">
                    ✓ 100% Conforme {scan.hardware.motherboard.product}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PDF Footer & Certification Seal */}
        <div className="pt-6 border-t border-slate-800 print:border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[10px] text-slate-500 font-mono">
          <div>
            <span>Certificat Cryptographique d'Audit :</span>
            <span className="block text-slate-400 print:text-slate-700 truncate max-w-sm">
              SHA256: {scan.machineFingerprint.substring(0, 32)}...
            </span>
          </div>
          <div className="text-left sm:text-right">
            <span>PulsePC Cloud Engine · Architecture Micro-services</span>
            <span className="block text-slate-600">Conforme RGPD & Confidentialité Matérielle</span>
          </div>
        </div>
      </div>
    </div>
  );
};
