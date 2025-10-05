export interface AudioFeatures {
  speechRate: number;
  pauseCount: number;
  avgPitch: number;
  duration: number;
  energyVariance: number;
}

export function analyzeAudioFeatures(transcript: string, duration: number): AudioFeatures {
  // Basic speech rate calculation (words per second)
  const words = transcript.trim().split(/\s+/).filter(word => word.length > 0);
  const speechRate = words.length / Math.max(duration, 1);

  // Estimate pause count based on punctuation and sentence structure
  const pauseIndicators = transcript.match(/[.,;!?]/g) || [];
  const pauseCount = pauseIndicators.length;

  // Mock pitch analysis (in real implementation, this would analyze audio frequency)
  // Lower values might indicate depression (flatter affect)
  const avgPitch = 150 + Math.random() * 100; // Placeholder: 150-250 Hz range

  // Energy variance placeholder (would measure amplitude variations)
  const energyVariance = Math.random() * 0.5; // 0-0.5 range

  return {
    speechRate: Math.round(speechRate * 100) / 100,
    pauseCount,
    avgPitch: Math.round(avgPitch),
    duration: Math.round(duration * 100) / 100,
    energyVariance: Math.round(energyVariance * 100) / 100,
  };
}

export function interpretAudioFeatures(features: AudioFeatures): {
  indicators: string[];
  riskLevel: "low" | "medium" | "high";
} {
  const indicators: string[] = [];
  let riskLevel: "low" | "medium" | "high" = "low";

  // Analyze speech rate
  if (features.speechRate < 1.5) {
    indicators.push("Slow speech rate may indicate low energy or depression");
    riskLevel = "medium";
  } else if (features.speechRate > 4) {
    indicators.push("Rapid speech may indicate anxiety or mania");
    riskLevel = "medium";
  }

  // Analyze pause patterns
  if (features.pauseCount / (features.duration / 10) > 3) {
    indicators.push("Frequent pauses may indicate difficulty concentrating");
    riskLevel = riskLevel === "low" ? "medium" : "high";
  }

  // Analyze pitch (lower pitch may indicate depression)
  if (features.avgPitch < 160) {
    indicators.push("Lower vocal pitch may indicate depressed mood");
    riskLevel = riskLevel === "low" ? "medium" : "high";
  }

  // Analyze energy variance (less variation may indicate flat affect)
  if (features.energyVariance < 0.2) {
    indicators.push("Reduced vocal energy variation may indicate emotional flattening");
    riskLevel = riskLevel === "low" ? "medium" : "high";
  }

  return { indicators, riskLevel };
}
