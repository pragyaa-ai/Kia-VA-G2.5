import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * POST /api/calls/ingest
 * 
 * Receives and stores the SI webhook payload format.
 * This endpoint should be called by the webhook service after generating
 * the payload, so the data is available in the admin UI for analytics.
 * 
 * Expected payload format (SI Webhook format):
 * {
 *   "id": "bot_...",
 *   "call_ref_id": "...",
 *   "customer_name": "Kia",
 *   "store_code": "UK401",
 *   "customer_number": 919556091099,
 *   "start_time": "2026-01-31 13:36:41",
 *   "end_time": "2026-01-31 13:38:00",
 *   "duration": 79,
 *   "completion_status": "partial",
 *   "response_data": [
 *     { "key_value": "name", "key_response": "Suman", ... },
 *     { "key_value": "model", "key_response": "EV9", ... },
 *     { "key_value": "test_drive", "key_response": "No", ... }
 *   ],
 *   ...
 * }
 */

interface ResponseDataItem {
  key_value: string;
  key_response: string;
  key_label?: string;
  remarks?: string;
  attempts?: number;
}

interface SIPayload {
  id?: string;
  call_ref_id: string;
  customer_name?: string;
  call_vendor?: string;
  store_code?: string;
  customer_number?: number | string;
  start_time?: string;
  end_time?: string;
  duration?: number;
  completion_status?: string;
  response_data?: ResponseDataItem[];
  language?: {
    welcome?: string;
    conversational?: string;
  };
  dealer_routing?: {
    status?: boolean;
    reason?: string;
    time?: string;
  };
  dropoff?: {
    time?: string;
    action?: string;
  };
}

// Helper to extract value from response_data array
function getResponseValue(responseData: ResponseDataItem[] | undefined, keyValue: string): string | null {
  if (!responseData) return null;
  const item = responseData.find((r) => r.key_value === keyValue);
  return item?.key_response?.trim() || null;
}

// Map completion_status to CallOutcome enum
function mapCompletionStatus(status?: string): "COMPLETE" | "PARTIAL" | "INCOMPLETE" | "TRANSFERRED" | null {
  if (!status) return null;
  const normalized = status.toLowerCase();
  if (normalized === "complete" || normalized === "completed") return "COMPLETE";
  if (normalized === "partial") return "PARTIAL";
  if (normalized === "incomplete") return "INCOMPLETE";
  if (normalized === "transferred" || normalized === "transfer") return "TRANSFERRED";
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const payload: SIPayload = await request.json();

    if (!payload.call_ref_id) {
      return NextResponse.json(
        { error: "Missing required field: call_ref_id" },
        { status: 400 }
      );
    }

    // Find voiceAgent by customer_name (slug)
    let voiceAgentId: string | null = null;
    if (payload.customer_name) {
      const voiceAgent = await prisma.voiceAgent.findFirst({
        where: {
          OR: [
            { slug: payload.customer_name.toLowerCase() },
            { name: { contains: payload.customer_name, mode: "insensitive" } },
          ],
        },
        select: { id: true },
      });
      voiceAgentId = voiceAgent?.id || null;
    }

    // Parse dates
    const startedAt = payload.start_time ? new Date(payload.start_time) : new Date();
    const endedAt = payload.end_time ? new Date(payload.end_time) : null;

    // Extract data from response_data for convenience
    const extractedData = {
      full_name: getResponseValue(payload.response_data, "name"),
      car_model: getResponseValue(payload.response_data, "model"),
      email_id: getResponseValue(payload.response_data, "email"),
      test_drive_interest: getResponseValue(payload.response_data, "test_drive"),
    };

    // Upsert the call session (update if exists, create if not)
    const callSession = await prisma.callSession.upsert({
      where: {
        callId: payload.call_ref_id,
      },
      update: {
        voiceAgentId,
        fromNumber: payload.customer_number?.toString() || null,
        startedAt,
        endedAt,
        durationSec: payload.duration || null,
        minutesBilled: payload.duration ? new Prisma.Decimal(Math.ceil(payload.duration / 60)) : null,
        outcome: mapCompletionStatus(payload.completion_status),
        extractedData: extractedData as Prisma.InputJsonValue,
        payloadJson: payload as unknown as Prisma.InputJsonValue,
      },
      create: {
        callId: payload.call_ref_id,
        voiceAgentId,
        direction: "inbound",
        fromNumber: payload.customer_number?.toString() || null,
        startedAt,
        endedAt,
        durationSec: payload.duration || null,
        minutesBilled: payload.duration ? new Prisma.Decimal(Math.ceil(payload.duration / 60)) : null,
        outcome: mapCompletionStatus(payload.completion_status),
        extractedData: extractedData as Prisma.InputJsonValue,
        payloadJson: payload as unknown as Prisma.InputJsonValue,
      },
    });

    console.log(`[Ingest] Call ${payload.call_ref_id} stored for ${payload.customer_name || "unknown"}`);

    return NextResponse.json({
      success: true,
      callSessionId: callSession.id,
      voiceAgentId,
      storeCode: payload.store_code,
      carModel: extractedData.car_model,
      testDrive: extractedData.test_drive_interest,
    });
  } catch (error) {
    console.error("[Ingest] Error storing call:", error);
    return NextResponse.json(
      { error: "Failed to store call data" },
      { status: 500 }
    );
  }
}
