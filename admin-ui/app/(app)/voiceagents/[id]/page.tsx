"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";
import { VOICE_NAMES, ACCENTS, LANGUAGES, ENGINE_LABELS } from "@/lib/validation";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

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

interface Analytics {
  summary: {
    totalCalls: number;
    totalMinutes: number;
    avgDuration: number;
    dataCaptureRate: number;
    callsTrend: number;
  };
  chartData: Array<{ date: string; calls: number; minutes: number }>;
  outcomeDistribution: {
    complete: number;
    partial: number;
    incomplete: number;
    transferred: number;
  };
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
    unknown: number;
  };
}

interface RecentCall {
  id: string;
  callId?: string;
  startedAt: string;
  durationSec?: number;
  outcome?: string;
  sentiment?: string;
  summary?: string;
  fromNumber?: string;
}

const OUTCOME_COLORS = {
  complete: "#10b981",
  partial: "#f59e0b",
  incomplete: "#ef4444",
  transferred: "#8b5cf6",
};

const SENTIMENT_COLORS = {
  positive: "#10b981",
  neutral: "#6b7280",
  negative: "#ef4444",
  unknown: "#cbd5e1",
};

export default function VoiceAgentOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const [agent, setAgent] = useState<VoiceAgent | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [recentCalls, setRecentCalls] = useState<RecentCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [period, setPeriod] = useState("30d");
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
    Promise.all([
      fetch(`/api/voiceagents/${params.id}`).then((r) => r.json()),
      fetch(`/api/voiceagents/${params.id}/analytics?period=${period}`).then((r) => r.json()),
      fetch(`/api/voiceagents/${params.id}/calls?limit=5`).then((r) => r.json()),
    ])
      .then(([agentData, analyticsData, callsData]) => {
        setAgent(agentData);
        setAnalytics(analyticsData);
        setRecentCalls(callsData.calls || []);
        setForm({
          name: agentData.name,
          phoneNumber: agentData.phoneNumber || "",
          greeting: agentData.greeting,
          accent: agentData.accent,
          language: agentData.language,
          voiceName: agentData.voiceName,
          engine: agentData.engine,
          isActive: agentData.isActive,
        });
      })
      .finally(() => setLoading(false));
  }, [params.id, period]);

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

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  };

  const getSentimentBadge = (sentiment?: string) => {
    const styles: Record<string, string> = {
      POSITIVE: "bg-emerald-100 text-emerald-700",
      NEUTRAL: "bg-slate-100 text-slate-700",
      NEGATIVE: "bg-red-100 text-red-700",
    };
    if (!sentiment) return null;
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[sentiment] || styles.NEUTRAL}`}>
        {sentiment.toLowerCase()}
      </span>
    );
  };

  const getOutcomeBadge = (outcome?: string) => {
    const styles: Record<string, string> = {
      COMPLETE: "bg-emerald-100 text-emerald-700",
      PARTIAL: "bg-amber-100 text-amber-700",
      INCOMPLETE: "bg-red-100 text-red-700",
      TRANSFERRED: "bg-violet-100 text-violet-700",
    };
    if (!outcome) return null;
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[outcome] || "bg-slate-100 text-slate-700"}`}>
        {outcome.toLowerCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="space-y-4 w-full max-w-4xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
          <div className="h-64 rounded-xl bg-slate-100 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!agent) return <p className="text-red-500">VoiceAgent not found</p>;

  const outcomeData = analytics ? [
    { name: "Complete", value: analytics.outcomeDistribution.complete, color: OUTCOME_COLORS.complete },
    { name: "Partial", value: analytics.outcomeDistribution.partial, color: OUTCOME_COLORS.partial },
    { name: "Incomplete", value: analytics.outcomeDistribution.incomplete, color: OUTCOME_COLORS.incomplete },
    { name: "Transferred", value: analytics.outcomeDistribution.transferred, color: OUTCOME_COLORS.transferred },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="space-y-8">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Analytics Overview</h2>
        <div className="flex items-center gap-2">
          {["7d", "30d", "90d", "all"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                period === p
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {p === "all" ? "All Time" : p.replace("d", " Days")}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5 bg-gradient-to-br from-indigo-50 via-white to-indigo-50/30 border-indigo-100/50 shadow-lg shadow-indigo-100/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Calls</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{analytics?.summary.totalCalls || 0}</p>
              {analytics?.summary.callsTrend !== 0 && (
                <p className={`text-xs mt-1 font-medium ${analytics?.summary.callsTrend > 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {analytics?.summary.callsTrend > 0 ? "↑" : "↓"} {Math.abs(analytics?.summary.callsTrend || 0)}% vs prev
                </p>
              )}
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 border-emerald-100/50 shadow-lg shadow-emerald-100/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Minutes</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{analytics?.summary.totalMinutes.toFixed(1) || 0}</p>
              <p className="text-xs mt-1 text-slate-500">Billable time</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-amber-50 via-white to-amber-50/30 border-amber-100/50 shadow-lg shadow-amber-100/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Avg Duration</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{formatDuration(analytics?.summary.avgDuration || 0)}</p>
              <p className="text-xs mt-1 text-slate-500">Per call</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-violet-50 via-white to-violet-50/30 border-violet-100/50 shadow-lg shadow-violet-100/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Data Capture</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{analytics?.summary.dataCaptureRate || 0}%</p>
              <p className="text-xs mt-1 text-slate-500">Success rate</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calls by Date Chart */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Calls & Minutes by Date</h3>
          {analytics?.chartData && analytics.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={analytics.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="calls"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#colorCalls)"
                  name="Calls"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="minutes"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#colorMinutes)"
                  name="Minutes"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-400">
              No call data available for this period
            </div>
          )}
        </Card>

        {/* Outcome Distribution */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Call Outcomes</h3>
          {outcomeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={outcomeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {outcomeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-400">
              No outcome data available
            </div>
          )}
        </Card>
      </div>

      {/* Recent Calls Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900">Recent Calls</h3>
          <Link
            href={`/voiceagents/${params.id}/calls`}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            View all calls →
          </Link>
        </div>
        {recentCalls.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="py-3 pr-4 font-medium">Date</th>
                  <th className="py-3 pr-4 font-medium">Duration</th>
                  <th className="py-3 pr-4 font-medium">Outcome</th>
                  <th className="py-3 pr-4 font-medium">Sentiment</th>
                  <th className="py-3 font-medium">Summary</th>
                </tr>
              </thead>
              <tbody>
                {recentCalls.map((call) => (
                  <tr
                    key={call.id}
                    className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/voiceagents/${params.id}/calls/${call.callId || call.id}`)}
                  >
                    <td className="py-3 pr-4">
                      <div className="font-medium text-slate-900">
                        {new Date(call.startedAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(call.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-slate-700">
                      {call.durationSec ? formatDuration(call.durationSec) : "-"}
                    </td>
                    <td className="py-3 pr-4">{getOutcomeBadge(call.outcome)}</td>
                    <td className="py-3 pr-4">{getSentimentBadge(call.sentiment)}</td>
                    <td className="py-3 max-w-xs truncate text-slate-600">
                      {call.summary || <span className="text-slate-400 italic">No summary</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            <p>No calls recorded yet.</p>
            <p className="text-xs mt-1">Calls will appear here as they are processed.</p>
          </div>
        )}
      </Card>

      {/* Configuration Card */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Configuration</h2>
            <p className="text-sm text-slate-500">Core settings for this VoiceAgent</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
            agent.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${agent.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
            {agent.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Kia VoiceAgent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Inbound Phone Number</label>
            <Input
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              placeholder="+91 9876543210"
            />
            <p className="mt-1 text-xs text-slate-400">The phone number callers dial to reach this VoiceAgent</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Greeting Message</label>
          <Textarea
            value={form.greeting}
            onChange={(e) => setForm({ ...form, greeting: e.target.value })}
            rows={3}
            placeholder="Hello! Welcome to..."
          />
          <p className="mt-1 text-xs text-slate-400">The first message spoken when a call connects</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Voice</label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              value={form.voiceName}
              onChange={(e) => setForm({ ...form, voiceName: e.target.value as keyof typeof VOICE_NAMES })}
            >
              {Object.entries(VOICE_NAMES).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Accent</label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              value={form.accent}
              onChange={(e) => setForm({ ...form, accent: e.target.value as keyof typeof ACCENTS })}
            >
              {Object.entries(ACCENTS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Language</label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value as keyof typeof LANGUAGES })}
            >
              {Object.entries(LANGUAGES).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Engine</label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              value={form.engine}
              onChange={(e) => setForm({ ...form, engine: e.target.value as keyof typeof ENGINE_LABELS })}
            >
              {Object.entries(ENGINE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <input
            type="checkbox"
            id="isActive"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="isActive" className="text-sm text-slate-700">
            VoiceAgent is active and accepting calls
          </label>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-5">
          <p className="text-xs text-slate-400">
            Created {new Date(agent.createdAt).toLocaleDateString()} · Last updated {new Date(agent.updatedAt).toLocaleDateString()}
          </p>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
