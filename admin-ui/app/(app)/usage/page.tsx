import { prisma } from "@/src/lib/prisma";
import { Card } from "@/components/ui/Card";

export default async function UsagePage() {
  const since = new Date(Date.now() - 7 * 86400 * 1000);

  const [calls, campaigns] = await Promise.all([
    prisma.callSession.count({ where: { startedAt: { gte: since } } }),
    prisma.campaign.count()
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Usage</h1>
        <p className="mt-1 text-sm text-slate-600">High-level usage overview (last 7 days).</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card title="Calls (last 7d)">
          <div className="text-3xl font-semibold text-slate-900">{calls}</div>
          <div className="mt-1 text-sm text-slate-600">All campaigns</div>
        </Card>
        <Card title="Campaigns">
          <div className="text-3xl font-semibold text-slate-900">{campaigns}</div>
          <div className="mt-1 text-sm text-slate-600">Configured cases</div>
        </Card>
      </div>

      <Card title="Next" description="We’ll add call/minute breakdown per campaign and provider.">
        <div className="text-sm text-slate-700">
          Once telephony emits end-of-call events, we’ll ingest them into `CallSession` and show
          per-campaign minutes and trends.
        </div>
      </Card>
    </div>
  );
}


