"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";

type Feedback = { id: string; message: string; source: string; createdAt: string; campaignId?: string | null };

export default function FeedbackPage() {
  const [items, setItems] = useState<Feedback[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/feedback", { cache: "no-store" });
      const json = await res.json();
      setItems(json.feedback ?? []);
    }
    void load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Feedback</h1>
        <p className="mt-1 text-sm text-slate-600">Latest 100 feedback entries across campaigns.</p>
      </div>

      <Card>
        <div className="space-y-3">
          {items.map((f) => (
            <div key={f.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs text-slate-500">
                {new Date(f.createdAt).toLocaleString()} • {f.source} •{" "}
                {f.campaignId ? `campaign: ${f.campaignId}` : "campaign: —"}
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


