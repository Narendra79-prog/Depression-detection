import { useState } from "react";
import { Mic, Square, Play, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { formatDuration } from "@/lib/audio-utils";

interface VoiceRecorderProps {
  onRecordingComplete: (transcript: string, duration: number) => void;
  question: string;
}

export function VoiceRecorder({ onRecordingComplete, question }: VoiceRecorderProps) {
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  
  const {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    getDuration
  } = useSpeechRecognition({
    continuous: true,
    interimResults: true
  });

  const handleStartRecording = () => {
    resetTranscript();
    setRecordingDuration(0);
    startListening();
    
    const id = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
    setIntervalId(id);
  };

  const handleStopRecording = () => {
    stopListening();
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    
    const duration = getDuration();
    if (transcript && duration > 0) {
      onRecordingComplete(transcript, duration);
    }
  };

  if (!isSupported) {
    return (
      <div className="text-center space-y-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-center justify-center space-x-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            <span>Speech recognition is not supported in this browser</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Please use Chrome, Safari, or Edge for voice recording
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Question Prompt */}
      <div className="bg-accent/10 border border-accent/20 rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-2 flex items-center">
          <Mic className="text-accent mr-2" />
          Voice Recording Question
        </h3>
        <p className="text-foreground text-lg">{question}</p>
      </div>

      {/* Recording Interface */}
      <div className="text-center space-y-6">
        {/* Recording Button */}
        <div className="relative">
          <Button
            onClick={isListening ? handleStopRecording : handleStartRecording}
            className={`w-24 h-24 rounded-full text-2xl ${
              isListening 
                ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground animate-pulse" 
                : "bg-primary hover:bg-primary/90 text-primary-foreground"
            }`}
            data-testid={isListening ? "button-stop-recording" : "button-start-recording"}
          >
            {isListening ? <Square className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </Button>
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
            <span className="text-sm text-muted-foreground">
              {isListening ? "Tap to stop" : "Tap to record"}
            </span>
          </div>
        </div>

        {/* Audio Visualization */}
        {isListening && (
          <div className="flex justify-center items-center space-x-1" data-testid="audio-visualization">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-primary rounded-full animate-pulse"
                style={{
                  height: `${Math.random() * 20 + 8}px`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        )}

        {/* Recording Status */}
        <div className="space-y-2">
          <p className="text-lg font-medium text-foreground" data-testid="recording-status">
            {isListening ? "Recording..." : "Ready to record"}
          </p>
          <p className="text-sm text-muted-foreground" data-testid="recording-time">
            Duration: {formatDuration(recordingDuration)}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <span>Recording error: {error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Transcript Display */}
      <div>
        <h3 className="font-medium text-foreground mb-3">Live Transcript</h3>
        <div 
          className="bg-background border border-border rounded-lg p-4 min-h-32"
          data-testid="transcript-display"
        >
          {transcript ? (
            <p className="text-foreground">{transcript}</p>
          ) : (
            <p className="text-muted-foreground italic">
              Your spoken words will appear here in real-time...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
