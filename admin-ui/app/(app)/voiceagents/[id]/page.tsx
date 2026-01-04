"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";
import { VOICE_NAMES, ACCENTS, LANGUAGES, ENGINE_LABELS } from "@/lib/validation";

interface VoiceAgent {
  id: string;
  name: string;
  phoneNumber?: string;
  engine: keyof typeof ENGINE_LABELS;
  greeting: string;
  accent: keyof typeof ACCENTS;
  language: keyof typeof LANGUAGES;
  voiceName: keyof typeof VOICE_NAMES;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { sessions: number; feedback: number };
}

export default function VoiceAgentOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const [agent, setAgent] = useState<VoiceAgent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phoneNumber: "",
    greeting: "",
    accent: "INDIAN" as keyof typeof ACCENTS,
    language: "ENGLISH" as keyof typeof LANGUAGES,
    voiceName: "ANANYA" as keyof typeof VOICE_NAMES,
    engine: "PRIMARY" as keyof typeof ENGINE_LABELS,
    isActive: true,
  });

  useEffect(() => {
    fetch(`/api/voiceagents/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setAgent(data);
        setForm({
          name: data.name,
          phoneNumber: data.phoneNumber || "",
          greeting: data.greeting,
          accent: data.accent,
          language: data.language,
          voiceName: data.voiceName,
          engine: data.engine,
          isActive: data.isActive,
        });
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/voiceagents/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const updated = await res.json();
      setAgent(updated);
    }
    setSaving(false);
  };

  if (loading) return <p className="text-slate-500">Loading...</p>;
  if (!agent) return <p className="text-red-500">VoiceAgent not found</p>;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2 p-6 space-y-5">
        <h2 className="text-lg font-semibold text-slate-900">Configuration</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
            <Input
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Greeting</label>
          <Textarea
            value={form.greeting}
            onChange={(e) => setForm({ ...form, greeting: e.target.value })}
            rows={3}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Voice</label>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.voiceName}
              onChange={(e) => setForm({ ...form, voiceName: e.target.value as keyof typeof VOICE_NAMES })}
            >
              {Object.entries(VOICE_NAMES).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Accent</label>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.accent}
              onChange={(e) => setForm({ ...form, accent: e.target.value as keyof typeof ACCENTS })}
            >
              {Object.entries(ACCENTS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Language</label>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value as keyof typeof LANGUAGES })}
            >
              {Object.entries(LANGUAGES).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Engine</label>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.engine}
              onChange={(e) => setForm({ ...form, engine: e.target.value as keyof typeof ENGINE_LABELS })}
            >
              {Object.entries(ENGINE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            className="rounded border-slate-300"
          />
          <label htmlFor="isActive" className="text-sm text-slate-700">Active</label>
        </div>

        <div className="pt-4 flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </Card>

      <Card className="p-6 space-y-4 h-fit">
        <h2 className="text-lg font-semibold text-slate-900">Stats</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Total Calls</span>
            <span className="font-medium text-slate-900">{agent._count?.sessions ?? 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Feedback</span>
            <span className="font-medium text-slate-900">{agent._count?.feedback ?? 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Created</span>
            <span className="font-medium text-slate-900">
              {new Date(agent.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

