import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function JournalSynthesizerPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="items-center text-center">
          <FileText className="h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold">Symptom Journal Synthesizer</CardTitle>
          <CardDescription>
            Convert your journal entries into structured medical summaries for healthcare providers.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg text-muted-foreground">
            This feature is currently under development. AI-powered journal summarization coming soon!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
