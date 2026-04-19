
-- 1) PROFILES: restrict broad read to self or admin
DROP POLICY IF EXISTS "profiles readable by signed in" ON public.profiles;

CREATE POLICY "profiles owner or admin read"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- 2) AUDIT_LOG: tighten INSERT — null review_id is service-role only.
-- Authenticated clients must scope to a review they can act on.
DROP POLICY IF EXISTS "audit insert by authenticated, scoped to review" ON public.audit_log;

CREATE POLICY "audit insert scoped to owned review"
  ON public.audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = actor_id
    AND review_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.reviews r
      WHERE r.id = audit_log.review_id
        AND (
          r.submitter_id = auth.uid()
          OR public.has_role(auth.uid(), 'reviewer')
          OR public.has_role(auth.uid(), 'admin')
        )
    )
  );

-- 3) REALTIME: scope channel subscriptions by topic ownership.
-- Topics convention: "agent_threads:<thread_id>", "reviews:<review_id>",
-- "agent_messages:<thread_id>", "hitl_reviews:<review_id>",
-- "agent_decisions:<review_id>".
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "realtime authenticated topic auth" ON realtime.messages;

CREATE POLICY "realtime authenticated topic auth"
  ON realtime.messages
  FOR SELECT
  TO authenticated
  USING (
    -- Admins can subscribe to any channel
    public.has_role(auth.uid(), 'admin')
    OR
    -- Thread-scoped topics: owner only
    (
      (realtime.topic() LIKE 'agent_threads:%' OR realtime.topic() LIKE 'agent_messages:%')
      AND EXISTS (
        SELECT 1 FROM public.agent_threads t
        WHERE t.id::text = split_part(realtime.topic(), ':', 2)
          AND t.owner_id = auth.uid()
      )
    )
    OR
    -- Review-scoped topics: submitter, reviewer, or admin
    (
      (
        realtime.topic() LIKE 'reviews:%'
        OR realtime.topic() LIKE 'hitl_reviews:%'
        OR realtime.topic() LIKE 'agent_decisions:%'
        OR realtime.topic() LIKE 'agent_findings:%'
      )
      AND (
        public.has_role(auth.uid(), 'reviewer')
        OR EXISTS (
          SELECT 1 FROM public.reviews r
          WHERE r.id::text = split_part(realtime.topic(), ':', 2)
            AND r.submitter_id = auth.uid()
        )
      )
    )
  );
