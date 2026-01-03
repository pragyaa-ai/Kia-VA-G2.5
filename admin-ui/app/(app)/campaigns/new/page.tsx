"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function NewCampaignPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [engine, setEngine] = useState<"PRIMARY" | "SECONDARY">("PRIMARY");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onCreate() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phoneNumber: phoneNumber || undefined,
          engine,
          isActive
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to create campaign");
      router.push(`/campaigns/${json.campaign.id}`);
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "Failed to create campaign");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">New campaign</h1>
        <p className="mt-1 text-sm text-slate-600">
          Create a campaign per number/case. You can configure call flow, guardrails, and voice next.
        </p>
      </div>

      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-slate-700">Name</label>
            <div className="mt-2">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Kia Spotlight" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Phone number (optional)</label>
            <div className="mt-2">
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91XXXXXXXXXX"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">VoiceAgent engine</label>
            <div className="mt-2">
              <select
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={engine}
                onChange={(e) => setEngine(e.target.value as any)}
              >
                <option value="PRIMARY">Primary</option>
                <option value="SECONDARY">Secondary</option>
              </select>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Active
            </label>
          </div>
        </div>

        {error && <div className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

        <div className="mt-5 flex items-center gap-2">
          <Button onClick={onCreate} disabled={saving || name.trim().length === 0}>
            {saving ? "Creating…" : "Create campaign"}
          </Button>
          <Button variant="secondary" onClick={() => router.push("/campaigns")} disabled={saving}>
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}


