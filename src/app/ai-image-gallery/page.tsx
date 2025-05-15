
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon, Info } from "lucide-react"; // Changed Sparkles to ImageIcon
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AiImageGalleryPage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Card className="shadow-lg text-center">
        <CardHeader>
           <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit mb-3">
             <Info className="h-10 w-10 text-destructive" />
           </div>
          <CardTitle className="text-2xl font-bold flex items-center justify-center">
            <ImageIcon className="h-7 w-7 mr-2 text-destructive" /> {/* Icon to match other "removed" pages */}
            AI Image Generator - Removed
          </CardTitle>
          <CardDescription>
            This feature has been removed from the platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            We are focusing on other core AI health features at this time.
            The static image library within the application will continue to be used.
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
