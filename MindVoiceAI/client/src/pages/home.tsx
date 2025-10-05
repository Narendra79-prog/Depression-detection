import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Shield, Clock, Users } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  const handleStartAssessment = () => {
    setLocation("/demographics");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center space-y-6 mb-12">
        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto">
          <Brain className="text-primary-foreground text-3xl" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to MindVoice
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A comprehensive mental health assessment platform combining traditional questionnaires 
            with advanced voice analysis for deeper insights into your wellbeing.
          </p>
        </div>
        <Button 
          onClick={handleStartAssessment}
          size="lg"
          className="px-8 py-3 text-lg"
          data-testid="button-start-assessment"
        >
          Start Your Assessment
        </Button>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="text-primary w-6 h-6" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Personalized</h3>
            <p className="text-sm text-muted-foreground">
              Tailored assessment based on your demographics and responses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Brain className="text-accent w-6 h-6" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">AI-Powered</h3>
            <p className="text-sm text-muted-foreground">
              Advanced voice and text analysis for comprehensive insights
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="text-accent w-6 h-6" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Private</h3>
            <p className="text-sm text-muted-foreground">
              Your data is processed securely with privacy as our priority
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Clock className="text-primary w-6 h-6" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Quick</h3>
            <p className="text-sm text-muted-foreground">
              Complete assessment in 10-15 minutes with immediate results
            </p>
          </CardContent>
        </Card>
      </div>

      {/* How it Works */}
      <Card className="mb-12">
        <CardContent className="p-8">
          <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground font-bold">
                1
              </div>
              <h3 className="font-medium text-foreground mb-2">Demographics</h3>
              <p className="text-sm text-muted-foreground">
                Share basic information to personalize your assessment
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground font-bold">
                2
              </div>
              <h3 className="font-medium text-foreground mb-2">PHQ-9 Questionnaire</h3>
              <p className="text-sm text-muted-foreground">
                Answer 9 questions about your recent mood and energy levels
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground font-bold">
                3
              </div>
              <h3 className="font-medium text-foreground mb-2">Voice Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Speak naturally while we analyze speech patterns and sentiment
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground font-bold">
                4
              </div>
              <h3 className="font-medium text-foreground mb-2">Results & Resources</h3>
              <p className="text-sm text-muted-foreground">
                Receive personalized insights and mental health resources
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Notice */}
      <Card className="border-accent/20 bg-accent/5">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Shield className="text-accent mt-1 w-5 h-5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-foreground mb-2">Important Notice</h3>
              <p className="text-sm text-muted-foreground">
                This assessment is for informational purposes only and is not a substitute for 
                professional medical advice, diagnosis, or treatment. Always seek the advice of 
                qualified healthcare providers with any questions regarding mental health conditions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
