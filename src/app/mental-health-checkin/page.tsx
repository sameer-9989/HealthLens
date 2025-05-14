import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck } from "lucide-react";

export default function MentalHealthCheckInPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="items-center text-center">
          <UserCheck className="h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold">Mental Health Check-In Companion</CardTitle>
          <CardDescription>
            Receive emotionally intelligent mental health check-ins using sentiment analysis and mood detection.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg text-muted-foreground">
            This feature is currently under development. Personalized mental health support coming soon!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
