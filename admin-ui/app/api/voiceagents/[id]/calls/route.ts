import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/voiceagents/[id]/calls
 * List calls for a VoiceAgent with filtering, pagination, and date range
 * 
 * Query params:
 * - page: number (default 1)
 * - limit: number (default 20)
 * - startDate: ISO date string
 * - endDate: ISO date string
 * - outcome: COMPLETE | PARTIAL | INCOMPLETE | TRANSFERRED
 * - sentiment: POSITIVE | NEUTRAL | NEGATIVE
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const outcome = searchParams.get("outcome");
    const sentiment = searchParams.get("sentiment");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {
      voiceAgentId: params.id,
    };

    // Date range filter
    if (startDate || endDate) {
      where.startedAt = {};
      if (startDate) {
        (where.startedAt as Record<string, Date>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.startedAt as Record<string, Date>).lte = new Date(endDate);
      }
    }

    // Outcome filter
    if (outcome) {
      where.outcome = outcome;
    }

    // Sentiment filter
    if (sentiment) {
      where.sentiment = sentiment;
    }

    // Fetch calls with pagination
    const [calls, total] = await Promise.all([
      prisma.callSession.findMany({
        where,
        orderBy: { startedAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          callId: true,
          direction: true,
          fromNumber: true,
          toNumber: true,
          startedAt: true,
          endedAt: true,
          durationSec: true,
          minutesBilled: true,
          outcome: true,
          sentiment: true,
          sentimentScore: true,
          summary: true,
          extractedData: true,
        },
      }),
      prisma.callSession.count({ where }),
    ]);

    return NextResponse.json({
      calls,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching calls:", error);
    return NextResponse.json(
      { error: "Failed to fetch calls" },
      { status: 500 }
    );
  }
}
