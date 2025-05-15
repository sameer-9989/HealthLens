
"use client";

import React, { useState } from 'react';
import { generateDietPlan, AIDietPlannerInput, AIDietPlannerOutput, DailyPlanSchema, MealSchema } from '@/ai/flows/ai-diet-planner'; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, AlertTriangle, Sparkles, UtensilsCrossed, ShieldAlert, InfoIcon, Apple, Carrot, Fish, LeafIcon, WheatOff, MilkOff, Beef, Salad, LanguagesIcon, BookOpen } from "lucide-react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const activityLevels = [
  { value: 'sedentary', label: 'Sedentary (little or no exercise)' },
  { value: 'lightly_active', label: 'Lightly Active (light exercise/sports 1-3 days/week)' },
  { value: 'moderately_active', label: 'Moderately Active (moderate exercise/sports 3-5 days/week)' },
  { value: 'very_active', label: 'Very Active (hard exercise/sports 6-7 days/week)' },
  { value: 'extra_active', label: 'Extra Active (very hard exercise/sports & physical job)' },
];

const dietTypes = [
  { value: 'none', label: 'No Specific Diet / Balanced' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'keto', label: 'Keto' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'gluten_free', label: 'Gluten-Free' },
  { value: 'dairy_free', label: 'Dairy-Free' },
  { value: 'pescatarian', label: 'Pescatarian' },
  { value: 'mediterranean', label: 'Mediterranean' },
  { value: 'low_carb', label: 'Low Carb' },
];

const genders = [
    {value: 'male', label: 'Male'},
    {value: 'female', label: 'Female'},
    {value: 'other', label: 'Other'},
];

const languages = [
    { value: "en", label: "English" },
    { value: "es", label: "Español (Spanish)" },
    { value: "hi", label: "हिन्दी (Hindi)" },
    { value: "fr", label: "Français (French)" },
    { value: "ar", label: "العربية (Arabic)" },
    { value: "kn", label: "ಕನ್ನಡ (Kannada)" },
];


const formSchema = z.object({
  userName: z.string().optional(),
  age: z.coerce.number().int().positive({ message: "Age must be a positive number." }),
  gender: z.enum(['male', 'female', 'other']),
  weightKg: z.coerce.number().positive({ message: "Weight must be a positive number." }),
  heightCm: z.coerce.number().int().positive({ message: "Height must be a positive number." }),
  activityLevel: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active']),
  healthGoals: z.string().min(3, {message: "Please list at least one health goal."}), 
  medicalConditions: z.string().optional(), 
  dietaryPreferences_dietType: z.enum(['none', 'vegetarian', 'vegan', 'keto', 'paleo', 'gluten_free', 'dairy_free', 'pescatarian', 'mediterranean', 'low_carb']).optional(),
  dietaryPreferences_allergies: z.string().optional(), 
  dietaryPreferences_foodDislikes: z.string().optional(), 
  dietaryPreferences_preferredCuisines: z.string().optional(), 
  planDurationDays: z.coerce.number().int().min(1, {message: "Duration must be at least 1 day."}).max(7, {message: "Duration can be up to 7 days."}).default(1),
  calorieTarget: z.coerce.number().int().positive().optional(),
  language: z.enum(['en', 'es', 'hi', 'fr', 'ar', 'kn']).optional().default('en'),
});

type FormData = z.infer<typeof formSchema>;

const MealIcon = ({ type }: { type?: string }) => {
  if (!type) return <UtensilsCrossed className="h-5 w-5 text-primary" />;
  const lowerType = type.toLowerCase();
  if (lowerType.includes('breakfast')) return <Apple className="h-5 w-5 text-primary" />;
  if (lowerType.includes('lunch')) return <Salad className="h-5 w-5 text-primary" />;
  if (lowerType.includes('dinner')) return <Fish className="h-5 w-5 text-primary" />;
  if (lowerType.includes('snack')) return <Carrot className="h-5 w-5 text-primary" />;
  return <UtensilsCrossed className="h-5 w-5 text-primary" />;
};

export default function AiDietPlannerPage() {
  const [generatedPlan, setGeneratedPlan] = useState<AIDietPlannerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');

  const { control, register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        gender: 'female',
        activityLevel: 'moderately_active',
        planDurationDays: 1,
        dietaryPreferences_dietType: 'none',
        language: 'en',
    }
  });

  const watchedLanguage = watch("language");
  React.useEffect(() => {
    if (watchedLanguage) {
      setCurrentLanguage(watchedLanguage);
    }
  }, [watchedLanguage]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setError(null);
    setGeneratedPlan(null);

    const inputForAI: AIDietPlannerInput = {
      userName: data.userName,
      age: data.age,
      gender: data.gender,
      weightKg: data.weightKg,
      heightCm: data.heightCm,
      activityLevel: data.activityLevel,
      healthGoals: data.healthGoals.split(',').map(s => s.trim()).filter(s => s),
      medicalConditions: data.medicalConditions?.split(',').map(s => s.trim()).filter(s => s) || [],
      dietaryPreferences: {
        dietType: data.dietaryPreferences_dietType,
        allergies: data.dietaryPreferences_allergies?.split(',').map(s => s.trim()).filter(s => s) || [],
        foodDislikes: data.dietaryPreferences_foodDislikes?.split(',').map(s => s.trim()).filter(s => s) || [],
        preferredCuisines: data.dietaryPreferences_preferredCuisines?.split(',').map(s => s.trim()).filter(s => s) || [],
      },
      planDurationDays: data.planDurationDays,
      calorieTarget: data.calorieTarget,
      language: data.language || 'en',
    };

    try {
      const output = await generateDietPlan(inputForAI);
      setGeneratedPlan(output);
    } catch (e: any) {
      setError(e.message || 'An error occurred while generating the diet plan. Please try again.');
      console.error(e);
    }
    setIsLoading(false);
  };
  
  const renderMeal = (mealType: string, meal?: MealSchema) => {
    if (!meal) return null;
    return (
      <Card className="mb-4 shadow-md border-l-4 border-primary">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <MealIcon type={mealType} />
            <span className="ml-2">{mealType.charAt(0).toUpperCase() + mealType.slice(1).replace(/([A-Z])/g, ' $1')}: {meal.mealName}</span>
          </CardTitle>
          {meal.description && <CardDescription>{meal.description}</CardDescription>}
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          {/* Image rendering removed */}
          <div>
            <h4 className="font-semibold mb-1">Ingredients:</h4>
            <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
              {meal.ingredients.map((ing, i) => (
                <li key={i}>{ing.quantity} {ing.unit || ''} {ing.name}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Preparation:</h4>
            <ol className="list-decimal list-inside text-muted-foreground space-y-0.5">
              {meal.preparationSteps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
          {meal.nutritionalInfo && (
            <div className="text-xs bg-primary/5 p-2 rounded-md">
              <h4 className="font-semibold mb-0.5">Estimated Nutrition:</h4>
              <p>Calories: {meal.nutritionalInfo.calories} kcal</p>
              <p>Protein: {meal.nutritionalInfo.proteinGrams}g, Carbs: {meal.nutritionalInfo.carbsGrams}g, Fat: {meal.nutritionalInfo.fatGrams}g</p>
            </div>
          )}
          {meal.healthBenefits && <p className="text-xs text-green-700 dark:text-green-400 italic mt-1">Benefit: {meal.healthBenefits}</p>}
          
          {meal.detailedExplanation && (
            <Accordion type="single" collapsible className="w-full mt-3">
              <AccordionItem value="detailed-info">
                <AccordionTrigger className="text-xs hover:no-underline text-primary flex items-center">
                  <BookOpen className="h-3.5 w-3.5 mr-1.5" /> More Info & Tips
                </AccordionTrigger>
                <AccordionContent className="pt-2 text-xs text-muted-foreground whitespace-pre-wrap">
                  {meal.detailedExplanation}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </CardContent>
      </Card>
    );
  };

  const pageDirection = currentLanguage === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className="space-y-8 max-w-4xl mx-auto" dir={pageDirection}>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <UtensilsCrossed className="h-7 w-7 mr-2 text-primary" />
            AI Personalized Diet Planner
          </CardTitle>
          <CardDescription>
            Fill in your details below to get a personalized meal plan generated by our AI. Please provide as much detail as possible for the best results.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <Accordion type="multiple" defaultValue={['profile']} className="w-full">
              <AccordionItem value="profile">
                <AccordionTrigger className="text-lg font-semibold">Your Profile</AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="userName">Name (Optional)</Label>
                      <Input id="userName" placeholder="e.g., Alex" {...register("userName")} className="mt-1" />
                    </div>
                     <div>
                      <Label htmlFor="age">Age</Label>
                      <Input id="age" type="number" placeholder="e.g., 30" {...register("age")} className="mt-1" />
                      {errors.age && <p className="text-sm text-destructive mt-1">{errors.age.message}</p>}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                        <Label htmlFor="gender">Gender</Label>
                        <Controller name="gender" control={control} render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger id="gender" className="mt-1"><SelectValue placeholder="Select gender" /></SelectTrigger>
                                <SelectContent>{genders.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}</SelectContent>
                            </Select>
                        )} />
                        {errors.gender && <p className="text-sm text-destructive mt-1">{errors.gender.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="weightKg">Weight (kg)</Label>
                      <Input id="weightKg" type="number" step="0.1" placeholder="e.g., 70" {...register("weightKg")} className="mt-1" />
                      {errors.weightKg && <p className="text-sm text-destructive mt-1">{errors.weightKg.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="heightCm">Height (cm)</Label>
                      <Input id="heightCm" type="number" placeholder="e.g., 175" {...register("heightCm")} className="mt-1" />
                      {errors.heightCm && <p className="text-sm text-destructive mt-1">{errors.heightCm.message}</p>}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="activityLevel">Activity Level</Label>
                    <Controller name="activityLevel" control={control} render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger id="activityLevel" className="mt-1"><SelectValue placeholder="Select activity level" /></SelectTrigger>
                        <SelectContent>{activityLevels.map(al => <SelectItem key={al.value} value={al.value}>{al.label}</SelectItem>)}</SelectContent>
                      </Select>
                    )} />
                    {errors.activityLevel && <p className="text-sm text-destructive mt-1">{errors.activityLevel.message}</p>}
                  </div>
                </AccordionContent>
              </AccordionItem>

             <AccordionItem value="goals">
                <AccordionTrigger className="text-lg font-semibold">Health Goals & Conditions</AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                    <div>
                        <Label htmlFor="healthGoals">Health Goals (comma-separated)</Label>
                        <Textarea id="healthGoals" placeholder="e.g., weight loss, build muscle, manage diabetes" {...register("healthGoals")} className="mt-1" />
                        {errors.healthGoals && <p className="text-sm text-destructive mt-1">{errors.healthGoals.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="medicalConditions">Medical Conditions (Optional, comma-separated)</Label>
                        <Textarea id="medicalConditions" placeholder="e.g., PCOS, high blood pressure, high cholesterol" {...register("medicalConditions")} className="mt-1" />
                    </div>
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="diet">
                <AccordionTrigger className="text-lg font-semibold">Dietary Preferences</AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                     <div>
                        <Label htmlFor="dietaryPreferences_dietType">Diet Type</Label>
                        <Controller name="dietaryPreferences_dietType" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger id="dietaryPreferences_dietType" className="mt-1"><SelectValue placeholder="Select diet type" /></SelectTrigger>
                            <SelectContent>{dietTypes.map(dt => <SelectItem key={dt.value} value={dt.value}>{dt.label}</SelectItem>)}</SelectContent>
                        </Select>
                        )} />
                    </div>
                     <div>
                        <Label htmlFor="dietaryPreferences_allergies">Allergies (Optional, comma-separated)</Label>
                        <Textarea id="dietaryPreferences_allergies" placeholder="e.g., peanuts, shellfish, dairy" {...register("dietaryPreferences_allergies")} className="mt-1" />
                    </div>
                     <div>
                        <Label htmlFor="dietaryPreferences_foodDislikes">Food Dislikes (Optional, comma-separated)</Label>
                        <Textarea id="dietaryPreferences_foodDislikes" placeholder="e.g., mushrooms, tofu, liver" {...register("dietaryPreferences_foodDislikes")} className="mt-1" />
                    </div>
                    <div>
                        <Label htmlFor="dietaryPreferences_preferredCuisines">Preferred Cuisines (Optional, comma-separated)</Label>
                        <Textarea id="dietaryPreferences_preferredCuisines" placeholder="e.g., Italian, Mexican, Indian" {...register("dietaryPreferences_preferredCuisines")} className="mt-1" />
                    </div>
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="plan_config">
                <AccordionTrigger className="text-lg font-semibold">Plan Configuration</AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="planDurationDays">Plan Duration (Days)</Label>
                            <Input id="planDurationDays" type="number" min="1" max="7" placeholder="1-7" {...register("planDurationDays")} className="mt-1" />
                            {errors.planDurationDays && <p className="text-sm text-destructive mt-1">{errors.planDurationDays.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="calorieTarget">Daily Calorie Target (Optional, kcal)</Label>
                            <Input id="calorieTarget" type="number" placeholder="e.g., 2000" {...register("calorieTarget")} className="mt-1" />
                            {errors.calorieTarget && <p className="text-sm text-destructive mt-1">{errors.calorieTarget.message}</p>}
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="language" className="flex items-center"><LanguagesIcon className="h-4 w-4 mr-2 text-muted-foreground"/>Language</Label>
                        <Controller name="language" control={control} render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger id="language" className="mt-1"><SelectValue placeholder="Select language" /></SelectTrigger>
                                <SelectContent>{languages.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
                            </Select>
                        )} />
                        {errors.language && <p className="text-sm text-destructive mt-1">{errors.language.message}</p>}
                    </div>
                </AccordionContent>
            </AccordionItem>
            </Accordion>
            
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
              <ShieldAlert className="h-4 w-4 !text-destructive" />
              <AlertTitle className="text-destructive">Important Disclaimer</AlertTitle>
              <AlertDescription className="text-destructive/80">
                This AI Diet Planner provides informational suggestions and is not a substitute for professional medical or nutritional advice. Always consult with a qualified healthcare provider or registered dietitian before making significant changes to your diet, especially if you have pre-existing health conditions.
              </AlertDescription>
            </Alert>

          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Generate My Diet Plan
            </Button>
          </CardFooter>
        </form>
      </Card>

      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Generating Plan</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {generatedPlan && (
        <Card className="shadow-xl mt-8">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">{generatedPlan.planTitle}</CardTitle>
            <CardDescription>{generatedPlan.introduction}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Accordion type="multiple" className="w-full" defaultValue={["day-0"]}>
              {generatedPlan.dailyPlans.map((dailyPlan, dayIndex) => (
                <AccordionItem value={`day-${dayIndex}`} key={dayIndex}>
                  <AccordionTrigger className="text-xl font-semibold hover:no-underline">Day {dailyPlan.dayNumber}</AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-4">
                    {renderMeal("Breakfast", dailyPlan.meals.breakfast)}
                    {renderMeal("Mid-Morning Snack", dailyPlan.meals.midMorningSnack)}
                    {renderMeal("Lunch", dailyPlan.meals.lunch)}
                    {renderMeal("Afternoon Snack", dailyPlan.meals.afternoonSnack)}
                    {renderMeal("Dinner", dailyPlan.meals.dinner)}
                    {renderMeal("Evening Snack", dailyPlan.meals.eveningSnack)}

                    {dailyPlan.dailyNutritionalSummary && (
                      <Card className="bg-primary/10 border-primary/20">
                        <CardHeader className="pb-2"><CardTitle className="text-md">Daily Nutritional Summary (Estimated)</CardTitle></CardHeader>
                        <CardContent className="text-sm">
                          <p>Total Calories: {dailyPlan.dailyNutritionalSummary.calories} kcal</p>
                          <p>Protein: {dailyPlan.dailyNutritionalSummary.proteinGrams}g, Carbs: {dailyPlan.dailyNutritionalSummary.carbsGrams}g, Fat: {dailyPlan.dailyNutritionalSummary.fatGrams}g</p>
                        </CardContent>
                      </Card>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            
            {generatedPlan.generalTips && generatedPlan.generalTips.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2 flex items-center"><InfoIcon className="h-5 w-5 mr-2 text-primary"/> General Tips</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {generatedPlan.generalTips.map((tip, index) => <li key={index}>{tip}</li>)}
                    </ul>
                </div>
            )}

            <Alert variant="destructive" className="mt-6 bg-destructive/10 border-destructive/30">
              <ShieldAlert className="h-4 w-4 !text-destructive" />
              <AlertTitle className="text-destructive">Overall Disclaimer</AlertTitle>
              <AlertDescription className="text-destructive/80 whitespace-pre-wrap">
                {generatedPlan.overallDisclaimer}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
