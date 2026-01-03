import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { FeedbackCreateSchema } from "@/src/lib/validation";

export async function GET() {
  const feedback = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
    take: 100
  });
  return NextResponse.json({ feedback });
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = FeedbackCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const created = await prisma.feedback.create({
    data: parsed.data
  });

  return NextResponse.json({ feedback: created }, { status: 201 });
}


