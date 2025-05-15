
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, CalendarDays, ActivityIcon, TrendingUp, NotebookText, Lightbulb, HelpCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateDailyWellnessTip, GenerateDailyWellnessTipInput, GenerateDailyWellnessTipOutput } from '@/ai/flows/daily-wellness-tip-generator';
import { useToast } from '@/hooks/use-toast'; // For emergency alerts

const symptomLogSchema = z.object({
  description: z.string().min(3, "Symptom description is too short."),
  severity: z.enum(["Mild", "Moderate", "Severe"]),
  date: z.string().optional(), // Will be auto-filled
  notes: z.string().optional(),
});
type SymptomLogFormData = z.infer<typeof symptomLogSchema>;

interface SymptomLogEntry extends SymptomLogFormData {
  id: string;
  timestamp: string;
  formattedDate: string;
}

const wellnessTipSchema = z.object({
    userFocus: z.string().optional(),
    language: z.string().optional(),
});
type WellnessTipFormData = z.infer<typeof wellnessTipSchema>;

const focusAreas = [
    { value: "hydration", label: "Hydration" },
    { value: "stress management", label: "Stress Management" },
    { value: "better sleep", label: "Better Sleep" },
    { value: "healthy eating", label: "Healthy Eating" },
    { value: "exercise motivation", label: "Exercise Motivation" },
    { value: "general wellness", label: "General Wellness" },
];

const languages = [
    { value: "en", label: "English" },
    { value: "es", label: "Español (Spanish)" },
    { value: "hi", label: "हिन्दी (Hindi)" },
    { value: "kn", label: "ಕನ್ನಡ (Kannada)" },
    // Add more languages as supported by AI
];

export default function HealthTrackerPage() {
  const [symptomLogs, setSymptomLogs] = useState<SymptomLogEntry[]>([]);
  const [isLoadingTip, setIsLoadingTip] = useState(false);
  const [wellnessTipResult, setWellnessTipResult] = useState<GenerateDailyWellnessTipOutput | null>(null);
  const [tipError, setTipError] = useState<string | null>(null);
  const { toast } = useToast();

  const { control: symptomControl, register: symptomRegister, handleSubmit: handleSymptomSubmit, reset: resetSymptomForm, formState: { errors: symptomErrors } } = useForm<SymptomLogFormData>({
    resolver: zodResolver(symptomLogSchema),
    defaultValues: { severity: "Mild" }
  });

  const { control: tipControl, handleSubmit: handleTipSubmit, formState: { errors: tipErrors } } = useForm<WellnessTipFormData>({
    resolver: zodResolver(wellnessTipSchema),
    defaultValues: { userFocus: "general wellness", language: "en"}
  });

  const criticalKeywords = ["chest pain", "difficulty breathing", "can't breathe", "severe bleeding", "loss of consciousness", "stroke symptoms", "sudden numbness", "severe dizziness", "suicidal", "want to die", "self harm"];

  const onSymptomLogSubmit: SubmitHandler<SymptomLogFormData> = (data) => {
    const now = new Date();
    const newLog: SymptomLogEntry = {
      ...data,
      id: now.toISOString() + Math.random().toString(),
      timestamp: now.toISOString(),
      formattedDate: now.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) + ' ' + now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
    };
    setSymptomLogs(prev => [newLog, ...prev]);
    resetSymptomForm();

    // Client-side critical symptom check
    const descriptionLower = data.description.toLowerCase();
    if (criticalKeywords.some(keyword => descriptionLower.includes(keyword))) {
      toast({
        variant: "destructive",
        title: "Critical Symptom Warning!",
        description: "Your logged symptom description suggests a serious condition. Please seek immediate medical attention or contact your local emergency services (e.g., 911, 112). This app does not provide medical diagnosis or emergency services.",
        duration: 10000, // Longer duration for important warnings
      });
    }
  };

  const onWellnessTipSubmit: SubmitHandler<WellnessTipFormData> = async (data) => {
    setIsLoadingTip(true);
    setTipError(null);
    setWellnessTipResult(null);
    try {
      const input: GenerateDailyWellnessTipInput = { userFocus: data.userFocus, language: data.language };
      // In a real app, age and healthGoals might come from a user profile
      // For demonstration: input.age = 30; input.healthGoals = ["reduce stress"];
      const result = await generateDailyWellnessTip(input);
      setWellnessTipResult(result);
    } catch (e) {
      console.error("Error fetching wellness tip:", e);
      setTipError("Could not fetch a wellness tip at this time. Please try again later.");
    }
    setIsLoadingTip(false);
  };
  
  // Fetch initial wellness tip on component mount
  useEffect(() => {
    handleTipSubmit({ userFocus: "general wellness", language: "en" })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const getSymptomTrends = () => {
    if (symptomLogs.length === 0) return "No symptoms logged in this session yet.";
    const descriptionCounts: Record<string, number> = {};
    symptomLogs.forEach(log => {
      descriptionCounts[log.description.trim()] = (descriptionCounts[log.description.trim()] || 0) + 1;
    });
    const mostFrequentDescription = Object.entries(descriptionCounts).sort((a, b) => b[1] - a[1])[0];
    let trendText = `Logged ${symptomLogs.length} symptom(s) this session. `;
    if (mostFrequentDescription) {
      trendText += `The most frequent symptom description is: "${mostFrequentDescription[0]}" (logged ${mostFrequentDescription[1]} time(s)). `;
    }
    // More complex trend analysis (e.g., severity changes over time) would require more data and logic.
    return trendText;
  };


  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <ActivityIcon className="mr-2 h-7 w-7 text-primary" /> Health Tracker
          </CardTitle>
          <CardDescription>
            Log your symptoms, get daily wellness tips, and monitor your health journey.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Daily Wellness Tip Section */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><Lightbulb className="mr-2 h-6 w-6 text-primary" /> Daily Wellness Tip</CardTitle>
          <CardDescription>Get a personalized wellness tip from our AI coach. For more detailed personalization, future updates will allow linking to your user profile for age and health goals.</CardDescription>
        </CardHeader>
        <form onSubmit={handleTipSubmit(onWellnessTipSubmit)}>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="userFocus">Focus Area (Optional)</Label>
                        <Controller
                            name="userFocus"
                            control={tipControl}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger id="userFocus" className="mt-1">
                                    <SelectValue placeholder="Select focus area" />
                                </SelectTrigger>
                                <SelectContent>
                                    {focusAreas.map(area => <SelectItem key={area.value} value={area.value}>{area.label}</SelectItem>)}
                                </SelectContent>
                                </Select>
                            )}
                        />
                         {tipErrors.userFocus && <p className="text-sm text-destructive mt-1">{tipErrors.userFocus.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="language">Language (Optional)</Label>
                         <Controller
                            name="language"
                            control={tipControl}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger id="language" className="mt-1">
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    {languages.map(lang => <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>)}
                                </SelectContent>
                                </Select>
                            )}
                        />
                        {tipErrors.language && <p className="text-sm text-destructive mt-1">{tipErrors.language.message}</p>}
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                 <Button type="submit" disabled={isLoadingTip}>
                    {isLoadingTip ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Get New Tip
                </Button>
            </CardFooter>
        </form>
        {wellnessTipResult && (
          <CardContent>
            <Alert className="bg-primary/10 border-primary/30">
              <Sparkles className="h-4 w-4 text-primary" />
              <AlertTitle className="text-primary font-semibold">{wellnessTipResult.category}</AlertTitle>
              <AlertDescription className="text-primary/90">{wellnessTipResult.wellnessTip}</AlertDescription>
            </Alert>
          </CardContent>
        )}
        {tipError && (
          <CardContent>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Tip Generation Error</AlertTitle>
              <AlertDescription>{tipError}</AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      {/* Symptom Logging Section */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><NotebookText className="mr-2 h-6 w-6 text-primary" />Log New Symptom (Current Session)</CardTitle>
          <CardDescription>Enter your symptoms below. Data is stored for this session only.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSymptomSubmit(onSymptomLogSubmit)}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="symptomDescription">Symptom Description</Label>
              <Input id="symptomDescription" placeholder="e.g., Headache, fatigue, cough" {...symptomRegister("description")} className="mt-1" />
              {symptomErrors.description && <p className="text-sm text-destructive mt-1">{symptomErrors.description.message}</p>}
            </div>
            <div>
              <Label htmlFor="symptomSeverity">Severity</Label>
              <Controller
                name="severity"
                control={symptomControl}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="symptomSeverity" className="mt-1">
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mild">Mild</SelectItem>
                      <SelectItem value="Moderate">Moderate</SelectItem>
                      <SelectItem value="Severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {symptomErrors.severity && <p className="text-sm text-destructive mt-1">{symptomErrors.severity.message}</p>}
            </div>
            <div>
              <Label htmlFor="symptomNotes">Additional Notes (Optional)</Label>
              <Textarea id="symptomNotes" placeholder="e.g., Started after lunch, worse in the evening" {...symptomRegister("notes")} className="mt-1" />
            </div>
             <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
              <ShieldAlert className="h-4 w-4 !text-destructive" />
              <AlertTitle className="text-destructive">Emergency Warning</AlertTitle>
              <AlertDescription className="text-destructive/80">
                If you are experiencing severe symptoms like chest pain, difficulty breathing, or other critical issues, please seek immediate medical attention from a healthcare professional or call your local emergency services. This app does not provide medical diagnosis or emergency services.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button type="submit">Log Symptom</Button>
          </CardFooter>
        </form>
      </Card>

      {/* Symptom Log Display Section */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><CalendarDays className="mr-2 h-6 w-6 text-primary" />Symptom Log (Current Session)</CardTitle>
        </CardHeader>
        <CardContent>
          {symptomLogs.length === 0 ? (
            <p className="text-muted-foreground">No symptoms logged in this session yet.</p>
          ) : (
            <ul className="space-y-3">
              {symptomLogs.map(log => (
                <li key={log.id} className="p-3 border rounded-md bg-muted/20">
                  <p className="font-semibold">{log.description} <span className={`text-sm font-normal px-2 py-0.5 rounded-full ${log.severity === "Severe" ? "bg-red-100 text-red-700" : log.severity === "Moderate" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>{log.severity}</span></p>
                  <p className="text-xs text-muted-foreground">Logged: {log.formattedDate}</p>
                  {log.notes && <p className="text-sm mt-1 text-muted-foreground">Notes: {log.notes}</p>}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Symptom Trends Section */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><TrendingUp className="mr-2 h-6 w-6 text-primary" />Symptom Summary (Current Session)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{getSymptomTrends()}</p>
          <p className="text-xs text-muted-foreground mt-2">Note: Advanced trend visualization over time requires persistent data storage, which is a planned future enhancement.</p>
        </CardContent>
      </Card>

      {/* Important Notes and Future Enhancements */}
      <Card className="shadow-md mt-8 bg-secondary/50">
        <CardHeader>
            <CardTitle className="text-lg flex items-center"><HelpCircle className="mr-2 h-5 w-5 text-primary"/>Important Notes & Future Enhancements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Data Persistence:</strong> Symptom logs entered on this page are stored for your current session only and will be cleared when you close or refresh this page. Persistent symptom history, allowing you to view logs across multiple sessions, is a feature planned for future updates and requires backend database integration.</p>
            <p><strong>Trend Analysis & Visualizations:</strong> The current "Symptom Summary" provides a very basic textual overview of symptoms logged in this session. Advanced trend analysis, visualizations (like charts and graphs of symptom frequency/severity over weeks or months), and progress tracking are planned for future versions that include persistent data storage.</p>
            <p><strong>Offline Functionality:</strong> While you can log symptoms during your current browser session if the page is already loaded, full offline data storage (beyond the current session) and automatic cloud synchronization are advanced features that will be explored in future updates.</p>
            <p><strong>Emergency Guidance:</strong> The critical symptom warning is a client-side aid. Always prioritize professional medical advice for any urgent health concerns. The main AI Symptom Checker and Virtual Nursing Assistant also have AI-driven checks for critical inputs.</p>
        </CardContent>
      </Card>

    </div>
  );
}

    