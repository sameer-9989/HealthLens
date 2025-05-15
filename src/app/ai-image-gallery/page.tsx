
"use client";

import React, { useState, useEffect } from 'react';
import { generateImage, GenerateImageInput, GenerateImageOutput } from '@/ai/flows/generate-image-flow';
import { imageLibrary, AppImageMetadata, findImagesByTag, findImagesByCategory } from '@/config/image-library';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, Sparkles, Image as ImageIcon, Search, SlidersHorizontal, Tag } from "lucide-react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image"; // Next.js Image component
import { useToast } from "@/hooks/use-toast";

const generateFormSchema = z.object({
  prompt: z.string().min(10, { message: "Prompt must be at least 10 characters." }),
});
type GenerateFormData = z.infer<typeof generateFormSchema>;

export default function AiImageGalleryPage() {
  const [generatedImageData, setGeneratedImageData] = useState<GenerateImageOutput | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const [displayedImages, setDisplayedImages] = useState<AppImageMetadata[]>(imageLibrary);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const { toast } = useToast();

  const { register: registerGenerate, handleSubmit: handleSubmitGenerate, formState: { errors: errorsGenerate } } = useForm<GenerateFormData>({
    resolver: zodResolver(generateFormSchema),
  });

  const onGenerateSubmit: SubmitHandler<GenerateFormData> = async (data) => {
    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedImageData(null);
    try {
      const output = await generateImage({ prompt: data.prompt });
      setGeneratedImageData(output);
      toast({
        title: "Image Generated Successfully!",
        description: output.revisedPrompt ? `Using revised prompt: ${output.revisedPrompt}` : "Your image is ready.",
      });
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'An unknown error occurred.';
      setGenerationError(errorMsg);
      toast({
        title: "Image Generation Failed",
        description: errorMsg,
        variant: "destructive",
      });
      console.error(e);
    }
    setIsGenerating(false);
  };

  useEffect(() => {
    let filtered = imageLibrary;
    if (filterCategory) {
      filtered = findImagesByCategory(filterCategory);
    }
    if (searchTerm) {
      filtered = filtered.filter(img => 
        img.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        img.aiGenerationPrompt.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setDisplayedImages(filtered);
  }, [searchTerm, filterCategory]);

  const uniqueCategories = Array.from(new Set(imageLibrary.map(img => img.purposeCategory)));

  const handleSaveToLibrary = () => {
    if (!generatedImageData) return;
    // In a real app, this would send data to a backend to store the image and update metadata.
    // For this prototype, we'll just log it and show a toast.
    console.log("Attempting to save image:", {
      prompt: generatedImageData.revisedPrompt || (document.getElementById('prompt') as HTMLInputElement)?.value,
      imageDataUri: generatedImageData.imageDataUri,
      // You'd add category, tags, etc. here from user input or defaults
    });
    toast({
      title: "Save to Library (Simulated)",
      description: "Image data logged. In a real app, this would save to your database.",
    });
  };

  return (
    <div className="space-y-12">
      {/* Image Generation Section */}
      <Card className="shadow-xl border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <Sparkles className="h-7 w-7 mr-2 text-primary" />
            AI Image Generator (Experimental)
          </CardTitle>
          <CardDescription>
            Use text prompts to generate unique images with Gemini. This feature uses an experimental model; results may vary.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmitGenerate(onGenerateSubmit)}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="prompt">Image Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="e.g., A calming abstract illustration of brain waves in soft teal and blue colors."
                {...registerGenerate("prompt")}
                className="mt-1 min-h-[100px]"
              />
              {errorsGenerate.prompt && <p className="text-sm text-destructive mt-1">{errorsGenerate.prompt.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-4 items-start">
            <Button type="submit" disabled={isGenerating} className="w-full sm:w-auto">
              {isGenerating ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
              ) : (
                "Generate Image"
              )}
            </Button>
            {generatedImageData && (
               <Button onClick={handleSaveToLibrary} variant="outline" className="w-full sm:w-auto">
                Save to Library (Simulated)
              </Button>
            )}
          </CardFooter>
        </form>

        {generationError && (
          <CardContent>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Generation Error</AlertTitle>
              <AlertDescription>{generationError}</AlertDescription>
            </Alert>
          </CardContent>
        )}

        {generatedImageData && (
          <CardContent className="mt-6">
            <h3 className="font-semibold text-lg mb-2">Generated Image:</h3>
            {generatedImageData.revisedPrompt && (
              <p className="text-sm text-muted-foreground mb-2">
                <span className="font-semibold">Revised Prompt:</span> {generatedImageData.revisedPrompt}
              </p>
            )}
            <div className="border rounded-md p-2 inline-block shadow-md">
              {/* Using standard <img> for data URI; next/image needs hostname for external URLs or local files */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={generatedImageData.imageDataUri} 
                alt="AI Generated Image" 
                className="max-w-full h-auto md:max-w-md rounded"
              />
            </div>
            <Alert className="mt-4">
              <ImageIcon className="h-4 w-4" />
              <AlertTitle>Note on Image Storage</AlertTitle>
              <AlertDescription>
                Generated images are displayed temporarily. In a full application, you would save this image to a persistent storage (like Firebase Storage) and its metadata to a database.
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      {/* Image Library Gallery Section */}
      <Card className="shadow-xl border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <ImageIcon className="h-7 w-7 mr-2 text-primary" />
            App Image Library
          </CardTitle>
          <CardDescription>
            Browse existing images from the application's static library.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search"
                placeholder="Search by title, tag, or prompt..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="relative sm:min-w-[200px]">
               <Tag className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background pl-8 pr-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">All Categories</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {displayedImages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedImages.map(image => (
                <Card key={image.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200 flex flex-col">
                  <div className="relative w-full aspect-video bg-muted">
                    <Image
                      src={image.imageUrl} // Assumes these are placehold.co or valid URLs
                      alt={image.title}
                      layout="fill"
                      objectFit="cover"
                      data-ai-hint={image.dataAiHint || image.tags.slice(0,2).join(" ")}
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{image.title}</CardTitle>
                    <CardDescription className="text-xs text-primary">{image.purposeCategory}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground flex-grow">
                    <p className="line-clamp-2 mb-1"><span className="font-semibold">Prompt:</span> {image.aiGenerationPrompt}</p>
                    <p className="text-xs line-clamp-2"><span className="font-semibold">Tags:</span> {image.tags.join(', ')}</p>
                  </CardContent>
                  <CardFooter>
                     <p className="text-xs text-muted-foreground/70">Created: {new Date(image.createdAt).toLocaleDateString()}</p>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No images found matching your criteria.</p>
          )}
           <Alert className="mt-6">
              <SlidersHorizontal className="h-4 w-4" />
              <AlertTitle>Admin Features (Conceptual)</AlertTitle>
              <AlertDescription>
                In a full application, administrators would have tools to manage this library: update tags, delete images, or manually trigger new generation prompts, likely through a separate admin interface connected to your backend database.
              </AlertDescription>
            </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
