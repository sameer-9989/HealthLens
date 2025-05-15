
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { mainNavItems } from "@/config/nav";
import Link from "next/link";
import { ArrowRight, ListChecks, Activity, YoutubeIcon, Building } from "lucide-react"; 
import { Button } from "@/components/ui/button";
// Image import removed as it's no longer used in this file.

export default function DashboardPage() {
  const featuredItems = mainNavItems.filter(item => item.href !== '/').slice(0, 3); // Show top 3 features
  const selfCarePlanItem = mainNavItems.find(item => item.href === '/self-care-plans');
  const virtualAssistantItem = mainNavItems.find(item => item.href === '/virtual-assistant');
  const stressReliefYogaItem = mainNavItems.find(item => item.href === '/stress-relief-yoga');


  return (
    <div className="space-y-8">
      <Card className="shadow-xl overflow-hidden">
        <CardHeader className="pb-6 text-center bg-gradient-to-br from-primary/80 via-primary/70 to-accent/60 dark:from-primary/50 dark:via-primary/40 dark:to-accent/40 p-8 md:p-12">
          {/* Image component removed from here */}
          <CardTitle className="text-3xl md:text-4xl font-bold text-primary-foreground drop-shadow-sm mt-4 md:mt-0">
            Welcome to Your Intelligent Health Companion
          </CardTitle>
          <CardDescription className="text-lg md:text-xl text-primary-foreground/90 mt-2 drop-shadow-sm">
            Powered by AI, Designed for You.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <div className="text-center md:text-left mb-8">
            <p className="text-muted-foreground mb-6 text-base md:text-lg">
              HealthLens provides a suite of AI-powered tools and resources to help you understand your symptoms, create self-care plans, manage stress, and interact with a virtual health assistant. Navigate through the sidebar to access all available features.
            </p>
            <div className="flex justify-center">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105">
                <Link href="/symptom-checker">
                  Let&apos;s Begin: Check Symptoms <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <section>
        <h2 className="text-2xl font-semibold mb-6 text-center md:text-left">Explore Key Features</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredItems.map((item) => (
            <Link href={item.href} key={item.href} className="block hover:no-underline group">
              <Card className={`shadow-md hover:shadow-xl transition-all duration-300 ease-in-out group-hover:scale-[1.03] h-full flex flex-col ${item.color || 'bg-card'}`}>
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
                   <Button variant="link" className="p-0 h-auto text-primary group-hover:underline">
                    Go to {item.title} <ArrowRight className="ml-1 h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Your Health Journey Support</CardTitle>
          <CardDescription>Tools to help you stay on top of your health goals and routines.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-6">
            {selfCarePlanItem && (
              <Link href={selfCarePlanItem.href} className="block hover:no-underline group">
                   <Card className="hover:bg-accent/10 dark:hover:bg-accent/20 transition-colors h-full group-hover:shadow-lg p-4">
                      <CardHeader className="flex flex-row items-center gap-4 p-2">
                          <ListChecks className="h-8 w-8 text-primary" />
                          <div>
                              <CardTitle className="text-base">{selfCarePlanItem.title}</CardTitle>
                              <CardDescription className="text-xs">{selfCarePlanItem.description || "Create personalized self-care strategies."}</CardDescription>
                          </div>
                      </CardHeader>
                   </Card>
              </Link>
            )}
             {virtualAssistantItem && (
              <Link href={virtualAssistantItem.href} className="block hover:no-underline group">
                   <Card className="hover:bg-accent/10 dark:hover:bg-accent/20 transition-colors h-full group-hover:shadow-lg p-4">
                      <CardHeader className="flex flex-row items-center gap-4 p-2">
                          <virtualAssistantItem.icon className="h-8 w-8 text-primary" />
                          <div>
                              <CardTitle className="text-base">{virtualAssistantItem.title}</CardTitle>
                              <CardDescription className="text-xs">{virtualAssistantItem.description || "Chat with our AI assistant."}</CardDescription>
                          </div>
                      </CardHeader>
                   </Card>
              </Link>
            )}
            {stressReliefYogaItem && (
              <Link href={stressReliefYogaItem.href} className="block hover:no-underline group">
                   <Card className="hover:bg-accent/10 dark:hover:bg-accent/20 transition-colors h-full group-hover:shadow-lg p-4">
                      <CardHeader className="flex flex-row items-center gap-4 p-2">
                          <YoutubeIcon className="h-8 w-8 text-primary" />
                          <div>
                              <CardTitle className="text-base">{stressReliefYogaItem.title}</CardTitle>
                              <CardDescription className="text-xs">{stressReliefYogaItem.description || "Find yoga routines for stress."}</CardDescription>
                          </div>
                      </CardHeader>
                   </Card>
              </Link>
            )}
        </CardContent>
      </Card>

      <Card className="shadow-lg mt-8 border-t-4 border-primary/50">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-semibold">Project Credits</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-3">
          <p className="text-muted-foreground">This HealthLens platform was proudly developed by:</p>
          <p className="font-medium text-lg">Abdul Sameer, Aniruddha Sarkar, Aditya, and Himadri</p>
          <div className="flex items-center justify-center gap-2 text-muted-foreground mt-2">
            <Building className="h-5 w-5 text-primary" />
            <span>HKBK College of Engineering</span>
          </div>
           <p className="text-xs text-muted-foreground pt-4">
            Powered by cutting-edge AI to bring you a new perspective on health.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
