import React, { useState } from 'react';
import { ShieldCheck, Key, Lock, ArrowRight, Laptop, Cloud, Database, CreditCard, Copy, Check, Terminal, RefreshCw } from 'lucide-react';
import { ARCHITECTURE_SPEC_SECTIONS } from '../data/architecture-spec';

export const ArchitectureView: React.FC = () => {
  const sectionData = ARCHITECTURE_SPEC_SECTIONS[0];
  const [activeSnippetIndex, setActiveSnippetIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  // HMAC Sandbox State
  const [testSecret, setTestSecret] = useState('agent_sk_live_9f88c2210a44e912b7');
  const [testMachineId, setTestMachineId] = useState('e8f7a90b4c2d1e3f890123456789abcdef0123456789abcdef0123456789abcd');
  const [testPayload, setTestPayload] = useState('{"event":"SCAN_COMPLETED","health_score":54,"anomalies_count":14}');
  const [testTimestamp, setTestTimestamp] = useState(Date.now().toString());
  const [testNonce, setTestNonce] = useState('nonce_7f2b1a9e');
  const [computedSignature, setComputedSignature] = useState('9a4cf330510129bc81e285a85fd160bcda88421b023efd6c29124a9e334cf4b7');
  const [sigStatus, setSigStatus] = useState<'valid' | 'fresh'>('valid');

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const regenerateNonce = () => {
    const newNonce = 'nonce_' + Math.random().toString(36).substring(2, 10);
    const newTime = Date.now().toString();
    setTestNonce(newNonce);
    setTestTimestamp(newTime);
    // Simulate recomputed HMAC
    const fakeHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setComputedSignature(fakeHash);
    setSigStatus('fresh');
  };

  return (
    <div className="space-y-10">
      {/* Editorial Title & Context */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-2">
          <span>SECTION 01</span>
          <span aria-hidden="true">·</span>
          <span>SPÉCIFICATION SYSTÈME</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white text-balance">
          Architecture Globale & Sécurité de Communication
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-4xl leading-relaxed">
          Schéma architectural distribué reliant l'Agent Windows natif (C# .NET 8 AOT), l'API Cloud (Node.js/Next.js),
          la base de données managée Supabase et le moteur de paiement Stripe, avec protocole de signature HMAC-SHA256
          et empreinte matérielle inviolable.
        </p>
      </div>

      {/* Visual Architectural Map */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Topologie du Flux Distribué Micro-Services
            </h2>
          </div>
          <span className="text-xs text-slate-500">Chiffrement TLS 1.3 · Certificate Pinning</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch">
          {/* Node 1: Windows Client */}
          <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-md bg-cyan-500/10 text-cyan-400">
                  <Laptop className="h-5 w-5" />
                </div>
                <span className="text-xs font-mono text-cyan-400">Client Lourd</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Agent Windows Desktop</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Binaire C# .NET 8 Native AOT (~14 Mo) avec manifeste UAC <code className="text-cyan-300">requireAdministrator</code>.
              </p>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• Collecte WMI & S.M.A.R.T</li>
                <li>• Exécuteur DISM & SFC</li>
                <li>• Empreinte SHA-256 locale</li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/60 text-xs text-slate-500">
              Non-intrusif en Plan 1
            </div>
          </div>

          {/* Node 2: API Cloud */}
          <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-md bg-blue-500/10 text-blue-400">
                  <Cloud className="h-5 w-5" />
                </div>
                <span className="text-xs font-mono text-blue-400">Backend API</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Passerelle Orchestratrice</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                API REST Node.js / Next.js avec validation cryptographique et calcul du score de santé (0-100).
              </p>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• Ingestion JSONB haute vitesse</li>
                <li>• Moteur PDF de synthèse</li>
                <li>• Vérification Anti-Replay</li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/60 text-xs text-slate-500">
              Fenêtre de validité : 60s
            </div>
          </div>

          {/* Node 3: Supabase */}
          <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-400">
                  <Database className="h-5 w-5" />
                </div>
                <span className="text-xs font-mono text-emerald-400">PostgreSQL</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Supabase DB & RLS</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Stockage relationnel, isolation par Row-Level Security et base de connaissances matérielles.
              </p>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• Tables Devices & Scans</li>
                <li>• Matrice Motherboard / Socket</li>
                <li>• Index GIN sur télémétrie</li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/60 text-xs text-slate-500">
              RPC compatibilité Plan 3
            </div>
          </div>

          {/* Node 4: Stripe */}
          <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-md bg-indigo-500/10 text-indigo-400">
                  <CreditCard className="h-5 w-5" />
                </div>
                <span className="text-xs font-mono text-indigo-400">Billing</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Stripe Checkout</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Passerelle de paiement sécurisée pour l'achat instantané des Plans Essentiel (3,50 €) ou Pro (9,90 €).
              </p>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• Webhook synchrone</li>
                <li>• Émission de la licence</li>
                <li>• Jeton chiffré unlock_token</li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/60 text-xs text-slate-500">
              Déblocage commande &lt; 2s
            </div>
          </div>
        </div>

        {/* Step-by-Step Security Protocol */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-4">
            Cycle de Vie Sécurisé : Du Diagnostic au Déblocage de la Réparation
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/60">
              <span className="text-cyan-400 font-bold block mb-1">Étape 1 · Empreinte</span>
              <p className="text-slate-400">L'agent calcule son empreinte SHA-256 via WMI et demande un JWT de session éphémère (15 min).</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/60">
              <span className="text-cyan-400 font-bold block mb-1">Étape 2 · Scan Signé</span>
              <p className="text-slate-400">Le rapport de diagnostic est envoyé à l'API avec signature HMAC-SHA256, nonce et horodatage UTC.</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/60">
              <span className="text-cyan-400 font-bold block mb-1">Étape 3 · Paiement Stripe</span>
              <p className="text-slate-400">L'utilisateur souscrit au Plan 2 ou 3. Le webhook Stripe génère une licence et un unlock_token chiffré.</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/60">
              <span className="text-cyan-400 font-bold block mb-1">Étape 4 · Ordre Chiffré</span>
              <p className="text-slate-400">L'Agent vérifie la signature asymétrique de l'ordre avant d'exécuter DISM/SFC avec privilèges administrateur.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive HMAC Signature & Token Playground */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Simulateur Interactif de Signature Cryptographique (HMAC-SHA256)
            </h2>
          </div>
          <button
            onClick={regenerateNonce}
            className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Nouveau Nonce & Horodatage</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">
                Empreinte Matérielle Machine (X-Machine-Fingerprint)
              </label>
              <input
                type="text"
                value={testMachineId}
                onChange={(e) => setTestMachineId(e.target.value)}
                className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-800 font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Horodatage Epoch (X-Pulse-Timestamp)</label>
                <input
                  type="text"
                  value={testTimestamp}
                  readOnly
                  className="w-full px-3 py-2 rounded bg-slate-950/60 border border-slate-800 font-mono text-slate-400"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">Nonce Anti-Replay (X-Pulse-Nonce)</label>
                <input
                  type="text"
                  value={testNonce}
                  readOnly
                  className="w-full px-3 py-2 rounded bg-slate-950/60 border border-slate-800 font-mono text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Secret Partagé Machine (Agent Secret Key)</label>
              <input
                type="text"
                value={testSecret}
                onChange={(e) => setTestSecret(e.target.value)}
                className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-800 font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Corps de Requête Scan (JSON Payload)</label>
              <textarea
                rows={3}
                value={testPayload}
                onChange={(e) => setTestPayload(e.target.value)}
                className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-800 font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Computed Output */}
          <div className="rounded-lg bg-slate-950 border border-slate-800/80 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-300">Résultat de la Signature X-Pulse-Signature</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  HMAC-SHA256 OK
                </span>
              </div>
              <div className="p-3 rounded bg-slate-900/80 border border-slate-800 font-mono text-xs text-cyan-300 break-all select-all">
                {computedSignature}
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-400">
                <p>
                  <strong className="text-slate-300">Formule Canonique :</strong>{' '}
                  <code className="text-cyan-400 font-mono">HMAC_SHA256(timestamp + ":" + nonce + ":" + payload, secret)</code>
                </p>
                <p>
                  <strong className="text-slate-300">Protection Anti-Replay :</strong> L'API compare{' '}
                  <code className="text-slate-300 font-mono">|now - timestamp| &lt; 60 000ms</code> et stocke le nonce dans un cache Redis / mémoire avec TTL 5 minutes.
                </p>
                <p>
                  <strong className="text-slate-300">Timing-Safe Compare :</strong> La vérification serveur utilise{' '}
                  <code className="text-slate-300 font-mono">crypto.timingSafeEqual()</code> pour éliminer toute attaque par analyse temporelle.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-500 flex items-center justify-between">
              <span>Statut de validité</span>
              <span className="text-emerald-400 font-medium">Prêt pour envoi TLS 1.3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Code Snippets Viewer */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            {sectionData.codeSnippets.map((snippet, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSnippetIndex(idx)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  activeSnippetIndex === idx
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {snippet.title}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleCopyCode(sectionData.codeSnippets[activeSnippetIndex].code)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Copié !' : 'Copier le code'}</span>
          </button>
        </div>

        <div className="p-6 bg-slate-950 overflow-x-auto">
          <pre className="font-mono text-xs text-slate-300 leading-relaxed">
            <code>{sectionData.codeSnippets[activeSnippetIndex].code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
