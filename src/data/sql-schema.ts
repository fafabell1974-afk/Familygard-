export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- PULSEPC SAAS - PRODUCTION DATABASE SCHEMA (POSTGRESQL / SUPABASE)
-- Architecture: Multi-tenant, Agent Machine Fingerprinting, Stripe Licensing & Hardware Compatibility
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMERATIONS
CREATE TYPE plan_tier_enum AS ENUM ('free', 'essential_3_50', 'pro_ultimate_9_90');
CREATE TYPE license_status_enum AS ENUM ('active', 'consumed', 'refunded', 'expired');
CREATE TYPE repair_status_enum AS ENUM ('pending', 'in_progress', 'completed', 'failed', 'cancelled');
CREATE TYPE hardware_type_enum AS ENUM ('CPU', 'RAM', 'SSD_NVME', 'GPU', 'PSU');
CREATE TYPE ram_type_enum AS ENUM ('DDR3', 'DDR4', 'DDR5');

-- ------------------------------------------------------------------------------
-- 3. PROFILES / USERS (Synchronisé avec Supabase auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    stripe_customer_id TEXT UNIQUE,
    current_tier plan_tier_enum NOT NULL DEFAULT 'free',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 4. DEVICES (Machines Windows appairées via Empreinte Matérielle C#)
-- ------------------------------------------------------------------------------
CREATE TABLE public.devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    machine_fingerprint VARCHAR(64) NOT NULL UNIQUE, -- SHA-256 (Motherboard UUID + CPU ID + BIOS Serial)
    hostname VARCHAR(128) NOT NULL,
    bios_uuid VARCHAR(64) NOT NULL,
    cpu_model VARCHAR(128) NOT NULL,
    os_edition VARCHAR(64) NOT NULL,
    os_build VARCHAR(32) NOT NULL,
    agent_version VARCHAR(16) NOT NULL,
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_devices_fingerprint ON public.devices(machine_fingerprint);
CREATE INDEX idx_devices_user ON public.devices(user_id);

-- ------------------------------------------------------------------------------
-- 5. LICENSES & TRANSACTIONS STRIPE
-- ------------------------------------------------------------------------------
CREATE TABLE public.licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    device_id UUID REFERENCES public.devices(id) ON DELETE SET NULL,
    plan_tier plan_tier_enum NOT NULL,
    stripe_checkout_id TEXT UNIQUE,
    stripe_payment_intent TEXT UNIQUE,
    amount_cents INTEGER NOT NULL, -- 0, 350, 990
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    status license_status_enum NOT NULL DEFAULT 'active',
    unlock_token_hash VARCHAR(64) NOT NULL, -- Token chiffré permettant à l'agent de débloquer l'exécution
    consumed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ, -- Pour les plans à exécution unique ou abonnements
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_licenses_device_status ON public.licenses(device_id, status);
CREATE INDEX idx_licenses_stripe_session ON public.licenses(stripe_checkout_id);

-- ------------------------------------------------------------------------------
-- 6. SCANS (Audits complets reçus de l'Agent C# .NET 8)
-- ------------------------------------------------------------------------------
CREATE TABLE public.scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    plan_at_scan plan_tier_enum NOT NULL DEFAULT 'free',
    health_score SMALLINT NOT NULL CHECK (health_score BETWEEN 0 AND 100),
    score_system SMALLINT NOT NULL CHECK (score_system BETWEEN 0 AND 40),
    score_disk SMALLINT NOT NULL CHECK (score_disk BETWEEN 0 AND 30),
    score_startup SMALLINT NOT NULL CHECK (score_startup BETWEEN 0 AND 15),
    score_hardware SMALLINT NOT NULL CHECK (score_hardware BETWEEN 0 AND 15),
    anomalies_count INTEGER NOT NULL DEFAULT 0,
    -- Stockage JSONB haute fidélité pour le rapport PDF et requêtes d'optimisation
    hardware_payload JSONB NOT NULL,
    smart_telemetry JSONB NOT NULL,
    system_anomalies JSONB NOT NULL,
    pdf_report_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_scans_device_created ON public.scans(device_id, created_at DESC);
CREATE INDEX idx_scans_hardware_gin ON public.scans USING GIN (hardware_payload);

-- ------------------------------------------------------------------------------
-- 7. REPAIR EXECUTIONS (Journal des actions de réparation Plans 2 & 3)
-- ------------------------------------------------------------------------------
CREATE TABLE public.repair_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
    license_id UUID NOT NULL REFERENCES public.licenses(id) ON DELETE RESTRICT,
    device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    plan_tier plan_tier_enum NOT NULL,
    status repair_status_enum NOT NULL DEFAULT 'pending',
    restore_point_created BOOLEAN NOT NULL DEFAULT FALSE,
    restore_point_name TEXT,
    disk_freed_mb INTEGER DEFAULT 0,
    steps_executed JSONB NOT NULL DEFAULT '[]'::jsonb,
    agent_exit_code INTEGER,
    agent_error_message TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_repair_device ON public.repair_executions(device_id);

-- ------------------------------------------------------------------------------
-- 8. CATALOGUE MATÉRIEL & CARTES MÈRES (MOTEUR DE RECOMMANDATIONS PLAN 3)
-- ------------------------------------------------------------------------------
CREATE TABLE public.motherboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand VARCHAR(64) NOT NULL,
    model VARCHAR(128) NOT NULL,
    socket VARCHAR(32) NOT NULL,        -- 'AM4', 'AM5', 'LGA1700', 'LGA1200', etc.
    chipset VARCHAR(32) NOT NULL,       -- 'B450', 'B550', 'B650', 'B760', 'Z790'
    ram_type ram_type_enum NOT NULL,    -- 'DDR4', 'DDR5'
    ram_slots SMALLINT NOT NULL DEFAULT 4,
    max_ram_gb SMALLINT NOT NULL DEFAULT 128,
    max_ram_speed_mhz INTEGER NOT NULL DEFAULT 3200,
    m2_slots_count SMALLINT NOT NULL DEFAULT 1,
    m2_pcie_gen VARCHAR(16) NOT NULL DEFAULT 'Gen4',
    bios_update_required_for_5000_series BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(brand, model)
);

CREATE TABLE public.hardware_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component_type hardware_type_enum NOT NULL,
    brand VARCHAR(64) NOT NULL,
    model VARCHAR(128) NOT NULL,
    socket_compatibility VARCHAR(32), -- Pour les CPU ('AM4', 'LGA1700')
    ram_type ram_type_enum,           -- Pour les barrettes RAM ('DDR4', 'DDR5')
    capacity_gb INTEGER,              -- RAM ou SSD
    speed_mhz INTEGER,                -- Fréquence RAM ou Vitesse lecture SSD
    specs JSONB NOT NULL DEFAULT '{}'::jsonb,
    price_eur NUMERIC(7,2) NOT NULL,
    amazon_asin VARCHAR(16),
    affiliate_url TEXT NOT NULL,
    performance_score INTEGER NOT NULL DEFAULT 100,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.motherboard_hardware_compatibilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    motherboard_id UUID NOT NULL REFERENCES public.motherboards(id) ON DELETE CASCADE,
    hardware_id UUID NOT NULL REFERENCES public.hardware_catalog(id) ON DELETE CASCADE,
    is_100_percent_verified BOOLEAN NOT NULL DEFAULT TRUE,
    expected_perf_boost_pct SMALLINT NOT NULL, -- Ex: 45% de gain en passant à 16Go Dual Channel
    compatibility_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(motherboard_id, hardware_id)
);

CREATE INDEX idx_mb_socket_chipset ON public.motherboards(socket, chipset);
CREATE INDEX idx_hw_type ON public.hardware_catalog(component_type, is_active);

-- ------------------------------------------------------------------------------
-- 9. FONCTION RPC DE RECOMMANDATION MATÉRIELLE (PLAN 3)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_compatible_upgrades_for_scan(target_scan_id UUID)
RETURNS TABLE (
    recommendation_id UUID,
    component_type hardware_type_enum,
    brand VARCHAR(64),
    model VARCHAR(128),
    specs JSONB,
    price_eur NUMERIC(7,2),
    affiliate_url TEXT,
    perf_boost_pct SMALLINT,
    why_upgrade TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_mb_model TEXT;
    v_mb_brand TEXT;
    v_current_ram_gb INT;
    v_motherboard_id UUID;
BEGIN
    -- Extraction des métadonnées du scan
    SELECT 
        s.hardware_payload->'motherboard'->>'product',
        s.hardware_payload->'motherboard'->>'vendor',
        (s.hardware_payload->'ram'->>'totalGb')::INT
    INTO v_mb_model, v_mb_brand, v_current_ram_gb
    FROM public.scans s
    WHERE s.id = target_scan_id;

    -- Trouver la carte mère correspondante
    SELECT m.id INTO v_motherboard_id
    FROM public.motherboards m
    WHERE v_mb_model ILIKE '%' || m.model || '%'
    LIMIT 1;

    IF v_motherboard_id IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT 
        hc.id AS recommendation_id,
        hc.component_type,
        hc.brand,
        hc.model,
        hc.specs,
        hc.price_eur,
        hc.affiliate_url,
        mhc.expected_perf_boost_pct AS perf_boost_pct,
        mhc.compatibility_notes AS why_upgrade
    FROM public.motherboard_hardware_compatibilities mhc
    JOIN public.hardware_catalog hc ON hc.id = mhc.hardware_id
    WHERE mhc.motherboard_id = v_motherboard_id
      AND hc.is_active = TRUE
    ORDER BY mhc.expected_perf_boost_pct DESC;
END;
$$;

-- ------------------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.motherboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hardware_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.motherboard_hardware_compatibilities ENABLE ROW LEVEL SECURITY;

-- Politiques de lecture publique pour le catalogue matériel
CREATE POLICY "Public read motherboards" ON public.motherboards FOR SELECT USING (true);
CREATE POLICY "Public read hardware_catalog" ON public.hardware_catalog FOR SELECT USING (is_active = true);
CREATE POLICY "Public read compatibilities" ON public.motherboard_hardware_compatibilities FOR SELECT USING (true);

-- Politiques d'accès utilisateur pour leurs propres données
CREATE POLICY "Users view own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users view own devices" ON public.devices FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own licenses" ON public.licenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own scans" ON public.scans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own repairs" ON public.repair_executions FOR ALL USING (auth.uid() = (SELECT user_id FROM public.devices WHERE devices.id = repair_executions.device_id));
`;
