"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export default function VoicePage({ params }: { params: { id: string } }) {
  const [voiceName, setVoiceName] = useState("Aoede");
  const [accentNotes, setAccentNotes] = useState("");
  const [settingsJson, setSettingsJson] = useState<string>("{}");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/campaigns/${params.id}/voice`, { cache: "no-store" });
        const json = await res.json();
        const v = json.voiceProfile;
        if (v) {
          setVoiceName(v.voiceName ?? "Aoede");
          setAccentNotes(v.accentNotes ?? "");
          setSettingsJson(JSON.stringify(v.settingsJson ?? {}, null, 2));
        }
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [params.id]);

  async function save() {
    setSaving(true);
    setError(null);
    setOk(null);
    try {
      const parsedJson = settingsJson.trim().length ? JSON.parse(settingsJson) : {};
      const res = await fetch(`/api/campaigns/${params.id}/voice`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voiceName,
          accentNotes: accentNotes || undefined,
          settingsJson: parsedJson
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to save voice profile");
      setOk("Saved.");
    } catch (e: any) {
      setError(e?.message ?? "Failed to save voice profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card
        title="Voice profile"
        description="Keep this human-readable. We’ll map these settings to the runtime voice configuration."
      >
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-700">Voice name</label>
            <div className="mt-2">
              <Input value={voiceName} onChange={(e) => setVoiceName(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Accent notes</label>
            <div className="mt-2">
              <Textarea
                rows={6}
                value={accentNotes}
                onChange={(e) => setAccentNotes(e.target.value)}
                placeholder="Example: North Indian accent, warm & patient, slow down for phone calls, avoid long monologues."
              />
            </div>
          </div>
        </div>
      </Card>

      <Card
        title="Advanced settings (JSON)"
        description="Optional. Store provider-specific knobs here (temperature, speaking rate, etc.)."
      >
        <Textarea
          rows={14}
          value={settingsJson}
          onChange={(e) => setSettingsJson(e.target.value)}
          className="font-mono"
          spellCheck={false}
        />
        <div className="mt-4 flex items-center gap-2">
          <Button onClick={save} disabled={saving || loading}>
            {saving ? "Saving…" : "Save voice profile"}
          </Button>
          {ok && <div className="text-sm text-emerald-700">{ok}</div>}
          {error && <div className="text-sm text-rose-700">{error}</div>}
        </div>
      </Card>
    </div>
  );
}


