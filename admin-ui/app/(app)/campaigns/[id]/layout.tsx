import Link from "next/link";
import { prisma } from "@/src/lib/prisma";

export default async function CampaignLayout({
  params,
  children
}: {
  params: { id: string };
  children: React.ReactNode;
}) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, phoneNumber: true, engine: true, isActive: true }
  });

  if (!campaign) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-semibold text-slate-900">Campaign not found</div>
        <div className="mt-1 text-sm text-slate-600">
          The campaign may have been deleted or the link is incorrect.
        </div>
        <div className="mt-4">
          <Link className="text-sm font-medium text-indigo-700 hover:underline" href="/campaigns">
            Back to campaigns
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { href: `/campaigns/${campaign.id}`, label: "Overview" },
    { href: `/campaigns/${campaign.id}/callflow`, label: "Call flow" },
    { href: `/campaigns/${campaign.id}/guardrails`, label: "Guardrails" },
    { href: `/campaigns/${campaign.id}/voice`, label: "Voice" },
    { href: `/campaigns/${campaign.id}/feedback`, label: "Feedback" },
    { href: `/campaigns/${campaign.id}/usage`, label: "Usage" }
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs text-slate-500">Campaign</div>
            <h1 className="mt-1 text-lg font-semibold text-slate-900">{campaign.name}</h1>
            <div className="mt-1 text-sm text-slate-600">
              {campaign.phoneNumber ?? "—"} • {campaign.engine} •{" "}
              {campaign.isActive ? "Active" : "Inactive"}
            </div>
          </div>
          <Link href="/campaigns" className="text-sm font-medium text-indigo-700 hover:underline">
            Back to campaigns
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="rounded-xl bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      {children}
    </div>
  );
}


