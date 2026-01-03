import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { GuardrailCreateSchema } from "@/src/lib/validation";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const guardrails = await prisma.guardrail.findMany({
    where: { campaignId: params.id },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json({ guardrails });
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const json = await req.json().catch(() => null);
  const parsed = GuardrailCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const created = await prisma.guardrail.create({
    data: { ...parsed.data, campaignId: params.id }
  });

  return NextResponse.json({ guardrail: created }, { status: 201 });
}


