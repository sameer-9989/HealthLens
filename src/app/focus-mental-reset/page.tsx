
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Leaf, Wind, Moon, Waves, Sun } from "lucide-react"; // Added Waves, Sun
// Image import removed as it's no longer used

interface ResetType {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  imageHint: string; // Kept for potential future use with real images, but not used for placehold.co
  youtubeSearchQuery: string;
}

const resetTypes: ResetType[] = [
  {
    id: 'breathing',
    title: 'Guided Breathing',
    description: 'Focus on your breath to calm your mind and reduce stress. Simple and effective.',
    icon: Wind,
    imageHint: 'calm breathing animation',
    youtubeSearchQuery: '5 minute guided breathing exercise for calm',
  },
  {
    id: 'nature',
    title: 'Nature Sounds & Visuals',
    description: 'Immerse yourself in calming nature scenes and sounds to relax and rejuvenate.',
    icon: Leaf,
    imageHint: 'serene nature landscape',
    youtubeSearchQuery: 'calming nature sounds and visuals for relaxation',
  },
  {
    id: 'meditation',
    title: 'Short Meditation',
    description: 'A brief guided meditation to center yourself and find inner peace.',
    icon: Moon, 
    imageHint: 'peaceful meditation silhouette',
    youtubeSearchQuery: '5 minute guided meditation for beginners',
  },
  {
    id: 'soundscape',
    title: 'Ambient Soundscape',
    description: 'Listen to soothing ambient sounds like rain or ocean waves to improve focus or relaxation.',
    icon: Waves,
    imageHint: 'abstract sound waves blue',
    youtubeSearchQuery: 'relaxing ambient soundscapes for focus sleep',
  },
   {
    id: 'positive_affirmations',
    title: 'Positive Affirmations',
    description: 'Listen to guided positive affirmations to boost mood and self-esteem.',
    icon: Sun,
    imageHint: 'uplifting sun rays positive energy',
    youtubeSearchQuery: 'guided positive affirmations for self esteem morning',
  }
];

export default function FocusMentalResetPage() {
  const [selectedReset, setSelectedReset] = useState<ResetType | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; 
  }

  const handleSelectReset = (resetId: string) => {
    const findReset = resetTypes.find(r => r.id === resetId);
    setSelectedReset(findReset || null);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-3">
            <Zap className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Focus &amp; Mental Reset Room</CardTitle>
          <CardDescription>
            Choose a mental reset type below to find guided exercises, relaxing visuals, or calming soundscapes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resetTypes.map((reset) => (
              <Button
                key={reset.id}
                variant={selectedReset?.id === reset.id ? "default" : "outline"}
                className="h-auto p-4 flex flex-col items-center justify-center space-y-2 text-center"
                onClick={() => handleSelectReset(reset.id)}
              >
                <reset.icon className="h-8 w-8 mb-1 text-primary" />
                <span className="font-semibold">{reset.title}</span>
                <span className="text-xs text-muted-foreground">{reset.description}</span>
              </Button>
            ))}
          </div>

          {selectedReset && (
            <Card className="mt-6 p-4 sm:p-6 bg-muted/30">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-xl flex items-center">
                  <selectedReset.icon className="h-6 w-6 mr-2 text-primary" />
                  {selectedReset.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                {/* Placeholder for actual video embed or visual. Image removed. */}
                {/* The div below used to contain the placeholder image. It's removed as it would be empty. */}
                {/* <div className="aspect-video bg-slate-800 rounded-lg overflow-hidden shadow-lg flex items-center justify-center"> */}
                {/* Image removed */}
                {/* </div> */}
                <p className="text-sm text-muted-foreground">{selectedReset.description}</p>
                <Button variant="default" asChild className="w-full sm:w-auto">
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedReset.youtubeSearchQuery)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Find {selectedReset.title} videos on YouTube
                  </a>
                </Button>
                <p className="text-xs text-muted-foreground text-center pt-2">
                    Clicking the button will search YouTube for "{selectedReset.youtubeSearchQuery}". Remember to choose videos from trusted sources.
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
       <Card className="shadow-lg mt-8">
        <CardHeader>
            <CardTitle className="text-lg">About The Reset Room</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">
                This space is designed to offer quick, accessible tools for mental well-being. Whether you need to de-stress, refocus, or find a moment of calm, these guided exercises and sensory experiences can help. 
                Select an option above to begin. All content is intended for relaxation and general well-being and is not a substitute for professional mental health care.
            </p>
        </CardContent>
       </Card>
    </div>
  );
}
