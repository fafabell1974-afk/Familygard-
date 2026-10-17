import { PlanConfig, ScanDiagnostic, RepairCommandStep, HardwareUpgradeRecommendation } from '../types/pc-saas';

export const PLANS: PlanConfig[] = [
  {
    id: 'free',
    name: 'Plan 1 · Gratuit',
    priceEur: 0,
    badge: 'Diagnostic Offert',
    description: 'Analyse intégrale du matériel, disques S.M.A.R.T, registre et démarrage avec synthèse PDF globale.',
    features: [
      'Audit matériel complet (CPU, RAM, Carte mère, GPU)',
      'Contrôle d\'usure et santé S.M.A.R.T des SSD/HDD',
      'Détection des fichiers système corrompus (CBS)',
      'Inventaire des bloatwares et services au boot',
      'Génération du rapport PDF de synthèse (Score 0-100)',
      'Mode lecture seule (aucune modification du système)'
    ],
    repairsIncluded: false,
    hardwareRecommendations: false,
    deepOptimization: false
  },
  {
    id: 'essential',
    name: 'Plan 2 · Essentiel',
    priceEur: 3.50,
    badge: 'Le Plus Populaire',
    description: 'Réparation automatique des fichiers système corrompus, nettoyage registre et accélération du démarrage.',
    features: [
      'Toutes les analyses du Plan Gratuit',
      'Création automatique d\'un Point de Restauration Système',
      'Réparation automatisée de l\'image Windows (DISM)',
      'Restauration de l\'intégrité des fichiers système (SFC)',
      'Sanitization et nettoyage du Registre Windows',
      'Désactivation des bloatwares & télémétries agressives',
      'Purge sécurisée des fichiers temporaires (%TEMP%, Prefetch)',
      'Rapport PDF avec journal d\'audit des réparations'
    ],
    repairsIncluded: true,
    hardwareRecommendations: false,
    deepOptimization: false
  },
  {
    id: 'pro_ultimate',
    name: 'Plan 3 · Pro Ultimate',
    priceEur: 9.90,
    badge: 'Remise en État Intégrale',
    description: 'Optimisation de pointe du stockage, purge des caches profonds et moteur d\'upgrades matériels 100% compatibles.',
    features: [
      'Toutes les réparations du Plan Essentiel (DISM + SFC)',
      'Optimisation des volumes SSD via commandes TRIM réelles',
      'Nettoyage profond du composant WinSxS (gain jusqu\'à 10 Go)',
      'Purge des pilotes fantômes (Ghost Drivers) déconnectés',
      'Vidage des caches DirectX / GPU Shaders et Windows Update',
      'Moteur de Recommandations Matérielles 100% Compatibles',
      'Détection Carte Mère / Socket / RAM Slots libres',
      'Liens d\'affiliation certifiés (Amazon / Distributeurs)',
      'Rapport PDF Deluxe avec plan d\'évolution matérielle'
    ],
    repairsIncluded: true,
    hardwareRecommendations: true,
    deepOptimization: true
  }
];

export const REPAIR_PIPELINE_COMMANDS: RepairCommandStep[] = [
  {
    id: 'step_restore_point',
    stepNumber: 1,
    category: 'restore_point',
    title: 'Snapshot de Sécurité (Restauration Système)',
    command: 'powershell -NoProfile -Command "Checkpoint-Computer -Description \\"PulsePC Pre-Repair Snapshot\\" -RestorePointType \\"MODIFY_SETTINGS\\""',
    description: 'Crée un instantané VSS complet de l\'état de la machine avant toute manipulation de registre ou binaire.',
    planRequired: 'essential',
    estimatedDurationSec: 12,
    safetyCheck: 'Vérification de l\'état du service VSS (Volume Shadow Copy) et espace disque minimal de 1 Go sur C:',
    rollbackStrategy: 'Possibilité de retour arrière instantané via RSTRUI.exe ou la console de récupération Windows.'
  },
  {
    id: 'step_dism_check',
    stepNumber: 2,
    category: 'dism',
    title: 'Diagnostic de l\'Image Windows (DISM ScanHealth)',
    command: 'dism.exe /Online /Cleanup-Image /ScanHealth',
    description: 'Analyse le magasin de composants Windows (WinSxS) pour détecter les corruptions de packages et signatures invalides.',
    planRequired: 'essential',
    estimatedDurationSec: 45,
    safetyCheck: 'Vérifie que Windows Update ou TrustedInstaller n\'ont pas de verrou exclusif en cours.',
    rollbackStrategy: 'Opération en lecture seule sans impact sur les fichiers en place.'
  },
  {
    id: 'step_dism_repair',
    stepNumber: 3,
    category: 'dism',
    title: 'Restauration de l\'Image Windows (DISM RestoreHealth)',
    command: 'dism.exe /Online /Cleanup-Image /RestoreHealth',
    description: 'Répare automatiquement les fichiers corrompus du store système en téléchargeant les manifests officiels Microsoft.',
    planRequired: 'essential',
    estimatedDurationSec: 90,
    safetyCheck: 'Connexion réseau vérifiée vers les serveurs de catalogage Windows Update ou image WIM locale.',
    rollbackStrategy: 'Les fichiers remplacés sont archivés dans CBS.log avec copie de sauvegarde automatique.'
  },
  {
    id: 'step_sfc',
    stepNumber: 4,
    category: 'sfc',
    title: 'Vérification et Restauration Fichiers Protégés (SFC)',
    command: 'sfc.exe /scannow',
    description: 'Scanne l\'ensemble des DLL et exécutables système protégés et remplace les copies altérées depuis WinSxS.',
    planRequired: 'essential',
    estimatedDurationSec: 60,
    safetyCheck: 'Vérification préalable du succès de DISM RestoreHealth pour garantir l\'intégrité de la source WinSxS.',
    rollbackStrategy: 'Audit complet exporté dans C:\\Windows\\Logs\\CBS\\CBS.log.'
  },
  {
    id: 'step_registry',
    stepNumber: 5,
    category: 'registry',
    title: 'Nettoyage Ciblé du Registre Windows',
    command: 'powershell -NoProfile -ExecutionPolicy Bypass -File .\\scripts\\Clean-OrphanRegistryKeys.ps1',
    description: 'Supprime les clés Run orphelines (programmes désinstallés pointant vers du vide), CLSID sans binaire et références MUI invalides.',
    planRequired: 'essential',
    estimatedDurationSec: 8,
    safetyCheck: 'Sauvegarde préalable de la ruche dans C:\\ProgramData\\PulsePC\\backup\\reg_backup_<timestamp>.reg',
    rollbackStrategy: 'Restauration automatique via reg import si code d\'erreur > 0.'
  },
  {
    id: 'step_services_bloatware',
    stepNumber: 6,
    category: 'services',
    title: 'Désactivation des Télémétries & Bloatwares de Démarrage',
    command: 'powershell -NoProfile -ExecutionPolicy Bypass -File .\\scripts\\Optimize-StartupServices.ps1',
    description: 'Passe en démarrage "Manuel" les services DiagTrack (télémétrie), dmwappushservice et assistants constructeurs invasifs.',
    planRequired: 'essential',
    estimatedDurationSec: 6,
    safetyCheck: 'Whitelist stricte des services essentiels (Spooler, Audio, Réseau, Sécurité Defender préservés à 100%).',
    rollbackStrategy: 'Fichier de réversibilité JSON stockant l\'état de démarrage d\'origine (Automatic / Manual / Disabled).'
  },
  {
    id: 'step_trim_storage',
    stepNumber: 7,
    category: 'storage_trim',
    title: 'Optimisation Stockage SSD & NVMe (ReTrim)',
    command: 'powershell -NoProfile -Command "Optimize-Volume -DriveLetter C -ReTrim -Verbose"',
    description: 'Envoie la commande TRIM au contrôleur du SSD afin d\'effacer les blocs de mémoire flash libérés et restaurer les débits d\'écriture.',
    planRequired: 'pro_ultimate',
    estimatedDurationSec: 15,
    safetyCheck: 'Détection du type de média physique (TRIM exécuté uniquement sur SSD/NVMe ; HDD soumis à defrag optimisée).',
    rollbackStrategy: 'Commande native Windows non destructive conforme aux spécifications SATA/NVMe.'
  },
  {
    id: 'step_winsxs_cleanup',
    stepNumber: 8,
    category: 'storage_trim',
    title: 'Purge Profonde WinSxS & ResetBase',
    command: 'dism.exe /Online /Cleanup-Image /StartComponentCleanup /ResetBase',
    description: 'Supprime toutes les versions antérieures obsolètes des composants Windows Update mis à jour pour récupérer de 3 à 12 Go.',
    planRequired: 'pro_ultimate',
    estimatedDurationSec: 110,
    safetyCheck: 'Valide qu\'aucune mise à jour Windows cumulative n\'est en attente de redémarrage.',
    rollbackStrategy: 'Windows interdit le rollback des anciennes mises à jour purgées mais maintient la stabilité parfaite de la version actuelle.'
  },
  {
    id: 'step_ghost_drivers',
    stepNumber: 9,
    category: 'ghost_drivers',
    title: 'Purge des Pilotes Fantômes et Périphériques Déconnectés',
    command: 'powershell -NoProfile -ExecutionPolicy Bypass -File .\\scripts\\Purge-GhostDrivers.ps1',
    description: 'Supprime les résidus OEM dans le DriverStore (anciens packages graphiques AMD/NVIDIA obsolètes et clés de clés USB inexistantes).',
    planRequired: 'pro_ultimate',
    estimatedDurationSec: 25,
    safetyCheck: 'Utilisation de pnputil.exe avec vérification du statut "Present: False" et package orphelin.',
    rollbackStrategy: 'Les pilotes actifs actuellement connectés sont protégés en écriture.'
  },
  {
    id: 'step_deep_cache',
    stepNumber: 10,
    category: 'deep_cache',
    title: 'Purge des Caches Shaders DirectX & SoftwareDistribution',
    command: 'powershell -NoProfile -ExecutionPolicy Bypass -File .\\scripts\\Clean-DeepCaches.ps1',
    description: 'Arrête temporairement wuauserv, purge le cache SoftwareDistribution/Download et vide les caches corrompus DirectX D3D/NVIDIA/AMD.',
    planRequired: 'pro_ultimate',
    estimatedDurationSec: 18,
    safetyCheck: 'Redémarrage garanti des services système (wuauserv, cryptsvc) dans le bloc finally.',
    rollbackStrategy: 'Les shaders et métadonnées de mise à jour se reconstruisent automatiquement de manière saine au prochain lancement.'
  }
];

export const SAMPLE_PC_SCANS: ScanDiagnostic[] = [
  {
    scanId: 'SCN-2026-8891-GAMING',
    createdAt: '2026-10-17 14:22:04 UTC',
    machineFingerprint: 'e8f7a90b4c2d1e3f890123456789abcdef0123456789abcdef0123456789abcd',
    machineHostname: 'DESKTOP-TITAN-MK3',
    plan: 'pro_ultimate',
    healthScore: 54,
    scoreBreakdown: {
      systemIntegrity: 22, // /40
      diskHealth: 16,     // /30
      startupAndServices: 7, // /15
      hardwareBalance: 9   // /15
    },
    systemAnomalies: {
      cbsCorruptedFiles: 14,
      dismErrorsFound: true,
      brokenRegistryKeys: 187,
      tempFilesSizeBytes: 14800000000, // 14.8 GB
      bloatwareServicesCount: 9,
      ghostDriversCount: 18,
      startupDelaySeconds: 42
    },
    criticalAlerts: [
      {
        level: 'critical',
        category: 'Système',
        title: 'Magasin WinSxS corrompu (Code CBS 0x800f081f)',
        description: '14 bibliothèques système critiques altérées provoquant des micro-freezes et des crashs aléatoires.',
        remediationPlan: 'essential'
      },
      {
        level: 'warning',
        category: 'Stockage',
        title: 'SSD NVMe C: saturé à 94% & TRIM inactif',
        description: 'Moins de 28 Go libres sur 512 Go. Baisse drastique des performances en écriture aléatoire.',
        remediationPlan: 'pro_ultimate'
      },
      {
        level: 'warning',
        category: 'Mémoire RAM',
        title: 'Single-Channel détecté (1x 8 Go DDR4-2666)',
        description: 'Bande passante mémoire bridée de 50%. 3 slots DIMM disponibles sur la carte mère.',
        remediationPlan: 'pro_ultimate'
      }
    ],
    hardware: {
      motherboard: {
        vendor: 'ASUSTeK COMPUTER INC.',
        product: 'PRIME B450-PLUS',
        chipset: 'AMD B450',
        socket: 'AM4',
        ramType: 'DDR4',
        ramSlotsTotal: 4,
        ramSlotsUsed: 1,
        ramMaxCapacityGb: 128,
        pcieGen: 'PCIe 3.0 / 4.0 (selon CPU)',
        m2SlotsTotal: 2,
        m2SlotsUsed: 1
      },
      cpu: {
        name: 'AMD Ryzen 3 3100 4-Core Processor',
        cores: 4,
        threads: 8,
        socket: 'AM4',
        baseClockGhz: 3.6,
        tdpWatts: 65,
        benchmarkScore: 11500
      },
      ram: {
        totalGb: 8,
        modules: [
          {
            slot: 'DIMM_A2',
            capacityGb: 8,
            type: 'DDR4',
            frequencyMhz: 2666,
            manufacturer: 'Crucial Technology'
          }
        ],
        channelMode: 'Single-Channel',
        speedMhz: 2666
      },
      storage: [
        {
          id: 'disk-0',
          driveLetter: 'C:',
          model: 'Samsung SSD 970 EVO Plus 500GB',
          type: 'NVMe SSD',
          totalGb: 465,
          freeGb: 28,
          healthPct: 89,
          temperatureC: 44,
          smartStatus: 'OK',
          reallocatedSectors: 0,
          uncorrectableErrors: 0,
          powerOnHours: 11200,
          tbwWrittenGb: 42000,
          trimEnabled: false
        },
        {
          id: 'disk-1',
          driveLetter: 'D:',
          model: 'Seagate Barracuda 1TB ST1000DM010',
          type: 'HDD',
          totalGb: 931,
          freeGb: 145,
          healthPct: 78,
          temperatureC: 38,
          smartStatus: 'WARNING',
          reallocatedSectors: 12,
          uncorrectableErrors: 1,
          powerOnHours: 24500
        }
      ],
      gpu: {
        name: 'NVIDIA GeForce GTX 1660 SUPER',
        vramGb: 6,
        driverVersion: '537.58',
        driverDate: '2023-10-10'
      },
      os: {
        edition: 'Windows 11 Professionnel',
        version: '23H2',
        build: '22631.3296',
        installDate: '2023-04-12',
        lastBootTime: '2026-10-17 08:14:22',
        secureBoot: true
      }
    }
  },
  {
    scanId: 'SCN-2026-4412-OFFICE',
    createdAt: '2026-10-17 11:05:12 UTC',
    machineFingerprint: '3b890f11a45c22998811ddeeccbbaa7766554433221100ffeeddccbbaa998877',
    machineHostname: 'LAPTOP-OFFICE-HP',
    plan: 'free',
    healthScore: 42,
    scoreBreakdown: {
      systemIntegrity: 15,
      diskHealth: 14,
      startupAndServices: 6,
      hardwareBalance: 7
    },
    systemAnomalies: {
      cbsCorruptedFiles: 28,
      dismErrorsFound: true,
      brokenRegistryKeys: 412,
      tempFilesSizeBytes: 22400000000, // 22.4 GB
      bloatwareServicesCount: 14,
      ghostDriversCount: 24,
      startupDelaySeconds: 68
    },
    criticalAlerts: [
      {
        level: 'critical',
        category: 'Disque S.M.A.R.T',
        title: 'Secteurs réalloués en augmentation (ID 05)',
        description: 'Le disque système HDD présente 48 secteurs défectueux réalloués. Risque imminent de perte de données.',
        remediationPlan: 'pro_ultimate'
      },
      {
        level: 'critical',
        category: 'Système & DLL',
        title: 'Intégrité système sévèrement compromise',
        description: 'Erreurs SFC critiques détectées sur opencl.dll et explorer.exe.',
        remediationPlan: 'essential'
      }
    ],
    hardware: {
      motherboard: {
        vendor: 'HP Inc.',
        product: 'HP 843B (Laptop Motherboard)',
        chipset: 'Intel HM370',
        socket: 'BGA1440',
        ramType: 'DDR4',
        ramSlotsTotal: 2,
        ramSlotsUsed: 1,
        ramMaxCapacityGb: 32,
        pcieGen: 'PCIe 3.0',
        m2SlotsTotal: 1,
        m2SlotsUsed: 0
      },
      cpu: {
        name: 'Intel Core i5-8250U CPU @ 1.60GHz',
        cores: 4,
        threads: 8,
        socket: 'BGA1440',
        baseClockGhz: 1.6,
        tdpWatts: 15,
        benchmarkScore: 6100
      },
      ram: {
        totalGb: 4,
        modules: [
          {
            slot: 'SODIMM 1',
            capacityGb: 4,
            type: 'DDR4',
            frequencyMhz: 2400,
            manufacturer: 'SK Hynix'
          }
        ],
        channelMode: 'Single-Channel',
        speedMhz: 2400
      },
      storage: [
        {
          id: 'disk-0',
          driveLetter: 'C:',
          model: 'WDC WD10JPVX-22JC3T0 1TB HDD 5400RPM',
          type: 'HDD',
          totalGb: 931,
          freeGb: 88,
          healthPct: 61,
          temperatureC: 43,
          smartStatus: 'CRITICAL',
          reallocatedSectors: 48,
          uncorrectableErrors: 6,
          powerOnHours: 32400
        }
      ],
      gpu: {
        name: 'Intel UHD Graphics 620',
        vramGb: 1,
        driverVersion: '30.0.101.1340',
        driverDate: '2022-01-14'
      },
      os: {
        edition: 'Windows 10 Famille',
        version: '22H2',
        build: '19045.3803',
        installDate: '2019-11-03',
        lastBootTime: '2026-10-17 06:30:10',
        secureBoot: true
      }
    }
  }
];

export const SAMPLE_HARDWARE_RECOMMENDATIONS: HardwareUpgradeRecommendation[] = [
  {
    id: 'upg_ram_dual',
    componentType: 'RAM',
    title: 'Kit 16 Go (2x8 Go) DDR4 3200 MHz CL16',
    currentSpec: '8 Go DDR4 2666 MHz (Single-Channel, 1 slot occupé)',
    recommendedSpec: 'Corsair Vengeance LPX 16 Go (2x8 Go) DDR4 3200MHz Dual-Channel',
    whyUpgrade: 'Double la bande passante mémoire réelle (de ~21 Go/s à ~42 Go/s) grâce au mode Dual-Channel et libère le potentiel du contrôleur Ryzen.',
    estimatedPerformanceBoost: '+38% en réactivité multitâche et +22% de FPS 1% low en jeu',
    compatibilityProof: '100% Vérifié : Carte mère ASUS PRIME B450-PLUS (4 slots DIMM, supporte jusqu\'à 4400MHz OC avec profil XMP/DOCP).',
    targetPriceEur: 38.99,
    affiliateUrl: 'https://amazon.fr/dp/B0143UM4TC?tag=pulsepc-saas-21',
    vendor: 'Amazon FR'
  },
  {
    id: 'upg_cpu_ryzen',
    componentType: 'CPU',
    title: 'Processeur AMD Ryzen 5 5600 (6 cœurs / 12 threads)',
    currentSpec: 'Ryzen 3 3100 (4 cœurs / 8 threads Zen 2)',
    recommendedSpec: 'AMD Ryzen 5 5600 Zen 3 (35 Mo Cache, Boost 4.4 GHz, 65W TDP)',
    whyUpgrade: 'Multiplie par plus de 2.2 les capacités de rendu et élimine le bottleneck CPU avec la carte graphique actuelle.',
    estimatedPerformanceBoost: '+64% en calcul applicatif et suppression des saccades système',
    compatibilityProof: '100% Vérifié : Socket AM4 identique. Nécessite uniquement la mise à jour BIOS version 3211 ou supérieure (fournie dans la notice).',
    targetPriceEur: 114.50,
    affiliateUrl: 'https://amazon.fr/dp/B09VCHR144?tag=pulsepc-saas-21',
    vendor: 'Amazon FR'
  },
  {
    id: 'upg_ssd_nvme',
    componentType: 'SSD_NVME',
    title: 'SSD NVMe M.2 1 To PCIe Gen3/Gen4 haute endurance',
    currentSpec: 'HDD secondaire mécanique fatigué (12 secteurs réalloués) + SSD C: 94% saturé',
    recommendedSpec: 'Crucial P3 Plus 1 To M.2 PCIe 4.0 NVMe (Débit lecture 5000 Mo/s)',
    whyUpgrade: 'Remplace le disque dur à risque de crash par un stockage flash ultra-rapide 50x plus rapide qu\'un disque mécanique.',
    estimatedPerformanceBoost: 'Démarrage instantané des logiciels et suppression des bruits mécaniques',
    compatibilityProof: '100% Vérifié : Slot M.2_2 disponible sur la carte ASUS B450.',
    targetPriceEur: 69.90,
    affiliateUrl: 'https://amazon.fr/dp/B0B25NXWC7?tag=pulsepc-saas-21',
    vendor: 'Amazon FR'
  }
];
