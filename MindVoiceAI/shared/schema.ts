import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const assessments = pgTable("assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  demographics: jsonb("demographics").notNull(),
  phq9Responses: jsonb("phq9_responses").notNull(),
  phq9Score: integer("phq9_score").notNull(),
  voiceAnalysis: jsonb("voice_analysis"),
  transcript: text("transcript"),
  finalAssessment: jsonb("final_assessment"),
  severity: varchar("severity", { length: 50 }),
  recommendations: jsonb("recommendations"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAssessmentSchema = createInsertSchema(assessments).omit({
  id: true,
  createdAt: true,
});

export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type Assessment = typeof assessments.$inferSelect;

// Zod schemas for validation
export const demographicsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.number().min(18, "Must be 18 or older").max(100, "Invalid age"),
  gender: z.enum(["male", "female", "non-binary", "prefer-not-to-say"]),
  relationshipStatus: z.enum(["single", "married", "relationship", "divorced", "widowed"]),
});

export const phq9ResponseSchema = z.object({
  questionIndex: z.number().min(0).max(8),
  score: z.number().min(0).max(3),
});

export const voiceAnalysisSchema = z.object({
  speechRate: z.number(),
  pauseCount: z.number(),
  avgPitch: z.number(),
  sentiment: z.number(),
  duration: z.number(),
});

export type Demographics = z.infer<typeof demographicsSchema>;
export type PHQ9Response = z.infer<typeof phq9ResponseSchema>;
export type VoiceAnalysis = z.infer<typeof voiceAnalysisSchema>;
