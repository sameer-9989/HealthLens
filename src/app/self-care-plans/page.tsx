import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Leaf, Smile, Moon, Sun } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface SelfCarePlan {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ElementType;
  imageHint: string;
  detailsLink?: string; // Optional: link to a more detailed page for the plan
}

const selfCarePlans: SelfCarePlan[] = [
  {
    id: "mindfulness-meditation",
    title: "Mindfulness Meditation",
    description: "Reduce stress and improve focus with guided mindfulness exercises. Suitable for all levels.",
    category: "Mental Wellness",
    icon: Leaf,
    imageHint: "meditation nature",
    detailsLink: "/self-care-plans/mindfulness"
  },
  {
    id: "stress-relief-yoga",
    title: "Stress Relief Yoga",
    description: "Gentle yoga poses and breathing techniques to calm your mind and body.",
    category: "Physical Activity",
    icon: Zap,
    imageHint: "yoga peaceful"
  },
  {
    id: "digital-detox-challenge",
    title: "Digital Detox Challenge",
    description: "Take a break from screens to reconnect with yourself and the world around you.",
    category: "Lifestyle",
    icon: Moon,
    imageHint: "nature no-phone"
  },
  {
    id: "gratitude-journaling",
    title: "Gratitude Journaling",
    description: "Cultivate positivity by regularly noting things you are grateful for.",
    category: "Mental Wellness",
    icon: Smile,
    imageHint: "journal writing"
  },
  {
    id: "healthy-sleep-habits",
    title: "Healthy Sleep Habits",
    description: "Tips and routines to improve your sleep quality and wake up refreshed.",
    category: "Lifestyle",
    icon: Moon,
    imageHint: "sleep bedroom"
  },
  {
    id: "morning-energizer-routine",
    title: "Morning Energizer Routine",
    description: "Start your day with energy through simple stretches and affirmations.",
    category: "Physical Activity",
    icon: Sun,
    imageHint: "morning sunrise"
  },
];

export default function SelfCarePlansPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Self-Care Plans</CardTitle>
          <CardDescription>
            Discover a variety of plans designed to support your mental, physical, and emotional well-being.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {selfCarePlans.map((plan) => (
          <Card key={plan.id} className="shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <plan.icon className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl">{plan.title}</CardTitle>
              </div>
              <CardDescription className="text-sm text-muted-foreground">{plan.category}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
               <Image 
                src={`https://placehold.co/400x250.png`} 
                alt={plan.title} 
                width={400} 
                height={250} 
                className="rounded-md mb-4 object-cover w-full h-40"
                data-ai-hint={plan.imageHint}
              />
              <p className="text-muted-foreground">{plan.description}</p>
            </CardContent>
            <CardFooter>
              {plan.detailsLink ? (
                <Button asChild variant="default" className="w-full">
                  <Link href={plan.detailsLink}>
                    View Plan <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                 <Button variant="secondary" className="w-full" disabled>
                    Coming Soon
                  </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
