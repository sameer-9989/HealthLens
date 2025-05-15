
"use client";

import React, { useState } from 'react';
import { virtualNursingAssistant, VirtualNursingAssistantInput, VirtualNursingAssistantOutput } from '@/ai/flows/virtual-nursing-assistant'; // Using VA for suggestions
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, Sparkles, YoutubeIcon, Zap } from "lucide-react"; // Zap for Energy/Stress
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";

const formSchema = z.object({
  stressLevelOrSymptoms: z.string().min(10, { message: "Please describe your stress or symptoms (min 10 chars)." }),
});
type FormData = z.infer<typeof formSchema>;

interface YogaRoutineSuggestion {
  routineName: string;
  description: string;
  poses?: string[]; // Optional: specific poses described by AI
  youtubeSearchQuery?: string;
}

// Example YouTube videos. In a real app, these might be curated or dynamically fetched.
const exampleYogaVideos = [
  { id: "v7AYKMP6rOE", title: "Yoga For Anxiety and Stress (20 min)", hint: "woman yoga calm" },
  { id: "sTANio_2E0Q", title: "5-Minute Office Yoga for Stress Relief", hint: "office yoga quick" },
  { id: "4pLUleLdwY4", title: "Gentle Yoga for Beginners (10 min)", hint: "yoga beginner gentle" },
];

export default function StressReliefYogaPage() {
  const [suggestion, setSuggestion] = useState<YogaRoutineSuggestion | null>(null);
  const [aiResponseText, setAiResponseText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setError(null);
    setSuggestion(null);
    setAiResponseText(null);

    try {
      const inputToVA: VirtualNursingAssistantInput = {
        message: `I'm feeling stressed and my symptoms are: ${data.stressLevelOrSymptoms}. Can you suggest a type of yoga routine for stress relief?`,
      };
      const outputFromVA = await virtualNursingAssistant(inputToVA);
      setAiResponseText(outputFromVA.response);

      // Basic parsing of AI response to form a suggestion (This is a simplification)
      // A more robust solution would have the AI flow return structured data for yoga suggestions.
      let routineName = "General Stress Relief Yoga";
      let youtubeQuery = "stress relief yoga gentle";

      if (outputFromVA.response.toLowerCase().includes("gentle stretching yoga")) {
        routineName = "Gentle Stretching Yoga";
        youtubeQuery = "gentle stretching yoga for stress";
      } else if (outputFromVA.response.toLowerCase().includes("desk yoga")) {
        routineName = "Desk Yoga Routine";
        youtubeQuery = "desk yoga for stress relief";
      }
      
      setSuggestion({
        routineName: routineName,
        description: `Based on your input, the AI suggests focusing on ${routineName.toLowerCase()}. Below are some example videos you might find helpful.`,
        youtubeSearchQuery: youtubeQuery,
        // Poses could be further extracted if AI provides them in a structured way
      });

    } catch (e) {
      setError('An error occurred while getting yoga suggestions. Please try again.');
      console.error(e);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
             <Zap className="h-7 w-7 mr-2 text-primary" />
             AI-Powered Stress Relief Yoga
          </CardTitle>
          <CardDescription>
            Describe your stress levels or symptoms, and our AI will suggest a type of yoga routine. 
            Explore curated YouTube videos for guided 5-10 minute sessions.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="stressLevelOrSymptoms">How are you feeling? Describe your stress or symptoms:</Label>
              <Textarea
                id="stressLevelOrSymptoms"
                placeholder="e.g., I have a lot of tension in my shoulders and feel overwhelmed. I'm looking for something gentle."
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
                  Suggest Yoga Routine
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

      {aiResponseText && !suggestion && (
         <Card className="shadow-lg mt-6">
            <CardHeader>
                <CardTitle className="text-xl">AI Suggestion</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{aiResponseText}</p>
                <p className="text-sm text-primary mt-2">Attempting to find relevant videos based on this suggestion...</p>
            </CardContent>
         </Card>
      )}

      {suggestion && (
        <Card className="shadow-lg mt-6">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Yoga Suggestion: {suggestion.routineName}</CardTitle>
            <CardDescription>{suggestion.description}</CardDescription>
            {aiResponseText && <p className="text-sm mt-2 p-3 bg-muted/50 rounded-md border"><strong>AI Assistant:</strong> <span className="whitespace-pre-wrap">{aiResponseText}</span></p>}
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="font-semibold text-lg">Example Guided Routines (5-10 minutes):</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exampleYogaVideos.map(video => (
                <Card key={video.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted">
                    {/* Placeholder for actual YouTube embed. In a real app, use next/third-parties or a library. */}
                     <Image 
                        src={`https://placehold.co/320x180.png`} 
                        alt={video.title} 
                        width={320} 
                        height={180} 
                        className="rounded-t-md object-cover w-full h-full"
                        data-ai-hint={video.hint}
                    />
                    {/* Example actual embed (would require consent screens etc):
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src={`https://www.youtube.com/embed/${video.id}`}
                      title={video.title} 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                      allowFullScreen>
                    </iframe>
                    */}
                  </div>
                  <CardContent className="p-3">
                    <h4 className="font-medium text-sm truncate" title={video.title}>{video.title}</h4>
                    <Button variant="outline" size="sm" asChild className="mt-2 w-full">
                      <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer">
                        <YoutubeIcon className="mr-2 h-4 w-4 text-red-600"/> Watch on YouTube
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            {suggestion.youtubeSearchQuery && (
                 <Button variant="link" asChild className="mt-2">
                    <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(suggestion.youtubeSearchQuery)}`} target="_blank" rel="noopener noreferrer">
                        Search for more "{suggestion.youtubeSearchQuery}" videos on YouTube
                    </a>
                 </Button>
            )}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Listen to Your Body</AlertTitle>
              <AlertDescription>
                These are general suggestions. If any pose causes pain, please stop. Consult a healthcare professional before starting any new exercise program, especially if you have pre-existing conditions.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
