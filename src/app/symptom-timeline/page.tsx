
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Info } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SymptomTimelinePage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Card className="shadow-lg text-center">
        <CardHeader>
           <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit mb-3">
             <Info className="h-10 w-10 text-destructive" />
           </div>
          <CardTitle className="text-2xl font-bold flex items-center justify-center">
            <Activity className="h-7 w-7 mr-2 text-destructive" /> {/* Icon to match other "removed" pages */}
            Symptom Playback Timeline - Removed
          </CardTitle>
          <CardDescription>
            This feature has been removed from the platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            We are currently focusing on other core health tracking and analysis features.
            Symptom logging might be integrated into other tools in the future.
          </p>
          <Button asChild variant="outline">
            <Link href="/">
              Go to Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
