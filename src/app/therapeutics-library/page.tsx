
"use client";

import React, { useState } from 'react';
import { recommendTherapy, RecommendTherapyInput, RecommendTherapyOutput } from '@/ai/flows/digital-therapeutics-recommender';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, Library, Sparkles, ListOrdered, Watch, Lightbulb } from 'lucide-react';
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  userNeed: z.string().min(3, { message: "Please describe your need (e.g., 'stress', 'anxiety')." }),
  recentSymptoms: z.string().optional(),
  userPreferences: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function TherapeuticsLibraryPage() {
  const [result, setResult] = useState<RecommendTherapyOutput | null>(null);
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
      const output = await recommendTherapy(data as RecommendTherapyInput);
      setResult(output);
    } catch (e) {
      setError('An error occurred while recommending a therapy. Please try again.');
      console.error(e);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <Library className="h-7 w-7 mr-2 text-primary" />
            Digital Therapeutics Library
          </CardTitle>
          <CardDescription>
            Tell us what you need help with, and our AI will recommend an interactive therapeutic tool and provide initial guidance. These exercises are software-based and require no external devices.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="userNeed">What do you need help with today?</Label>
              <Input
                id="userNeed"
                placeholder="e.g., reduce anxiety, manage stress, improve focus"
                {...register("userNeed")}
                className="mt-1"
              />
              {errors.userNeed && <p className="text-sm text-destructive mt-1">{errors.userNeed.message}</p>}
            </div>
            <div>
              <Label htmlFor="recentSymptoms">Any recent symptoms? (Optional)</Label>
              <Textarea
                id="recentSymptoms"
                placeholder="e.g., feeling overwhelmed, racing thoughts, trouble sleeping"
                {...register("recentSymptoms")}
                className="mt-1 min-h-[60px]"
              />
            </div>
            <div>
              <Label htmlFor="userPreferences">Any preferences for the exercise? (Optional)</Label>
              <Input
                id="userPreferences"
                placeholder="e.g., something quick, a breathing exercise"
                {...register("userPreferences")}
                className="mt-1"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Finding Therapy...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Recommend Therapy
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card className="shadow-lg mt-6">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center">
              {result.recommendedTherapyName}
            </CardTitle>
            {result.estimatedDuration && (
                <CardDescription className="flex items-center text-sm text-muted-foreground">
                    <Watch className="h-4 w-4 mr-1.5" /> Estimated duration: {result.estimatedDuration}
                </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{result.description}</p>
            <div>
              <h3 className="font-semibold mb-2 flex items-center">
                <ListOrdered className="h-5 w-5 mr-2 text-primary" />
                Initial Guidance:
              </h3>
              <ul className="list-decimal list-outside pl-5 space-y-1 text-muted-foreground">
                {result.initialGuidance.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertTitle>Remember</AlertTitle>
              <AlertDescription>
                This is initial guidance. Follow these steps. You can repeat or extend the exercise as feels comfortable. Consistent practice can improve benefits. This is not a replacement for professional medical advice.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
