export type PlanTier = 'free' | 'essential' | 'pro_ultimate';

export interface PlanConfig {
  id: PlanTier;
  name: string;
  priceEur: number;
  badge: string;
  description: string;
  features: string[];
  repairsIncluded: boolean;
  hardwareRecommendations: boolean;
  deepOptimization: boolean;
}

export interface HardwareSpec {
  motherboard: {
    vendor: string;
    product: string;
    chipset: string;
    socket: string;
    ramType: 'DDR4' | 'DDR5' | 'DDR3';
    ramSlotsTotal: number;
    ramSlotsUsed: number;
    ramMaxCapacityGb: number;
    pcieGen: string;
    m2SlotsTotal: number;
    m2SlotsUsed: number;
  };
  cpu: {
    name: string;
    cores: number;
    threads: number;
    socket: string;
    baseClockGhz: number;
    tdpWatts: number;
    benchmarkScore: number;
  };
  ram: {
    totalGb: number;
    modules: Array<{
      slot: string;
      capacityGb: number;
      type: string;
      frequencyMhz: number;
      manufacturer: string;
    }>;
    channelMode: 'Single-Channel' | 'Dual-Channel' | 'Quad-Channel';
    speedMhz: number;
  };
  storage: Array<{
    id: string;
    driveLetter: string;
    model: string;
    type: 'NVMe SSD' | 'SATA SSD' | 'HDD';
    totalGb: number;
    freeGb: number;
    healthPct: number;
    temperatureC: number;
    smartStatus: 'OK' | 'WARNING' | 'CRITICAL';
    reallocatedSectors: number;
    uncorrectableErrors: number;
    powerOnHours: number;
    tbwWrittenGb?: number;
    trimEnabled?: boolean;
  }>;
  gpu: {
    name: string;
    vramGb: number;
    driverVersion: string;
    driverDate: string;
  };
  os: {
    edition: string;
    version: string;
    build: string;
    installDate: string;
    lastBootTime: string;
    secureBoot: boolean;
  };
}

export interface ScanDiagnostic {
  scanId: string;
  createdAt: string;
  machineFingerprint: string;
  machineHostname: string;
  plan: PlanTier;
  hardware: HardwareSpec;
  healthScore: number; // 0 to 100
  scoreBreakdown: {
    systemIntegrity: number; // /40
    diskHealth: number; // /30
    startupAndServices: number; // /15
    hardwareBalance: number; // /15
  };
  systemAnomalies: {
    cbsCorruptedFiles: number;
    dismErrorsFound: boolean;
    brokenRegistryKeys: number;
    tempFilesSizeBytes: number;
    bloatwareServicesCount: number;
    ghostDriversCount: number;
    startupDelaySeconds: number;
  };
  criticalAlerts: Array<{
    level: 'critical' | 'warning' | 'info';
    category: string;
    title: string;
    description: string;
    remediationPlan: PlanTier;
  }>;
}

export interface RepairCommandStep {
  id: string;
  stepNumber: number;
  category: 'restore_point' | 'dism' | 'sfc' | 'registry' | 'services' | 'storage_trim' | 'ghost_drivers' | 'deep_cache';
  title: string;
  command: string;
  description: string;
  planRequired: PlanTier;
  estimatedDurationSec: number;
  safetyCheck: string;
  rollbackStrategy: string;
}

export interface HardwareUpgradeRecommendation {
  id: string;
  componentType: 'RAM' | 'SSD_NVME' | 'CPU';
  title: string;
  currentSpec: string;
  recommendedSpec: string;
  whyUpgrade: string;
  estimatedPerformanceBoost: string;
  compatibilityProof: string;
  targetPriceEur: number;
  affiliateUrl: string;
  vendor: string;
}

export interface ExecutionLogEntry {
  timestamp: string;
  stepId: string;
  command: string;
  status: 'pending' | 'running' | 'success' | 'warning' | 'error';
  exitCode?: number;
  outputLog: string;
}
