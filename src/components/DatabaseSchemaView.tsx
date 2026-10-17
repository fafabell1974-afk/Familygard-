import React, { useState } from 'react';
import { Database, Copy, Check, Table, ShieldCheck, Key, Code2, Link2, CreditCard } from 'lucide-react';
import { SUPABASE_SQL_SCHEMA } from '../data/sql-schema';

interface TableDefinition {
  name: string;
  category: 'core' | 'licensing' | 'hardware';
  description: string;
  columns: Array<{
    name: string;
    type: string;
    constraints?: string;
    description: string;
  }>;
  indexes: string[];
  rlsPolicy: string;
}

const SCHEMA_TABLES: TableDefinition[] = [
  {
    name: 'devices',
    category: 'core',
    description: 'Enregistrement des PC Windows avec empreinte matérielle SHA-256 calculée localement par l\'Agent C#.',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PK, DEFAULT gen_random_uuid()', description: 'Identifiant unique de la machine' },
      { name: 'user_id', type: 'UUID', constraints: 'FK -> profiles.id (CASCADE)', description: 'Propriétaire du PC (optionnel au scan initial)' },
      { name: 'machine_fingerprint', type: 'VARCHAR(64)', constraints: 'UNIQUE, NOT NULL', description: 'SHA-256 (Motherboard UUID + CPU ID + BIOS Serial)' },
      { name: 'hostname', type: 'VARCHAR(128)', constraints: 'NOT NULL', description: 'Nom de la machine Windows' },
      { name: 'bios_uuid', type: 'VARCHAR(64)', constraints: 'NOT NULL', description: 'UUID immuable issu de Win32_ComputerSystemProduct' },
      { name: 'cpu_model', type: 'VARCHAR(128)', constraints: 'NOT NULL', description: 'Nom commercial du processeur' },
      { name: 'os_edition', type: 'VARCHAR(64)', constraints: 'NOT NULL', description: 'Ex: Windows 11 Professionnel' },
      { name: 'os_build', type: 'VARCHAR(32)', constraints: 'NOT NULL', description: 'Ex: 22631.3296' },
      { name: 'agent_version', type: 'VARCHAR(16)', constraints: 'NOT NULL', description: 'Version de l\'exécutable Native AOT' },
      { name: 'last_seen_at', type: 'TIMESTAMPTZ', constraints: 'DEFAULT now()', description: 'Horodatage du dernier contact API' }
    ],
    indexes: ['idx_devices_fingerprint (machine_fingerprint)', 'idx_devices_user (user_id)'],
    rlsPolicy: 'Users view own devices (auth.uid() = user_id)'
  },
  {
    name: 'scans',
    category: 'core',
    description: 'Historique des audits techniques ingérés au format JSONB avec score de santé calculé.',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PK, DEFAULT gen_random_uuid()', description: 'Identifiant unique du diagnostic' },
      { name: 'device_id', type: 'UUID', constraints: 'FK -> devices.id (CASCADE)', description: 'Machine scannée' },
      { name: 'health_score', type: 'SMALLINT', constraints: 'CHECK (0-100)', description: 'Score global de santé calculé' },
      { name: 'score_system', type: 'SMALLINT', constraints: 'CHECK (0-40)', description: 'Sous-score intégrité système & registre' },
      { name: 'score_disk', type: 'SMALLINT', constraints: 'CHECK (0-30)', description: 'Sous-score santé S.M.A.R.T & endurance' },
      { name: 'score_startup', type: 'SMALLINT', constraints: 'CHECK (0-15)', description: 'Sous-score bloatwares & services au boot' },
      { name: 'score_hardware', type: 'SMALLINT', constraints: 'CHECK (0-15)', description: 'Sous-score équilibre & mémoire' },
      { name: 'hardware_payload', type: 'JSONB', constraints: 'NOT NULL', description: 'Spécifications complètes WMI (CM, RAM, CPU, GPU)' },
      { name: 'smart_telemetry', type: 'JSONB', constraints: 'NOT NULL', description: 'Attributs S.M.A.R.T disques (ID 05, 0BB, TBW)' },
      { name: 'system_anomalies', type: 'JSONB', constraints: 'NOT NULL', description: 'Corruptions CBS, clés registre orphelines' },
      { name: 'pdf_report_url', type: 'TEXT', constraints: 'NULLABLE', description: 'URL de téléchargement du rapport généré' }
    ],
    indexes: ['idx_scans_device_created (device_id, created_at DESC)', 'idx_scans_hardware_gin USING GIN (hardware_payload)'],
    rlsPolicy: 'Users view own scans (auth.uid() = user_id)'
  },
  {
    name: 'licenses',
    category: 'licensing',
    description: 'Gestion des paiements Stripe Checkout et des jetons d\'autorisation de réparation.',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PK, DEFAULT gen_random_uuid()', description: 'Identifiant de licence' },
      { name: 'user_id', type: 'UUID', constraints: 'FK -> profiles.id', description: 'Client acheteur' },
      { name: 'device_id', type: 'UUID', constraints: 'FK -> devices.id', description: 'PC pour lequel la réparation est acquise' },
      { name: 'plan_tier', type: 'plan_tier_enum', constraints: 'free | essential_3_50 | pro_ultimate_9_90', description: 'Niveau souscrit' },
      { name: 'stripe_checkout_id', type: 'TEXT', constraints: 'UNIQUE', description: 'Session Stripe Checkout complétée' },
      { name: 'amount_cents', type: 'INTEGER', constraints: '350 ou 990', description: 'Montant en centimes EUR' },
      { name: 'unlock_token_hash', type: 'VARCHAR(64)', constraints: 'NOT NULL', description: 'SHA-256 du jeton d\'exécution pour l\'agent C#' },
      { name: 'status', type: 'license_status_enum', constraints: 'active | consumed | expired', description: 'Cycle de vie de la licence' },
      { name: 'consumed_at', type: 'TIMESTAMPTZ', constraints: 'NULLABLE', description: 'Date de validation de la réparation' }
    ],
    indexes: ['idx_licenses_device_status (device_id, status)', 'idx_licenses_stripe_session (stripe_checkout_id)'],
    rlsPolicy: 'Users view own licenses (auth.uid() = user_id)'
  },
  {
    name: 'repair_executions',
    category: 'licensing',
    description: 'Journal d\'audit des réparations exécutées côté Windows avec diff d\'espace disque libéré.',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PK, DEFAULT gen_random_uuid()', description: 'Session de réparation' },
      { name: 'scan_id', type: 'UUID', constraints: 'FK -> scans.id', description: 'Diagnostic d\'origine' },
      { name: 'license_id', type: 'UUID', constraints: 'FK -> licenses.id', description: 'Licence consommée' },
      { name: 'device_id', type: 'UUID', constraints: 'FK -> devices.id', description: 'Machine réparée' },
      { name: 'status', type: 'repair_status_enum', constraints: 'pending | in_progress | completed | failed', description: 'Statut du pipeline' },
      { name: 'restore_point_created', type: 'BOOLEAN', constraints: 'NOT NULL DEFAULT FALSE', description: 'Confirmation de l\'instantané VSS' },
      { name: 'disk_freed_mb', type: 'INTEGER', constraints: 'DEFAULT 0', description: 'Mégaoctets récupérés par DISM/WinSxS/Caches' },
      { name: 'steps_executed', type: 'JSONB', constraints: 'NOT NULL', description: 'Liste des étapes avec ExitCode et stdout' },
      { name: 'completed_at', type: 'TIMESTAMPTZ', constraints: 'NULLABLE', description: 'Fin d\'exécution' }
    ],
    indexes: ['idx_repair_device (device_id)'],
    rlsPolicy: 'Users view repairs for their devices'
  },
  {
    name: 'motherboards',
    category: 'hardware',
    description: 'Catalogue des cartes mères avec caractéristiques de sockets, chipsets et capacités mémoire.',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PK, DEFAULT gen_random_uuid()', description: 'Identifiant carte mère' },
      { name: 'brand', type: 'VARCHAR(64)', constraints: 'NOT NULL', description: 'Ex: ASUS, MSI, Gigabyte' },
      { name: 'model', type: 'VARCHAR(128)', constraints: 'NOT NULL', description: 'Ex: PRIME B450-PLUS' },
      { name: 'socket', type: 'VARCHAR(32)', constraints: 'NOT NULL', description: 'AM4, AM5, LGA1700, LGA1200' },
      { name: 'chipset', type: 'VARCHAR(32)', constraints: 'NOT NULL', description: 'B450, B550, B650, Z790, H610' },
      { name: 'ram_type', type: 'ram_type_enum', constraints: 'DDR4 | DDR5', description: 'Norme de mémoire vive requise' },
      { name: 'ram_slots', type: 'SMALLINT', constraints: 'DEFAULT 4', description: 'Nombre total de connecteurs DIMM' },
      { name: 'max_ram_gb', type: 'SMALLINT', constraints: 'DEFAULT 128', description: 'Capacité mémoire maximale supportée' },
      { name: 'm2_slots_count', type: 'SMALLINT', constraints: 'DEFAULT 1', description: 'Nombre de ports SSD NVMe M.2' },
      { name: 'pcie_gen', type: 'VARCHAR(16)', constraints: 'Gen3 / Gen4', description: 'Norme de bande passante bus' }
    ],
    indexes: ['idx_mb_socket_chipset (socket, chipset)'],
    rlsPolicy: 'Lecture publique pour tous les clients'
  },
  {
    name: 'hardware_catalog',
    category: 'hardware',
    description: 'Composants d\'upgrade référencés (RAM, SSD, CPU) avec liens d\'affiliation monétisés.',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PK, DEFAULT gen_random_uuid()', description: 'Identifiant composant' },
      { name: 'component_type', type: 'hardware_type_enum', constraints: 'CPU | RAM | SSD_NVME | GPU | PSU', description: 'Catégorie matérielle' },
      { name: 'brand', type: 'VARCHAR(64)', constraints: 'NOT NULL', description: 'Ex: Crucial, AMD, Corsair, Samsung' },
      { name: 'model', type: 'VARCHAR(128)', constraints: 'NOT NULL', description: 'Ex: Vengeance LPX 16GB, Ryzen 5 5600' },
      { name: 'socket_compatibility', type: 'VARCHAR(32)', constraints: 'NULLABLE', description: 'Socket supporté pour les CPU (AM4, etc.)' },
      { name: 'ram_type', type: 'ram_type_enum', constraints: 'NULLABLE', description: 'DDR4 ou DDR5' },
      { name: 'price_eur', type: 'NUMERIC(7,2)', constraints: 'NOT NULL', description: 'Prix moyen constaté en euros' },
      { name: 'affiliate_url', type: 'TEXT', constraints: 'NOT NULL', description: 'Lien direct partenaire (tag d\'affiliation)' },
      { name: 'amazon_asin', type: 'VARCHAR(16)', constraints: 'NULLABLE', description: 'Identifiant catalogue Amazon' }
    ],
    indexes: ['idx_hw_type (component_type, is_active)'],
    rlsPolicy: 'Lecture publique pour tous les clients'
  },
  {
    name: 'motherboard_hardware_compatibilities',
    category: 'hardware',
    description: 'Matrice de correspondance liant cartes mères et composants avec validation 100% sans erreur de pinout.',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PK, DEFAULT gen_random_uuid()', description: 'Identifiant de compatibilité' },
      { name: 'motherboard_id', type: 'UUID', constraints: 'FK -> motherboards.id (CASCADE)', description: 'Carte mère cible' },
      { name: 'hardware_id', type: 'UUID', constraints: 'FK -> hardware_catalog.id (CASCADE)', description: 'Pièce recommandée' },
      { name: 'is_100_percent_verified', type: 'BOOLEAN', constraints: 'NOT NULL DEFAULT TRUE', description: 'Garantie de compatibilité matérielle' },
      { name: 'expected_perf_boost_pct', type: 'SMALLINT', constraints: 'NOT NULL', description: 'Estimation du gain de vélocité (+38%)' },
      { name: 'compatibility_notes', type: 'TEXT', constraints: 'NOT NULL', description: 'Argumentaire technique pour le rapport PDF' }
    ],
    indexes: ['idx_mb_hw_unique (motherboard_id, hardware_id)'],
    rlsPolicy: 'Lecture publique pour tous les clients'
  }
];

export const DatabaseSchemaView: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<TableDefinition>(SCHEMA_TABLES[0]);
  const [copiedSql, setCopiedSql] = useState(false);
  const [viewMode, setViewMode] = useState<'tables' | 'sql_full' | 'stripe_flow'>('tables');

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Editorial Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-2">
          <span>SECTION 03</span>
          <span aria-hidden="true">·</span>
          <span>MODÉLISATION RELATIONNELLE</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white text-balance">
          Structure de la Base de Données (Schéma SQL / Supabase)
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-4xl leading-relaxed">
          Schéma PostgreSQL managé par Supabase avec politiques Row-Level Security (RLS), stockage de la télémétrie en JSONB,
          gestion des licences Stripe et table de correspondance matérielle pour les recommandations d'upgrade (Plan 3).
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('tables')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'tables'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Explorateur des Tables ({SCHEMA_TABLES.length})
          </button>
          <button
            onClick={() => setViewMode('sql_full')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'sql_full'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Script DDL Complet (Prêt pour Supabase)
          </button>
          <button
            onClick={() => setViewMode('stripe_flow')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'stripe_flow'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Architecture Webhook Stripe
          </button>
        </div>

        <button
          onClick={handleCopySql}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors cursor-pointer self-start sm:self-auto"
        >
          {copiedSql ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          <span>{copiedSql ? 'SQL Copié !' : 'Copier Script SQL'}</span>
        </button>
      </div>

      {/* View Mode 1: Table Explorer */}
      {viewMode === 'tables' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Table List Sidebar */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 block mb-2">
              Tables du Schéma
            </span>
            {SCHEMA_TABLES.map((table) => (
              <button
                key={table.name}
                onClick={() => setSelectedTable(table)}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                  selectedTable.name === table.name
                    ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Table className="h-3.5 w-3.5 text-slate-500" />
                  <span className="font-mono">{table.name}</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  table.category === 'hardware'
                    ? 'bg-purple-500/10 text-purple-400'
                    : table.category === 'licensing'
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {table.category}
                </span>
              </button>
            ))}
          </div>

          {/* Table Details */}
          <div className="lg:col-span-3 rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <div className="p-5 border-b border-slate-800 bg-slate-950/40">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-mono">public.</span>
                  <h3 className="text-lg font-bold text-white font-mono">{selectedTable.name}</h3>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 font-mono text-[11px]">
                  {selectedTable.columns.length} colonnes
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {selectedTable.description}
              </p>
            </div>

            {/* Column Grid */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Colonne</th>
                    <th className="py-2.5 px-4">Type PostgreSQL</th>
                    <th className="py-2.5 px-4">Contraintes</th>
                    <th className="py-2.5 px-4">Description Métier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {selectedTable.columns.map((col) => (
                    <tr key={col.name} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-cyan-300">{col.name}</td>
                      <td className="py-3 px-4 font-mono text-purple-400">{col.type}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-amber-300/90">{col.constraints || '—'}</td>
                      <td className="py-3 px-4 text-slate-400">{col.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Indexes & RLS Policy Box */}
            <div className="p-5 border-t border-slate-800 bg-slate-950/40 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-medium block mb-1">Index de Performance :</span>
                <ul className="space-y-1 font-mono text-[11px] text-slate-300">
                  {selectedTable.indexes.map((idx, i) => (
                    <li key={i} className="text-slate-400">• {idx}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-slate-400 font-medium block mb-1">Politique Row-Level Security (RLS) :</span>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-[11px]">
                  {selectedTable.rlsPolicy}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Mode 2: Full SQL Script */}
      {viewMode === 'sql_full' && (
        <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
            <span className="text-xs font-mono text-slate-300">supabase_pulsepc_schema.sql (PostgreSQL 15+)</span>
            <span className="text-xs text-slate-500">Prêt à exécuter dans Supabase SQL Editor</span>
          </div>
          <div className="p-6 overflow-x-auto max-h-[600px] overflow-y-auto">
            <pre className="font-mono text-xs text-slate-300 leading-relaxed">
              <code>{SUPABASE_SQL_SCHEMA}</code>
            </pre>
          </div>
        </div>
      )}

      {/* View Mode 3: Stripe Flow & License Key Architecture */}
      {viewMode === 'stripe_flow' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-indigo-400" />
              <span>Orchestration des Paiements Stripe & Déverrouillage Cryptographique</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Les plans de réparation (Plan 2 à 3,50 € et Plan 3 à 9,90 €) utilisent des sessions Stripe Checkout
              hébergées. La sécurité empêche l'agent local d'exécuter des modifications payantes sans confirmation
              cryptographique vérifiée par le serveur.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-cyan-400 font-bold block mb-2">1. Création de Session Checkout</span>
                <p className="text-slate-400 leading-relaxed">
                  L'utilisateur clique sur le plan choisi. L'API crée une session Stripe avec les métadonnées :
                  <code className="text-cyan-300 block font-mono mt-1 text-[11px]">
                    metadata: &#123; device_id, scan_id, plan_tier &#125;
                  </code>
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-indigo-400 font-bold block mb-2">2. Webhook & Hash SHA-256</span>
                <p className="text-slate-400 leading-relaxed">
                  À la réception de <code className="text-indigo-300 font-mono">checkout.session.completed</code>,
                  le serveur génère 32 octets aléatoires (<code className="text-indigo-300 font-mono">unlock_token</code>),
                  stocke son hash SHA-256 dans la table <code className="text-indigo-300 font-mono">licenses</code> et émet l'ordre signé.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-emerald-400 font-bold block mb-2">3. Validation & Consommation</span>
                <p className="text-slate-400 leading-relaxed">
                  L'Agent Windows présente le token lors de l'exécution. Supabase passe la licence au statut
                  <code className="text-emerald-300 font-mono"> consumed</code> avec horodatage, empêchant tout rejeu ou duplication.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
