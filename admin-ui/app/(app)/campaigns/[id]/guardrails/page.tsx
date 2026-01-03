"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

type Guardrail = {
  id: string;
  name: string;
  description: string | null;
  ruleText: string;
  enabled: boolean;
};

export default function GuardrailsPage({ params }: { params: { id: string } }) {
  const [guardrails, setGuardrails] = useState<Guardrail[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [ruleText, setRuleText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/campaigns/${params.id}/guardrails`, { cache: "no-store" });
    const json = await res.json();
    setGuardrails(json.guardrails ?? []);
  }

  useEffect(() => {
    void load();
  }, [params.id]);

  async function create() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/campaigns/${params.id}/guardrails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || undefined,
          ruleText,
          enabled: true
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to create guardrail");
      setName("");
      setDescription("");
      setRuleText("");
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Failed to create guardrail");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card
        title="Add guardrail"
        description="Guardrails are short, enforceable rules (privacy, compliance, tone, refusal policy)."
      >
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-700">Name</label>
            <div className="mt-2">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="No pricing promises" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Description (optional)</label>
            <div className="mt-2">
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Why this matters" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Rule text</label>
            <div className="mt-2">
              <Textarea
                rows={6}
                value={ruleText}
                onChange={(e) => setRuleText(e.target.value)}
                placeholder="Example: Never commit to a final on-road price. Offer to connect the customer with the dealership for pricing details."
              />
            </div>
          </div>
          {error && <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
          <Button onClick={create} disabled={saving || name.trim().length === 0 || ruleText.trim().length === 0}>
            {saving ? "Adding…" : "Add guardrail"}
          </Button>
        </div>
      </Card>

      <Card title="Configured guardrails" description="These will be applied for this campaign.">
        <div className="space-y-3">
          {guardrails.map((g) => (
            <div key={g.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-slate-900">{g.name}</div>
                  {g.description && <div className="mt-1 text-sm text-slate-600">{g.description}</div>}
                </div>
                <span
                  className={
                    "inline-flex rounded-full px-2 py-1 text-xs font-medium " +
                    (g.enabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600")
                  }
                >
                  {g.enabled ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{g.ruleText}</div>
            </div>
          ))}
          {guardrails.length === 0 && <div className="text-sm text-slate-600">No guardrails yet.</div>}
        </div>
      </Card>
    </div>
  );
}


