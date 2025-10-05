export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function analyzeLocalAudioFeatures(transcript: string, duration: number) {
  // Basic client-side analysis
  const words = transcript.trim().split(/\s+/).filter(word => word.length > 0);
  const speechRate = words.length / Math.max(duration, 1);
  
  // Count potential pause indicators
  const pauseIndicators = transcript.match(/[.,;!?]/g) || [];
  const pauseCount = pauseIndicators.length;
  
  return {
    speechRate: Math.round(speechRate * 100) / 100,
    pauseCount,
    wordCount: words.length,
    duration: Math.round(duration * 100) / 100
  };
}

export function validateAudioInput(transcript: string, duration: number): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!transcript || transcript.trim().length === 0) {
    errors.push("No speech detected. Please try recording again.");
  }
  
  if (duration < 10) {
    errors.push("Recording too short. Please speak for at least 10 seconds.");
  }
  
  if (duration > 300) {
    errors.push("Recording too long. Please keep responses under 5 minutes.");
  }
  
  const words = transcript.trim().split(/\s+/).filter(word => word.length > 0);
  if (words.length < 10) {
    errors.push("Response too brief. Please provide a more detailed answer.");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
