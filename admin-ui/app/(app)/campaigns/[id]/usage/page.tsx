import { prisma } from "@/src/lib/prisma";
import { Card } from "@/components/ui/Card";

export default async function CampaignUsagePage({ params }: { params: { id: string } }) {
  const since = new Date(Date.now() - 7 * 86400 * 1000);

  const [sessions, count] = await Promise.all([
    prisma.callSession.findMany({
      where: { campaignId: params.id, startedAt: { gte: since } },
      orderBy: { startedAt: "desc" },
      take: 50
    }),
    prisma.callSession.count({
      where: { campaignId: params.id, startedAt: { gte: since } }
    })
  ]);

  const minutes = sessions.reduce((acc, s) => acc + Number(s.minutesBilled ?? 0), 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card title="Calls (last 7d)">
          <div className="text-3xl font-semibold text-slate-900">{count}</div>
          <div className="mt-1 text-sm text-slate-600">Tracked call sessions</div>
        </Card>
        <Card title="Minutes billed (last 7d)">
          <div className="text-3xl font-semibold text-slate-900">{minutes.toFixed(2)}</div>
          <div className="mt-1 text-sm text-slate-600">Sum of recorded minutes</div>
        </Card>
      </div>

      <Card title="Recent sessions" description="Last 50 sessions (we’ll wire ingestion from telephony next).">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-slate-500">
              <tr className="border-b border-slate-200">
                <th className="py-3 pr-4 font-medium">Started</th>
                <th className="py-3 pr-4 font-medium">Provider</th>
                <th className="py-3 pr-4 font-medium">From</th>
                <th className="py-3 pr-4 font-medium">Duration</th>
                <th className="py-3 pr-4 font-medium">Minutes</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="border-b border-slate-100">
                  <td className="py-3 pr-4 text-slate-700">{s.startedAt.toLocaleString()}</td>
                  <td className="py-3 pr-4 text-slate-700">{s.provider}</td>
                  <td className="py-3 pr-4 text-slate-700">{s.fromNumber ?? "—"}</td>
                  <td className="py-3 pr-4 text-slate-700">{s.durationSec ?? "—"}</td>
                  <td className="py-3 pr-4 text-slate-700">{s.minutesBilled?.toString() ?? "—"}</td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                  <td className="py-6 text-slate-600" colSpan={5}>
                    No sessions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}


