
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Library, Info } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TherapeuticsLibraryPage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Card className="shadow-lg text-center">
        <CardHeader>
          <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit mb-3">
             <Info className="h-10 w-10 text-destructive" />
           </div>
          <CardTitle className="text-2xl font-bold">Digital Therapeutics Library - Feature Update</CardTitle>
          <CardDescription>
            The tools and exercises from the Digital Therapeutics Library (like guided breathing, mindfulness, and CBT prompts) are now available through our <strong>Virtual Nursing Assistant</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            You can ask the Virtual Nursing Assistant for specific exercises (e.g., "guide me through a breathing exercise" or "help me with a CBT prompt for negative thoughts").
          </p>
          <Button asChild>
            <Link href="/virtual-assistant">
              Go to Virtual Nursing Assistant
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
