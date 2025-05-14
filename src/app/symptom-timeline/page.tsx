
"use client";

import React, { useState } from 'react';
import { generateSymptomTimeline, SymptomTimelineInput, SymptomTimelineOutput, SymptomEntrySchema as FlowSymptomEntrySchema } from '@/ai/flows/symptom-playback-timeline'; // Assuming SymptomEntrySchema is exported
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, Activity, CalendarDays, PlusCircle, Trash2, BarChart3, Zap, Lightbulb } from 'lucide-react';
import { useForm, useFieldArray, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Define Zod schema for a single symptom entry for the form
const SymptomEntryClientSchema = z.object({
  date: z.string().min(1, "Date is required."), // Consider using a date picker or stricter date format
  symptoms: z.string().min(3, "Describe at least one symptom."),
  notes: z.string().optional(),
});

// Define Zod schema for the form data, containing an array of symptom entries
const formSchema = z.object({
  userId: z.string().min(1, "User ID is required for context."), // Simplified: In a real app, this would come from auth
  symptomEntries: z.array(SymptomEntryClientSchema).min(1, "Please add at least one symptom entry."),
});

type FormDataType = z.infer<typeof formSchema>;
type SymptomEntryType = z.infer<typeof SymptomEntryClientSchema>;


export default function SymptomTimelinePage() {
  const [result, setResult] = useState<SymptomTimelineOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, register, handleSubmit, formState: { errors }, watch } = useForm<FormDataType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "user123", // Example User ID
      symptomEntries: [{ date: new Date().toISOString().split('T')[0], symptoms: "", notes: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "symptomEntries",
  });

  const onSubmit: SubmitHandler<FormDataType> = async (data) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    // Transform client schema to AI flow schema
    const transformedEntries: z.infer<typeof FlowSymptomEntrySchema>[] = data.symptomEntries.map(entry => ({
        date: new Date(entry.date).toISOString(), // Ensure ISO format for AI
        symptoms: entry.symptoms.split(',').map(s => s.trim()).filter(s => s.length > 0),
        notes: entry.notes || "",
    }));
    
    if (transformedEntries.some(entry => entry.symptoms.length === 0)) {
        setError("One or more entries have no valid symptoms listed after processing. Please ensure symptoms are comma-separated if multiple.");
        setIsLoading(false);
        return;
    }


    try {
      const inputForAI: SymptomTimelineInput = {
        userId: data.userId,
        symptomEntries: transformedEntries,
      };
      const output = await generateSymptomTimeline(inputForAI);
      setResult(output);
    } catch (e) {
      setError('An error occurred while generating the timeline. Please try again.');
      console.error(e);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <Activity className="h-7 w-7 mr-2 text-primary" />
            Symptom Playback Timeline
          </CardTitle>
          <CardDescription>
            Enter your symptom history below. Our AI will analyze these entries to create a narrative summary and identify potential patterns. This tool helps visualize your symptom progression without needing external devices or sensors.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="userId">User ID (for context)</Label>
              <Input id="userId" {...register("userId")} className="mt-1" readOnly />
              {errors.userId && <p className="text-sm text-destructive mt-1">{errors.userId.message}</p>}
            </div>

            <div className="space-y-4">
              <Label className="text-lg font-medium">Symptom Entries</Label>
              {fields.map((field, index) => (
                <Card key={field.id} className="p-4 bg-muted/30 border">
                  <CardHeader className="p-0 pb-2 mb-2 border-b">
                    <CardTitle className="text-md flex justify-between items-center">
                      Entry {index + 1}
                      {fields.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive hover:bg-destructive/10 h-7 w-7">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 space-y-3">
                    <div>
                      <Label htmlFor={`symptomEntries.${index}.date`}>Date</Label>
                      <Input
                        type="date"
                        id={`symptomEntries.${index}.date`}
                        {...register(`symptomEntries.${index}.date`)}
                        className="mt-1"
                      />
                      {errors.symptomEntries?.[index]?.date && <p className="text-sm text-destructive mt-1">{errors.symptomEntries?.[index]?.date?.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor={`symptomEntries.${index}.symptoms`}>Symptoms (comma-separated)</Label>
                       <Input
                        id={`symptomEntries.${index}.symptoms`}
                        placeholder="e.g., headache, fatigue, mild cough"
                        {...register(`symptomEntries.${index}.symptoms`)}
                        className="mt-1"
                      />
                      {errors.symptomEntries?.[index]?.symptoms && <p className="text-sm text-destructive mt-1">{errors.symptomEntries?.[index]?.symptoms?.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor={`symptomEntries.${index}.notes`}>Notes (Optional)</Label>
                      <Textarea
                        id={`symptomEntries.${index}.notes`}
                        placeholder="e.g., Worse in the morning, took paracetamol"
                        {...register(`symptomEntries.${index}.notes`)}
                        className="mt-1 min-h-[60px]"
                      />
                       {errors.symptomEntries?.[index]?.notes && <p className="text-sm text-destructive mt-1">{errors.symptomEntries?.[index]?.notes?.message}</p>}
                    </div>
                  </CardContent>
                </Card>
              ))}
               {errors.symptomEntries && !errors.symptomEntries.length && typeof errors.symptomEntries.message === 'string' && <p className="text-sm text-destructive mt-1">{errors.symptomEntries.message}</p>}
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ date: new Date().toISOString().split('T')[0], symptoms: "", notes: "" })}
                className="mt-2"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Symptom Entry
              </Button>
            </div>
            
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Timeline...
                </>
              ) : (
                 <>
                  <Zap className="mr-2 h-4 w-4" />
                  Generate Timeline & Analysis
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
            <CardTitle className="text-xl font-semibold">Symptom Timeline Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center">
                <CalendarDays className="h-5 w-5 mr-2 text-primary" />
                Timeline Narrative:
              </h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{result.timelineNarrative}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                Key Patterns Identified:
              </h3>
              {result.keyPatterns && result.keyPatterns.length > 0 ? (
                <ul className="list-disc list-outside pl-5 space-y-1 text-muted-foreground">
                  {result.keyPatterns.map((pattern, index) => (
                    <li key={index}>{pattern}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No specific patterns were identified from the provided entries.</p>
              )}
            </div>
             <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>Note</AlertTitle>
                <AlertDescription>
                  This analysis is based on the information you provided. For a comprehensive understanding, discuss these patterns with a healthcare professional.
                </AlertDescription>
              </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

