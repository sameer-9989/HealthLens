import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Library } from "lucide-react";

export default function TherapeuticsLibraryPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="items-center text-center">
           <Library className="h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold">Digital Therapeutics Library</CardTitle>
          <CardDescription>
            Access interactive CBT exercises, guided imagery, mindfulness tools, and breathing exercises.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg text-muted-foreground">
            This feature is currently under development. Check back soon for a library of therapeutic resources!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
