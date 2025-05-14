import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain } from "lucide-react";

export default function CognitiveTrackerPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="items-center text-center">
          <Brain className="h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold">Cognitive Health Tracker</CardTitle>
          <CardDescription>
            Assess memory, focus, or emotional resilience with daily prompts. Especially helpful for aging users or caregivers.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg text-muted-foreground">
            This feature is currently under development. Daily cognitive prompts coming soon!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
