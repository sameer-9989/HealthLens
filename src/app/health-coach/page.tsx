import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BotMessageSquare } from "lucide-react";

export default function HealthCoachPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="items-center text-center">
          <BotMessageSquare className="h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold">Conversational Health Coach</CardTitle>
          <CardDescription>
            Engage in personalized habit-building conversations for sleep, diet, hydration, and more.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg text-muted-foreground">
            This feature is currently under development. Soon you'll be able to chat with our AI health coach!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
