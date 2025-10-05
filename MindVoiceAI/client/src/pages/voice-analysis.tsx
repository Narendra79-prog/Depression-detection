import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressIndicator } from "@/components/progress-indicator";
import { VoiceRecorder } from "@/components/voice-recorder";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { validateAudioInput, analyzeLocalAudioFeatures } from "@/lib/audio-utils";
import type { Assessment } from "@/types/assessment";
import { ArrowLeft, ArrowRight, TrendingUp } from "lucide-react";

const VOICE_QUESTIONS = [
  "How have you been feeling lately? Please describe your mood and energy levels over the past few weeks.",
  "Can you tell me about any challenges or stressors you've been experiencing recently?",
  "What activities or things usually make you feel better or bring you joy?"
];

export default function VoiceAnalysis() {
  const { assessmentId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [recordings, setRecordings] = useState<Array<{ transcript: string; duration: number }>>([]);
  const [localAnalysis, setLocalAnalysis] = useState<any>(null);

  const { data: assessment, isLoading } = useQuery<Assessment>({
    queryKey: ["/api/assessments", assessmentId],
    enabled: !!assessmentId,
  });

  const updateVoiceMutation = useMutation({
    mutationFn: async ({ transcript, duration }: { transcript: string; duration: number }) => {
      const response = await apiRequest("PATCH", `/api/assessments/${assessmentId}/voice`, {
        transcript,
        duration,
      });
      return response.json();
    },
    onSuccess: (updatedAssessment) => {
      queryClient.setQueryData(["/api/assessments", assessmentId], updatedAssessment);
      toast({
        title: "Voice analysis complete",
        description: "Your voice data has been processed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process voice analysis",
        variant: "destructive",
      });
    },
  });

  const currentQuestion = VOICE_QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === VOICE_QUESTIONS.length - 1;
  const hasCurrentRecording = recordings[currentQuestionIndex];

  const handleRecordingComplete = (transcript: string, duration: number) => {
    const validation = validateAudioInput(transcript, duration);
    
    if (!validation.isValid) {
      toast({
        title: "Recording Invalid",
        description: validation.errors.join(" "),
        variant: "destructive",
      });
      return;
    }

    // Store recording
    const newRecordings = [...recordings];
    newRecordings[currentQuestionIndex] = { transcript, duration };
    setRecordings(newRecordings);

    // Perform local analysis
    const analysis = analyzeLocalAudioFeatures(transcript, duration);
    setLocalAnalysis(analysis);

    toast({
      title: "Recording saved",
      description: "Your response has been recorded successfully",
    });
  };

  const handleNext = () => {
    if (!hasCurrentRecording) {
      toast({
        title: "Recording required",
        description: "Please record your response before continuing",
        variant: "destructive",
      });
      return;
    }

    if (isLastQuestion) {
      // Combine all recordings and send for analysis
      const combinedTranscript = recordings.map(r => r.transcript).join(" ");
      const totalDuration = recordings.reduce((sum, r) => sum + r.duration, 0);
      
      updateVoiceMutation.mutate({ 
        transcript: combinedTranscript, 
        duration: totalDuration 
      }, {
        onSuccess: () => {
          setLocation(`/results/${assessmentId}`);
        }
      });
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      setLocation(`/phq9/${assessmentId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-destructive">Assessment not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ProgressIndicator 
        currentStep="voice" 
        completedSteps={["demographics", "phq9"]} 
      />
      
      <Card>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Voice Analysis</h2>
            <p className="text-muted-foreground">
              Please answer the following questions by speaking clearly. This helps us analyze speech patterns and emotional indicators.
            </p>
          </div>

          {/* Question Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Question {currentQuestionIndex + 1} of {VOICE_QUESTIONS.length}</span>
              <span>{recordings.filter(r => r).length} recorded</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${((currentQuestionIndex + 1) / VOICE_QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Voice Recorder */}
          <div className="mb-6">
            <VoiceRecorder
              question={currentQuestion}
              onRecordingComplete={handleRecordingComplete}
            />
          </div>

          {/* Current Recording Status */}
          {hasCurrentRecording && (
            <Card className="bg-accent/10 border-accent/20 mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">✓ Response Recorded</h3>
                    <p className="text-sm text-muted-foreground">
                      Duration: {Math.round(hasCurrentRecording.duration)}s | 
                      Words: {hasCurrentRecording.transcript.split(/\s+/).length}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const newRecordings = [...recordings];
                      newRecordings[currentQuestionIndex] = undefined as any;
                      setRecordings(newRecordings);
                    }}
                    data-testid="button-re-record"
                  >
                    Re-record
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Local Analysis Preview */}
          {localAnalysis && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary" data-testid="speech-rate">
                    {localAnalysis.speechRate}
                  </div>
                  <div className="text-xs text-muted-foreground">Words/sec</div>
                  <div className="text-sm text-foreground">Speech Rate</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary" data-testid="pause-count">
                    {localAnalysis.pauseCount}
                  </div>
                  <div className="text-xs text-muted-foreground">Count</div>
                  <div className="text-sm text-foreground">Pauses</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary" data-testid="word-count">
                    {localAnalysis.wordCount}
                  </div>
                  <div className="text-xs text-muted-foreground">Total</div>
                  <div className="text-sm text-foreground">Words</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary" data-testid="duration">
                    {Math.round(localAnalysis.duration)}s
                  </div>
                  <div className="text-xs text-muted-foreground">Seconds</div>
                  <div className="text-sm text-foreground">Duration</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              data-testid="button-previous"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              {currentQuestionIndex === 0 ? "Back to PHQ-9" : "Previous Question"}
            </Button>
            <Button 
              onClick={handleNext}
              disabled={!hasCurrentRecording || updateVoiceMutation.isPending}
              data-testid="button-next"
            >
              {updateVoiceMutation.isPending ? (
                "Analyzing..."
              ) : isLastQuestion ? (
                <>
                  Analyze Results
                  <TrendingUp className="ml-2 w-4 h-4" />
                </>
              ) : (
                <>
                  Next Question
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
