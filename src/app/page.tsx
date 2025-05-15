
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { mainNavItems } from "@/config/nav";
import Link from "next/link";
import { ArrowRight, ListChecks, Activity, YoutubeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function DashboardPage() {
  // Filter out the dashboard itself and take a few features for quick access
  const featuredItems = mainNavItems.filter(item => item.href !== '/').slice(0, 5); 
  // Specific items for "Your Health Journey" section
  const selfCarePlanItem = mainNavItems.find(item => item.href === '/self-care-plans');
  const symptomTimelineItem = mainNavItems.find(item => item.href === '/symptom-timeline');
  const stressReliefYogaItem = mainNavItems.find(item => item.href === '/stress-relief-yoga');


  return (
    <div className="space-y-8">
      <div className="w-full max-w-[600px] mx-auto p-4">
        <Image
          src="/images/health_lens_hero.png"
          alt="Health Lens App Hero Image"
          width={600} 
          height={600} 
          className="rounded-lg shadow-md object-contain w-full h-auto"
          priority 
        />
      </div>

      <Card className="shadow-lg">
        <CardHeader className="pb-4 text-center">
          <CardTitle className="text-3xl font-bold">Welcome to HealthLens!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Your personal AI-powered health companion. Explore tools to manage your well-being.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-1 gap-6 items-center"> {/* Adjusted to single column as image is now above */}
            <div className="text-center md:text-left">
              <p className="mb-4">
                HealthLens provides a suite of AI-powered tools and resources to help you understand your symptoms, create self-care plans, manage stress, and interact with a virtual health assistant.
              </p>
              <p>
                Navigate through the sidebar to access all available features.
              </p>
              <Button asChild className="mt-6">
                <Link href="/symptom-checker">
                  Check Symptoms <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            {/* Previous image div removed */}
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
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selfCarePlanItem && (
              <Link href={selfCarePlanItem.href} className="block hover:no-underline">
                   <Card className="hover:bg-accent/50 transition-colors h-full">
                      <CardHeader className="flex flex-row items-center gap-4">
                          <ListChecks className="h-8 w-8 text-primary" />
                          <div>
                              <CardTitle>{selfCarePlanItem.title}</CardTitle>
                              <CardDescription>{selfCarePlanItem.description || "Create personalized self-care strategies."}</CardDescription>
                          </div>
                      </CardHeader>
                   </Card>
              </Link>
            )}
            {symptomTimelineItem && (
              <Link href={symptomTimelineItem.href} className="block hover:no-underline">
                   <Card className="hover:bg-accent/50 transition-colors h-full">
                      <CardHeader className="flex flex-row items-center gap-4">
                          <Activity className="h-8 w-8 text-primary" />
                          <div>
                              <CardTitle>{symptomTimelineItem.title}</CardTitle>
                              <CardDescription>{symptomTimelineItem.description || "Track and visualize your symptoms."}</CardDescription>
                          </div>
                      </CardHeader>
                   </Card>
              </Link>
            )}
            {stressReliefYogaItem && (
              <Link href={stressReliefYogaItem.href} className="block hover:no-underline">
                   <Card className="hover:bg-accent/50 transition-colors h-full">
                      <CardHeader className="flex flex-row items-center gap-4">
                          <YoutubeIcon className="h-8 w-8 text-primary" />
                          <div>
                              <CardTitle>{stressReliefYogaItem.title}</CardTitle>
                              <CardDescription>{stressReliefYogaItem.description || "Find yoga routines for stress."}</CardDescription>
                          </div>
                      </CardHeader>
                   </Card>
              </Link>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
