"use client";

import React, { useState } from 'react';
import { explainHealthConcept, ExplainHealthConceptInput, ExplainHealthConceptOutput } from '@/ai/flows/multilingual-cultural-health-companion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, Languages, Lightbulb } from 'lucide-react';
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  concept: z.string().min(5, { message: "Concept must be at least 5 characters." }),
  language: z.string().min(2, { message: "Language code must be at least 2 characters (e.g., en, es)." }),
  culture: z.string().min(3, { message: "Culture must be at least 3 characters." }),
  educationLevel: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;


export default function MultilingualCompanionPage() {
  const [result, setResult] = useState<ExplainHealthConceptOutput | null>(null);
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
      const output = await explainHealthConcept(data as ExplainHealthConceptInput);
      setResult(output);
    } catch (e) {
      setError('An error occurred. Please try again.');
      console.error(e);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Languages /> Multilingual Cultural Health Companion
          </CardTitle>
          <CardDescription>
            Get culturally sensitive explanations of symptoms, self-care, and medication guidance in multiple languages.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="concept">Health Concept</Label>
              <Textarea id="concept" placeholder="e.g., Managing diabetes, Understanding fever in children, Taking antibiotics correctly" {...register("concept")} className="min-h-[80px]"/>
              {errors.concept && <p className="text-sm text-destructive mt-1">{errors.concept.message}</p>}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="language">Language</Label>
                <Input id="language" placeholder="e.g., es, fr, en" {...register("language")} />
                 {errors.language && <p className="text-sm text-destructive mt-1">{errors.language.message}</p>}
              </div>
              <div>
                <Label htmlFor="culture">Cultural Context</Label>
                <Input id="culture" placeholder="e.g., Mexican, Indian, Chinese" {...register("culture")} />
                {errors.culture && <p className="text-sm text-destructive mt-1">{errors.culture.message}</p>}
              </div>
            </div>
             <div>
                <Label htmlFor="educationLevel">Education Level (Optional)</Label>
                <Input id="educationLevel" placeholder="e.g., Basic, Intermediate, Advanced" {...register("educationLevel")} />
              </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Explaining...</> : 'Get Explanation'}
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
            <CardTitle className="text-xl font-semibold flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-primary" /> Explanation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap text-base leading-relaxed">{result.explanation}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
