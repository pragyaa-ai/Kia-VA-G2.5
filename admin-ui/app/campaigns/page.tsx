 "use client";

import { useEffect, useState } from "react";

type Campaign = {
  id: string;
  name: string;
  phoneNumber: string | null;
  provider: "GEMINI" | "OPENAI";
  isActive: boolean;
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/campaigns", { cache: "no-store" });
        const data = await res.json();
        setCampaigns(data.campaigns ?? []);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-xl font-semibold">Campaigns</h1>
      <p className="mt-1 text-sm text-slate-300">
        Per-number/campaign configuration (provider, call flow, guardrails, voice).
      </p>

      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/30 p-4">
        <div className="text-sm text-slate-300">
          Create campaigns via API for now:
        </div>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-950 p-3 text-xs text-slate-200">
{`curl -sS -X POST http://localhost:3100/api/campaigns \\
  -H 'Content-Type: application/json' \\
  -d '{"name":"Kia Spotlight","phoneNumber":"+91XXXXXXXXXX","provider":"GEMINI","isActive":true}' | jq`}
        </pre>
      </div>

      <div className="mt-6 grid gap-3">
        {campaigns.map((c) => (
          <div key={c.id} className="rounded-xl border border-slate-800 bg-slate-900/30 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-sm text-slate-400">
                  {c.phoneNumber ?? "—"} • {c.provider} • {c.isActive ? "active" : "inactive"}
                </div>
              </div>
              <div className="text-xs text-slate-500">id: {c.id}</div>
            </div>
          </div>
        ))}
        {!loading && campaigns.length === 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4 text-sm text-slate-300">
            No campaigns yet.
          </div>
        )}
        {loading && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4 text-sm text-slate-300">
            Loading…
          </div>
        )}
      </div>
    </main>
  );
}


