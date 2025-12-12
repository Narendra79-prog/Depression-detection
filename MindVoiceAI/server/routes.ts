import multer from "multer";
import path from "path";
import fs from "fs";
import { simulateFromPhq } from "./simulator";

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
    // --- Demo audio upload setup ---
  // Create uploads folder if not present
  const uploadsDir = path.join(process.cwd(), "server", "uploads");
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  // Multer configuration to save uploaded files to server/uploads
  const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
      cb(null, uploadsDir);
    },
    filename: function (_req, file, cb) {
      const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const safe = file.originalname.replace(/\s+/g, "_");
      cb(null, `${unique}_${safe}`);
    },
  });
  const upload = multer({ storage });

  // Allow CORS so your client can call this API during development
  // (optional: tighten origin in production)
  try {
    app.use(cors({ origin: true }));
  } catch (err) {
    // If app is not the express instance or CORS already set, ignore
  }

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
    /**
   * POST /api/assessments/:id/audio
   * multipart/form-data:
   * - audio (file)
   * - phq9 (optional) JSON string: "[0,1,2,1,0,0,1,0,0]"
   * - consent (required) 'true' or true
   *
   * This is a DEMO simulator. It will update the assessment with simulated voiceAnalysis.
   */
  app.post("/api/assessments/:id/audio", upload.single("audio"), async (req, res) => {
    try {
      const { id } = req.params;

      // Require consent
      const consentRaw = req.body?.consent;
      const consent = consentRaw === true || consentRaw === "true" || consentRaw === "on";
      if (!consent) {
        return res.status(400).json({ message: "Consent required to process audio" });
      }

      // Ensure audio file present
      if (!req.file) {
        return res.status(400).json({ message: "Audio file is required" });
      }

      // Try to get PHQ-9 answers from request body
      let phq9Array: number[] | null = null;
      if (req.body?.phq9) {
        try {
          const parsed = JSON.parse(req.body.phq9);
          phq9Array = parsed;
        } catch (err) {
          return res.status(400).json({ message: "phq9 must be a JSON array of 9 integers" });
        }
      } else {
        // fallback: try to get saved PHQ-9 from storage
        const existing = await storage.getAssessment(id);
        if (existing && existing.phq9Responses) {
          try {
            phq9Array = (existing.phq9Responses as any[]).map((r) => r.score);
            if (!Array.isArray(phq9Array) || phq9Array.length !== 9) phq9Array = null;
          } catch {
            phq9Array = null;
          }
        }
      }

      if (!phq9Array) {
        return res.status(400).json({
          message:
            "PHQ-9 answers required. Send phq9 (JSON array) in the request or save PHQ-9 to the assessment first.",
        });
      }

      // Run simulator (use filename as salt for deterministic bias)
      const sim = simulateFromPhq(phq9Array, req.file.filename);

      // Build demo voiceAnalysis object
      const voiceAnalysis = {
        simulated: true,
        simulatorSource: "phq9_based_demo",
        phq9_total: sim.phq9_total,
        simulated_total: sim.simulated_total,
        bias_applied: sim.bias_applied,
        label: sim.label,
        audio_filename: req.file.filename,
        sentiment: { score: 0, label: "neutral", reason: "simulated" },
        textAnalysis: { simulated: true },
        audioInterpretation: { simulated: true },
      };

      // Update the assessment in storage
      const updated = await storage.updateAssessment(id, {
        transcript: null,
        voiceAnalysis,
      });

      if (!updated) {
        return res.status(404).json({ message: "Assessment not found" });
      }

      // Optional: remove uploaded audio to avoid storing sensitive data
      // fs.unlink(req.file.path, (err) => { if (err) console.warn("Failed to delete upload:", err); });

      return res.json(updated);
    } catch (error) {
      console.error("Audio upload/analysis error:", error);
      return res.status(500).json({ message: "Audio processing failed", error: (error instanceof Error ? error.message : "unknown") });
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
