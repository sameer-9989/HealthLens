"use client";

import React, { useState } from 'react';
import { symptomChecker, SymptomCheckerInput, SymptomCheckerOutput } from '@/ai/flows/ai-symptom-checker';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, Lightbulb, CheckCircle2 } from 'lucide-react';
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  symptoms: z.string().min(10, { message: "Please describe your symptoms in at least 10 characters." }),
});
type FormData = z.infer<typeof formSchema>;

export default function SymptomCheckerPage() {
  const [result, setResult] = useState<SymptomCheckerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const output = await symptomChecker({ symptoms: data.symptoms });
      setResult(output);
    } catch (e) {
      setError('An error occurred while checking symptoms. Please try again.');
      console.error(e);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">AI Symptom Checker</CardTitle>
          <CardDescription>
            Describe your symptoms, and our AI will provide potential diagnostic suggestions and triage recommendations.
            This tool is for informational purposes only and not a substitute for professional medical advice.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="symptoms" className="text-base">Your Symptoms</Label>
              <Textarea
                id="symptoms"
                placeholder="e.g., I have a persistent cough, fever, and headache for the last 3 days..."
                className="min-h-[120px] mt-1 text-base"
                {...register("symptoms")}
              />
              {errors.symptoms && <p className="text-sm text-destructive mt-1">{errors.symptoms.message}</p>}
            </div>
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
              <AlertTriangle className="h-4 w-4 !text-destructive" />
              <AlertTitle className="text-destructive">Important Disclaimer</AlertTitle>
              <AlertDescription className="text-destructive/80">
                The information provided by this AI Symptom Checker is not medical advice. Always consult with a qualified healthcare professional for any health concerns or before making any decisions related to your health or treatment.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking Symptoms...
                </>
              ) : (
                'Check Symptoms'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Symptom Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium flex items-center mb-2">
                <Lightbulb className="h-5 w-5 mr-2 text-primary" />
                Potential Diagnostic Suggestions
              </h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{result.diagnosticSuggestions}</p>
            </div>
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium flex items-center mb-2">
                <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" />
                Triage Recommendations
              </h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{result.triageRecommendations}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
