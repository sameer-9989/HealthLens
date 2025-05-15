
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListChecks, Info } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RoutineBuilderPage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Card className="shadow-lg text-center">
        <CardHeader>
           <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit mb-3">
             <Info className="h-10 w-10 text-destructive" />
           </div>
          <CardTitle className="text-2xl font-bold">Health Routine Builder - Feature Update</CardTitle>
          <CardDescription>
            The Health Routine Builder for daily checklists has been streamlined. Personalized habit suggestions are now primarily part of our AI-generated <strong>Self-Care Plans</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Explore Self-Care Plans to get AI-tailored suggestions for building healthy habits and routines based on your specific conditions or goals.
          </p>
          <Button asChild>
            <Link href="/self-care-plans">
              Explore Self-Care Plans
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
