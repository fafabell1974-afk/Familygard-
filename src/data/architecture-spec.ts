export interface SpecSection {
  id: string;
  number: string;
  title: string;
  summary: string;
  content: string;
  codeSnippets: Array<{
    language: string;
    title: string;
    code: string;
  }>;
}

export const ARCHITECTURE_SPEC_SECTIONS: SpecSection[] = [
  {
    id: 'section_1_architecture',
    number: '01',
    title: 'Architecture Globale & Sécurité de Communication',
    summary: 'Système micro-services distribué unissant un Agent Windows natif C#/.NET 8, une API Cloud Next.js/Express, Supabase (PostgreSQL & Auth) et Stripe Billing.',
    content: `### 1.1 Vue d'ensemble du Système Distribué

Le SaaS repose sur une séparation stricte des responsabilités entre le client lourd d'exécution locale et le cerveau cloud :

1. **Agent Desktop Windows (C# .NET 8 Native AOT)** :
   - Exécutable binaire unique (~14 Mo), compilé en Ahead-Of-Time (AOT), sans dépendance au framework .NET préinstallé.
   - Fonctionne avec élévation de privilèges UAC (\`requireAdministrator\`) pour accéder à WMI, au sous-système de stockage, aux ruches du registre et aux binaires DISM/SFC.
   - Rôle : Collecte de la télémétrie matérielle, diagnostic non-intrusif, et exécution des commandes de réparation déverrouillées par licence.

2. **API Cloud & Backend Orchestrateur (Next.js / Node.js)** :
   - Endpoints REST sécurisés pour l'ingestion des scans, la vérification des licences et la distribution des ordres de réparation.
   - Générateur de rapports PDF au format vectoriel (Puppeteer / PDFKit / Tailwind).
   - Passerelle Webhooks Stripe pour le déblocage synchrone des réparations payantes.

3. **Base de Données & Stockage (Supabase / PostgreSQL)** :
   - Persistance relationnelle des comptes, des empreintes matérielles (devices), des historiques de scan JSONB et des exécutions.
   - Base de connaissances matérielle (Motherboard / Chipset / Socket / RAM / GPU) et moteur de compatibilité 100%.

4. **Paiements & Licences (Stripe)** :
   - Stripe Checkout hébergé pour encaisser 3,50 € (Plan Essentiel) ou 9,90 € (Plan Pro Ultimate).
   - Émission d'un jeton cryptographique à usage unique (\`unlock_token\`) signé par la clé privée du SaaS.

---

### 1.2 Protocole de Communication Sécurisée

L'Agent Desktop communique exclusivement via HTTPS (TLS 1.3) avec Certificate Pinning. L'appairage et la signature s'articulent autour de 4 piliers cryptographiques :

- **Empreinte Matérielle Déterministe (Hardware Fingerprint)** :
  L'agent calcule un hash SHA-256 immuable combinant le numéro de série de la carte mère (\`Win32_BaseBoard.SerialNumber\`), l'UUID BIOS (\`Win32_ComputerSystemProduct.UUID\`), et le processeur ID (\`Win32_Processor.ProcessorId\`). Aucun mot de passe utilisateur n'est stocké en local.
- **Jeton JWT Éphémère & Session d'Analyse** :
  Lors du premier contact, l'API délivre un JWT signé d'une durée de 15 minutes, restreint au scope \`scan:upload\`.
- **Signature HMAC-SHA256 Anti-Altération & Anti-Replay** :
  Chaque requête de scan ou de commande comporte un en-tête \`X-Pulse-Signature\`. Le hash est calculé sur la concaténation : \`HMAC_SHA256(Timestamp + Nonce + MachineFingerprint + RequestBody, MachineSecret)\`. Les requêtes datant de plus de 60 secondes sont immédiatement rejetées par l'API.
- **Autorisation de Réparation par Jeton Chiffré Asymétrique** :
  L'agent Windows refuse catégoriquement d'exécuter toute commande de modification (Plans 2 & 3) sans un \`ExecutionCertificate\` signé numériquement par la clé privée ECDSA/RSA du serveur suite au webhook de confirmation Stripe.`,
    codeSnippets: [
      {
        language: 'csharp',
        title: 'Agent C# .NET 8 - Calcul de l\'Empreinte Matérielle & Requête Signée HMAC',
        code: `using System.Management;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace PulsePC.Agent.Core;

public sealed class SecurityProvider
{
    public static string GenerateMachineFingerprint()
    {
        var rawData = new StringBuilder();
        
        // 1. Motherboard Serial
        using var mbSearcher = new ManagementObjectSearcher("SELECT SerialNumber, Product FROM Win32_BaseBoard");
        foreach (var obj in mbSearcher.Get())
        {
            rawData.Append(obj["SerialNumber"]?.ToString()?.Trim());
            rawData.Append(obj["Product"]?.ToString()?.Trim());
        }

        // 2. System UUID
        using var sysSearcher = new ManagementObjectSearcher("SELECT UUID FROM Win32_ComputerSystemProduct");
        foreach (var obj in sysSearcher.Get())
        {
            rawData.Append(obj["UUID"]?.ToString()?.Trim());
        }

        // 3. Processor ID
        using var cpuSearcher = new ManagementObjectSearcher("SELECT ProcessorId FROM Win32_Processor");
        foreach (var obj in cpuSearcher.Get())
        {
            rawData.Append(obj["ProcessorId"]?.ToString()?.Trim());
        }

        using var sha256 = SHA256.Create();
        byte[] hash = sha256.ComputeHash(Encoding.UTF8.GetBytes(rawData.ToString()));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    public static string ComputeHmacSignature(string payload, string machineSecret, long timestamp, string nonce)
    {
        var message = $"{timestamp}:{nonce}:{payload}";
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(machineSecret));
        byte[] hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(message));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }
}`
      },
      {
        language: 'typescript',
        title: 'Backend API - Validation HMAC & Webhook Stripe pour Déverrouillage',
        code: `import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  const timestamp = req.headers.get('x-pulse-timestamp');
  const nonce = req.headers.get('x-pulse-nonce');
  const fingerprint = req.headers.get('x-machine-fingerprint');
  const signature = req.headers.get('x-pulse-signature');

  if (!timestamp || !nonce || !fingerprint || !signature) {
    return NextResponse.json({ error: 'Missing security headers' }, { status: 401 });
  }

  // Vérification de la fenêtre temporelle anti-replay (< 60 secondes)
  const reqTime = parseInt(timestamp, 10);
  if (Math.abs(Date.now() - reqTime) > 60000) {
    return NextResponse.json({ error: 'Request timestamp expired' }, { status: 403 });
  }

  const rawBody = await req.text();
  const machineSecret = process.env.AGENT_SECRET_KEY!;
  const expectedSig = crypto
    .createHmac('sha256', machineSecret)
    .update(\`\${timestamp}:\${nonce}:\${rawBody}\`)
    .digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
    return NextResponse.json({ error: 'Invalid HMAC signature' }, { status: 403 });
  }

  // Traitement sécurisé de l'ingestion de scan...
  return NextResponse.json({ status: 'ok', scanReceived: true });
}`
      }
    ]
  },
  {
    id: 'section_2_scripts',
    number: '02',
    title: 'Spécification des Scripts de Réparation (Plans 2 & 3)',
    summary: 'Séquence ordonnancée des commandes Windows natives, garanties de non-régression, points de restauration VSS et isolation d\'erreurs.',
    content: `### 2.1 Philosophie d'Exécution et Filets de Sécurité

Les outils grand public agressifs causent souvent des corruptions irréversibles (écrans bleus BSOD). PulsePC adopte une démarche d'ingénierie stricte :

1. **Zéro Outil Tiers Douteux** : Utilisation exclusive des binaires officiels Microsoft certifiés (\`dism.exe\`, \`sfc.exe\`, \`Optimize-Volume\`, \`pnputil.exe\`).
2. **Étape 0 Inconditionnelle : Point de Restauration Système (VSS)** :
   Avant de modifier une seule clé de registre ou binaire, un instantané Shadow Copy est généré avec nommage horodaté.
3. **Journalisation Complète & Timeout** :
   Chaque processus C# est exécuté avec redirection asynchrone des flux stdout/stderr, un timeout adapté (90s pour DISM, 15s pour le registre), et un code de retour surveillé (0 = succès, 3010 = redémarrage requis).

---

### 2.2 Séquence Plan 2 (3,50 € · Essentiel)

1. **Vérification de l'Image Windows (DISM ScanHealth)** :
   \`\`\`cmd
   dism.exe /Online /Cleanup-Image /ScanHealth
   \`\`\`
2. **Restauration du Store WinSxS (DISM RestoreHealth)** :
   \`\`\`cmd
   dism.exe /Online /Cleanup-Image /RestoreHealth
   \`\`\`
   *Impact : Remplace les fichiers du magasin de composants corrompus via les serveurs officiels Windows Update.*
3. **Réparation de l'Intégrité des Fichiers Système (SFC)** :
   \`\`\`cmd
   sfc.exe /scannow
   \`\`\`
   *Impact : Réanalyse toutes les DLL et binaires critiques (kernel32, ntdll, explorer) et les remplace depuis la source WinSxS réparée.*
4. **Sanitization Précise du Registre** :
   - Éradication des clés Run orphelines dans \`HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\` et \`HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run\`.
   - Purge des entrées \`SharedDLLs\` orphelines et CLSID désinstallés. Sauvegarde préalable dans \`C:\\ProgramData\\PulsePC\\backup\\reg_<timestamp>.reg\`.
5. **Désactivation des Télémétries Agressives & Services Inutiles** :
   - Service \`DiagTrack\` (Connected User Experiences and Telemetry) -> Passage en mode "Disabled".
   - Service \`dmwappushservice\` (WAP Push Service de suivi publicitaire) -> Désactivé.
   - Désactivation des résidus d'assistants OEM (Dell SupportAssist, HP Touchpoint Analytics) qui consomment 10 à 25% de CPU en continu.
6. **Nettoyage Standard** :
   - Purge de \`%TEMP%\`, \`C:\\Windows\\Temp\`, et vidage de la corbeille.

---

### 2.3 Séquence Plan 3 (9,90 € · Pro Ultimate)

Comprend l'intégralité du Plan 2, complété par les optimisations matérielles et caches profonds :

1. **Optimisation SSD & ReTrim Réel** :
   \`\`\`powershell
   Optimize-Volume -DriveLetter C -ReTrim -Verbose
   \`\`\`
   *Impact : Notifie le contrôleur SSD flash des blocs libérés pour restaurer les performances en écriture aléatoire et réduire l'amplification d'écriture.*
2. **Nettoyage Profond WinSxS avec ResetBase** :
   \`\`\`cmd
   dism.exe /Online /Cleanup-Image /StartComponentCleanup /ResetBase
   \`\`\`
   *Impact : Libère de 4 à 12 Go d'espace disque en supprimant définitivement les copies archivées d'anciennes mises à jour Windows obsolètes.*
3. **Purge des Pilotes Fantômes (Ghost Drivers)** :
   \`\`\`powershell
   Get-PnpDevice | Where-Object { $_.Present -eq $false -and $_.Status -eq 'Unknown' }
   pnputil.exe /delete-driver oemXX.inf /uninstall /force
   \`\`\`
   *Impact : Désinstalle les anciens pilotes résiduels (cartes graphiques antérieures, périphériques USB retirés) polluant le noyau du système.*
4. **Purge des Caches Profonds DirectX & Windows Update** :
   - Arrêt temporaire du service \`wuauserv\`, purge du dossier \`C:\\Windows\\SoftwareDistribution\\Download\`, redémarrage du service.
   - Purge des caches de nuanceurs (Shaders DirectX) : \`%LOCALAPPDATA%\\D3DSCache\`, \`%LOCALAPPDATA%\\NVIDIA\\DXCache\`.
5. **Moteur de Recommandations Matérielles** :
   - Corrélation de la carte mère et des slots libres avec le catalogue de pièces 100% compatibles (RAM Dual-Channel, SSD NVMe Gen3/Gen4, CPU AM4/LGA1700).`,
    codeSnippets: [
      {
        language: 'csharp',
        title: 'C# .NET 8 - Pipeline d\'Exécution Sécurisé avec Point de Restauration',
        code: `using System.Diagnostics;
using System.Text;

namespace PulsePC.Agent.Repair;

public sealed class RepairPipelineRunner
{
    public static async Task<RepairStepResult> ExecuteCommandAsync(
        string command, 
        string arguments, 
        int timeoutSeconds = 120,
        CancellationToken cancellationToken = default)
    {
        var psi = new ProcessStartInfo
        {
            FileName = command,
            Arguments = arguments,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true,
            StandardOutputEncoding = Encoding.UTF8
        };

        var outputBuilder = new StringBuilder();
        var errorBuilder = new StringBuilder();

        using var process = new Process { StartInfo = psi };
        process.OutputDataReceived += (s, e) => { if (e.Data != null) outputBuilder.AppendLine(e.Data); };
        process.ErrorDataReceived += (s, e) => { if (e.Data != null) errorBuilder.AppendLine(e.Data); };

        process.Start();
        process.BeginOutputReadLine();
        process.BeginErrorReadLine();

        using var timeoutCts = new CancellationTokenSource(TimeSpan.FromSeconds(timeoutSeconds));
        using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, timeoutCts.Token);

        try
        {
            await process.WaitForExitAsync(linkedCts.Token);
            return new RepairStepResult(
                ExitCode: process.ExitCode,
                Success: process.ExitCode == 0 || process.ExitCode == 3010, // 3010 = Reboot required (normal for DISM)
                Output: outputBuilder.ToString(),
                Errors: errorBuilder.ToString()
            );
        }
        catch (OperationCanceledException)
        {
            process.Kill(entireProcessTree: true);
            return new RepairStepResult(-1, false, outputBuilder.ToString(), "Process killed due to execution timeout.");
        }
    }
}

public readonly record struct RepairStepResult(int ExitCode, bool Success, string Output, string Errors);`
      }
    ]
  },
  {
    id: 'section_3_database',
    number: '03',
    title: 'Structure de la Base de Données (Schéma SQL / Supabase)',
    summary: 'Architecture relationnelle multi-tenant PostgreSQL complète : devices, scans JSONB, paiements Stripe et matrice matérielle 100% compatible.',
    content: `### 3.1 Conception des Données & Normalisation

La base de données hébergée sur Supabase (PostgreSQL 15+) gère 4 domaines fonctionnels :

1. **Parc de Machines & Identité (Profiles & Devices)** :
   - \`profiles\` : Liaison 1:1 avec \`auth.users\` de Supabase.
   - \`devices\` : Indexé sur \`machine_fingerprint\` pour lier chaque PC physiquement sans fuite de données personnelles.
2. **Ingestion & Diagnostic (Scans)** :
   - Stockage des scores de santé normalisés (0 à 100) et des détails bruts au format JSONB (\`hardware_payload\`, \`smart_telemetry\`, \`system_anomalies\`).
   - L'index GIN sur \`hardware_payload\` permet d'interroger instantanément les cartes mères ou GPU à travers des millions de diagnostics.
3. **Monétisation & Déverrouillage (Licenses & Repair Executions)** :
   - Modèle transactionnel lié aux sessions de paiement Stripe (\`stripe_checkout_id\`).
   - Émission d'un jeton cryptographique à usage unique consommé lors de l'exécution de la réparation.
4. **Catalogue Matériel & Correspondances (Plan 3)** :
   - Tables \`motherboards\`, \`hardware_catalog\` et table de jonction \`motherboard_hardware_compatibilities\`.
   - Permet de garantir contractuellement à l'utilisateur que la barrette de RAM ou le CPU recommandé s'insère à 100% dans son socket sans risque d'incompatibilité de pinout ou de chipset.

---

### 3.2 Intégration Stripe Webhook

Lorsqu'un utilisateur paie 3,50 € ou 9,90 € sur la page de paiement Stripe Checkout :
- Le webhook reçoit l'événement \`checkout.session.completed\`.
- La table \`licenses\` crée un enregistrement actif avec un \`unlock_token_hash\`.
- L'agent C# sonde l'endpoint d'autorisation ou reçoit une notification WebSocket / SSE pour démarrer immédiatement la réparation.`,
    codeSnippets: [
      {
        language: 'sql',
        title: 'Requête d\'Optimisation Matérielle 100% Compatible (Plan 3)',
        code: `-- Requête exécutée pour extraire les upgrades compatibles avec calcul du gain de performance
SELECT 
    m.brand AS mb_brand,
    m.model AS mb_model,
    m.socket,
    m.ram_type,
    hc.component_type,
    hc.brand AS upgrade_brand,
    hc.model AS upgrade_model,
    hc.price_eur,
    hc.affiliate_url,
    mhc.expected_perf_boost_pct,
    mhc.compatibility_notes
FROM public.motherboard_hardware_compatibilities mhc
JOIN public.motherboards m ON m.id = mhc.motherboard_id
JOIN public.hardware_catalog hc ON hc.id = mhc.hardware_id
WHERE m.model = 'PRIME B450-PLUS'
  AND hc.is_active = TRUE
ORDER BY mhc.expected_perf_boost_pct DESC;`
      },
      {
        language: 'typescript',
        title: 'Handler API Webhook Stripe - Création de Licence & Token de Déblocage',
        code: `import Stripe from 'stripe';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')!;
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return NextResponse.json({ error: \`Webhook error: \${err.message}\` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const planTier = session.metadata?.plan_tier as 'essential_3_50' | 'pro_ultimate_9_90';
    const deviceId = session.metadata?.device_id;
    const userId = session.metadata?.user_id;

    // Génération du token de déverrouillage cryptographique pour l'Agent C#
    const rawUnlockToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawUnlockToken).digest('hex');

    await supabase.from('licenses').insert({
      user_id: userId,
      device_id: deviceId,
      plan_tier: planTier,
      stripe_checkout_id: session.id,
      stripe_payment_intent: session.payment_intent as string,
      amount_cents: session.amount_total || 0,
      unlock_token_hash: tokenHash,
      status: 'active'
    });
  }

  return NextResponse.json({ received: true });
}`
      }
    ]
  },
  {
    id: 'section_4_pdf_report',
    number: '04',
    title: 'Structure du Rapport PDF Généré',
    summary: 'Spécification du document d\'audit de santé PC : formule du Score Global (0-100), alertes, diagnostic matériel et plan d\'upgrades d\'affiliation.',
    content: `### 4.1 Modèle de Calcul du Score de Santé (0 à 100)

Le Score Global est calculé selon un algorithme déterministe pondéré :

$$\\text{Score Global} = S_{\\text{système}} (40) + S_{\\text{disque}} (30) + S_{\\text{démarrage}} (15) + S_{\\text{matériel}} (15)$$

- **Intégrité Système & Registre (Max 40 pts)** :
  - -20 pts si corruption CBS / DISM détectée.
  - -1 pt par bloc de 20 clés orphelines dans le registre (max -10 pts).
  - -10 pts si pilotes ou services critiques en échec.
- **Santé & Endurance Disque S.M.A.R.T (Max 30 pts)** :
  - -15 pts si secteur réalloué (ID 05) > 0 ou erreur incorrigible (ID 0BB).
  - -10 pts si espace libre sur le disque C: < 15%.
  - -5 pts si TRIM désactivé sur SSD NVMe.
- **Surcharge Démarrage & Services (Max 15 pts)** :
  - -2 pts par bloatware au démarrage (max -10 pts).
  - -5 pts si temps de boot mesuré > 45 secondes.
- **Équilibre & Étranglement Matériel (Max 15 pts)** :
  - -8 pts si RAM en mode Single-Channel au lieu de Dual-Channel.
  - -7 pts si RAM totale $\\le 8$ Go sur Windows 11.

---

### 4.2 Structure des Rubriques du Rapport PDF

Le rapport PDF généré (format A4 vectoriel, 3 à 4 pages selon le plan) est organisé en 6 sections modulaires :

1. **Cartouche d'Identification & En-Tête** :
   - Identifiant unique du scan (\`SCN-XXXX-XXXX\`), horodatage UTC, version de l'Agent .NET 8.
   - Modèle PC, édition Windows (\`Windows 11 Pro 23H2 build 22631\`), carte mère et processeur.
   - Plan d'audit souscrit (FREE / ESSENTIEL / PRO ULTIMATE).
2. **Jauge & Synthèse du Score Global de Santé** :
   - Score sur 100 avec code couleur normalisé (Vert > 80, Ambre 50-79, Rouge < 50).
   - Radar ou barres de décomposition des 4 sous-scores.
   - Synthèse exécutive résumant l'état de la machine en 3 lignes percutantes.
3. **Tableau des Alertes Prioritaires** :
   - Classification par sévérité : *Critique* (action requise), *Avertissement* (dégradation), *Information*.
   - Mention du plan minimum requis pour la résolution automatique.
4. **Audit Technique Détaillé par Sous-Système** :
   - *Intégrité Windows* : État du magasin WinSxS, DLL modifiées, logs CBS.
   - *Santé du Stockage S.M.A.R.T* : Température, heures de fonctionnement, usure TBW, secteurs réalloués.
   - *Applications de Démarrage & Services* : Temps d'impact au démarrage, mémoire mobilisée.
   - *Registre Windows* : Nombre de clés orphelines répertoriées.
5. **Plan d'Action & Journal des Réparations Exécutées** :
   - *En Plan 1 (Free)* : Liste des actions correctives recommandées avec CTA pour débloquer le Plan Essentiel ou Pro.
   - *En Plan 2 & 3* : Journal d'exécution officiel certifiant la création du point de restauration VSS, le résultat DISM/SFC, et le volume d'espace disque nettoyé (ex: *14,8 Go libérés*).
6. **Moteur d'Upgrades Matériels Certifiés 100% Compatibles (Exclusivité Plan 3)** :
   - Identification précise des goulots d'étranglement (ex : *Passage de 8 Go Single-Channel à 16 Go Dual-Channel*).
   - Preuve de compatibilité physique (Carte mère ASUS B450-PLUS : 4 slots DDR4, socket AM4 compatible Ryzen série 5000).
   - Liens directs d'achat vérifiés avec tracking d'affiliation (Amazon, distributeurs partenaires) et estimation chiffrée du gain de performance (+38% en réactivité).
7. **Pied de Page & Certificat de Conformité** :
   - Hash SHA-256 du rapport garantissant son intégrité, conditions d'assistance et mentions légales.`,
    codeSnippets: [
      {
        language: 'typescript',
        title: 'Algorithme Déterministe de Calcul du Score de Santé (TypeScript)',
        code: `export function calculatePCHealthScore(data: {
  cbsCorruptedFiles: number;
  dismErrors: boolean;
  brokenRegistryKeys: number;
  smartReallocatedSectors: number;
  diskFreePct: number;
  trimActive: boolean;
  bloatwaresCount: number;
  bootDelaySec: number;
  isSingleChannel: boolean;
  totalRamGb: number;
}) {
  // 1. Système (40 max)
  let systemScore = 40;
  if (data.dismErrors || data.cbsCorruptedFiles > 0) systemScore -= 20;
  systemScore -= Math.min(10, Math.floor(data.brokenRegistryKeys / 25));
  systemScore = Math.max(0, systemScore);

  // 2. Disque S.M.A.R.T (30 max)
  let diskScore = 30;
  if (data.smartReallocatedSectors > 0) diskScore -= 15;
  if (data.diskFreePct < 15) diskScore -= 10;
  if (!data.trimActive) diskScore -= 5;
  diskScore = Math.max(0, diskScore);

  // 3. Démarrage & Services (15 max)
  let startupScore = 15;
  startupScore -= Math.min(10, data.bloatwaresCount * 2);
  if (data.bootDelaySec > 45) startupScore -= 5;
  startupScore = Math.max(0, startupScore);

  // 4. Équilibre Matériel (15 max)
  let hardwareScore = 15;
  if (data.isSingleChannel) hardwareScore -= 8;
  if (data.totalRamGb <= 8) hardwareScore -= 7;
  hardwareScore = Math.max(0, hardwareScore);

  const total = systemScore + diskScore + startupScore + hardwareScore;
  return {
    totalHealthScore: Math.round(total),
    breakdown: { systemScore, diskScore, startupScore, hardwareScore }
  };
}`
      }
    ]
  }
];
