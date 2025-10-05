export interface Demographics {
  name: string;
  age: number;
  gender: "male" | "female" | "non-binary" | "prefer-not-to-say";
  relationshipStatus: "single" | "married" | "relationship" | "divorced" | "widowed";
}

export interface PHQ9Question {
  id: number;
  text: string;
  options: {
    value: number;
    label: string;
    description: string;
  }[];
}

export interface PHQ9Response {
  questionIndex: number;
  score: number;
}

export interface VoiceAnalysis {
  speechRate: number;
  pauseCount: number;
  avgPitch: number;
  duration: number;
  sentiment: number;
  textAnalysis?: {
    sentiment: number;
    negativeWords: string[];
    pronounUsage: number;
    emotionalIndicators: string[];
    confidence: number;
  };
}

export interface Assessment {
  id: string;
  demographics?: Demographics;
  phq9Responses?: PHQ9Response[];
  phq9Score?: number;
  transcript?: string;
  voiceAnalysis?: VoiceAnalysis;
  finalAssessment?: {
    severity: "minimal" | "mild" | "moderate" | "moderately-severe" | "severe";
    confidence: number;
    keyFindings: string[];
    riskFactors: string[];
    recommendations: string[];
  };
  severity?: string;
  recommendations?: any;
  createdAt?: Date;
}

export type AssessmentStep = "demographics" | "phq9" | "voice" | "results";
