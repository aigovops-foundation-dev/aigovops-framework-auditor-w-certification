import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Camera, Loader2, Upload, UserCircle2 } from "lucide-react";

interface QagaRow {
  id: string;
  user_id: string;
  display_name: string;
  status: string;
  training_level: string;
  firm_name: string | null;
  portrait_url: string | null;
}

const PORTRAIT_BUCKET = "agent-portraits";

export const QagaPortraitUploader = () => {
  const [rows, setRows] = useState<QagaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const portraitUrl = (userId: string) => {
    const { data } = supabase.storage.from(PORTRAIT_BUCKET).getPublicUrl(`${userId}.jpg`);
    // cache-bust
    return `${data.publicUrl}?t=${Date.now()}`;
  };

  const probe = async (userId: string): Promise<string | null> => {
    const url = portraitUrl(userId);
    try {
      const res = await fetch(url, { method: "HEAD" });
      return res.ok ? url : null;
    } catch {
      return null;
    }
  };

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("qaga_assessors")
      .select("id, user_id, display_name, status, training_level, qagac_firms!qaga_assessors_firm_id_fkey(name)")
      .order("display_name");
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    const base: QagaRow[] = (data ?? []).map((r: any) => ({
      id: r.id,
      user_id: r.user_id,
      display_name: r.display_name,
      status: r.status,
      training_level: r.training_level,
      firm_name: r.qagac_firms?.name ?? null,
      portrait_url: null,
    }));
    // Probe portraits in parallel
    const withPortraits = await Promise.all(
      base.map(async (r) => ({ ...r, portrait_url: await probe(r.user_id) }))
    );
    setRows(withPortraits);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleFile = async (row: QagaRow, file: File) => {
    if (!file) return;
    if (!/^image\/jpe?g$/i.test(file.type)) {
      toast.error("JPEG only — convert PNG/HEIC first");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max 5MB per portrait");
      return;
    }
    setUploadingFor(row.user_id);
    const path = `${row.user_id}.jpg`;
    const { error } = await supabase.storage
      .from(PORTRAIT_BUCKET)
      .upload(path, file, { upsert: true, contentType: "image/jpeg", cacheControl: "3600" });
    if (error) {
      toast.error(error.message);
      setUploadingFor(null);
      return;
    }
    await supabase.functions.invoke("sign-decision", {
      body: { event: "qaga.portrait_uploaded", payload: { user_id: row.user_id, assessor_id: row.id } },
    });
    toast.success(`Portrait uploaded for ${row.display_name}`);
    setUploadingFor(null);
    // refresh just that row
    setRows((prev) => prev.map((r) => r.user_id === row.user_id ? { ...r, portrait_url: portraitUrl(row.user_id) } : r));
  };

  return (
    <div className="rounded-lg border border-border bg-card-grad overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <Camera className="h-4 w-4 text-primary" />
        <div className="text-sm font-semibold">QAGA portrait library</div>
        <div className="text-[11px] text-muted-foreground ml-2">
          JPEG only · auto-embeds in future attestation PDFs
        </div>
      </div>
      <div className="grid grid-cols-12 px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground border-b border-border">
        <div className="col-span-1">Portrait</div>
        <div className="col-span-4">Assessor</div>
        <div className="col-span-3">Firm</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2 text-right">Action</div>
      </div>
      {loading ? (
        <div className="p-6 text-sm text-muted-foreground font-mono">loading…</div>
      ) : rows.length === 0 ? (
        <div className="p-6 text-sm text-muted-foreground">No QAGA assessors yet. Seed demo dataset to populate.</div>
      ) : rows.map((r) => {
        const isUploading = uploadingFor === r.user_id;
        return (
          <div key={r.id} className="grid grid-cols-12 items-center px-4 py-3 border-b border-border last:border-0">
            <div className="col-span-1">
              {r.portrait_url ? (
                <img
                  src={r.portrait_url}
                  alt={`${r.display_name} portrait`}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/40"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center ring-2 ring-border">
                  <UserCircle2 className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="col-span-4">
              <div className="text-sm font-medium">{r.display_name}</div>
              <div className="font-mono text-[10px] text-muted-foreground truncate">{r.user_id}</div>
            </div>
            <div className="col-span-3 text-sm text-muted-foreground truncate">{r.firm_name ?? "—"}</div>
            <div className="col-span-2">
              <Badge variant={r.status === "active" ? "default" : "outline"} className="text-[10px]">
                {r.training_level} · {r.status}
              </Badge>
            </div>
            <div className="col-span-2 flex justify-end">
              <input
                ref={(el) => { inputRefs.current[r.user_id] = el; }}
                type="file"
                accept="image/jpeg"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(r, f);
                  e.target.value = "";
                }}
              />
              <Button
                size="sm"
                variant="outline"
                disabled={isUploading}
                onClick={() => inputRefs.current[r.user_id]?.click()}
              >
                {isUploading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1.5" />}
                {r.portrait_url ? "Replace" : "Upload"}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
