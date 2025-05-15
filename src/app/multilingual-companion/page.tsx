
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Languages, Info } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MultilingualCompanionPage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Card className="shadow-lg text-center">
         <CardHeader>
           <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit mb-3">
             <Info className="h-10 w-10 text-destructive" />
           </div>
          <CardTitle className="text-2xl font-bold">Multilingual Companion - Feature Update</CardTitle>
          <CardDescription>
            Multilingual and cultural sensitivity options have been integrated directly into the <strong>AI Symptom Checker</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            When using the AI Symptom Checker, you can now specify a preferred language and cultural context to receive more tailored information.
          </p>
           <Button asChild>
            <Link href="/symptom-checker">
              Go to AI Symptom Checker
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
