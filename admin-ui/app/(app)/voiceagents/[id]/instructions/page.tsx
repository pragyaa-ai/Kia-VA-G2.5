"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";

export default function InstructionsPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [systemInstructions, setSystemInstructions] = useState("");
  const [agentName, setAgentName] = useState("");
  const [slug, setSlug] = useState("");

  useEffect(() => {
    fetch(`/api/voiceagents/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setSystemInstructions(data.systemInstructions || "");
        setAgentName(data.name || "");
        setSlug(data.slug || "");
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    const res = await fetch(`/api/voiceagents/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemInstructions }),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">System Instructions</h2>
          <p className="mt-1 text-sm text-slate-500">
            Full prompt/instructions used by the VoiceAgent during calls. This is sent to the AI model
            as system instructions and controls how the agent behaves.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-amber-800">
              <strong>Agent Key:</strong> <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono">{slug}</code>
              <p className="mt-1 text-amber-700">
                Telephony URL: <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-xs">
                  wss://ws-singleinterfacews.pragyaa.ai/wsNew1?agent={slug}
                </code>
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Instructions for {agentName}
          </label>
          <Textarea
            value={systemInstructions}
            onChange={(e) => setSystemInstructions(e.target.value)}
            rows={30}
            placeholder="Enter the full system instructions for this VoiceAgent..."
            className="font-mono text-sm leading-relaxed"
          />
          <p className="mt-2 text-xs text-slate-400">
            {systemInstructions.length.toLocaleString()} characters
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            {saved && (
              <span className="text-sm text-emerald-600 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved successfully
              </span>
            )}
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Instructions"}
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-slate-50 border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Tips for Writing Instructions</h3>
        <ul className="text-sm text-slate-600 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">•</span>
            <span>Define the agent&apos;s personality, tone, and accent clearly</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">•</span>
            <span>Specify data points to collect (name, model, test drive, email)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">•</span>
            <span>Include language switching rules (Hindi/English)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">•</span>
            <span>Add error handling instructions (unclear audio, timeouts)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">•</span>
            <span>Define transfer protocol and closing phrases</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
