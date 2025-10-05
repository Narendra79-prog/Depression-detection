import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProgressIndicator } from "@/components/progress-indicator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { demographicsSchema, type Demographics } from "@shared/schema";
import { Shield, ArrowRight } from "lucide-react";

export default function Demographics() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const form = useForm<Demographics>({
    resolver: zodResolver(demographicsSchema),
    defaultValues: {
      name: "",
      age: 18,
      gender: undefined,
      relationshipStatus: undefined,
    },
  });

  const createAssessmentMutation = useMutation({
    mutationFn: async (demographics: Demographics) => {
      const response = await apiRequest("POST", "/api/assessments", {
        demographics,
        phq9Responses: [],
        phq9Score: 0,
      });
      return response.json();
    },
    onSuccess: (assessment) => {
      toast({
        title: "Success",
        description: "Demographics saved successfully",
      });
      setLocation(`/phq9/${assessment.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save demographics",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: Demographics) => {
    createAssessmentMutation.mutate(data);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ProgressIndicator currentStep="demographics" completedSteps={[]} />
      
      <Card>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Welcome to MindVoice</h2>
            <p className="text-muted-foreground">
              Let's start with some basic information to personalize your assessment
            </p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-foreground">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  {...form.register("name")}
                  className="mt-2"
                  data-testid="input-name"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="age" className="text-sm font-medium text-foreground">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter your age"
                  min="18"
                  max="100"
                  {...form.register("age", { valueAsNumber: true })}
                  className="mt-2"
                  data-testid="input-age"
                />
                {form.formState.errors.age && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.age.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-foreground">Gender</Label>
                <Select 
                  onValueChange={(value) => form.setValue("gender", value as any)}
                  value={form.watch("gender")}
                >
                  <SelectTrigger className="mt-2" data-testid="select-gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="non-binary">Non-binary</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.gender && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.gender.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label className="text-sm font-medium text-foreground">Relationship Status</Label>
                <Select 
                  onValueChange={(value) => form.setValue("relationshipStatus", value as any)}
                  value={form.watch("relationshipStatus")}
                >
                  <SelectTrigger className="mt-2" data-testid="select-relationship-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="relationship">In a relationship</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.relationshipStatus && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.relationshipStatus.message}
                  </p>
                )}
              </div>
            </div>

            <Card className="bg-secondary border-none">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="text-accent mt-1 w-5 h-5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-foreground">Privacy Notice</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your information is processed locally and securely. We never store personal data 
                      without your explicit consent.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button 
              type="submit" 
              className="w-full"
              disabled={createAssessmentMutation.isPending}
              data-testid="button-continue-assessment"
            >
              {createAssessmentMutation.isPending ? (
                "Saving..."
              ) : (
                <>
                  Continue to Assessment
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
