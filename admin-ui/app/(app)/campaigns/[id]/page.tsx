import { prisma } from "@/src/lib/prisma";
import { Card } from "@/components/ui/Card";

export default async function CampaignOverviewPage({ params }: { params: { id: string } }) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: params.id },
    include: {
      callFlow: { include: { steps: { orderBy: { order: "asc" } } } },
      guardrails: true,
      voiceProfile: true
    }
  });

  if (!campaign) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card title="Call flow" description="Greeting + step list">
        <div className="text-sm text-slate-700">
          {campaign.callFlow ? (
            <>
              <div className="font-medium text-slate-900">Greeting</div>
              <div className="mt-1 line-clamp-3 whitespace-pre-wrap">{campaign.callFlow.greeting}</div>
              <div className="mt-3 text-xs text-slate-500">
                Steps: {campaign.callFlow.steps.length}
              </div>
            </>
          ) : (
            <div className="text-slate-600">Not configured yet.</div>
          )}
        </div>
      </Card>

      <Card title="Guardrails" description="Safety + policy rules">
        <div className="text-3xl font-semibold text-slate-900">{campaign.guardrails.length}</div>
        <div className="mt-1 text-sm text-slate-600">Rules configured</div>
      </Card>

      <Card title="Voice profile" description="Voice + accent notes">
        {campaign.voiceProfile ? (
          <div className="text-sm text-slate-700">
            <div className="font-medium text-slate-900">{campaign.voiceProfile.voiceName}</div>
            <div className="mt-1 text-slate-600">
              {campaign.voiceProfile.accentNotes ?? "— consider adding accent notes"}
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-600">Not configured yet.</div>
        )}
      </Card>
    </div>
  );
}


