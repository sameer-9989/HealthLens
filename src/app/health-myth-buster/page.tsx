
"use client";

import React, { useState } from 'react';
import { bustHealthMyth, BustHealthMythInput, BustHealthMythOutput } from '@/ai/flows/ai-health-myth-buster';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, Lightbulb, YoutubeIcon, Search, CheckCircle, XCircle, HelpCircleIcon } from "lucide-react";
// Image import removed as it's no longer used
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  mythQuery: z.string().min(10, { message: "Please enter the myth or question (min 10 characters)." }),
});
type FormData = z.infer<typeof formSchema>;

export default function HealthMythBusterPage() {
  const [result, setResult] = useState<BustHealthMythOutput | null>(null);
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
      const output = await bustHealthMyth(data as BustHealthMythInput);
      setResult(output);
    } catch (e) {
      setError('An error occurred while busting the myth. Please try again.');
      console.error(e);
    }
    setIsLoading(false);
  };

  const getStatusIcon = (isTrue: boolean | null) => {
    if (isTrue === true) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (isTrue === false) return <XCircle className="h-5 w-5 text-red-500" />;
    return <HelpCircleIcon className="h-5 w-5 text-yellow-500" />;
  };

  const getConfidenceColor = (confidence: BustHealthMythOutput['confidenceLevel']) => {
    switch (confidence) {
      case 'High': return 'bg-green-100 text-green-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-orange-100 text-orange-700';
      case 'Uncertain': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };


  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
             <Lightbulb className="h-7 w-7 mr-2 text-primary" />
             AI Health Myth Buster
          </CardTitle>
          <CardDescription>
            Got a health question or heard a common myth? Enter it below, and our AI will provide an evidence-based explanation.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="mythQuery">Enter Health Myth or Question</Label>
              <Textarea
                id="mythQuery"
                placeholder="e.g., Does eating carrots improve eyesight? Is garlic effective for colds?"
                {...register("mythQuery")}
                className="mt-1 min-h-[80px]"
              />
              {errors.mythQuery && <p className="text-sm text-destructive mt-1">{errors.mythQuery.message}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                 <>
                  <Search className="mr-2 h-4 w-4" />
                  Bust Myth / Get Answer
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
            <CardTitle className="text-xl font-semibold">AI Analysis Result</CardTitle>
            <div className="flex items-center gap-2 mt-1">
                {getStatusIcon(result.isMythTrue)}
                <span className="text-lg font-medium">
                    {result.isMythTrue === true ? "Likely True/Supported" : result.isMythTrue === false ? "Likely False/Myth" : "Complex/Uncertain"}
                </span>
            </div>
             <Badge variant="outline" className={`text-xs ${getConfidenceColor(result.confidenceLevel)}`}>Confidence: {result.confidenceLevel}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Placeholder image removed here */}
            <div>
              <h3 className="font-semibold text-lg mb-1">Explanation:</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{result.explanation}</p>
            </div>
            
            {result.youtubeSearchQuery && (
              <div className="mt-4">
                <h3 className="font-semibold text-lg mb-2">Find Video Explainers:</h3>
                <Button variant="outline" asChild>
                  <a 
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(result.youtubeSearchQuery)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <YoutubeIcon className="mr-2 h-4 w-4 text-red-600"/> Search on YouTube: "{result.youtubeSearchQuery}"
                  </a>
                </Button>
                 <p className="text-xs text-muted-foreground mt-1">Note: Please evaluate video sources for credibility. Look for trusted health organizations or verified medical professionals.</p>
              </div>
            )}
             <Alert variant="default" className="mt-4">
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>Disclaimer</AlertTitle>
                <AlertDescription>
                This AI-generated information is for educational purposes only and not a substitute for professional medical advice. Always consult with a qualified healthcare provider for any health concerns or before making any decisions related to your health or treatment.
                </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
