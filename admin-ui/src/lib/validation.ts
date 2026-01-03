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


