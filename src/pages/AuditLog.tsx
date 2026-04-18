import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const AuditLog = () => {
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("audit_log").select("*").order("created_at", { ascending: false }).limit(200);
      setEntries(data ?? []);
    })();
  }, []);

  return (
    <AppShell>
      <div className="p-8 max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold tracking-tight">Audit log</h1>
        <p className="text-sm text-muted-foreground mb-6">Append-only event trail across reviews you can see.</p>
        <div className="rounded-lg border border-border bg-card-grad divide-y divide-border">
          {entries.map((e) => (
            <Link to={e.review_id ? `/review/${e.review_id}` : "#"} key={e.id} className="px-4 py-2.5 flex items-start gap-3 text-sm hover:bg-muted/40">
              <Activity className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-primary">{e.event}</span>
                  <span className="text-[10px] font-mono uppercase text-muted-foreground">{e.actor_kind}</span>
                </div>
                {Object.keys(e.payload ?? {}).length > 0 && (
                  <div className="text-[10px] font-mono text-muted-foreground mt-1 truncate">{JSON.stringify(e.payload)}</div>
                )}
              </div>
              <div className="text-[10px] font-mono text-muted-foreground shrink-0">{formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}</div>
            </Link>
          ))}
          {entries.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No audit events yet.</div>}
        </div>
      </div>
    </AppShell>
  );
};

export default AuditLog;
