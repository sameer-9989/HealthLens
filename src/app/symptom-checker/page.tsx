
"use client";

import React, { useState } from 'react';
import { symptomChecker, SymptomCheckerInput, SymptomCheckerOutput, MedicineSuggestion } from '@/ai/flows/ai-symptom-checker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, Lightbulb, CheckCircle2, Pill, Apple, Bike, LanguagesIcon, Globe, InfoIcon, Stethoscope } from 'lucide-react'; 
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const formSchema = z.object({
  symptoms: z.string().min(10, { message: "Please describe your symptoms in at least 10 characters." }),
  language: z.string().optional(),
  culture: z.string().optional(),
});
type FormData = z.infer<typeof formSchema>;

export default function SymptomCheckerPage() {
  const [result, setResult] = useState<SymptomCheckerOutput | null>(null);
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
      const output = await symptomChecker(data as SymptomCheckerInput);
      setResult(output);
    } catch (e) {
      setError('An error occurred while checking symptoms. Please try again.');
      console.error(e);
    }
    setIsLoading(false);
  };

  const getCategoryLabel = (category?: MedicineSuggestion['category']) => {
    if (!category || category === 'Unknown') return null;
    const labels: Record<Exclude<MedicineSuggestion['category'], undefined | 'Unknown'>, string> = {
      OTC: "Over-the-Counter",
      Prescription: "Prescription (Example)",
      NaturalRemedy: "Natural Remedy"
    };
    if (category in labels) {
        return labels[category as Exclude<MedicineSuggestion['category'], undefined | 'Unknown'>];
    }
    return null;
  }
  
  const practoUrl = "https://www.practo.com/doctors?utm_source=opd_google&utm_medium=156227283291&utm_campaign=20298938780&gad_source=1&gad_campaignid=20298938780&gclid=Cj0KCQjwoZbBBhDCARIsAOqMEZUedzUjRHTpaZgMdNwfF1zEqrs3oE568pfm6Jpl0Ebi0WRdWwy_6jAaAsjyEALw_wcB";

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center"><Stethoscope className="mr-2 h-7 w-7 text-primary"/>AI Symptom Checker</CardTitle>
          <CardDescription>
            Describe your symptoms, and our AI will provide potential informational suggestions.
            This tool is not a substitute for professional medical advice.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="my-4 p-4 border bg-muted/20 rounded-lg">
                <p className="text-sm text-muted-foreground text-center sm:text-left">
                    Remember to be as detailed as possible with your symptoms. Include when they started, their intensity, and anything that makes them better or worse.
                </p>
            </div>
            <div>
              <Label htmlFor="symptoms" className="text-base">Your Symptoms</Label>
              <Textarea
                id="symptoms"
                placeholder="e.g., I have a persistent cough, fever, and headache for the last 3 days..."
                className="min-h-[120px] mt-1 text-base"
                {...register("symptoms")}
              />
              {errors.symptoms && <p className="text-sm text-destructive mt-1">{errors.symptoms.message}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="language" className="text-base flex items-center">
                  <LanguagesIcon className="mr-2 h-4 w-4 text-muted-foreground" /> Language (Optional)
                </Label>
                <Input
                  id="language"
                  placeholder="e.g., es, fr (default: en)"
                  className="mt-1 text-base"
                  {...register("language")}
                />
                {errors.language && <p className="text-sm text-destructive mt-1">{errors.language.message}</p>}
              </div>
              <div>
                <Label htmlFor="culture" className="text-base flex items-center">
                  <Globe className="mr-2 h-4 w-4 text-muted-foreground" /> Cultural Context (Optional)
                </Label>
                <Input
                  id="culture"
                  placeholder="e.g., Hispanic, South Asian"
                  className="mt-1 text-base"
                  {...register("culture")}
                />
                {errors.culture && <p className="text-sm text-destructive mt-1">{errors.culture.message}</p>}
              </div>
            </div>
            
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
              <AlertTriangle className="h-4 w-4 !text-destructive" />
              <AlertTitle className="text-destructive">Important Disclaimer</AlertTitle>
              <AlertDescription className="text-destructive/80">
                The information provided by this AI Symptom Checker is not medical advice. Always consult with a qualified healthcare professional for any health concerns or before making any decisions related to your health or treatment.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Symptoms...
                </>
              ) : (
                'Analyze Symptoms'
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
        <Card className="shadow-lg mt-6">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Symptom Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {result.possibleConditions && result.possibleConditions.length > 0 && (
              <div>
                <h3 className="text-lg font-medium flex items-center mb-3">
                  <Lightbulb className="h-5 w-5 mr-2 text-primary" />
                  Potential Conditions & Informational Suggestions
                </h3>
                <Accordion type="single" collapsible className="w-full">
                  {result.possibleConditions.map((condition, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger className="text-base hover:no-underline font-semibold">
                        {condition.conditionName || `Suggestion ${index + 1}`}
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-3 pl-2 text-sm">
                        <div>
                          <h4 className="font-semibold flex items-center mb-1"><Apple className="h-4 w-4 mr-1.5 text-green-600" /> Related Diet Suggestions:</h4>
                          <p className="text-muted-foreground whitespace-pre-wrap">{condition.relatedDietSuggestions}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold flex items-center mb-1"><Bike className="h-4 w-4 mr-1.5 text-blue-600" /> Recommended Lifestyle Changes:</h4>
                          <p className="text-muted-foreground whitespace-pre-wrap">{condition.recommendedLifestyleChanges}</p>
                        </div>
                        {condition.suggestedMedicines && condition.suggestedMedicines.length > 0 && (
                          <div>
                            <h4 className="font-semibold flex items-center mb-2"><Pill className="h-4 w-4 mr-1.5 text-red-600" /> Possible Medicine Information:</h4>
                            <div className="space-y-3">
                              {condition.suggestedMedicines.map((med, medIndex) => (
                                <Card key={medIndex} className="p-3 bg-background shadow-sm border">
                                  <CardHeader className="p-0 pb-2 mb-2">
                                      <CardTitle className="text-md flex items-center justify-between">
                                        {med.name}
                                        {getCategoryLabel(med.category) && (
                                          <span className="text-xs font-normal bg-primary/10 text-primary px-2 py-0.5 rounded-full">{getCategoryLabel(med.category)}</span>
                                        )}
                                      </CardTitle>
                                       <CardDescription className="text-xs">{med.purpose}</CardDescription>
                                  </CardHeader>
                                  <CardContent className="p-0 space-y-2">
                                    <p className="text-xs text-muted-foreground whitespace-pre-wrap"><strong className="text-foreground">General Dosage:</strong> {med.generalDosage}</p>
                                    <Alert variant="destructive" className="mt-2 text-xs p-2 bg-destructive/5 border-destructive/20">
                                      <InfoIcon className="h-3 w-3 !text-destructive" />
                                      <AlertDescription className="!text-destructive/80">{med.disclaimer}</AlertDescription>
                                    </Alert>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
            
            {result.triageRecommendations && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium flex items-center mb-2">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" />
                  Triage Recommendations
                </h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{result.triageRecommendations}</p>
              </div>
            )}

            {result.overallDisclaimer && (
                 <Alert variant="destructive" className="mt-4 bg-destructive/10 border-destructive/30">
                    <AlertTriangle className="h-4 w-4 !text-destructive" />
                    <AlertTitle className="text-destructive">Overall Disclaimer</AlertTitle>
                    <AlertDescription className="text-destructive/80 whitespace-pre-wrap">
                        {result.overallDisclaimer}
                    </AlertDescription>
                </Alert>
            )}
            <div className="mt-8 flex justify-center md:justify-start">
              <Button
                onClick={() => window.open(practoUrl, "_blank")}
              >
                Book an Appointment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
