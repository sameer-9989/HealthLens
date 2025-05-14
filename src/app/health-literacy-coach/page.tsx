"use client";

import React, { useState } from 'react';
import { explainMedicalTerm, ExplainMedicalTermInput, ExplainMedicalTermOutput } from '@/ai/flows/conversational-health-literacy-coach';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, Lightbulb } from 'lucide-react';
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  term: z.string().min(3, { message: "Medical term must be at least 3 characters." }),
  context: z.string().min(10, { message: "Context must be at least 10 characters." }),
  educationLevel: z.enum(["elementary", "high school", "college", "graduate"]),
});

type FormData = z.infer<typeof formSchema>;

export default function HealthLiteracyCoachPage() {
  const [result, setResult] = useState<ExplainMedicalTermOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      educationLevel: "high school",
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const output = await explainMedicalTerm(data as ExplainMedicalTermInput);
      setResult(output);
    } catch (e) {
      setError('An error occurred while explaining the term. Please try again.');
      console.error(e);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Conversational Health Literacy Coach</CardTitle>
          <CardDescription>
            Enter a medical term, diagnosis, or prescription, along with context and your education level, to get an explanation in plain language.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="term" className="text-base">Medical Term / Diagnosis / Prescription</Label>
              <Input
                id="term"
                placeholder="e.g., Hypertension, Amoxicillin, MRI Scan"
                className="mt-1 text-base"
                {...register("term")}
              />
              {errors.term && <p className="text-sm text-destructive mt-1">{errors.term.message}</p>}
            </div>

            <div>
              <Label htmlFor="context" className="text-base">Context</Label>
              <Textarea
                id="context"
                placeholder="e.g., My doctor mentioned this during my last visit regarding my blood pressure."
                className="min-h-[100px] mt-1 text-base"
                {...register("context")}
              />
              {errors.context && <p className="text-sm text-destructive mt-1">{errors.context.message}</p>}
            </div>

            <div>
              <Label htmlFor="educationLevel" className="text-base">Your Education Level</Label>
               <Controller
                name="educationLevel"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="educationLevel" className="mt-1 text-base">
                      <SelectValue placeholder="Select education level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="elementary">Elementary School</SelectItem>
                      <SelectItem value="high school">High School</SelectItem>
                      <SelectItem value="college">College</SelectItem>
                      <SelectItem value="graduate">Graduate/Post-graduate</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.educationLevel && <p className="text-sm text-destructive mt-1">{errors.educationLevel.message}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Explaining...
                </>
              ) : (
                'Explain Term'
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
            <CardTitle className="text-xl font-semibold flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-primary" />
              Explanation
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
