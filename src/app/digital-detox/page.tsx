
"use client";

import React, { useState } from 'react';
import { getDigitalDetoxGuidance, DigitalDetoxInput, DigitalDetoxOutput } from '@/ai/flows/digital-detox-guidance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, Sparkles, PowerOff, BookOpen, Activity, LightbulbIcon, Image as ImageIconLucide } from "lucide-react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";

const formSchema = z.object({
  userConcern: z.string().min(10, { message: "Please describe your concern or goal (min 10 characters)." }),
  userName: z.string().optional(),
});
type FormData = z.infer<typeof formSchema>;

export default function DigitalDetoxPage() {
  const [guidance, setGuidance] = useState<DigitalDetoxOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setError(null);
    setGuidance(null);
    try {
      const output = await getDigitalDetoxGuidance(data as DigitalDetoxInput);
      setGuidance(output);
    } catch (e) {
      setError('An error occurred while generating digital detox guidance. Please try again.');
      console.error(e);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
             <PowerOff className="h-7 w-7 mr-2 text-primary" />
             Digital Detox Tool
          </CardTitle>
          <CardDescription>
            Get AI-powered guidance, journaling prompts, and activity challenges to help you find a healthier balance with technology.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="my-4 p-4 border bg-muted/20 rounded-lg flex flex-col sm:flex-row items-center gap-4">
                <Image
                    src="https://placehold.co/120x120.png"
                    alt="Illustration of a person mindfully disconnecting from devices"
                    width={100}
                    height={100}
                    className="rounded-md object-cover shadow-sm"
                    data-ai-hint="digital detox mindfulness"
                />
                <p className="text-sm text-muted-foreground text-center sm:text-left">
                    Share your concerns about screen time or digital habits. Are you looking to reduce stress from notifications, improve sleep, or be more present in your daily life? Our AI can help you craft a plan.
                </p>
            </div>
            <div>
              <Label htmlFor="userConcern">What's your concern or goal regarding digital wellness?</Label>
              <Textarea
                id="userConcern"
                placeholder="e.g., I spend too much time scrolling, I want to be more present, I need help reducing screen time before bed."
                {...register("userConcern")}
                className="mt-1 min-h-[80px]"
              />
              {errors.userConcern && <p className="text-sm text-destructive mt-1">{errors.userConcern.message}</p>}
            </div>
            <div>
              <Label htmlFor="userName">Your Name (Optional)</Label>
              <Input
                id="userName"
                placeholder="e.g., Jamie"
                {...register("userName")}
                className="mt-1"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Guidance...
                </>
              ) : (
                 <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Get My Detox Plan
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

      {guidance && (
        <Card className="shadow-lg mt-6">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Your Digital Detox Guidance</CardTitle>
             <CardDescription>{guidance.introduction}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center"><ImageIconLucide className="h-5 w-5 mr-2 text-primary" /> Screen Time Insights</h3>
                <div className="p-4 border rounded-md bg-muted/30">
                    <p className="text-sm text-muted-foreground italic mb-2">Visualize the impact: Below is a conceptual image representing digital balance.</p>
                     <Image 
                        src="https://placehold.co/600x300.png" 
                        alt="Digital wellness concept - balance between technology and nature" 
                        width={600} 
                        height={300} 
                        className="rounded-md shadow-sm object-cover w-full"
                        data-ai-hint="digital wellbeing nature balance" 
                    />
                </div>
                {guidance.screenTimeRisksGuide.map((item, index) => (
                    <Card key={index} className="bg-background p-3 shadow-sm">
                        <CardTitle className="text-md font-medium">{item.title}</CardTitle>
                        <CardDescription className="text-sm">{item.point}</CardDescription>
                    </Card>
                ))}
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center"><BookOpen className="h-5 w-5 mr-2 text-primary" /> Journaling Prompts</h3>
              <ul className="list-disc list-outside pl-5 space-y-2 text-muted-foreground">
                {guidance.journalingPrompts.map((prompt, index) => (
                  <li key={index} className="text-sm">{prompt}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center"><Activity className="h-5 w-5 mr-2 text-primary" /> Screen-Free Activity Challenges</h3>
              {guidance.activityChallenges.map((activity, index) => (
                 <Card key={index} className="bg-background p-3 shadow-sm">
                    <CardTitle className="text-md font-medium">{activity.title}</CardTitle>
                    <CardDescription className="text-sm">{activity.description}</CardDescription>
                </Card>
              ))}
            </div>
            
            <Alert variant="default" className="bg-accent/10 border-accent/30">
              <LightbulbIcon className="h-4 w-4 text-accent" />
              <AlertTitle className="text-accent-foreground">AI Nudge Idea</AlertTitle>
              <AlertDescription className="text-accent-foreground/80">
                {guidance.aiNudgeSuggestion}
              </AlertDescription>
            </Alert>

            <p className="text-center text-muted-foreground pt-4 border-t mt-4">{guidance.motivationalMessage}</p>

          </CardContent>
        </Card>
      )}
    </div>
  );
}
