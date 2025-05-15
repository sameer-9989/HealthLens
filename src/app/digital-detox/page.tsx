
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PowerOff, Info } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DigitalDetoxPage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Card className="shadow-lg text-center">
        <CardHeader>
           <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit mb-3">
             <Info className="h-10 w-10 text-destructive" />
           </div>
          <CardTitle className="text-2xl font-bold flex items-center justify-center">
            <PowerOff className="h-7 w-7 mr-2 text-destructive" />
            Digital Detox Tool - Removed
          </CardTitle>
          <CardDescription>
            This feature has been removed from the platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            We are currently focusing on other core health and wellness features.
            For tips on managing screen time or building healthier digital habits, consider exploring our Self-Care Plans or asking the Virtual Assistant.
          </p>
          <Button asChild variant="outline">
            <Link href="/">
              Go to Dashboard
            </Link>
          </Button>
           <Button asChild className="ml-2">
            <Link href="/self-care-plans">
              Explore Self-Care Plans
            </Link>
          </Button>
           <Button asChild className="ml-2">
            <Link href="/virtual-assistant">
              Ask Virtual Assistant
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
