import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { VoiceProfileUpsertSchema } from "@/src/lib/validation";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const voiceProfile = await prisma.voiceProfile.findUnique({
    where: { campaignId: params.id }
  });
  return NextResponse.json({ voiceProfile });
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const json = await req.json().catch(() => null);
  const parsed = VoiceProfileUpsertSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const updated = await prisma.voiceProfile.upsert({
    where: { campaignId: params.id },
    create: { campaignId: params.id, ...parsed.data },
    update: parsed.data
  });

  return NextResponse.json({ voiceProfile: updated });
}


