import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/voiceagents/[id]/analytics
 * Get aggregated analytics for charts
 * 
 * Query params:
 * - period: "today" | "7d" | "30d" | "90d" | "all" (default: "30d")
 * - startDate: ISO date string for custom range
 * - endDate: ISO date string for custom range
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d";
    const customStartDate = searchParams.get("startDate");
    const customEndDate = searchParams.get("endDate");

    // Calculate date range
    let startDate: Date | undefined;
    let endDate: Date | undefined;
    const now = new Date();

    // Handle custom date range
    if (customStartDate && customEndDate) {
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
      // Set end date to end of day
      endDate.setHours(23, 59, 59, 999);
    } else {
      switch (period) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "7d":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "90d":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case "all":
          startDate = undefined;
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
    }

    const where: Record<string, unknown> = {
      voiceAgentId: params.id,
    };

    if (startDate || endDate) {
      where.startedAt = {};
      if (startDate) {
        (where.startedAt as Record<string, Date>).gte = startDate;
      }
      if (endDate) {
        (where.startedAt as Record<string, Date>).lte = endDate;
      }
    }

    // Get all calls in period
    const calls = await prisma.callSession.findMany({
      where,
      select: {
        id: true,
        startedAt: true,
        durationSec: true,
        minutesBilled: true,
        outcome: true,
        sentiment: true,
      },
      orderBy: { startedAt: "asc" },
    });

    // Aggregate by date
    const callsByDate: Record<string, { calls: number; minutes: number }> = {};
    
    for (const call of calls) {
      const dateKey = call.startedAt.toISOString().split("T")[0];
      if (!callsByDate[dateKey]) {
        callsByDate[dateKey] = { calls: 0, minutes: 0 };
      }
      callsByDate[dateKey].calls += 1;
      callsByDate[dateKey].minutes += Number(call.minutesBilled || 0);
    }

    // Convert to array for charts
    const chartData = Object.entries(callsByDate)
      .map(([date, data]) => ({
        date,
        calls: data.calls,
        minutes: Math.round(data.minutes * 100) / 100,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate outcome distribution
    const outcomeDistribution = {
      complete: calls.filter((c) => c.outcome === "COMPLETE").length,
      partial: calls.filter((c) => c.outcome === "PARTIAL").length,
      incomplete: calls.filter((c) => c.outcome === "INCOMPLETE").length,
      transferred: calls.filter((c) => c.outcome === "TRANSFERRED").length,
    };

    // Calculate sentiment distribution
    const sentimentDistribution = {
      positive: calls.filter((c) => c.sentiment === "POSITIVE").length,
      neutral: calls.filter((c) => c.sentiment === "NEUTRAL").length,
      negative: calls.filter((c) => c.sentiment === "NEGATIVE").length,
      unknown: calls.filter((c) => !c.sentiment).length,
    };

    // Calculate summary stats
    const totalCalls = calls.length;
    const totalMinutes = calls.reduce((acc, c) => acc + Number(c.minutesBilled || 0), 0);
    const avgDuration = totalCalls > 0
      ? calls.reduce((acc, c) => acc + (c.durationSec || 0), 0) / totalCalls
      : 0;
    const dataCaptureRate = totalCalls > 0
      ? ((outcomeDistribution.complete + outcomeDistribution.partial) / totalCalls) * 100
      : 0;

    // Calculate trend (compare to previous period)
    let previousPeriodCalls = 0;
    if (startDate) {
      const previousStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
      previousPeriodCalls = await prisma.callSession.count({
        where: {
          voiceAgentId: params.id,
          startedAt: {
            gte: previousStartDate,
            lt: startDate,
          },
        },
      });
    }

    const callsTrend = previousPeriodCalls > 0
      ? ((totalCalls - previousPeriodCalls) / previousPeriodCalls) * 100
      : 0;

    return NextResponse.json({
      summary: {
        totalCalls,
        totalMinutes: Math.round(totalMinutes * 100) / 100,
        avgDuration: Math.round(avgDuration),
        dataCaptureRate: Math.round(dataCaptureRate * 10) / 10,
        callsTrend: Math.round(callsTrend * 10) / 10,
      },
      chartData,
      outcomeDistribution,
      sentimentDistribution,
      period,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
