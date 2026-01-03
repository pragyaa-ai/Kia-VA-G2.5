import { z } from "zod";

export const CampaignCreateSchema = z.object({
  name: z.string().min(1).max(120),
  phoneNumber: z.string().min(3).max(32).optional(),
  provider: z.enum(["GEMINI", "OPENAI"]).default("GEMINI"),
  isActive: z.boolean().default(true)
});

export const CampaignUpdateSchema = CampaignCreateSchema.partial().extend({
  id: z.string().min(1)
});

export const FeedbackCreateSchema = z.object({
  campaignId: z.string().min(1).optional(),
  source: z.string().min(1).max(50).default("testing"),
  message: z.string().min(1).max(4000)
});

export const CallFlowUpsertSchema = z.object({
  greeting: z.string().min(1).max(8000),
  steps: z
    .array(
      z.object({
        order: z.number().int().min(1).max(1000),
        title: z.string().min(1).max(200),
        content: z.string().min(1).max(8000),
        enabled: z.boolean().default(true)
      })
    )
    .max(200)
});

export const GuardrailCreateSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  ruleText: z.string().min(1).max(8000),
  enabled: z.boolean().default(true)
});

export const VoiceProfileUpsertSchema = z.object({
  voiceName: z.string().min(1).max(120),
  accentNotes: z.string().max(4000).optional(),
  settingsJson: z.any().optional()
});


