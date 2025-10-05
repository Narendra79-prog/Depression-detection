import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressIndicator } from "@/components/progress-indicator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Assessment } from "@/types/assessment";
import { 
  Check, 
  Download, 
  RotateCcw, 
  Calendar, 
  Heart, 
  Lightbulb, 
  MapPin, 
  Bot,
  Phone,
  MessageSquare,
  Book,
  Video,
  Headphones,
  AlertTriangle,
  Target,
  Activity
} from "lucide-react";

export default function Results() {
  const { assessmentId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: assessment, isLoading } = useQuery<Assessment>({
    queryKey: ["/api/assessments", assessmentId],
    enabled: !!assessmentId,
  });

  const finalizeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/assessments/${assessmentId}/finalize`, {});
      return response.json();
    },
    onSuccess: (updatedAssessment) => {
      queryClient.setQueryData(["/api/assessments", assessmentId], updatedAssessment);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to finalize assessment",
        variant: "destructive",
      });
    },
  });

  // Auto-finalize if not already done
  if (assessment && !assessment.finalAssessment && !finalizeMutation.isPending) {
    finalizeMutation.mutate();
  }

  const handleRetakeAssessment = () => {
    setLocation("/demographics");
  };

  const handleSaveResults = () => {
    // In a real app, this would generate and download a PDF
    toast({
      title: "Results saved",
      description: "Your assessment results have been saved locally",
    });
  };

  const handleScheduleFollowup = () => {
    toast({
      title: "Follow-up scheduled",
      description: "You'll receive a reminder to retake this assessment in 2 weeks",
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Loading results...</p>
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

  const finalAssessment = assessment.finalAssessment;
  const phq9Score = assessment.phq9Score || 0;
  const voiceAnalysis = assessment.voiceAnalysis;

  if (finalizeMutation.isPending || !finalAssessment) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ProgressIndicator 
          currentStep="results" 
          completedSteps={["demographics", "phq9", "voice"]} 
        />
        <Card>
          <CardContent className="p-6 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Analyzing Your Assessment</h2>
            <p className="text-muted-foreground">
              Please wait while our AI processes your responses and generates personalized insights...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const severityColors = {
    minimal: "text-green-600",
    mild: "text-yellow-600", 
    moderate: "text-orange-600",
    "moderately-severe": "text-red-600",
    severe: "text-red-800"
  };

  const severityColor = severityColors[finalAssessment.severity as keyof typeof severityColors] || "text-gray-600";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ProgressIndicator 
        currentStep="results" 
        completedSteps={["demographics", "phq9", "voice"]} 
      />
      
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="text-accent-foreground text-2xl" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Assessment Complete</h2>
            <p className="text-muted-foreground">Your comprehensive mental health analysis is ready</p>
          </div>

          {/* Overall Score */}
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-none mb-6">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-medium text-foreground mb-2">Overall Assessment</h3>
              <div className={`text-4xl font-bold mb-2 capitalize ${severityColor}`} data-testid="final-severity">
                {finalAssessment.severity}
              </div>
              <p className="text-muted-foreground">
                Based on PHQ-9 score ({phq9Score}/27) and voice analysis
              </p>
              
              {/* Confidence Score */}
              <div className="mt-4 flex items-center justify-center space-x-2">
                <span className="text-sm text-muted-foreground">Confidence:</span>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full ${
                        i < Math.round(finalAssessment.confidence * 5) 
                          ? "bg-accent" 
                          : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-foreground" data-testid="confidence-score">
                  {Math.round(finalAssessment.confidence * 100)}%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium text-foreground mb-2">PHQ-9 Score</h4>
                <div className="text-2xl font-bold text-primary mb-1" data-testid="phq9-score">
                  {phq9Score}/27
                </div>
                <p className="text-sm text-muted-foreground">Depression screening</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium text-foreground mb-2">Voice Analysis</h4>
                <div className="text-2xl font-bold text-primary mb-1" data-testid="voice-sentiment">
                  {voiceAnalysis?.sentiment ? (voiceAnalysis.sentiment * 100).toFixed(0) : "N/A"}
                </div>
                <p className="text-sm text-muted-foreground">Sentiment score</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium text-foreground mb-2">Speech Rate</h4>
                <div className="text-2xl font-bold text-primary mb-1" data-testid="speech-rate">
                  {voiceAnalysis?.speechRate || "N/A"}
                </div>
                <p className="text-sm text-muted-foreground">Words per second</p>
              </CardContent>
            </Card>
          </div>

          {/* Key Findings */}
          {finalAssessment.keyFindings.length > 0 && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
                  <Lightbulb className="text-accent mr-2" />
                  Key Findings
                </h3>
                <ul className="space-y-3">
                  {finalAssessment.keyFindings.map((finding, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Target className="text-primary text-sm mt-1 flex-shrink-0" />
                      <span className="text-foreground">{finding}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground flex items-center">
              <Heart className="text-accent mr-2" />
              Personalized Recommendations
            </h3>
            
            {/* Immediate Actions */}
            <Card className="bg-accent/10 border-accent/20">
              <CardContent className="p-4">
                <h4 className="font-medium text-foreground mb-3">Immediate Actions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="flex items-center space-x-3 justify-start h-auto p-3"
                    data-testid="button-breathing-exercise"
                  >
                    <Activity className="text-accent w-5 h-5" />
                    <span>Breathing Exercise</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center space-x-3 justify-start h-auto p-3"
                    data-testid="button-meditation"
                  >
                    <Target className="text-accent w-5 h-5" />
                    <span>5-min Meditation</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Professional Support */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium text-foreground mb-3">Professional Support</h4>
                <div className="space-y-3">
                  <Button 
                    className="w-full flex items-center justify-between"
                    data-testid="button-find-therapists"
                  >
                    <span>Find Nearby Therapists</span>
                    <MapPin className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-between"
                    data-testid="button-ai-chat"
                  >
                    <span>Chat with AI Therapist</span>
                    <Bot className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Educational Resources */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium text-foreground mb-3">Educational Resources</h4>
                <div className="space-y-2">
                  <button className="flex items-center space-x-3 p-2 rounded hover:bg-muted transition-colors w-full text-left">
                    <Book className="text-accent w-4 h-4" />
                    <span className="text-foreground">Understanding Depression: A Complete Guide</span>
                  </button>
                  <button className="flex items-center space-x-3 p-2 rounded hover:bg-muted transition-colors w-full text-left">
                    <Video className="text-accent w-4 h-4" />
                    <span className="text-foreground">Cognitive Behavioral Therapy Techniques</span>
                  </button>
                  <button className="flex items-center space-x-3 p-2 rounded hover:bg-muted transition-colors w-full text-left">
                    <Headphones className="text-accent w-4 h-4" />
                    <span className="text-foreground">Mental Health Podcast Series</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button 
              className="flex-1"
              onClick={handleSaveResults}
              data-testid="button-save-results"
            >
              <Download className="mr-2 w-4 h-4" />
              Save Results
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleRetakeAssessment}
              data-testid="button-retake-assessment"
            >
              <RotateCcw className="mr-2 w-4 h-4" />
              Retake Assessment
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleScheduleFollowup}
              data-testid="button-schedule-followup"
            >
              <Calendar className="mr-2 w-4 h-4" />
              Schedule Follow-up
            </Button>
          </div>

          {/* Crisis Support */}
          {(finalAssessment.severity === "moderately-severe" || finalAssessment.severity === "severe") && (
            <Card className="bg-destructive/10 border-destructive/20 mt-6">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="text-destructive mt-1 w-5 h-5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-foreground">Need Immediate Help?</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      If you're having thoughts of self-harm, please reach out for immediate support.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <a 
                        href="tel:988" 
                        className="inline-flex items-center px-3 py-1 bg-destructive text-destructive-foreground rounded text-sm hover:bg-destructive/90"
                        data-testid="link-crisis-hotline"
                      >
                        <Phone className="mr-1 w-4 h-4" />
                        Crisis Hotline: 988
                      </a>
                      <a 
                        href="sms:741741" 
                        className="inline-flex items-center px-3 py-1 border border-destructive text-destructive rounded text-sm hover:bg-destructive/10"
                        data-testid="link-crisis-text"
                      >
                        <MessageSquare className="mr-1 w-4 h-4" />
                        Text: 741741
                      </a>
                    </div>
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
