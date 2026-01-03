"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

type Feedback = { id: string; message: string; source: string; createdAt: string };

export default function CampaignFeedbackPage({ params }: { params: { id: string } }) {
  const [items, setItems] = useState<Feedback[]>([]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/feedback?campaignId=${encodeURIComponent(params.id)}`, {
      cache: "no-store"
    });
    const json = await res.json();
    setItems(json.feedback ?? []);
  }

  useEffect(() => {
    void load();
  }, [params.id]);

  async function create() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId: params.id, source: "testing", message })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to create feedback");
      setMessage("");
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Failed to create feedback");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card
        title="Add feedback"
        description="Capture what you observed in testing so we can iteratively improve behavior."
      >
        <Textarea
          rows={8}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Example: Agent should ask one question at a time. Add a confirmation step after capturing phone number."
        />
        {error && <div className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
        <div className="mt-3">
          <Button onClick={create} disabled={saving || message.trim().length === 0}>
            {saving ? "Saving…" : "Save feedback"}
          </Button>
        </div>
      </Card>

      <Card title="Recent feedback" description="Latest 100 entries for this campaign.">
        <div className="space-y-3">
          {items.map((f) => (
            <div key={f.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs text-slate-500">
                {new Date(f.createdAt).toLocaleString()} • {f.source}
              </div>
              <div className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{f.message}</div>
            </div>
          ))}
          {items.length === 0 && <div className="text-sm text-slate-600">No feedback yet.</div>}
        </div>
      </Card>
    </div>
  );
}


