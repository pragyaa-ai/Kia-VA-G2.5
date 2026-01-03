import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default async function CampaignsPage() {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Campaigns</h1>
          <p className="mt-1 text-sm text-slate-600">
            Each campaign maps to a number/case. Configure provider, call flow, guardrails, and voice.
          </p>
        </div>
        <Link href="/campaigns/new">
          <Button>New campaign</Button>
        </Link>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-slate-500">
              <tr className="border-b border-slate-200">
                <th className="py-3 pr-4 font-medium">Name</th>
                <th className="py-3 pr-4 font-medium">Phone</th>
                <th className="py-3 pr-4 font-medium">Provider</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-b border-slate-100">
                  <td className="py-3 pr-4">
                    <Link className="font-medium text-indigo-700 hover:underline" href={`/campaigns/${c.id}`}>
                      {c.name}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-slate-700">{c.phoneNumber ?? "—"}</td>
                  <td className="py-3 pr-4 text-slate-700">{c.provider}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={
                        "inline-flex rounded-full px-2 py-1 text-xs font-medium " +
                        (c.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600")
                      }
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <Link href={`/campaigns/${c.id}`}>
                      <Button variant="secondary">Open</Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {campaigns.length === 0 && (
                <tr>
                  <td className="py-6 text-slate-600" colSpan={5}>
                    No campaigns yet. Create your first campaign to start configuring call flows.
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


