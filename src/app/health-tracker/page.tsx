
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Loader2, AlertTriangle, CalendarDays, ActivityIcon, TrendingUp, NotebookText, Lightbulb, HelpCircle, ShieldAlert, Sparkles, Weight, Droplets, BedDouble, Zap, Smile, Flame, Utensils, Pill, Edit3, Download, Trash2 } from 'lucide-react';
import { generateDailyWellnessTip, GenerateDailyWellnessTipInput, GenerateDailyWellnessTipOutput } from '@/ai/flows/daily-wellness-tip-generator';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod"; // Added import for Zod

// Schemas for new trackable metrics (session state)
interface LogEntry {
  id: string;
  timestamp: number; 
  formattedDateTime: string;
}

interface WeightLogEntry extends LogEntry {
  value: number; // kg
  goal?: number; // kg
}

interface WaterLogEntry extends LogEntry {
  amount: number; // glasses or ml (user defines unit contextually)
}

interface SleepLogEntry extends LogEntry {
  duration: number; // hours
  quality?: 'Poor' | 'Fair' | 'Good' | 'Excellent';
}

interface MoodLogEntry extends LogEntry {
  level: number; // 1-5 scale
  notes?: string;
}

interface StressLogEntry extends LogEntry {
  level: number; // 1-5 scale
  notes?: string;
}

interface EnergyLogEntry extends LogEntry {
  level: number; // 1-10 scale
}

interface ExerciseLogEntry extends LogEntry {
  minutes: number;
  type?: string;
}

interface StepsLogEntry extends LogEntry {
  count: number;
}

interface MedicationAdherenceLogEntry extends LogEntry {
  taken: boolean;
  medicationName?: string; // Simplified for now
}

interface DailyNoteEntry extends LogEntry {
  note: string;
}

const symptomLogSchema = z.object({
  description: z.string().min(3, "Symptom description is too short."),
  severity: z.enum(["Mild", "Moderate", "Severe"]),
  notes: z.string().optional(),
});
type SymptomLogFormData = z.infer<typeof symptomLogSchema>;
interface SymptomLogSessionEntry extends SymptomLogFormData, LogEntry {}


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
];

const moodLevels = [
  { value: 1, label: '😢 Very Low' },
  { value: 2, label: '😟 Low' },
  { value: 3, label: '😐 Neutral' },
  { value: 4, label: '🙂 Good' },
  { value: 5, label: '😄 Excellent' },
];

const energyLevels = Array.from({ length: 10 }, (_, i) => ({ value: i + 1, label: `${i + 1}` }));

const criticalKeywords = ["chest pain", "difficulty breathing", "can't breathe", "severe bleeding", "loss of consciousness", "stroke symptoms", "sudden numbness", "severe dizziness", "suicidal", "want to die", "self harm", "heart attack", "unable to speak", "severe pain", "uncontrollable bleeding", "blue lips", "seizure", "extreme weakness", "vision loss", "unbearable pain", "crushing chest pain", "shortness of breath at rest", "sudden confusion"];


export default function HealthTrackerPage() {
  const { toast } = useToast();

  // Symptom Logging State & Form
  const [symptomLogs, setSymptomLogs] = useState<SymptomLogSessionEntry[]>([]);
  const { control: symptomControl, register: symptomRegister, handleSubmit: handleSymptomSubmit, reset: resetSymptomForm, formState: { errors: symptomErrors } } = useForm<SymptomLogFormData>({
    resolver: zodResolver(symptomLogSchema),
    defaultValues: { severity: "Mild" }
  });

  // Wellness Tip State & Form
  const [isLoadingTip, setIsLoadingTip] = useState(false);
  const [wellnessTipResult, setWellnessTipResult] = useState<GenerateDailyWellnessTipOutput | null>(null);
  const [tipError, setTipError] = useState<string | null>(null);
  const { control: tipControl, handleSubmit: handleTipSubmit, formState: { errors: tipErrors }, getValues: getTipValues } = useForm<WellnessTipFormData>({
    resolver: zodResolver(wellnessTipSchema),
    defaultValues: { userFocus: "general wellness", language: "en"}
  });
  
  // New Metric States
  const [weightLogs, setWeightLogs] = useState<WeightLogEntry[]>([]);
  const [currentWeight, setCurrentWeight] = useState<string>('');
  const [weightGoal, setWeightGoal] = useState<string>('');

  const [waterLogs, setWaterLogs] = useState<WaterLogEntry[]>([]);
  const [currentWater, setCurrentWater] = useState<string>('');

  const [sleepLogs, setSleepLogs] = useState<SleepLogEntry[]>([]);
  const [currentSleepDuration, setCurrentSleepDuration] = useState<string>('');
  const [currentSleepQuality, setCurrentSleepQuality] = useState<'Poor' | 'Fair' | 'Good' | 'Excellent'>('Good');

  const [moodLogs, setMoodLogs] = useState<MoodLogEntry[]>([]);
  const [currentMoodLevel, setCurrentMoodLevel] = useState<number>(3);
  const [currentMoodNotes, setCurrentMoodNotes] = useState<string>('');

  const [stressLogs, setStressLogs] = useState<StressLogEntry[]>([]);
  const [currentStressLevel, setCurrentStressLevel] = useState<number>(3);
  const [currentStressNotes, setCurrentStressNotes] = useState<string>('');
  
  const [energyLogs, setEnergyLogs] = useState<EnergyLogEntry[]>([]);
  const [currentEnergyLevel, setCurrentEnergyLevel] = useState<number>(5);

  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLogEntry[]>([]);
  const [currentExerciseMinutes, setCurrentExerciseMinutes] = useState<string>('');
  const [currentExerciseType, setCurrentExerciseType] = useState<string>('');

  const [stepsLogs, setStepsLogs] = useState<StepsLogEntry[]>([]);
  const [currentSteps, setCurrentSteps] = useState<string>('');

  const [medAdherenceLogs, setMedAdherenceLogs] = useState<MedicationAdherenceLogEntry[]>([]);
  const [currentMedAdherence, setCurrentMedAdherence] = useState<boolean>(false);
  
  const [dailyNotes, setDailyNotes] = useState<DailyNoteEntry[]>([]);
  const [currentDailyNote, setCurrentDailyNote] = useState<string>('');

  const createLogEntry = <T extends object>(data: T): T & LogEntry => {
    const now = new Date();
    return {
      ...data,
      id: now.toISOString() + Math.random().toString(),
      timestamp: now.getTime(),
      formattedDateTime: format(now, 'MMM d, yyyy HH:mm'),
    };
  };

  const onSymptomLogSubmit: SubmitHandler<SymptomLogFormData> = (data) => {
    const newLog = createLogEntry<SymptomLogFormData>(data);
    setSymptomLogs(prev => [newLog, ...prev].slice(0, 50)); // Keep last 50
    resetSymptomForm();
    const descriptionLower = data.description.toLowerCase();
    if (criticalKeywords.some(keyword => descriptionLower.includes(keyword))) {
      toast({
        variant: "destructive",
        title: "Critical Symptom Warning!",
        description: "Your logged symptom suggests a serious condition. Please seek immediate medical attention or contact your local emergency services (e.g., 911, 112, or your regional number). This app does not provide medical diagnosis or emergency services.",
        duration: 20000, 
      });
    }
  };

  const onWellnessTipSubmit: SubmitHandler<WellnessTipFormData> = async (data) => {
    setIsLoadingTip(true);
    setTipError(null);
    setWellnessTipResult(null);
    try {
      const input: GenerateDailyWellnessTipInput = { userFocus: data.userFocus, language: data.language };
      const result = await generateDailyWellnessTip(input);
      setWellnessTipResult(result);
    } catch (e) {
      console.error("Error fetching wellness tip:", e);
      setTipError("Could not fetch a wellness tip at this time. Please try again later.");
    }
    setIsLoadingTip(false);
  };
  
  useEffect(() => {
    const initialTipValues = getTipValues();
    onWellnessTipSubmit(initialTipValues);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogWeight = () => {
    if (!currentWeight) return;
    const newLog = createLogEntry({ value: parseFloat(currentWeight), goal: weightGoal ? parseFloat(weightGoal) : undefined });
    setWeightLogs(prev => [newLog, ...prev].slice(0,50));
    setCurrentWeight('');
    // setWeightGoal(''); // Optionally clear goal or keep it
  };

  const handleLogWater = () => {
    if (!currentWater) return;
    const newLog = createLogEntry({ amount: parseFloat(currentWater) });
    setWaterLogs(prev => [newLog, ...prev].slice(0,50));
    setCurrentWater('');
  };

  const handleLogSleep = () => {
    if (!currentSleepDuration) return;
    const newLog = createLogEntry({ duration: parseFloat(currentSleepDuration), quality: currentSleepQuality });
    setSleepLogs(prev => [newLog, ...prev].slice(0,50));
    setCurrentSleepDuration('');
  };

  const handleLogMood = () => {
    const newLog = createLogEntry({ level: currentMoodLevel, notes: currentMoodNotes });
    setMoodLogs(prev => [newLog, ...prev].slice(0,50));
    setCurrentMoodNotes('');
  };
  
  const handleLogStress = () => {
    const newLog = createLogEntry({ level: currentStressLevel, notes: currentStressNotes });
    setStressLogs(prev => [newLog, ...prev].slice(0,50));
    setCurrentStressNotes('');
  };

  const handleLogEnergy = () => {
    const newLog = createLogEntry({ level: currentEnergyLevel });
    setEnergyLogs(prev => [newLog, ...prev].slice(0,50));
  };

  const handleLogExercise = () => {
    if (!currentExerciseMinutes) return;
    const newLog = createLogEntry({ minutes: parseFloat(currentExerciseMinutes), type: currentExerciseType });
    setExerciseLogs(prev => [newLog, ...prev].slice(0,50));
    setCurrentExerciseMinutes('');
    setCurrentExerciseType('');
  };

  const handleLogSteps = () => {
    if (!currentSteps) return;
    const newLog = createLogEntry({ count: parseInt(currentSteps) });
    setStepsLogs(prev => [newLog, ...prev].slice(0,50));
    setCurrentSteps('');
  };
  
  const handleLogMedAdherence = () => {
    const newLog = createLogEntry({ taken: currentMedAdherence, medicationName: "General Daily Adherence" }); // Simplified
    setMedAdherenceLogs(prev => [newLog, ...prev].slice(0,50));
  };
  
  const handleLogDailyNote = () => {
    if (!currentDailyNote.trim()) return;
    const newLog = createLogEntry({ note: currentDailyNote });
    setDailyNotes(prev => [newLog, ...prev].slice(0,50));
    setCurrentDailyNote('');
  };

  const resetAllSessionData = () => {
    setSymptomLogs([]);
    setWeightLogs([]);
    setWaterLogs([]);
    setSleepLogs([]);
    setMoodLogs([]);
    setStressLogs([]);
    setEnergyLogs([]);
    setExerciseLogs([]);
    setStepsLogs([]);
    setMedAdherenceLogs([]);
    setDailyNotes([]);
    toast({ title: "Session Data Cleared", description: "All tracked data for this session has been reset." });
  };
  
  // Chart data transformations (memoized for performance)
  const commonChartProps = {
    margin: { top: 5, right: 20, left: -20, bottom: 5 },
  };

  const weightChartData = useMemo(() => weightLogs.map(log => ({ name: format(log.timestamp, 'HH:mm'), weight: log.value, goal: log.goal })).reverse(), [weightLogs]);
  const waterChartData = useMemo(() => waterLogs.map(log => ({ name: format(log.timestamp, 'HH:mm'), amount: log.amount })).reverse(), [waterLogs]);
  const sleepChartData = useMemo(() => sleepLogs.map(log => ({ name: format(log.timestamp, 'HH:mm'), duration: log.duration })).reverse(), [sleepLogs]);
  const moodChartData = useMemo(() => moodLogs.map(log => ({ name: format(log.timestamp, 'HH:mm'), mood: log.level })).reverse(), [moodLogs]);
  const stressChartData = useMemo(() => stressLogs.map(log => ({ name: format(log.timestamp, 'HH:mm'), stress: log.level })).reverse(), [stressLogs]);
  const energyChartData = useMemo(() => energyLogs.map(log => ({ name: format(log.timestamp, 'HH:mm'), energy: log.level })).reverse(), [energyLogs]);
  const exerciseChartData = useMemo(() => exerciseLogs.map(log => ({ name: format(log.timestamp, 'HH:mm'), minutes: log.minutes })).reverse(), [exerciseLogs]);
  const stepsChartData = useMemo(() => stepsLogs.map(log => ({ name: format(log.timestamp, 'HH:mm'), steps: log.count })).reverse(), [stepsLogs]);

  const moodDistributionData = useMemo(() => {
    const counts = moodLogs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    return moodLevels.map(level => ({ name: level.label.split(' ')[0], value: counts[level.value] || 0 }));
  }, [moodLogs]);
  const PIE_COLORS = ['#FF8042', '#FFBB28', '#00C49F', '#0088FE', '#8884D8'];


  const renderLogList = (logs: LogEntry[], renderItem: (log: any) => React.ReactNode) => {
    if (logs.length === 0) return <p className="text-sm text-muted-foreground">No entries yet for this session.</p>;
    return (
      <ScrollArea className="h-40 pr-3">
        <ul className="space-y-2 text-sm">
          {logs.map(log => (
            <li key={log.id} className="p-2 border rounded-md bg-muted/30">
              {renderItem(log)}
              <p className="text-xs text-muted-foreground">{log.formattedDateTime}</p>
            </li>
          ))}
        </ul>
      </ScrollArea>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <Card className="shadow-lg sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <ActivityIcon className="mr-2 h-7 w-7 text-primary" /> Health Tracker Dashboard
          </CardTitle>
          <CardDescription>
            Manually track your health metrics, log symptoms, and get wellness tips. All data is for the current session only.
          </CardDescription>
        </CardHeader>
      </Card>

      <Accordion type="multiple" defaultValue={['wellnessTip', 'symptomLog']} className="w-full space-y-4">
        <AccordionItem value="wellnessTip">
          <AccordionTrigger className="text-lg font-semibold bg-card p-4 rounded-lg shadow-md hover:no-underline">
            <div className="flex items-center"><Lightbulb className="mr-2 h-5 w-5 text-primary" /> Daily Wellness Tip</div>
          </AccordionTrigger>
          <AccordionContent className="bg-card p-4 rounded-b-lg shadow-md">
            <form onSubmit={handleTipSubmit(onWellnessTipSubmit)} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="userFocus">Focus Area</Label>
                  <Controller name="userFocus" control={tipControl} render={({ field }) => (<Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger id="userFocus" className="mt-1"><SelectValue placeholder="Select focus" /></SelectTrigger><SelectContent>{focusAreas.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}</SelectContent></Select>)} />
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Controller name="language" control={tipControl} render={({ field }) => (<Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger id="language" className="mt-1"><SelectValue placeholder="Select language" /></SelectTrigger><SelectContent>{languages.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent></Select>)} />
                </div>
              </div>
              <Button type="submit" size="sm" disabled={isLoadingTip}>
                {isLoadingTip ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />} Get New Tip
              </Button>
            </form>
             <p className="text-xs text-muted-foreground mt-2">AI personalization based on age/goals is available in the AI flow but not collected on this UI. Tips are based on Focus Area and Language selected.</p>
            {wellnessTipResult && <Alert className="mt-3 bg-primary/10 border-primary/30"><Sparkles className="h-4 w-4 text-primary" /><AlertTitle className="text-primary font-semibold">{wellnessTipResult.category}</AlertTitle><AlertDescription className="text-primary/90">{wellnessTipResult.wellnessTip}</AlertDescription></Alert>}
            {tipError && <Alert variant="destructive" className="mt-3"><AlertTriangle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{tipError}</AlertDescription></Alert>}
          </AccordionContent>
        </AccordionItem>

        {/* Metrics Tracking Sections */}
        {[
          { title: "Weight Tracking", icon: Weight, logs: weightLogs, chartData: weightChartData, logHandler: handleLogWeight,
            inputs: <>
              <Input type="number" placeholder="Weight (kg)" value={currentWeight} onChange={e => setCurrentWeight(e.target.value)} className="flex-1" />
              <Input type="number" placeholder="Goal (kg, optional)" value={weightGoal} onChange={e => setWeightGoal(e.target.value)} className="flex-1" />
            </>,
            renderLogItem: (log: WeightLogEntry) => <p>{log.value} kg {log.goal ? `(Goal: ${log.goal} kg)` : ''}</p>,
            chart: <ResponsiveContainer width="100%" height={200}><LineChart data={weightChartData} {...commonChartProps}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={10} /><YAxis fontSize={10} domain={['dataMin - 2', 'dataMax + 2']} /><Tooltip /><Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Weight (kg)" />{weightGoal && <Line type="monotone" dataKey="goal" stroke="hsl(var(--accent))" strokeDasharray="5 5" name="Goal (kg)" />}</LineChart></ResponsiveContainer>
          },
          { title: "Mood Log", icon: Smile, logs: moodLogs, chartData: moodChartData, logHandler: handleLogMood,
            inputs: <>
              <div className="w-full space-y-2"><Label>Mood Level: {moodLevels.find(m => m.value === currentMoodLevel)?.label || 'Neutral'}</Label><Slider defaultValue={[3]} min={1} max={5} step={1} value={[currentMoodLevel]} onValueChange={(val) => setCurrentMoodLevel(val[0])} /></div>
              <Textarea placeholder="Notes (optional)" value={currentMoodNotes} onChange={e => setCurrentMoodNotes(e.target.value)} />
            </>,
            renderLogItem: (log: MoodLogEntry) => <p>Level: {moodLevels.find(m=>m.value === log.level)?.label || log.level} {log.notes && `- Notes: ${log.notes}`}</p>,
            chart: <ResponsiveContainer width="100%" height={200}><LineChart data={moodChartData} {...commonChartProps}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={10} /><YAxis domain={[0,6]} ticks={[1,2,3,4,5]} fontSize={10}/><Tooltip /><Line type="monotone" dataKey="mood" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Mood Level" /></LineChart></ResponsiveContainer>,
            pieChart: moodLogs.length > 0 && <ResponsiveContainer width="100%" height={200}><PieChart><Pie data={moodDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>{PIE_COLORS.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}</Pie><Tooltip /><Legend iconSize={10} wrapperStyle={{fontSize: '10px'}} /></PieChart></ResponsiveContainer>
          },
          { title: "Sleep Log", icon: BedDouble, logs: sleepLogs, chartData: sleepChartData, logHandler: handleLogSleep,
            inputs: <>
              <Input type="number" placeholder="Duration (hours)" value={currentSleepDuration} onChange={e => setCurrentSleepDuration(e.target.value)} />
              <Select value={currentSleepQuality} onValueChange={(val: any) => setCurrentSleepQuality(val)}><SelectTrigger><SelectValue placeholder="Quality" /></SelectTrigger><SelectContent><SelectItem value="Poor">Poor</SelectItem><SelectItem value="Fair">Fair</SelectItem><SelectItem value="Good">Good</SelectItem><SelectItem value="Excellent">Excellent</SelectItem></SelectContent></Select>
            </>,
            renderLogItem: (log: SleepLogEntry) => <p>{log.duration} hours (Quality: {log.quality || 'N/A'})</p>,
            chart: <ResponsiveContainer width="100%" height={200}><BarChart data={sleepChartData} {...commonChartProps}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={10} /><YAxis fontSize={10} /><Tooltip /><Bar dataKey="duration" fill="hsl(var(--primary))" name="Sleep (hrs)" /></BarChart></ResponsiveContainer>
          },
           { title: "Stress Log", icon: Flame, logs: stressLogs, chartData: stressChartData, logHandler: handleLogStress,
            inputs: <>
              <div className="w-full space-y-2"><Label>Stress Level (1-Low, 5-High): {currentStressLevel}</Label><Slider defaultValue={[3]} min={1} max={5} step={1} value={[currentStressLevel]} onValueChange={(val) => setCurrentStressLevel(val[0])} /></div>
              <Textarea placeholder="Notes (optional)" value={currentStressNotes} onChange={e => setCurrentStressNotes(e.target.value)} />
            </>,
            renderLogItem: (log: StressLogEntry) => <p>Level: {log.level} {log.notes && `- Notes: ${log.notes}`}</p>,
            chart: <ResponsiveContainer width="100%" height={200}><LineChart data={stressChartData} {...commonChartProps}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={10} /><YAxis domain={[0,6]} ticks={[1,2,3,4,5]} fontSize={10}/><Tooltip /><Line type="monotone" dataKey="stress" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Stress Level" /></LineChart></ResponsiveContainer>
          },
          { title: "Energy Level (1-10)", icon: Zap, logs: energyLogs, chartData: energyChartData, logHandler: handleLogEnergy,
            inputs: <div className="w-full space-y-2"><Label>Energy: {currentEnergyLevel}/10</Label><Slider defaultValue={[5]} min={1} max={10} step={1} value={[currentEnergyLevel]} onValueChange={(val) => setCurrentEnergyLevel(val[0])} /></div>,
            renderLogItem: (log: EnergyLogEntry) => <p>Level: {log.level}/10</p>,
            chart: <ResponsiveContainer width="100%" height={200}><LineChart data={energyChartData} {...commonChartProps}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={10} /><YAxis domain={[0,11]} ticks={Array.from({length:11},(v,k)=>k)} fontSize={10}/><Tooltip /><Line type="monotone" dataKey="energy" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Energy Level" /></LineChart></ResponsiveContainer>
          },
          { title: "Water Intake", icon: Droplets, logs: waterLogs, chartData: waterChartData, logHandler: handleLogWater,
            inputs: <Input type="number" placeholder="Amount (e.g., glasses, ml)" value={currentWater} onChange={e => setCurrentWater(e.target.value)} />,
            renderLogItem: (log: WaterLogEntry) => <p>{log.amount} units</p>,
            chart: <ResponsiveContainer width="100%" height={200}><BarChart data={waterChartData} {...commonChartProps}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={10} /><YAxis fontSize={10} /><Tooltip /><Bar dataKey="amount" fill="hsl(var(--primary))" name="Water Intake" /></BarChart></ResponsiveContainer>
          },
          { title: "Exercise Log", icon: Utensils, logs: exerciseLogs, chartData: exerciseChartData, logHandler: handleLogExercise,
            inputs: <>
                <Input type="number" placeholder="Minutes" value={currentExerciseMinutes} onChange={e => setCurrentExerciseMinutes(e.target.value)} className="flex-1"/>
                <Input type="text" placeholder="Type (e.g., walk, run)" value={currentExerciseType} onChange={e => setCurrentExerciseType(e.target.value)} className="flex-1"/>
            </>,
            renderLogItem: (log: ExerciseLogEntry) => <p>{log.minutes} mins ({log.type || 'Exercise'})</p>,
            chart: <ResponsiveContainer width="100%" height={200}><BarChart data={exerciseChartData} {...commonChartProps}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={10} /><YAxis fontSize={10} /><Tooltip /><Bar dataKey="minutes" fill="hsl(var(--accent))" name="Exercise (mins)" /></BarChart></ResponsiveContainer>
          },
          { title: "Steps Log", icon: ActivityIcon, logs: stepsLogs, chartData: stepsChartData, logHandler: handleLogSteps,
            inputs: <Input type="number" placeholder="Step count" value={currentSteps} onChange={e => setCurrentSteps(e.target.value)} />,
            renderLogItem: (log: StepsLogEntry) => <p>{log.count} steps</p>,
            chart: <ResponsiveContainer width="100%" height={200}><BarChart data={stepsChartData} {...commonChartProps}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={10} /><YAxis fontSize={10} /><Tooltip /><Bar dataKey="steps" fill="hsl(var(--primary))" name="Steps" /></BarChart></ResponsiveContainer>
          },
          { title: "Medication Adherence (Daily)", icon: Pill, logs: medAdherenceLogs, chartData: [], logHandler: handleLogMedAdherence,
            inputs: <div className="flex items-center space-x-2"><Switch id="medAdherence" checked={currentMedAdherence} onCheckedChange={setCurrentMedAdherence} /><Label htmlFor="medAdherence">Taken all today?</Label></div>,
            renderLogItem: (log: MedicationAdherenceLogEntry) => <p>{log.medicationName || 'General'}: {log.taken ? "Taken" : "Missed"}</p>,
            // Chart for boolean adherence might be tricky without more data/context
          },
        ].map(metric => (
          <AccordionItem value={metric.title.toLowerCase().replace(/\s/g, '')} key={metric.title}>
            <AccordionTrigger className="text-lg font-semibold bg-card p-4 rounded-lg shadow-md hover:no-underline">
              <div className="flex items-center"><metric.icon className="mr-2 h-5 w-5 text-primary" /> {metric.title}</div>
            </AccordionTrigger>
            <AccordionContent className="bg-card p-4 rounded-b-lg shadow-md space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-md">Log New Entry</CardTitle></CardHeader>
                <CardContent className="space-y-3 sm:flex sm:space-y-0 sm:space-x-2 items-end">
                  {metric.inputs}
                  <Button onClick={metric.logHandler} size="sm" className="w-full sm:w-auto">Log {metric.title.split(' ')[0]}</Button>
                </CardContent>
              </Card>
              {metric.chartData.length > 0 && metric.chart && (
                <Card>
                  <CardHeader><CardTitle className="text-md">{metric.title.split(' ')[0]} Trend (Current Session)</CardTitle></CardHeader>
                  <CardContent>{metric.chart}</CardContent>
                </Card>
              )}
              {metric.pieChart && (
                <Card>
                  <CardHeader><CardTitle className="text-md">{metric.title.split(' ')[0]} Distribution (Current Session)</CardTitle></CardHeader>
                  <CardContent>{metric.pieChart}</CardContent>
                </Card>
              )}
              <Card>
                <CardHeader><CardTitle className="text-md">Logged Entries (Current Session)</CardTitle></CardHeader>
                <CardContent>{renderLogList(metric.logs, metric.renderLogItem)}</CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        ))}

        <AccordionItem value="symptomLog">
            <AccordionTrigger className="text-lg font-semibold bg-card p-4 rounded-lg shadow-md hover:no-underline">
                <div className="flex items-center"><NotebookText className="mr-2 h-5 w-5 text-primary" /> Symptom Log</div>
            </AccordionTrigger>
            <AccordionContent className="bg-card p-4 rounded-b-lg shadow-md space-y-4">
                <Card>
                    <CardHeader><CardTitle className="text-md">Log New Symptom</CardTitle></CardHeader>
                    <form onSubmit={handleSymptomSubmit(onSymptomLogSubmit)} className="space-y-3 p-4">
                        <div><Label htmlFor="symptomDescription">Description</Label><Input id="symptomDescription" placeholder="e.g., Headache, fatigue" {...symptomRegister("description")} className="mt-1" />{symptomErrors.description && <p className="text-xs text-destructive mt-1">{symptomErrors.description.message}</p>}</div>
                        <div><Label htmlFor="symptomSeverity">Severity</Label><Controller name="severity" control={symptomControl} render={({ field }) => (<Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger id="symptomSeverity" className="mt-1"><SelectValue placeholder="Select severity" /></SelectTrigger><SelectContent><SelectItem value="Mild">Mild</SelectItem><SelectItem value="Moderate">Moderate</SelectItem><SelectItem value="Severe">Severe</SelectItem></SelectContent></Select>)} />{symptomErrors.severity && <p className="text-xs text-destructive mt-1">{symptomErrors.severity.message}</p>}</div>
                        <div><Label htmlFor="symptomNotes">Notes</Label><Textarea id="symptomNotes" placeholder="e.g., Started after lunch" {...symptomRegister("notes")} className="mt-1" /></div>
                        <Alert variant="destructive" className="bg-destructive/10 border-destructive/30"><ShieldAlert className="h-4 w-4 !text-destructive" /><AlertTitle className="text-destructive">Emergency Warning</AlertTitle><AlertDescription className="text-destructive/80 text-xs">If experiencing severe symptoms (chest pain, difficulty breathing, etc.), seek immediate medical attention. This app is not for emergencies.</AlertDescription></Alert>
                        <Button type="submit" size="sm">Log Symptom</Button>
                    </form>
                </Card>
                 <Card>
                    <CardHeader><CardTitle className="text-md">Logged Symptoms (Current Session)</CardTitle></CardHeader>
                    <CardContent>
                        {renderLogList(symptomLogs, (log: SymptomLogSessionEntry) => (
                            <div>
                                <p className="font-medium">{log.description} <span className={`text-xs px-1.5 py-0.5 rounded-full ${log.severity === "Severe" ? "bg-red-200 text-red-800" : log.severity === "Moderate" ? "bg-yellow-200 text-yellow-800" : "bg-green-200 text-green-800"}`}>{log.severity}</span></p>
                                {log.notes && <p className="text-xs text-muted-foreground">Notes: {log.notes}</p>}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </AccordionContent>
        </AccordionItem>

        <AccordionItem value="dailyNotes">
          <AccordionTrigger className="text-lg font-semibold bg-card p-4 rounded-lg shadow-md hover:no-underline">
            <div className="flex items-center"><Edit3 className="mr-2 h-5 w-5 text-primary" /> Daily Journal / Reflections</div>
          </AccordionTrigger>
          <AccordionContent className="bg-card p-4 rounded-b-lg shadow-md space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-md">New Journal Entry</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Textarea placeholder="How are you feeling today? Any reflections or observations..." value={currentDailyNote} onChange={e => setCurrentDailyNote(e.target.value)} rows={4}/>
                <Button onClick={handleLogDailyNote} size="sm">Save Note</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-md">Logged Notes (Current Session)</CardTitle></CardHeader>
              <CardContent>
                {renderLogList(dailyNotes, (log: DailyNoteEntry) => <p className="whitespace-pre-wrap">{log.note}</p>)}
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <Card className="shadow-md mt-6">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><TrendingUp className="mr-2 h-6 w-6 text-primary"/>Session Summary & Tools</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-1">Placeholder for AI Smart Insights</h3>
            <p className="text-sm text-muted-foreground">In a future version, this section would display AI-generated insights based on your tracked data patterns (e.g., "Your mood tends to be lower on days with less sleep." or "Increased water intake correlates with higher energy levels reported."). This requires persistent data storage and advanced AI analysis.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" disabled>
              <Download className="mr-2 h-4 w-4" /> Export Data (PDF/CSV) - Future Feature
            </Button>
            <Button variant="destructive" size="sm" onClick={resetAllSessionData}>
              <Trash2 className="mr-2 h-4 w-4" /> Reset All Session Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg mt-8 bg-secondary/50">
        <CardHeader>
            <CardTitle className="text-lg flex items-center"><HelpCircle className="mr-2 h-5 w-5 text-primary"/>Important Notes & Future Enhancements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Data Persistence & History:</strong> All data tracked on this page (symptoms, weight, mood, etc.) is stored locally in your browser **for your current session only**. It will be cleared when you close this browser tab/window or refresh the page. Full historical data tracking and trend analysis over weeks/months require backend database integration.</p>
            <p><strong>Visualizations:</strong> Charts currently display data logged within this session. Viewing trends over longer periods, comparing different metrics on a single graph, and more advanced chart types (like 3D or heatmaps) are planned future enhancements requiring backend integration and potentially different charting libraries.</p>
            <p><strong>AI Smart Insights & Goal Setting:</strong> AI-driven personalized insights and active goal setting/tracking features are planned for future updates and also depend on persistent data storage and more advanced AI analysis.</p>
            <p><strong>Offline Functionality & Cloud Sync:</strong> Full offline data storage (beyond the current session) and automatic cloud synchronization are advanced features that will be explored in future updates requiring backend services.</p>
            <p><strong>Emergency Guidance:</strong> The critical symptom warning is a client-side aid. Always prioritize professional medical advice for any urgent health concerns. The main AI Symptom Checker and Virtual Nursing Assistant also have AI-driven checks for critical inputs.</p>
        </CardContent>
      </Card>
    </div>
  );
}

