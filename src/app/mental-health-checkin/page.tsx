
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircleHeart, Info } from "lucide-react"; // Changed UserCheck to MessageCircleHeart, added Info
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MentalHealthCheckInPage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Card className="shadow-lg text-center">
        <CardHeader>
           <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-3">
             <Info className="h-10 w-10 text-primary" />
           </div>
          <CardTitle className="text-2xl font-bold">Mental Health Check-In - Feature Update</CardTitle>
          <CardDescription>
            The functionality of the Mental Health Check-In Companion has been integrated into our enhanced <strong>Virtual Nursing Assistant</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            You can now discuss your mood, feelings of stress or anxiety, and request simple calming exercises directly with the Virtual Nursing Assistant.
            It's equipped to provide empathetic responses and supportive guidance.
          </p>
          <Button asChild>
            <Link href="/virtual-assistant">
              <MessageCircleHeart className="mr-2 h-4 w-4"/> Talk to Virtual Nursing Assistant
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
