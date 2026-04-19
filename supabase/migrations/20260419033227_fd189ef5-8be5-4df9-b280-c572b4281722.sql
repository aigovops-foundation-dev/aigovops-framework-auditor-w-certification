UPDATE public.assessor_engagements
SET status='active',
    independence_declared_at=now(),
    independence_signed_by='e25c4801-d0cb-4c76-ae67-953dfa660595',
    independence_attestation='I attest no conflicts of interest exist between Aurora Audit Partners and the client organization for this review (demo seed).'
WHERE id='33333333-3333-3333-3333-333333333333';