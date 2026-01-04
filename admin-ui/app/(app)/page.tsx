import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Welcome to the VoiceAgent Admin. Manage your VoiceAgents, call flows, and track usage.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/voiceagents">
          <Card className="p-6 hover:shadow-md transition cursor-pointer">
            <h3 className="font-medium text-slate-900">VoiceAgents</h3>
            <p className="mt-1 text-sm text-slate-500">
              Configure greeting, voice, accent, and call flows.
            </p>
          </Card>
        </Link>

        <Link href="/feedback">
          <Card className="p-6 hover:shadow-md transition cursor-pointer">
            <h3 className="font-medium text-slate-900">Feedback</h3>
            <p className="mt-1 text-sm text-slate-500">
              Review testing feedback and improve behavior.
            </p>
          </Card>
        </Link>

        <Link href="/usage">
          <Card className="p-6 hover:shadow-md transition cursor-pointer">
            <h3 className="font-medium text-slate-900">Usage</h3>
            <p className="mt-1 text-sm text-slate-500">
              Track calls and minutes across all VoiceAgents.
            </p>
          </Card>
        </Link>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Quick Start</h2>
        <p className="text-sm text-slate-600 mb-4">
          Create a new VoiceAgent or configure your existing Kia VoiceAgent.
        </p>
        <div className="flex gap-3">
          <Link href="/voiceagents/new">
            <Button>+ New VoiceAgent</Button>
          </Link>
          <Link href="/voiceagents">
            <Button variant="secondary">View All</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
