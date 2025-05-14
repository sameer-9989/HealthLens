import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

export default function SymptomTimelinePage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="items-center text-center">
          <Activity className="h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold">Symptom Playback Timeline</CardTitle>
          <CardDescription>
            Visualize and understand your symptom progression over time through a narrative log.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg text-muted-foreground">
            This feature is currently under development. Check back soon to track your symptom patterns automatically!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
