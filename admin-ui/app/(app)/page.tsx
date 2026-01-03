import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default async function DashboardPage() {
  const [campaignsTotal, campaignsActive, feedbackRecent, sessionsRecent] = await Promise.all([
    prisma.campaign.count(),
    prisma.campaign.count({ where: { isActive: true } }),
    prisma.feedback.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 86400 * 1000) } } }),
    prisma.callSession.count({ where: { startedAt: { gte: new Date(Date.now() - 7 * 86400 * 1000) } } })
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            A clean overview of configuration and usage.
          </p>
        </div>
        <Link href="/campaigns/new">
          <Button>New campaign</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Campaigns">
          <div className="text-3xl font-semibold text-slate-900">{campaignsTotal}</div>
          <div className="mt-1 text-sm text-slate-600">{campaignsActive} active</div>
        </Card>
        <Card title="Calls (last 7d)">
          <div className="text-3xl font-semibold text-slate-900">{sessionsRecent}</div>
          <div className="mt-1 text-sm text-slate-600">Telephony + UI sessions</div>
        </Card>
        <Card title="Feedback (last 7d)">
          <div className="text-3xl font-semibold text-slate-900">{feedbackRecent}</div>
          <div className="mt-1 text-sm text-slate-600">Testing notes & issues</div>
        </Card>
        <Card title="Provider switching">
          <div className="text-sm text-slate-600">
            Set per campaign. Default: <span className="font-medium text-slate-900">Gemini</span>
          </div>
        </Card>
      </div>

      <Card
        title="What you can do here"
        description="Everything is organized per campaign (number/case) so the UI stays intuitive."
      >
        <ul className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
          <li>
            - Create/edit call flows (greeting + steps)
          </li>
          <li>
            - Add guardrails
          </li>
          <li>
            - Tune voice profile (voice + accent notes)
          </li>
          <li>
            - Track calls and minutes
          </li>
        </ul>
      </Card>
    </div>
  );
}


