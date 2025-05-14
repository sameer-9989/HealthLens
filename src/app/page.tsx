import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { mainNavItems } from "@/config/nav";
import Link from "next/link";
import { ArrowRight, ListChecks, Activity } from "lucide-react"; // Added ListChecks and Activity
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function DashboardPage() {
  const featuredItems = mainNavItems.filter(item => item.href !== '/').slice(0, 6); // Show 6 features

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-3xl font-bold">Welcome to HealthLens!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Your personal health companion. Explore tools to manage your well-being.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <p className="mb-4">
                HealthLens provides a suite of AI-powered tools and resources to help you understand your symptoms, manage your health routines, and communicate effectively with healthcare providers.
              </p>
              <p>
                Navigate through the sidebar to access features like the AI Symptom Checker, Virtual Nursing Assistant, Self-Care Plans, and more.
              </p>
              <Button asChild className="mt-6">
                <Link href="/symptom-checker">
                  Check Symptoms <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="hidden md:block">
              <Image 
                src="https://placehold.co/600x400.png" 
                alt="Healthcare illustration" 
                width={600} 
                height={400} 
                className="rounded-lg shadow-md"
                data-ai-hint="health technology" 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Quick Access</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredItems.map((item) => (
            <Link href={item.href} key={item.href} className="block hover:no-underline">
              <Card className={`shadow-md hover:shadow-xl transition-shadow duration-300 h-full flex flex-col ${item.color || 'bg-card'}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">{item.title}</CardTitle>
                  <item.icon className="h-6 w-6 text-primary" />
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground">
                    {item.description || `Access the ${item.title} feature.`}
                  </p>
                </CardContent>
                <CardContent className="pt-0">
                   <Button variant="link" className="p-0 h-auto text-primary">
                    Go to {item.title} <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Your Health Journey</CardTitle>
          <CardDescription>Stay on top of your health goals and routines.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
            <Link href="/routine-builder" className="block hover:no-underline">
                 <Card className="hover:bg-accent/50 transition-colors">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <ListChecks className="h-8 w-8 text-primary" />
                        <div>
                            <CardTitle>Routine Builder</CardTitle>
                            <CardDescription>Manage your daily health tasks.</CardDescription>
                        </div>
                    </CardHeader>
                 </Card>
            </Link>
            <Link href="/symptom-timeline" className="block hover:no-underline">
                 <Card className="hover:bg-accent/50 transition-colors">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Activity className="h-8 w-8 text-primary" />
                        <div>
                            <CardTitle>Symptom Timeline</CardTitle>
                            <CardDescription>Track and visualize your symptoms.</CardDescription>
                        </div>
                    </CardHeader>
                 </Card>
            </Link>
        </CardContent>
      </Card>
    </div>
  );
}
