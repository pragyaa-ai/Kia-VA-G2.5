"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
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
  _count?: { sessions: number; feedback: number; guardrails: number };
}

export default function VoiceAgentsPage() {
  const [agents, setAgents] = useState<VoiceAgent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/voiceagents")
      .then((r) => r.json())
      .then(setAgents)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">VoiceAgents</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your VoiceAgent configurations
          </p>
        </div>
        <Link href="/voiceagents/new">
          <Button>+ New VoiceAgent</Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : agents.length === 0 ? (
        <Card className="p-8 text-center text-slate-500">
          No VoiceAgents yet. Create your first one!
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <Link key={agent.id} href={`/voiceagents/${agent.id}`}>
              <Card className="p-5 hover:shadow-md transition cursor-pointer">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-slate-900">{agent.name}</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {agent.phoneNumber || "No phone"}
                    </p>
                  </div>
                  <span
                    className={
                      "rounded-full px-2 py-0.5 text-xs font-medium " +
                      (agent.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-500")
                    }
                  >
                    {agent.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Voice</span>
                    <span className="font-medium text-slate-700">
                      {VOICE_NAMES[agent.voiceName] || agent.voiceName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Accent</span>
                    <span className="font-medium text-slate-700">
                      {ACCENTS[agent.accent] || agent.accent}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Language</span>
                    <span className="font-medium text-slate-700">
                      {LANGUAGES[agent.language] || agent.language}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400">
                  {agent._count?.sessions ?? 0} calls · {agent._count?.guardrails ?? 0} guardrails
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

