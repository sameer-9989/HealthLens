
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, Info } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HealthLiteracyCoachPage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Card className="shadow-lg text-center">
        <CardHeader>
           <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit mb-3">
             <Info className="h-10 w-10 text-destructive" />
           </div>
          <CardTitle className="text-2xl font-bold">Health Literacy Coach - Feature Update</CardTitle>
          <CardDescription>
            The functionality of the Health Literacy Coach (explaining medical terms and simplifying information) has been integrated into our enhanced <strong>Virtual Nursing Assistant</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Please use the Virtual Nursing Assistant to ask for explanations of medical terms, diagnoses, or prescriptions.
            It can now provide this information in plain language.
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
