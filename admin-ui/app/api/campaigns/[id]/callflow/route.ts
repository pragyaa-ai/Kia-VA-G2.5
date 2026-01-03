import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { CallFlowUpsertSchema } from "@/src/lib/validation";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const callFlow = await prisma.callFlow.findUnique({
    where: { campaignId: params.id },
    include: { steps: { orderBy: { order: "asc" } } }
  });
  return NextResponse.json({ callFlow });
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const json = await req.json().catch(() => null);
  const parsed = CallFlowUpsertSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { greeting, steps } = parsed.data;

  const updated = await prisma.callFlow.upsert({
    where: { campaignId: params.id },
    create: {
      campaignId: params.id,
      greeting,
      steps: { create: steps }
    },
    update: {
      greeting,
      steps: {
        deleteMany: {},
        create: steps
      }
    },
    include: { steps: { orderBy: { order: "asc" } } }
  });

  return NextResponse.json({ callFlow: updated });
}


