-- Seed Aurora Audit Partners QAGAC firm + map admin user as a QAGA assessor
-- + open engagement on the TalentForge review, so an attestation can be issued end-to-end.
INSERT INTO public.qagac_firms (id, name, status, public_listed, jurisdiction, contact_email, charter_at, indemnity_carrier, indemnity_amount_usd)
VALUES ('11111111-1111-1111-1111-111111111111','Aurora Audit Partners','active',true,'US-DE','partners@aurora-audit.demo', now() - interval '2 months','Lloyds of London (Demo)',5000000)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.qaga_assessors (id, user_id, firm_id, display_name, status, training_level, qaga_credential_id, qaga_issued_at, qaga_expires_at, jurisdiction, public_listed, training_completed_at, exam_passed_at)
VALUES ('22222222-2222-2222-2222-222222222222','e25c4801-d0cb-4c76-ae67-953dfa660595','11111111-1111-1111-1111-111111111111','Bob Rapp, QAGA','active','qaga','QAGA-DEMO-AURORA-001', now() - interval '1 month', now() + interval '11 months','US-DE',true, now() - interval '2 months', now() - interval '1 month')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.assessor_engagements (id, review_id, assessor_id, firm_id, client_org, status)
VALUES ('33333333-3333-3333-3333-333333333333','7c607df1-715f-44b5-a02a-c6e9443a1533','22222222-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111','aigovops foundation','requested')
ON CONFLICT (id) DO NOTHING;