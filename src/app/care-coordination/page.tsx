"use client";

import React, { useState } from 'react';
import { careCoordination, CareCoordinationInput, CareCoordinationOutput } from '@/ai/flows/care-coordination-hub';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, Lightbulb, ListChecks, ClipboardList } from 'lucide-react';
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  visitType: z.enum(["pre-visit", "post-visit"]),
  patientNotes: z.string().min(20, { message: "Please provide at least 20 characters for your notes." }),
});

type FormData = z.infer<typeof formSchema>;

export default function CareCoordinationPage() {
  const [result, setResult] = useState<CareCoordinationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      visitType: "pre-visit",
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const output = await careCoordination(data as CareCoordinationInput);
      setResult(output);
    } catch (e) {
      setError('An error occurred while coordinating care. Please try again.');
      console.error(e);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Care Coordination Hub</CardTitle>
          <CardDescription>
            Organize health-related tasks, notes, and questions before doctor visits, or summarize key points post-visit.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base mb-2 block">Visit Type</Label>
              <Controller
                name="visitType"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 cursor-pointer data-[state=checked]:bg-accent data-[state=checked]:border-primary flex-1">
                      <RadioGroupItem value="pre-visit" id="pre-visit" />
                      <Label htmlFor="pre-visit" className="text-base font-normal cursor-pointer">Pre-Visit Organization (Tasks & Questions)</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 cursor-pointer data-[state=checked]:bg-accent data-[state=checked]:border-primary flex-1">
                      <RadioGroupItem value="post-visit" id="post-visit" />
                      <Label htmlFor="post-visit" className="text-base font-normal cursor-pointer">Post-Visit Summary (Key Points)</Label>
                    </div>
                  </RadioGroup>
                )}
              />
              {errors.visitType && <p className="text-sm text-destructive mt-1">{errors.visitType.message}</p>}
            </div>

            <div>
              <Label htmlFor="patientNotes" className="text-base">Your Notes</Label>
              <Textarea
                id="patientNotes"
                placeholder="Enter your notes, symptoms, questions for the doctor, or summary of what was discussed..."
                className="min-h-[150px] mt-1 text-base"
                {...register("patientNotes")}
              />
              {errors.patientNotes && <p className="text-sm text-destructive mt-1">{errors.patientNotes.message}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Generate Summary/Tasks'
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
              { control.getValues("visitType") === "pre-visit" 
                ? <ListChecks className="h-5 w-5 mr-2 text-primary" /> 
                : <ClipboardList className="h-5 w-5 mr-2 text-primary" />
              }
              {control.getValues("visitType") === "pre-visit" ? "Pre-Visit Plan" : "Post-Visit Summary"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap text-base leading-relaxed">{result.summary}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
