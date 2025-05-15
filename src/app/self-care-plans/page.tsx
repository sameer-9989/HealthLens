
"use client";

import React, { useState } from 'react';
import { generateSelfCarePlan, GenerateSelfCarePlanInput, GenerateSelfCarePlanOutput } from '@/ai/flows/self-care-plan-generator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, ArrowRight, Leaf, Moon, Sparkles, Palette, ListChecks, ShieldIcon, YoutubeIcon, Zap } from "lucide-react"; 
import Link from "next/link";
// Image import removed as no images are used in this file anymore
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface StaticSelfCarePlan {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ElementType;
  detailsLink?: string; 
  youtubeVideoId?: string; 
}

const staticSelfCarePlans: StaticSelfCarePlan[] = [
  {
    id: "mindfulness-meditation",
    title: "Beginner Mindfulness Meditation",
    description: "Reduce stress and improve focus with a simple guided mindfulness exercise. Suitable for all levels.",
    category: "Mental Wellness",
    icon: Leaf,
    youtubeVideoId: "inpok4MKVLM" 
  },
  {
    id: "desk-stretches",
    title: "Quick Desk Stretches",
    description: "Relieve tension from sitting with these easy stretches you can do at your desk.",
    category: "Physical Activity",
    icon: Zap,
    youtubeVideoId: "tAUf7aVO0DM" 
  },
  {
    id: "digital-detox-evening",
    title: "Evening Digital Detox",
    description: "Tips to disconnect from screens before bed for better sleep and a calmer mind.",
    category: "Lifestyle",
    icon: Moon,
    detailsLink: "/digital-detox" // This page shows "feature removed", which is fine.
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
             <div className="my-4 p-4 border bg-muted/20 rounded-lg">
                <p className="text-sm text-muted-foreground text-center sm:text-left">
                    Provide details like your main health focus (e.g., "manage stress", "get better sleep", "eat healthier for diabetes"), any current habits, and how long you'd like the plan to be. The more information you give, the better the AI can tailor a plan for you!
                </p>
            </div>
            <div>
              <Label htmlFor="userConditionOrGoal">What's your main condition or goal?</Label>
              <Input
                id="userConditionOrGoal"
                placeholder="e.g., manage common cold, improve sleep, reduce stress, diabetes management"
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
                placeholder="e.g., I sit at a desk all day, I often forget to drink water, I eat lots of processed food"
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
          <CardContent className="space-y-3">
            <Accordion type="single" collapsible className="w-full">
              {generatedPlan.steps.map((step, index) => (
                <AccordionItem value={`step-${index}`} key={index}>
                  <AccordionTrigger className="text-base hover:no-underline">
                     {step.stepTitle} ({step.stepType})
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 pl-2 text-sm">
                    {/* Placeholder image for step removed */}
                    <p className="text-muted-foreground whitespace-pre-wrap">{step.stepDescription}</p>
                    {step.frequencyOrTiming && <p className="text-xs text-primary mt-1"><strong>Timing/Frequency:</strong> {step.frequencyOrTiming}</p>}
                    {(step.stepType === 'exercise' && (step.stepDescription.toLowerCase().includes('stretch') || step.stepDescription.toLowerCase().includes('yoga'))) && (
                       <div className="mt-2 p-2 border rounded-md bg-muted/50">
                          <p className="text-xs text-muted-foreground italic flex items-center">
                            <YoutubeIcon className="h-4 w-4 mr-1.5 text-red-600" />
                            Consider searching YouTube for "{step.stepTitle}" for visual guidance.
                          </p>
                       </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            
            <Alert variant="default" className="bg-accent/10 border-accent/30 mt-4">
               <Sparkles className="h-4 w-4 text-accent" />
              <AlertTitle className="text-accent-foreground">Motivational Tip</AlertTitle>
              <AlertDescription className="text-accent-foreground/80">
                {generatedPlan.motivationalTip}
              </AlertDescription>
            </Alert>
             <Alert variant="destructive" className="mt-4">
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
          <CardTitle className="text-2xl font-bold">Browse Self-Care Ideas & Exercises</CardTitle>
          <CardDescription>
            Discover a variety of pre-defined ideas and guided exercises to support your well-being.
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
            <CardContent className="flex-grow space-y-3">
               {/* Placeholder image for static plan removed */}
              <p className="text-muted-foreground text-sm">{plan.description}</p>
              {plan.youtubeVideoId && (
                <div className="mt-2">
                   <Label className="text-xs text-muted-foreground">Quick Video Guide:</Label>
                   <div className="aspect-video bg-muted rounded-md flex items-center justify-center mt-1">
                     <a 
                        href={`https://www.youtube.com/watch?v=${plan.youtubeVideoId}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-primary hover:underline flex items-center"
                      >
                       <YoutubeIcon className="h-6 w-6 mr-2 text-red-600"/> Watch on YouTube
                     </a>
                   </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              {plan.detailsLink ? (
                <Button asChild variant="default" className="w-full">
                  <Link href={plan.detailsLink}>
                    Learn More <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : !plan.youtubeVideoId ? (
                 <Button variant="secondary" className="w-full" disabled>
                    More Info Soon
                  </Button>
              ) : null }
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
