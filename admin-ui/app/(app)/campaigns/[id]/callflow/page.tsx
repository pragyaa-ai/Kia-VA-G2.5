"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";

type Step = { order: number; title: string; content: string; enabled: boolean };

export default function CallFlowPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [greeting, setGreeting] = useState("");
  const [steps, setSteps] = useState<Step[]>([
    { order: 1, title: "Step 1", content: "", enabled: true }
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/campaigns/${params.id}/callflow`, { cache: "no-store" });
        const json = await res.json();
        const cf = json.callFlow;
        if (cf) {
          setGreeting(cf.greeting ?? "");
          setSteps(
            (cf.steps ?? []).map((s: any) => ({
              order: s.order,
              title: s.title,
              content: s.content,
              enabled: s.enabled
            }))
          );
        }
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [params.id]);

  const nextOrder = useMemo(() => (steps.length ? Math.max(...steps.map((s) => s.order)) + 1 : 1), [steps]);

  function addStep() {
    setSteps((prev) => [...prev, { order: nextOrder, title: `Step ${nextOrder}`, content: "", enabled: true }]);
  }

  function updateStep(idx: number, patch: Partial<Step>) {
    setSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  }

  function removeStep(idx: number) {
    setSteps((prev) => prev.filter((_, i) => i !== idx));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/campaigns/${params.id}/callflow`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          greeting,
          steps: steps
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((s) => ({ ...s, order: Number(s.order) }))
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to save call flow");
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "Failed to save call flow");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card
        title="Greeting"
        description="The very first thing the agent says. Keep it warm, short, and role-specific."
      >
        <Textarea rows={5} value={greeting} onChange={(e) => setGreeting(e.target.value)} />
      </Card>

      <Card
        title="Steps"
        description="Order the conversation into small steps. Keep each step focused and testable."
      >
        <div className="space-y-4">
          {steps
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((s, idx) => (
              <div key={`${s.order}-${idx}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="grid gap-3 sm:grid-cols-6">
                  <div className="sm:col-span-1">
                    <label className="text-xs font-medium text-slate-600">Order</label>
                    <Input
                      type="number"
                      value={s.order}
                      onChange={(e) => updateStep(idx, { order: Number(e.target.value) })}
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="text-xs font-medium text-slate-600">Title</label>
                    <Input value={s.title} onChange={(e) => updateStep(idx, { title: e.target.value })} />
                  </div>
                  <div className="sm:col-span-2 flex items-end justify-between gap-2">
                    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300"
                        checked={s.enabled}
                        onChange={(e) => updateStep(idx, { enabled: e.target.checked })}
                      />
                      Enabled
                    </label>
                    <Button variant="ghost" onClick={() => removeStep(idx)}>
                      Remove
                    </Button>
                  </div>
                  <div className="sm:col-span-6">
                    <label className="text-xs font-medium text-slate-600">Content</label>
                    <Textarea
                      rows={4}
                      value={s.content}
                      onChange={(e) => updateStep(idx, { content: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            ))}

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={addStep}>
              Add step
            </Button>
            <Button onClick={save} disabled={saving || loading}>
              {saving ? "Saving…" : "Save call flow"}
            </Button>
          </div>

          {error && <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
        </div>
      </Card>
    </div>
  );
}


