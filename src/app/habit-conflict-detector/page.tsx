
"use client";

import React, { useState } from 'react';
import { detectHabitConflicts, DetectHabitConflictsInput, DetectHabitConflictsOutput } from '@/ai/flows/ai-habit-conflict-detector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, GitCompareArrows, YoutubeIcon, Search, Lightbulb, ShieldCheck,ThumbsUp } from "lucide-react";
import Image from "next/image";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  habitsDescription: z.string().min(10, { message: "Describe your habits/routine (min 10 characters)." }),
  healthConditions: z.string().optional(),
});
type FormData = z.infer<typeof formSchema>;

export default function HabitConflictDetectorPage() {
  const [result, setResult] = useState<DetectHabitConflictsOutput | null>(null);
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
      const output = await detectHabitConflicts(data as DetectHabitConflictsInput);
      setResult(output);
    } catch (e) {
      setError('An error occurred while detecting habit conflicts. Please try again.');
      console.error(e);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
             <GitCompareArrows className="h-7 w-7 mr-2 text-primary" />
             AI Habit Conflict Detector
          </CardTitle>
          <CardDescription>
            Describe your health habits, dietary routines, or exercise plans. Our AI will analyze them for potential conflicts or risks, especially if you have existing health conditions.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="habitsDescription">Describe Your Habits or Routine Combination</Label>
              <Textarea
                id="habitsDescription"
                placeholder="e.g., 'I do high-intensity interval training 5 days a week and follow a ketogenic diet.' or 'Can I combine daily long runs with intermittent fasting?'"
                {...register("habitsDescription")}
                className="mt-1 min-h-[100px]"
              />
              {errors.habitsDescription && <p className="text-sm text-destructive mt-1">{errors.habitsDescription.message}</p>}
            </div>
            <div>
              <Label htmlFor="healthConditions">Any Existing Health Conditions? (Optional)</Label>
              <Input
                id="healthConditions"
                placeholder="e.g., Type 2 Diabetes, High Blood Pressure, recovering from knee surgery"
                {...register("healthConditions")}
                className="mt-1"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Habits...
                </>
              ) : (
                 <>
                  <Search className="mr-2 h-4 w-4" />
                  Detect Conflicts
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
            <CardTitle className="text-xl font-semibold">Habit Analysis Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {result.imageHintDiagram && (
                <div className="my-4 rounded-lg overflow-hidden border shadow-sm aspect-video bg-muted flex items-center justify-center">
                    <Image
                        src={`https://placehold.co/600x350.png?text=${encodeURIComponent(result.imageHintDiagram.replace(/\s+/g, '+'))}`}
                        alt={result.imageHintDiagram}
                        width={600}
                        height={350}
                        className="object-cover w-full h-full"
                        data-ai-hint={result.imageHintDiagram}
                    />
                </div>
            )}

            <div>
              <h3 className="font-semibold text-lg mb-1 flex items-center"><AlertTriangle className="h-5 w-5 mr-2 text-orange-500"/>Potential Conflict Analysis:</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{result.conflictAnalysis}</p>
            </div>
            
            {result.positiveSynergies && (
              <div>
                <h3 className="font-semibold text-lg mb-1 flex items-center"><ThumbsUp className="h-5 w-5 mr-2 text-green-500"/>Potential Positive Synergies:</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{result.positiveSynergies}</p>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-lg mb-1 flex items-center"><ShieldCheck className="h-5 w-5 mr-2 text-green-600"/>Recommendations:</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{result.recommendations}</p>
            </div>
            
            {result.youtubeSearchQuery && (
              <div className="mt-4">
                <h3 className="font-semibold text-lg mb-2">Learn More (Educational Videos):</h3>
                <Button variant="outline" asChild>
                  <a 
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(result.youtubeSearchQuery)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <YoutubeIcon className="mr-2 h-4 w-4 text-red-600"/> Search on YouTube: "{result.youtubeSearchQuery}"
                  </a>
                </Button>
                <p className="text-xs text-muted-foreground mt-1">Note: Always verify information with trusted health professionals.</p>
              </div>
            )}
            <Alert variant="destructive" className="mt-4 bg-destructive/5 border-destructive/20">
                <Lightbulb className="h-4 w-4 !text-destructive" />
                <AlertTitle className="text-destructive">Important Disclaimer</AlertTitle>
                <AlertDescription className="!text-destructive/80">
                This AI-powered analysis is for informational purposes only and does not constitute medical or nutritional advice. Always consult with a qualified healthcare professional before making any significant changes to your diet, exercise routine, or health practices, especially if you have pre-existing health conditions.
                </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
