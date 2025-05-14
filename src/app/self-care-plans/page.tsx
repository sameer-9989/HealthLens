
"use client";

import React, { useState } from 'react';
import { generateSelfCarePlan, GenerateSelfCarePlanInput, GenerateSelfCarePlanOutput } from '@/ai/flows/self-care-plan-generator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, ArrowRight, Zap, Leaf, Smile, Moon, Sun, Sparkles, Palette, ListChecks, ShieldIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface StaticSelfCarePlan {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ElementType;
  imageHint: string;
  detailsLink?: string;
}

const staticSelfCarePlans: StaticSelfCarePlan[] = [
  {
    id: "mindfulness-meditation",
    title: "Mindfulness Meditation",
    description: "Reduce stress and improve focus with guided mindfulness exercises. Suitable for all levels.",
    category: "Mental Wellness",
    icon: Leaf,
    imageHint: "meditation nature",
    detailsLink: "/self-care-plans/mindfulness" // This could link to a page with pre-defined content or an app feature
  },
  {
    id: "stress-relief-yoga",
    title: "Stress Relief Yoga Snippets",
    description: "Gentle yoga pose descriptions and breathing techniques to calm your mind and body, doable at your desk.",
    category: "Physical Activity",
    icon: Zap,
    imageHint: "yoga peaceful",
  },
  {
    id: "digital-detox-challenge",
    title: "Digital Detox Ideas",
    description: "Tips to take a break from screens to reconnect with yourself and the world around you.",
    category: "Lifestyle",
    icon: Moon,
    imageHint: "nature no-phone",
  },
];

const formSchema = z.object({
  userConditionOrGoal: z.string().min(5, { message: "Describe your condition or goal (min 5 chars)." }),
  relevantHabits: z.string().optional(),
  durationPreference: z.string().optional(),
  userName: z.string().optional(),
});
type FormData = z.infer<typeof formSchema>;

export default function SelfCarePlansPage() {
  const [generatedPlan, setGeneratedPlan] = useState<GenerateSelfCarePlanOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onGenerateSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setError(null);
    setGeneratedPlan(null);
    try {
      const output = await generateSelfCarePlan(data as GenerateSelfCarePlanInput);
      setGeneratedPlan(output);
    } catch (e) {
      setError('An error occurred while generating the plan. Please try again.');
      console.error(e);
    }
    setIsLoading(false);
  };


  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
             <Palette className="h-7 w-7 mr-2 text-primary" />
             Personalized Self-Care Plan Generator
          </CardTitle>
          <CardDescription>
            Tell us about your health condition or goals, and our AI will generate a personalized self-care plan for you.
            These plans are 100% software-powered and do not require external devices.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onGenerateSubmit)}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="userConditionOrGoal">What's your main condition or goal?</Label>
              <Input
                id="userConditionOrGoal"
                placeholder="e.g., manage a common cold, improve sleep, reduce stress"
                {...register("userConditionOrGoal")}
                className="mt-1"
              />
              {errors.userConditionOrGoal && <p className="text-sm text-destructive mt-1">{errors.userConditionOrGoal.message}</p>}
            </div>
             <div>
              <Label htmlFor="userName">Your Name (Optional for personalization)</Label>
              <Input
                id="userName"
                placeholder="e.g., Alex"
                {...register("userName")}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="relevantHabits">Any relevant habits or context? (Optional)</Label>
              <Textarea
                id="relevantHabits"
                placeholder="e.g., I sit at a desk all day, I often forget to drink water"
                {...register("relevantHabits")}
                className="mt-1 min-h-[60px]"
              />
            </div>
            <div>
              <Label htmlFor="durationPreference">Preferred plan duration? (Optional)</Label>
              <Input
                id="durationPreference"
                placeholder="e.g., 3 days, 1 week, just for today"
                {...register("durationPreference")}
                className="mt-1"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Plan...
                </>
              ) : (
                 <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate My Plan
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

      {generatedPlan && (
        <Card className="shadow-lg mt-6">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center">
              <ListChecks className="h-6 w-6 mr-2 text-primary" />
              {generatedPlan.planTitle}
            </CardTitle>
            <CardDescription>{generatedPlan.planIntroduction}</CardDescription>
            <CardDescription><strong>Suggested Duration:</strong> {generatedPlan.planDurationSuggestion}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedPlan.steps.map((step, index) => (
              <div key={index} className="p-3 border rounded-md bg-muted/30">
                <h4 className="font-semibold">{step.stepTitle}</h4>
                <p className="text-sm text-muted-foreground">{step.stepDescription}</p>
                {step.frequencyOrTiming && <p className="text-xs text-primary mt-1">Timing: {step.frequencyOrTiming}</p>}
              </div>
            ))}
            <Alert variant="default" className="bg-accent/10 border-accent/30">
               <Sparkles className="h-4 w-4 text-accent" />
              <AlertTitle className="text-accent-foreground">Motivational Tip</AlertTitle>
              <AlertDescription className="text-accent-foreground/80">
                {generatedPlan.motivationalTip}
              </AlertDescription>
            </Alert>
             <Alert variant="destructive">
              <ShieldIcon className="h-4 w-4" />
              <AlertTitle>Important Disclaimer</AlertTitle>
              <AlertDescription>
                {generatedPlan.disclaimer}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg mt-12">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Browse Self-Care Ideas</CardTitle>
          <CardDescription>
            Discover a variety of pre-defined plans and ideas to support your well-being.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {staticSelfCarePlans.map((plan) => (
          <Card key={plan.id} className="shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <plan.icon className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl">{plan.title}</CardTitle>
              </div>
              <CardDescription className="text-sm text-muted-foreground">{plan.category}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
               <Image 
                src={`https://placehold.co/400x250.png`} 
                alt={plan.title} 
                width={400} 
                height={250} 
                className="rounded-md mb-4 object-cover w-full h-40"
                data-ai-hint={plan.imageHint}
              />
              <p className="text-muted-foreground">{plan.description}</p>
            </CardContent>
            <CardFooter>
              {plan.detailsLink ? (
                <Button asChild variant="default" className="w-full">
                  <Link href={plan.detailsLink}>
                    View Details <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                 <Button variant="secondary" className="w-full" disabled>
                    More Info Soon
                  </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
