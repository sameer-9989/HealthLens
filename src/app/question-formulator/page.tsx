import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

export default function QuestionFormulatorPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="items-center text-center">
          <HelpCircle className="h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold">Health Question Auto-Formulator</CardTitle>
          <CardDescription>
            Get help formulating the right questions to ask your doctor based on your current condition and symptoms.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg text-muted-foreground">
            This feature is currently under development. AI-assisted question generation for your doctor visits is coming soon!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
