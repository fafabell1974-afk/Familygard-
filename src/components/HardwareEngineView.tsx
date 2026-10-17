import React, { useState } from 'react';
import { Cpu, CheckCircle2, AlertCircle, ShoppingCart, ExternalLink, Zap, Layers, HardDrive, ArrowUpRight } from 'lucide-react';

interface MockMotherboardProfile {
  id: string;
  name: string;
  vendor: string;
  socket: string;
  chipset: string;
  ramType: 'DDR4' | 'DDR5';
  ramSlots: number;
  currentRamOccupied: number;
  currentRamGb: number;
  currentCpu: string;
  currentDiskType: string;
  m2Available: boolean;
  upgrades: Array<{
    type: 'RAM' | 'SSD_NVME' | 'CPU';
    title: string;
    model: string;
    specs: string;
    priceEur: number;
    perfBoostPct: number;
    whyUpgrade: string;
    compatibilityGuarantee: string;
    affiliateLink: string;
    vendor: string;
  }>;
}

const MOTHERBOARD_PRESETS: MockMotherboardProfile[] = [
  {
    id: 'asus_b450_plus',
    name: 'PRIME B450-PLUS',
    vendor: 'ASUSTeK COMPUTER INC.',
    socket: 'Socket AM4',
    chipset: 'AMD B450',
    ramType: 'DDR4',
    ramSlots: 4,
    currentRamOccupied: 1,
    currentRamGb: 8,
    currentCpu: 'AMD Ryzen 3 3100 (4C/8T)',
    currentDiskType: 'SSD 500Go 94% plein + HDD 1To fatigué',
    m2Available: true,
    upgrades: [
      {
        type: 'RAM',
        title: 'Kit 16 Go (2x8 Go) DDR4 3200MHz Dual-Channel',
        model: 'Corsair Vengeance LPX CL16',
        specs: 'DDR4-3200 PC4-25600, Timing 16-20-20-38, 1.35V XMP 2.0',
        priceEur: 38.99,
        perfBoostPct: 38,
        whyUpgrade: 'Activation du Dual-Channel (passage de 21 Go/s à 42 Go/s de bande passante). Élimine les saccades en multitâche et sur les jeux récents.',
        compatibilityGuarantee: '100% Vérifié : La carte ASUS B450 dispose de 3 slots DIMM libres et supporte jusqu\'à 4400MHz OC.',
        affiliateLink: 'https://amazon.fr/dp/B0143UM4TC?tag=pulsepc-saas-21',
        vendor: 'Amazon FR'
      },
      {
        type: 'CPU',
        title: 'Processeur AMD Ryzen 5 5600 (6 Cores / 12 Threads)',
        model: 'AMD Ryzen 5 5600 Zen 3 Box (avec ventirad Wraith Stealth)',
        specs: 'Architecture Zen 3 7nm, 35 Mo GameCache, Boost 4.4 GHz, TDP 65W',
        priceEur: 114.50,
        perfBoostPct: 62,
        whyUpgrade: 'Multiplie par plus de 2.2 la puissance brute face au Ryzen 3 3100. Idéal pour montage vidéo et fluidité globale.',
        compatibilityGuarantee: '100% Vérifié : Même socket AM4 physique. Nécessite uniquement la mise à jour BIOS ASUS version 3211 (tutoriel inclus).',
        affiliateLink: 'https://amazon.fr/dp/B09VCHR144?tag=pulsepc-saas-21',
        vendor: 'Amazon FR'
      },
      {
        type: 'SSD_NVME',
        title: 'SSD NVMe M.2 1 To PCIe 4.0 haute vitesse',
        model: 'Crucial P3 Plus 1TB M.2 PCIe Gen4 NVMe',
        specs: 'Débits jusqu\'à 5000 Mo/s en lecture séquentielle, endurance 220 TBW',
        priceEur: 69.90,
        perfBoostPct: 85,
        whyUpgrade: 'Remplace le disque dur secondaire mécanique à 12 secteurs réalloués. Débits 45x supérieurs sans bruit mécanique.',
        compatibilityGuarantee: '100% Vérifié : Emplacement M.2_2 disponible sur la carte mère avec visserie standard.',
        affiliateLink: 'https://amazon.fr/dp/B0B25NXWC7?tag=pulsepc-saas-21',
        vendor: 'Amazon FR'
      }
    ]
  },
  {
    id: 'msi_b650_tomahawk',
    name: 'MAG B650 TOMAHAWK WIFI',
    vendor: 'Micro-Star International (MSI)',
    socket: 'Socket AM5',
    chipset: 'AMD B650',
    ramType: 'DDR5',
    ramSlots: 4,
    currentRamOccupied: 2,
    currentRamGb: 16,
    currentCpu: 'AMD Ryzen 5 7600 (6C/12T)',
    currentDiskType: 'SSD NVMe 1 To (50% libre)',
    m2Available: true,
    upgrades: [
      {
        type: 'RAM',
        title: 'Kit 32 Go (2x16 Go) DDR5 6000MHz CL30 EXPO',
        model: 'G.Skill Flare X5 Series DDR5 6000 MT/s',
        specs: 'Certifié AMD EXPO, Timing ultra-bas 30-38-38-96, Sweet Spot Ryzen 7000',
        priceEur: 118.90,
        perfBoostPct: 24,
        whyUpgrade: 'Passe de 16 Go 4800MHz JEDEC à 32 Go 6000MHz CL30 avec profils EXPO activés pour une latence minimale.',
        compatibilityGuarantee: '100% Vérifié : Liste QVL officielle MSI validée pour le contrôleur mémoire Raphael AM5.',
        affiliateLink: 'https://amazon.fr/dp/B0BFG8NP2B?tag=pulsepc-saas-21',
        vendor: 'Amazon FR'
      },
      {
        type: 'SSD_NVME',
        title: 'SSD NVMe 2 To PCIe 4.0 Professionnel',
        model: 'Samsung 990 PRO 2TB PCIe 4.0 NVMe',
        specs: 'Lecture 7450 Mo/s, Écriture 6900 Mo/s, Cache DRAM 2 Go LPDDR4',
        priceEur: 168.00,
        perfBoostPct: 40,
        whyUpgrade: 'Doublement de la capacité de stockage haute vitesse sur le port M.2_2 refroidi par le Shield Frozr MSI.',
        compatibilityGuarantee: '100% Vérifié : 3 slots M.2 PCIe 4.0 disponibles sur la carte mère.',
        affiliateLink: 'https://amazon.fr/dp/B0BHJJ9Y77?tag=pulsepc-saas-21',
        vendor: 'Amazon FR'
      }
    ]
  },
  {
    id: 'laptop_hp_843b',
    name: 'Carte Mère PC Portable HP 843B',
    vendor: 'HP Inc.',
    socket: 'Socket BGA1440 (CPU Soudé)',
    chipset: 'Intel HM370',
    ramType: 'DDR4',
    ramSlots: 2,
    currentRamOccupied: 1,
    currentRamGb: 4,
    currentCpu: 'Intel Core i5-8250U @ 1.60GHz',
    currentDiskType: 'Disque Dur HDD 1To 5400 RPM (Saturé & 48 secteurs défectueux)',
    m2Available: true,
    upgrades: [
      {
        type: 'RAM',
        title: 'Barrette SO-DIMM 8 Go DDR4 2400MHz pour PC Portable',
        model: 'Crucial RAM 8 Go DDR4 2400 MT/s CL17 SO-DIMM',
        specs: 'Format 260-pin SODIMM 1.2V pour ordinateurs portables bureautiques',
        priceEur: 19.99,
        perfBoostPct: 95,
        whyUpgrade: 'Sauve le PC de la saturation mémoire totale (Windows 10/11 consomme à lui seul 3.5 Go sur les 4 Go actuels).',
        compatibilityGuarantee: '100% Vérifié : 1 slot SODIMM secondaire libre accessible sous le capot inférieur.',
        affiliateLink: 'https://amazon.fr/dp/B019FRDKWI?tag=pulsepc-saas-21',
        vendor: 'Amazon FR'
      },
      {
        type: 'SSD_NVME',
        title: 'SSD Interne 2.5" SATA III 500 Go pour remplacement HDD',
        model: 'Crucial MX500 500 Go 3D NAND SATA 2.5"',
        specs: 'Vitesse de lecture 560 Mo/s, protection contre les pannes de courant',
        priceEur: 42.50,
        perfBoostPct: 420,
        whyUpgrade: 'URGENT : Le disque HDD actuel présente 48 secteurs réalloués critiques. Le SSD multiplie la vitesse par 5 et évite le crash.',
        compatibilityGuarantee: '100% Vérifié : Remplacement direct de l\'ancien disque dur 2.5 pouces sans adaptateur.',
        affiliateLink: 'https://amazon.fr/dp/B0784SL728?tag=pulsepc-saas-21',
        vendor: 'Amazon FR'
      }
    ]
  }
];

export const HardwareEngineView: React.FC = () => {
  const [selectedMbIndex, setSelectedMbIndex] = useState(0);
  const currentMb = MOTHERBOARD_PRESETS[selectedMbIndex];

  return (
    <div className="space-y-8">
      {/* Editorial Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-2">
          <span>FONCTIONNALITÉ EXCLUSIVE PLAN 3 (9,90 €)</span>
          <span aria-hidden="true">·</span>
          <span>MOTEUR D'AFFILIATION & COMPATIBILITÉ</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white text-balance">
          Moteur de Recommandations Matérielles 100% Compatibles
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-4xl leading-relaxed">
          Algorithme d'analyse croisée entre les composants inventoriés par l'Agent Windows (Carte mère, socket, slots RAM libres,
          norme PCIe) et la base relationnelle Supabase. Détecte les bottlenecks physiques et génère des suggestions d'achat certifiées
          sans incompatibilité, monétisées avec des liens d'affiliation.
        </p>
      </div>

      {/* Preset Selector */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
          Simuler la Détection sur une Carte Mère :
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {MOTHERBOARD_PRESETS.map((preset, idx) => (
            <button
              key={preset.id}
              onClick={() => setSelectedMbIndex(idx)}
              className={`p-3.5 rounded-lg text-left transition-all border cursor-pointer ${
                selectedMbIndex === idx
                  ? 'bg-slate-800 border-cyan-500/50 shadow-xs'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white font-mono">{preset.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono">
                  {preset.socket}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                {preset.vendor} · {preset.ramType} ({preset.ramSlots} slots)
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Diagnostic Findings on Selected Hardware */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Analyse Physique de la Machine ({currentMb.vendor} {currentMb.name})
            </h2>
          </div>
          <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Validation Pinout & Chipset 100% Conforme
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80">
            <span className="text-slate-500 block mb-1">Socket Processeur</span>
            <span className="text-white font-mono font-bold text-sm">{currentMb.socket}</span>
            <span className="text-slate-400 block mt-1">Chipset {currentMb.chipset}</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80">
            <span className="text-slate-500 block mb-1">Topologie Mémoire RAM</span>
            <span className="text-white font-mono font-bold text-sm">
              {currentMb.currentRamGb} Go ({currentMb.ramType})
            </span>
            <span className="text-amber-400 block mt-1">
              {currentMb.currentRamOccupied}/{currentMb.ramSlots} slots utilisés ({currentMb.ramSlots - currentMb.currentRamOccupied} libres)
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80">
            <span className="text-slate-500 block mb-1">Processeur Actuel</span>
            <span className="text-white font-mono font-bold text-sm truncate block" title={currentMb.currentCpu}>
              {currentMb.currentCpu}
            </span>
            <span className="text-slate-400 block mt-1">Évaluation Bottleneck</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80">
            <span className="text-slate-500 block mb-1">Stockage Principal</span>
            <span className="text-white font-mono font-bold text-xs truncate block" title={currentMb.currentDiskType}>
              {currentMb.currentDiskType}
            </span>
            <span className="text-cyan-400 block mt-1">Port M.2 disponible</span>
          </div>
        </div>
      </div>

      {/* Generated Upgrades List with Affiliate Links */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200">
            Composants d'Upgrade Recommandés & Liens d'Affiliation Vérifiés ({currentMb.upgrades.length})
          </h3>
          <span className="text-xs text-slate-400">
            Monétisation SaaS : 4% à 8% de commission d'affiliation par pièce achetée
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {currentMb.upgrades.map((upgrade, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 hover:border-cyan-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
                    upgrade.type === 'RAM'
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      : upgrade.type === 'CPU'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    UPGRADE {upgrade.type}
                  </span>
                  <h4 className="text-sm font-bold text-white">{upgrade.title}</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    +{upgrade.perfBoostPct}% de gain estimé
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {upgrade.whyUpgrade}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                  <span className="font-mono text-cyan-300 text-[11px]">
                    Spécifications : {upgrade.specs}
                  </span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="text-slate-400 text-[11px]">
                    {upgrade.compatibilityGuarantee}
                  </span>
                </div>
              </div>

              {/* Price & Affiliate CTA */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-800">
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Prix moyen vérifié</span>
                  <span className="text-lg font-bold font-mono text-white tabular-nums">
                    {upgrade.priceEur.toFixed(2)} €
                  </span>
                </div>

                <a
                  href={upgrade.affiliateLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm shadow-cyan-400/20 transition-all cursor-pointer"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  <span>Acheter sur {upgrade.vendor}</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
