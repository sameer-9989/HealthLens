
"use client";

import React, { useState } from 'react';
import { virtualNursingAssistant, VirtualNursingAssistantInput, VirtualNursingAssistantOutput, YogaRoutineSuggestion } from '@/ai/flows/virtual-nursing-assistant';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, Sparkles, YoutubeIcon, Zap, ListTree } from "lucide-react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
// Image import removed as no images are used in this file anymore

const formSchema = z.object({
  stressLevelOrSymptoms: z.string().min(10, { message: "Please describe your stress or symptoms (min 10 characters)." }),
});
type FormData = z.infer<typeof formSchema>;

export default function StressReliefYogaPage() {
  const [aiResponse, setAiResponse] = useState<VirtualNursingAssistantOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setError(null);
    setAiResponse(null);

    try {
      const inputToVA: VirtualNursingAssistantInput = {
        message: `I'm feeling stressed. My symptoms/concerns are: ${data.stressLevelOrSymptoms}. Can you suggest some yoga or stretching routines?`,
      };
      const outputFromVA = await virtualNursingAssistant(inputToVA);
      setAiResponse(outputFromVA);

    } catch (e) {
      setError('An error occurred while getting yoga suggestions. Please try again.');
      console.error(e);
    }
    setIsLoading(false);
  };

  // Group suggestions by category
  const groupedSuggestions = aiResponse?.suggestedYogaRoutines?.reduce((acc, suggestion) => {
    const category = suggestion.category || "General Suggestions";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(suggestion);
    return acc;
  }, {} as Record<string, YogaRoutineSuggestion[]>);


  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
             <Zap className="h-7 w-7 mr-2 text-primary" />
             AI-Powered Stress Relief Yoga & Stretching
          </CardTitle>
          <CardDescription>
            Describe your stress levels, physical discomfort, or wellness goals. Our AI will suggest relevant yoga or stretching routines and guide you to find helpful videos on YouTube.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="my-4 p-4 border bg-muted/20 rounded-lg">
                <p className="text-sm text-muted-foreground text-center sm:text-left">
                    Feeling tense? Let us know what's bothering you – whether it's "shoulder pain from my desk job," "trouble sleeping due to anxiety," or just "general stress." We'll find some yoga or stretching routines to help you unwind.
                </p>
            </div>
            <div>
              <Label htmlFor="stressLevelOrSymptoms">How are you feeling? Describe your stress, symptoms, or goals:</Label>
              <Textarea
                id="stressLevelOrSymptoms"
                placeholder="e.g., I have tension in my shoulders from work, I want a quick morning stretch, I need help relaxing before sleep, I feel anxious."
                {...register("stressLevelOrSymptoms")}
                className="mt-1 min-h-[100px]"
              />
              {errors.stressLevelOrSymptoms && <p className="text-sm text-destructive mt-1">{errors.stressLevelOrSymptoms.message}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Getting Suggestions...
                </>
              ) : (
                 <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Suggest Routines
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

      {aiResponse && (
        <Card className="shadow-lg mt-6">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">AI Recommendations</CardTitle>
            {aiResponse.response && <CardDescription className="whitespace-pre-wrap">{aiResponse.response}</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-6">
            {groupedSuggestions && Object.entries(groupedSuggestions).map(([category, suggestions]) => (
              <div key={category}>
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <ListTree className="h-5 w-5 mr-2 text-primary/80" /> 
                  {category}
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suggestions.map((routine, index) => (
                    <Card key={index} className="overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-200">
                      {/* Placeholder image removed */}
                      <CardContent className="p-4 flex-grow flex flex-col">
                        <h4 className="font-semibold text-md mb-1">{routine.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3 flex-grow">{routine.description}</p>
                        <Button variant="outline" size="sm" asChild className="mt-auto w-full">
                          <a 
                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(routine.youtubeSearchQuery)}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <YoutubeIcon className="mr-2 h-4 w-4 text-red-600"/> Find on YouTube
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
            
            {!groupedSuggestions && !aiResponse.suggestedAction && (
                <p className="text-muted-foreground">The AI didn't have specific yoga routines for your query, but here's the general guidance: {aiResponse.response}</p>
            )}

            {aiResponse.suggestedAction && (
                 <Alert variant="default" className="mt-4 bg-accent/20 border-accent/50">
                    <AlertTitle className="font-semibold">Additional Suggestion</AlertTitle>
                    <AlertDescription className="whitespace-pre-wrap">{aiResponse.suggestedAction}</AlertDescription>
                </Alert>
            )}
            
            <Alert className="mt-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Important Note</AlertTitle>
              <AlertDescription>
                Always listen to your body. If any pose causes pain, please stop. Consult a healthcare professional before starting any new exercise program, especially if you have pre-existing conditions. These suggestions are for informational purposes only.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
