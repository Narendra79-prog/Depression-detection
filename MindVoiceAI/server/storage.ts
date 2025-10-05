import { type Assessment, type InsertAssessment } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getAssessment(id: string): Promise<Assessment | undefined>;
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  updateAssessment(id: string, updates: Partial<Assessment>): Promise<Assessment | undefined>;
  getAssessmentsByDateRange(startDate: Date, endDate: Date): Promise<Assessment[]>;
}

export class MemStorage implements IStorage {
  private assessments: Map<string, Assessment>;

  constructor() {
    this.assessments = new Map();
  }

  async getAssessment(id: string): Promise<Assessment | undefined> {
    return this.assessments.get(id);
  }

  async createAssessment(insertAssessment: InsertAssessment): Promise<Assessment> {
    const id = randomUUID();
    const assessment: Assessment = {
      ...insertAssessment,
      id,
      createdAt: new Date(),
      voiceAnalysis: insertAssessment.voiceAnalysis || null,
      transcript: insertAssessment.transcript || null,
      finalAssessment: insertAssessment.finalAssessment || null,
      severity: insertAssessment.severity || null,
      recommendations: insertAssessment.recommendations || null,
    };
    this.assessments.set(id, assessment);
    return assessment;
  }

  async updateAssessment(id: string, updates: Partial<Assessment>): Promise<Assessment | undefined> {
    const existing = this.assessments.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates };
    this.assessments.set(id, updated);
    return updated;
  }

  async getAssessmentsByDateRange(startDate: Date, endDate: Date): Promise<Assessment[]> {
    return Array.from(this.assessments.values()).filter(
      assessment => 
        assessment.createdAt && 
        assessment.createdAt >= startDate && 
        assessment.createdAt <= endDate
    );
  }
}

export const storage = new MemStorage();
