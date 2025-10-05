import Sentiment from "sentiment";

const sentiment = new Sentiment();

export interface TextAnalysisResult {
  sentiment: number;
  negativeWords: string[];
  pronounUsage: number;
  emotionalIndicators: string[];
  confidence: number;
}

export interface FinalAssessmentResult {
  severity: "minimal" | "mild" | "moderate" | "moderately-severe" | "severe";
  confidence: number;
  keyFindings: string[];
  riskFactors: string[];
  recommendations: string[];
}

export async function analyzeTextSentiment(text: string): Promise<TextAnalysisResult> {
  try {
    const result = sentiment.analyze(text);
    
    // Normalize sentiment score to -1 to 1 range
    const normalizedSentiment = Math.max(-1, Math.min(1, result.score / 10));
    
    // Extract negative words from the sentiment analysis
    const negativeWords = result.negative || [];
    
    // Calculate pronoun usage (first person indicators)
    const words = text.toLowerCase().split(/\s+/);
    const firstPersonPronouns = ["i", "me", "my", "myself", "mine"];
    const pronounCount = words.filter(word => firstPersonPronouns.includes(word)).length;
    const pronounUsage = Math.min(1, pronounCount / words.length * 10); // Scale it up
    
    // Identify emotional indicators based on common mental health keywords
    const emotionalKeywords = [
      "sad", "depressed", "anxious", "worried", "hopeless", "tired", "empty",
      "lonely", "overwhelmed", "stressed", "angry", "frustrated", "numb",
      "helpless", "worthless", "guilty", "shame", "fear", "panic"
    ];
    const emotionalIndicators = words.filter(word => 
      emotionalKeywords.some(keyword => word.includes(keyword))
    );
    
    // Calculate confidence based on text length and clarity
    const confidence = Math.min(1, Math.max(0.3, words.length / 50));
    
    return {
      sentiment: normalizedSentiment,
      negativeWords,
      pronounUsage,
      emotionalIndicators,
      confidence,
    };
  } catch (error) {
    throw new Error("Failed to analyze text sentiment: " + (error as Error).message);
  }
}

export async function generateFinalAssessment(
  phq9Score: number,
  textAnalysis: TextAnalysisResult,
  voiceFeatures: any,
  demographics: any
): Promise<FinalAssessmentResult> {
  try {
    // Determine severity based on PHQ-9 score and voice analysis
    let severity: "minimal" | "mild" | "moderate" | "moderately-severe" | "severe";
    
    if (phq9Score <= 4) {
      severity = "minimal";
    } else if (phq9Score <= 9) {
      severity = "mild";
    } else if (phq9Score <= 14) {
      severity = "moderate";
    } else if (phq9Score <= 19) {
      severity = "moderately-severe";
    } else {
      severity = "severe";
    }
    
    // Adjust severity based on voice analysis
    if (textAnalysis.sentiment < -0.5 && severity === "minimal") {
      severity = "mild";
    } else if (textAnalysis.sentiment < -0.7 && (severity === "mild" || severity === "minimal")) {
      severity = "moderate";
    }
    
    // Generate key findings
    const keyFindings: string[] = [
      `PHQ-9 depression screening score: ${phq9Score}/27`,
      `Voice sentiment analysis: ${textAnalysis.sentiment > 0 ? "positive" : textAnalysis.sentiment > -0.3 ? "neutral" : "negative"} tone detected`
    ];
    
    if (voiceFeatures.speechRate && voiceFeatures.speechRate < 1.5) {
      keyFindings.push("Slow speech rate may indicate low energy or mood");
    }
    
    if (textAnalysis.emotionalIndicators.length > 0) {
      keyFindings.push(`Emotional indicators detected: ${textAnalysis.emotionalIndicators.slice(0, 3).join(", ")}`);
    }
    
    // Generate risk factors
    const riskFactors: string[] = [];
    
    if (phq9Score >= 15) {
      riskFactors.push("Moderately severe to severe depression symptoms");
    }
    
    if (textAnalysis.sentiment < -0.5) {
      riskFactors.push("Negative emotional expression in speech");
    }
    
    if (textAnalysis.emotionalIndicators.some(word => ["hopeless", "worthless", "helpless"].includes(word))) {
      riskFactors.push("Expressions of hopelessness or worthlessness");
    }
    
    // Generate basic recommendations
    const recommendations: string[] = [];
    
    if (severity === "minimal" || severity === "mild") {
      recommendations.push("Continue monitoring your mental health");
      recommendations.push("Consider stress management techniques");
    } else if (severity === "moderate") {
      recommendations.push("Consider speaking with a mental health professional");
      recommendations.push("Practice daily self-care activities");
    } else {
      recommendations.push("Seek professional mental health support");
      recommendations.push("Consider crisis support if needed");
    }
    
    // Calculate confidence based on multiple factors
    const confidence = Math.min(1, Math.max(0.5, 
      (textAnalysis.confidence * 0.5) + 
      (phq9Score > 0 ? 0.3 : 0.1) + 
      (voiceFeatures ? 0.2 : 0)
    ));
    
    return {
      severity,
      confidence,
      keyFindings,
      riskFactors,
      recommendations,
    };
  } catch (error) {
    throw new Error("Failed to generate final assessment: " + (error as Error).message);
  }
}
