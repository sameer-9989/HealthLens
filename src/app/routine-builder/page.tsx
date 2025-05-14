import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListChecks } from "lucide-react";

export default function RoutineBuilderPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="items-center text-center">
          <ListChecks className="h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold">Health Routine Builder</CardTitle>
          <CardDescription>
            Create personalized daily checklists for hydration, mobility, breathing, and more, based on your symptom history and goals.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg text-muted-foreground">
            This feature is currently under development. Soon you'll be able to build and track your personalized health routines!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
