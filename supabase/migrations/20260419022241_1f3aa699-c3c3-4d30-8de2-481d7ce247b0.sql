-- 1. Risk tier enum
CREATE TYPE public.risk_tier AS ENUM ('medium', 'high', 'critical');

-- 2. reviews: submitter-declared tier (nullable so legacy rows still work)
ALTER TABLE public.reviews
  ADD COLUMN risk_tier_declared public.risk_tier;

-- 3. certifications: declared + derived + expiry + revocation
ALTER TABLE public.certifications
  ADD COLUMN risk_tier_declared public.risk_tier,
  ADD COLUMN risk_tier_derived public.risk_tier,
  ADD COLUMN expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '12 months'),
  ADD COLUMN revoked_at TIMESTAMPTZ,
  ADD COLUMN revoked_reason TEXT;

-- 4. attestations: single risk tier + expiry (QAGA attestations are formal)
ALTER TABLE public.attestations
  ADD COLUMN risk_tier public.risk_tier,
  ADD COLUMN expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '12 months');

-- 5. Helper: derive risk tier from findings + scenarios.
-- Logic mirrors the EU AI Act / NAIC AI bulletin pattern:
--   • Any 'critical' finding OR any healthcare/HR/IP scenario → 'critical'
--   • Any 'high' finding OR >= 3 'medium' findings → 'high'
--   • Otherwise → 'medium' (baseline for any production AI system)
CREATE OR REPLACE FUNCTION public.derive_risk_tier(_review_id uuid)
RETURNS public.risk_tier
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _crit int;
  _high int;
  _med int;
  _scenarios scenario_tag[];
  _has_critical_scenario boolean;
BEGIN
  SELECT
    COUNT(*) FILTER (WHERE severity = 'critical'),
    COUNT(*) FILTER (WHERE severity = 'high'),
    COUNT(*) FILTER (WHERE severity = 'medium')
  INTO _crit, _high, _med
  FROM public.agent_findings
  WHERE review_id = _review_id;

  SELECT scenarios INTO _scenarios FROM public.reviews WHERE id = _review_id;

  _has_critical_scenario := EXISTS (
    SELECT 1 FROM unnest(COALESCE(_scenarios, '{}'::scenario_tag[])) s
    WHERE s IN ('healthcare_codegen', 'hr_behavior')
  );

  IF _crit > 0 OR _has_critical_scenario THEN
    RETURN 'critical';
  ELSIF _high > 0 OR _med >= 3 OR 'generative_ip' = ANY(COALESCE(_scenarios,'{}'::scenario_tag[])) THEN
    RETURN 'high';
  ELSE
    RETURN 'medium';
  END IF;
END $$;

-- 6. Index for the public attestation feed (insurer queries)
CREATE INDEX IF NOT EXISTS idx_certifications_expires_at ON public.certifications (expires_at DESC);
CREATE INDEX IF NOT EXISTS idx_certifications_revoked_at ON public.certifications (revoked_at) WHERE revoked_at IS NOT NULL;