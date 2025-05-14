import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

export default function EmergencyInfoPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="items-center text-center">
          <ShieldAlert className="h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold">Secure Emergency Info Builder</CardTitle>
          <CardDescription>
            Create a downloadable emergency sheet with your vital medical information.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg text-muted-foreground">
            This feature is currently under development. Your personalized emergency sheet builder is on its way!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
