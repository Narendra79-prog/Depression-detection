import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  demographicsSchema, 
  phq9ResponseSchema, 
  voiceAnalysisSchema,
  insertAssessmentSchema 
} from "@shared/schema";
import { analyzeTextSentiment, generateFinalAssessment } from "./services/openai";
import { analyzeAudioFeatures, interpretAudioFeatures } from "./services/audioAnalysis";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create new assessment
  app.post("/api/assessments", async (req, res) => {
    try {
      const validatedData = insertAssessmentSchema.parse(req.body);
      const assessment = await storage.createAssessment(validatedData);
      res.json(assessment);
    } catch (error) {
      res.status(400).json({ 
        message: "Invalid assessment data", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Update assessment demographics
  app.patch("/api/assessments/:id/demographics", async (req, res) => {
    try {
      const { id } = req.params;
      const demographics = demographicsSchema.parse(req.body);
      
      const updated = await storage.updateAssessment(id, { demographics });
      if (!updated) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      
      res.json(updated);
    } catch (error) {
      res.status(400).json({ 
        message: "Invalid demographics data", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Update PHQ-9 responses and calculate score
  app.patch("/api/assessments/:id/phq9", async (req, res) => {
    try {
      const { id } = req.params;
      const { responses } = req.body;
      
      // Validate each response
      const validatedResponses = responses.map((response: any) => 
        phq9ResponseSchema.parse(response)
      );
      
      // Calculate total PHQ-9 score
      const phq9Score = validatedResponses.reduce((total: number, response: any) => 
        total + response.score, 0
      );
      
      const updated = await storage.updateAssessment(id, { 
        phq9Responses: validatedResponses,
        phq9Score 
      });
      
      if (!updated) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      
      res.json(updated);
    } catch (error) {
      res.status(400).json({ 
        message: "Invalid PHQ-9 data", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Process voice analysis
  app.patch("/api/assessments/:id/voice", async (req, res) => {
    try {
      const { id } = req.params;
      const { transcript, duration } = req.body;
      
      if (!transcript || !duration) {
        return res.status(400).json({ message: "Transcript and duration are required" });
      }

      // Analyze audio features
      const audioFeatures = analyzeAudioFeatures(transcript, duration);
      const audioInterpretation = interpretAudioFeatures(audioFeatures);
      
      // Analyze text sentiment
      const textAnalysis = await analyzeTextSentiment(transcript);
      
      const voiceAnalysis = {
        ...audioFeatures,
        sentiment: textAnalysis.sentiment,
        textAnalysis,
        audioInterpretation
      };
      
      const updated = await storage.updateAssessment(id, { 
        transcript,
        voiceAnalysis 
      });
      
      if (!updated) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ 
        message: "Voice analysis failed", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Generate final assessment
  app.post("/api/assessments/:id/finalize", async (req, res) => {
    try {
      const { id } = req.params;
      const assessment = await storage.getAssessment(id);
      
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }

      if (!assessment.phq9Score || !assessment.voiceAnalysis) {
        return res.status(400).json({ 
          message: "Assessment incomplete - missing PHQ-9 or voice analysis" 
        });
      }

      const finalAssessment = await generateFinalAssessment(
        assessment.phq9Score,
        (assessment.voiceAnalysis as any).textAnalysis,
        assessment.voiceAnalysis,
        assessment.demographics
      );

      // Determine severity based on final assessment
      const severity = finalAssessment.severity;
      
      // Generate recommendations based on severity
      const recommendations = generateRecommendations(severity, finalAssessment);

      const updated = await storage.updateAssessment(id, { 
        finalAssessment,
        severity,
        recommendations 
      });
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to generate final assessment", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Get assessment by ID
  app.get("/api/assessments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const assessment = await storage.getAssessment(id);
      
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      
      res.json(assessment);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to retrieve assessment", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function generateRecommendations(severity: string, assessment: any): any {
  const baseRecommendations = {
    immediate: [] as string[],
    professional: [] as string[],
    resources: [] as string[]
  };

  switch (severity) {
    case "minimal":
      baseRecommendations.immediate = [
        "Continue maintaining healthy habits",
        "Regular exercise and sleep schedule"
      ];
      baseRecommendations.resources = [
        "Mental wellness apps",
        "Stress management techniques"
      ];
      break;
      
    case "mild":
      baseRecommendations.immediate = [
        "Breathing exercises",
        "Mindfulness meditation",
        "Social connection activities"
      ];
      baseRecommendations.professional = [
        "Consider counseling sessions"
      ];
      break;
      
    case "moderate":
      baseRecommendations.immediate = [
        "Daily mood tracking",
        "Structured activity scheduling",
        "Breathing exercises"
      ];
      baseRecommendations.professional = [
        "Schedule therapy appointment",
        "Consider psychiatric evaluation"
      ];
      break;
      
    case "moderately-severe":
    case "severe":
      baseRecommendations.immediate = [
        "Crisis support planning",
        "Daily check-ins with support person"
      ];
      baseRecommendations.professional = [
        "Urgent psychiatric evaluation",
        "Intensive therapy program",
        "Medication consultation"
      ];
      break;
  }

  return baseRecommendations;
}
