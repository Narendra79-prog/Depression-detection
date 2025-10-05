import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ProgressIndicator } from "@/components/progress-indicator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PHQ9_QUESTIONS, calculatePHQ9Score, getSeverityLevel } from "@/lib/phq9-scoring";
import type { Assessment, PHQ9Response } from "@/types/assessment";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function PHQ9() {
  const { assessmentId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<PHQ9Response[]>([]);

  const { data: assessment, isLoading } = useQuery<Assessment>({
    queryKey: ["/api/assessments", assessmentId],
    enabled: !!assessmentId,
  });

  const updatePHQ9Mutation = useMutation({
    mutationFn: async (responses: PHQ9Response[]) => {
      const response = await apiRequest("PATCH", `/api/assessments/${assessmentId}/phq9`, {
        responses,
      });
      return response.json();
    },
    onSuccess: (updatedAssessment) => {
      queryClient.setQueryData(["/api/assessments", assessmentId], updatedAssessment);
      toast({
        title: "Progress saved",
        description: "Your responses have been saved",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save responses",
        variant: "destructive",
      });
    },
  });

  // Load existing responses
  useEffect(() => {
    if (assessment?.phq9Responses) {
      setResponses(assessment.phq9Responses);
    }
  }, [assessment]);

  const currentQuestion = PHQ9_QUESTIONS[currentQuestionIndex];
  const currentResponse = responses.find(r => r.questionIndex === currentQuestionIndex);
  const totalScore = calculatePHQ9Score(responses);
  const { level, description } = getSeverityLevel(totalScore);
  const progressPercentage = ((currentQuestionIndex + 1) / PHQ9_QUESTIONS.length) * 100;

  const handleResponseChange = (score: number) => {
    const newResponses = responses.filter(r => r.questionIndex !== currentQuestionIndex);
    newResponses.push({ questionIndex: currentQuestionIndex, score });
    setResponses(newResponses);
  };

  const handleNext = () => {
    if (currentQuestionIndex < PHQ9_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Save final responses and navigate to voice analysis
      updatePHQ9Mutation.mutate(responses, {
        onSuccess: () => {
          setLocation(`/voice/${assessmentId}`);
        }
      });
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      setLocation(`/demographics/${assessmentId}`);
    }
  };

  const canProceed = currentResponse !== undefined;
  const isLastQuestion = currentQuestionIndex === PHQ9_QUESTIONS.length - 1;

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
        currentStep="phq9" 
        completedSteps={["demographics"]} 
      />
      
      <Card>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-2">PHQ-9 Depression Assessment</h2>
            <p className="text-muted-foreground">
              Please answer each question based on how you've been feeling over the past 2 weeks
            </p>
          </div>

          {/* Question Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Question {currentQuestionIndex + 1} of {PHQ9_QUESTIONS.length}</span>
              <span data-testid="current-score">Score: {totalScore}/27</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progressPercentage}%` }}
                data-testid="question-progress"
              />
            </div>
          </div>

          {/* Current Question */}
          <div className="bg-background rounded-lg p-6 border border-border mb-6">
            <h3 className="text-lg font-medium text-foreground mb-4" data-testid="current-question">
              Over the last 2 weeks, how often have you been bothered by {currentQuestion.text}
            </h3>
            
            <RadioGroup
              value={currentResponse?.score?.toString()}
              onValueChange={(value) => handleResponseChange(parseInt(value))}
              className="space-y-3"
            >
              {currentQuestion.options.map((option) => (
                <div 
                  key={option.value}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <RadioGroupItem 
                    value={option.value.toString()} 
                    id={`option-${option.value}`}
                    data-testid={`radio-option-${option.value}`}
                  />
                  <Label 
                    htmlFor={`option-${option.value}`}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-foreground">{option.label}</span>
                      <span className="text-sm text-muted-foreground">{option.description}</span>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Navigation */}
          <div className="flex justify-between mb-6">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              data-testid="button-previous"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              {currentQuestionIndex === 0 ? "Back to Demographics" : "Previous"}
            </Button>
            <Button 
              onClick={handleNext}
              disabled={!canProceed || updatePHQ9Mutation.isPending}
              data-testid="button-next"
            >
              {updatePHQ9Mutation.isPending ? (
                "Saving..."
              ) : isLastQuestion ? (
                <>
                  Complete PHQ-9
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              ) : (
                <>
                  Next Question
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          {/* Score Summary */}
          {responses.length > 0 && (
            <Card className="bg-secondary border-none">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">Current Assessment</h3>
                    <p className="text-sm text-muted-foreground">
                      Score: <span data-testid="total-score">{totalScore}</span>/27 - 
                      <span data-testid="severity-level" className="ml-1">{description}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{totalScore}</div>
                    <div className="text-xs text-muted-foreground">Total Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
