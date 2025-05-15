
"use client";

import React, { useState } from 'react';
import { getBodyPartInfo, GetBodyPartInfoInput, GetBodyPartInfoOutput } from '@/ai/flows/ai-body-scan-visualizer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, Search, YoutubeIcon, AnatomicalHeart, Users, Lightbulb } from "lucide-react"; // Changed Body to AnatomicalHeart/Users
import Image from "next/image";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Placeholder for a more sophisticated body part selector
const commonBodyParts = ["Lower Back", "Knee", "Shoulder", "Neck", "Foot", "Wrist", "Hip", "Elbow", "Ankle"];

const formSchema = z.object({
  bodyPart: z.string().min(3, { message: "Please enter a body part (e.g., knee, lower back)." }),
  concern: z.string().optional(),
});
type FormData = z.infer<typeof formSchema>;

export default function BodyScanVisualizerPage() {
  const [result, setResult] = useState<GetBodyPartInfoOutput | null>(null);
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
      const output = await getBodyPartInfo(data as GetBodyPartInfoInput);
      setResult(output);
    } catch (e) {
      setError('An error occurred while fetching body part information. Please try again.');
      console.error(e);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
             <Users className="h-7 w-7 mr-2 text-primary" /> {/* Using Users as a general human body icon */}
             AI Body Part Information
          </CardTitle>
          <CardDescription>
            Select a body part to learn about common issues, care tips, and find related educational videos. This tool provides general information, not medical diagnosis.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="bodyPart">Body Part</Label>
              <Input
                id="bodyPart"
                placeholder="e.g., Knee, Shoulder, Lower Back"
                {...register("bodyPart")}
                className="mt-1"
                list="commonBodyParts"
              />
              <datalist id="commonBodyParts">
                {commonBodyParts.map(part => <option key={part} value={part} />)}
              </datalist>
              {errors.bodyPart && <p className="text-sm text-destructive mt-1">{errors.bodyPart.message}</p>}
            </div>
             <div>
              <Label htmlFor="concern">Specific Concern (Optional)</Label>
              <Input
                id="concern"
                placeholder="e.g., Pain, Stiffness, Injury Prevention"
                {...register("concern")}
                className="mt-1"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fetching Info...
                </>
              ) : (
                 <>
                  <Search className="mr-2 h-4 w-4" />
                  Get Info
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
            <CardTitle className="text-xl font-semibold">Information for: {result.bodyPartName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.anatomicalImageHint && (
                 <div className="my-4 rounded-lg overflow-hidden border shadow-sm aspect-video bg-muted flex items-center justify-center">
                    <Image
                        src={`https://placehold.co/600x350.png?text=${encodeURIComponent(result.anatomicalImageHint.replace(/\s+/g, '+'))}`}
                        alt={`Anatomical illustration: ${result.anatomicalImageHint}`}
                        width={600}
                        height={350}
                        className="object-cover w-full h-full"
                        data-ai-hint={result.anatomicalImageHint}
                    />
                </div>
            )}
            <div>
              <h3 className="font-semibold text-md mb-1">Common Issues:</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.commonIssues}</p>
            </div>
            <div>
              <h3 className="font-semibold text-md mb-1">General Care Tips:</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.generalCareTips}</p>
            </div>
             {result.exerciseTypes && (
              <div>
                <h3 className="font-semibold text-md mb-1">Helpful Exercise Types:</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.exerciseTypes}</p>
              </div>
            )}
            {result.youtubeSearchQuery && (
              <div className="mt-3">
                <h3 className="font-semibold text-md mb-2">Find Educational Videos:</h3>
                <Button variant="outline" asChild>
                  <a 
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(result.youtubeSearchQuery)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <YoutubeIcon className="mr-2 h-4 w-4 text-red-600"/> Search YouTube: "{result.youtubeSearchQuery}"
                  </a>
                </Button>
                 <p className="text-xs text-muted-foreground mt-1">Note: Choose videos from qualified medical or physiotherapy channels.</p>
              </div>
            )}
             <Alert variant="default" className="mt-4">
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>Important Note</AlertTitle>
                <AlertDescription>
                The information provided is for general knowledge and educational purposes only, and does not constitute medical advice or diagnosis. Always consult with a qualified healthcare professional for any health concerns, pain, injury, or before making any decisions related to your health or treatment.
                </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
