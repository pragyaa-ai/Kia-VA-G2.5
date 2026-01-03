import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { CampaignCreateSchema } from "@/src/lib/validation";

export async function GET() {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json({ campaigns });
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = CampaignCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const created = await prisma.campaign.create({
    data: parsed.data
  });

  return NextResponse.json({ campaign: created }, { status: 201 });
}


