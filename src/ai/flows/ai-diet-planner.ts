
'use server';
/**
 * @fileOverview An AI agent that generates personalized diet plans.
 *
 * - generateDietPlan - A function that creates a personalized diet plan.
 * - AIDietPlannerInput - The input type for the generateDietPlan function.
 * - AIDietPlannerOutput - The return type for the generateDietPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schemas
const DietaryPreferencesSchema = z.object({
  dietType: z.enum(['none', 'vegetarian', 'vegan', 'keto', 'paleo', 'gluten_free', 'dairy_free', 'pescatarian', 'mediterranean', 'low_carb']).optional().describe("The overall type of diet the user follows or wants to follow."),
  allergies: z.array(z.string()).optional().describe("List of food allergies, e.g., 'peanuts', 'shellfish', 'gluten' (if not covered by dietType)."),
  foodDislikes: z.array(z.string()).optional().describe("Specific foods the user dislikes and wants to avoid."),
  preferredCuisines: z.array(z.string()).optional().describe("Preferred cuisines, e.g., 'Italian', 'Mexican', 'Indian'.")
});

const AIDietPlannerInputSchema = z.object({
  userName: z.string().optional().describe("User's name for personalization."),
  age: z.number().int().positive().describe("User's age in years."),
  gender: z.enum(['male', 'female', 'other']).describe("User's gender."),
  weightKg: z.number().positive().describe("User's current weight in kilograms."),
  heightCm: z.number().int().positive().describe("User's height in centimeters."),
  activityLevel: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active']).describe("User's typical daily activity level. Sedentary: little to no exercise. Lightly active: light exercise/sports 1-3 days/week. Moderately active: moderate exercise/sports 3-5 days/week. Very active: hard exercise/sports 6-7 days a week. Extra active: very hard exercise/sports & physical job."),
  healthGoals: z.array(z.string()).min(1).describe("User's primary health goals, e.g., 'weight loss', 'muscle gain', 'manage diabetes', 'improve gut health', 'general healthy eating'."),
  medicalConditions: z.array(z.string()).optional().describe("Any relevant medical conditions, e.g., 'Type 2 Diabetes', 'Hypertension', 'PCOS', 'High Cholesterol'. The AI should generate generally healthy plans suitable for these but not specific medical dietary therapy without professional consultation."),
  dietaryPreferences: DietaryPreferencesSchema.describe("User's detailed dietary preferences, restrictions, and likes/dislikes."),
  planDurationDays: z.number().int().min(1).max(7).default(1).describe("Desired duration of the meal plan in days (e.g., 1 for a daily plan, 3 for a 3-day plan, 7 for a weekly plan)."),
  calorieTarget: z.number().int().positive().optional().describe("Optional: Specific daily calorie target. If not provided, AI should estimate a reasonable target based on profile and goals, or create a balanced plan without strict calorie counting if appropriate for the goal (e.g. general healthy eating)."),
  language: z.enum(['en', 'es', 'hi', 'fr', 'ar', 'kn']).optional().default('en').describe("The target language for the entire diet plan output (e.g., en (English), es (Spanish), hi (Hindi), fr (French), ar (Arabic), kn (Kannada)). Defaults to English.")
});
export type AIDietPlannerInput = z.infer<typeof AIDietPlannerInputSchema>;

// Output Schemas
const IngredientSchema = z.object({
  name: z.string().describe("Name of the ingredient, e.g., 'Chicken Breast', 'Rolled Oats', 'Spinach'."),
  quantity: z.string().describe("Quantity of the ingredient, e.g., '100', '1/2', '200'. Include numerical value as string."),
  unit: z.string().optional().describe("Unit for the quantity, e.g., 'g', 'cup', 'ml', 'medium-sized'.")
});

const NutritionalInfoSchema = z.object({
  calories: z.number().int().describe("Estimated calories for the meal/day."),
  proteinGrams: z.number().describe("Estimated protein in grams."),
  carbsGrams: z.number().describe("Estimated carbohydrates in grams."),
  fatGrams: z.number().describe("Estimated fat in grams.")
}).optional();

const MealSchema = z.object({
  mealName: z.string().describe("Name of the meal, e.g., 'Grilled Chicken Salad', 'Overnight Oats with Berries'."),
  description: z.string().optional().describe("A brief description of the meal."),
  ingredients: z.array(IngredientSchema).min(1).describe("List of ingredients with quantities and units."),
  preparationSteps: z.array(z.string()).min(1).describe("Step-by-step preparation instructions."),
  nutritionalInfo: NutritionalInfoSchema,
  recipeImageHint: z.string().max(30).optional().describe("A 2-4 word hint for a relevant placeholder image, e.g., 'oatmeal berries fruit', 'grilled chicken salad bowl', 'salmon asparagus plate'. This will be used for data-ai-hint."),
  healthBenefits: z.string().optional().describe("Briefly list 1-2 key health benefits of this meal in relation to the user's goals if apparent."),
  detailedExplanation: z.string().optional().describe("Detailed explanation (2-4 sentences) covering: nutritional breakdown summary, specific health benefits especially for user's goals/conditions, brief reasoning for inclusion, one cooking tip or portion advice, and one simple ingredient swap if appropriate. Mention cultural/seasonal notes if relevant.")
});

const DailyPlanSchema = z.object({
  dayNumber: z.number().int().describe("The day number in the plan (e.g., 1, 2)."),
  meals: z.object({
    breakfast: MealSchema.optional(),
    midMorningSnack: MealSchema.optional().describe("A light and healthy mid-morning snack."),
    lunch: MealSchema.optional(),
    afternoonSnack: MealSchema.optional().describe("A light and healthy afternoon snack."),
    dinner: MealSchema.optional(),
    eveningSnack: MealSchema.optional().describe("Optional: A light evening snack if appropriate for the plan/goals (e.g. for muscle gain or specific conditions).")
  }).describe("Object containing various meals for the day."),
  dailyNutritionalSummary: NutritionalInfoSchema.describe("Estimated total nutritional values for the entire day.")
});

const AIDietPlannerOutputSchema = z.object({
  planTitle: z.string().describe("A descriptive title for the generated diet plan, e.g., 'Personalized 3-Day Weight Management Plan for Alex'."),
  introduction: z.string().describe("A brief, encouraging introduction to the plan, personalized if userName is available."),
  dailyPlans: z.array(DailyPlanSchema).min(1).describe("An array of daily meal plans, matching the planDurationDays."),
  generalTips: z.array(z.string()).optional().describe("A few general healthy eating tips relevant to the user's goals or preferences."),
  overallDisclaimer: z.string().describe("Standard disclaimer: This plan is for informational purposes only, not medical/nutritional advice. Consult a healthcare professional or registered dietitian before making dietary changes, especially with medical conditions.")
});
export type AIDietPlannerOutput = z.infer<typeof AIDietPlannerOutputSchema>;


export async function generateDietPlan(input: AIDietPlannerInput): Promise<AIDietPlannerOutput> {
  return generateDietPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDietPlanPrompt',
  input: {schema: AIDietPlannerInputSchema},
  output: {schema: AIDietPlannerOutputSchema},
  prompt: `You are an AI Health and Nutrition Expert. Your task is to generate a personalized, detailed, and actionable meal plan for a user based on their profile, goals, and preferences.
The ENTIRE response, including all titles, descriptions, meal names, ingredients, preparation steps, explanations, tips, and disclaimers, MUST be in the target language specified by the user: '{{language}}'. If '{{language}}' is 'ar', ensure the text direction is appropriate for Arabic if possible within this text-based response (though actual RTL rendering is a UI concern).

User Profile & Goals:
{{#if userName}}Name: {{userName}}{{/if}}
Age: {{age}}
Gender: {{gender}}
Weight: {{weightKg}} kg
Height: {{heightCm}} cm
Activity Level: {{activityLevel}}
Health Goals: {{#each healthGoals}}"{{this}}" {{/each}}
{{#if medicalConditions}}Medical Conditions (for general consideration, not treatment): {{#each medicalConditions}}"{{this}}" {{/each}}{{/if}}
{{#with dietaryPreferences}}
Diet Type: {{#if dietType}}{{dietType}}{{else}}None specified{{/if}}
Allergies: {{#if allergies}}{{#each allergies}}"{{this}}" {{/each}}{{else}}None specified{{/if}}
Dislikes: {{#if foodDislikes}}{{#each foodDislikes}}"{{this}}" {{/each}}{{else}}None specified{{/if}}
Preferred Cuisines: {{#if preferredCuisines}}{{#each preferredCuisines}}"{{this}}" {{/each}}{{else}}None specified{{/if}}
{{/with}}
Plan Duration: {{planDurationDays}} day(s)
Target Language: {{language}}
{{#if calorieTarget}}Specific Daily Calorie Target: {{calorieTarget}} kcal{{else}}Calorie Target: Estimate based on profile and goals, or focus on balanced, healthy meals if goals are non-specific (e.g., 'general healthy eating'). If estimating calories, state it's an estimate.{{/if}}

Instructions for Plan Generation (ALL OUTPUT IN '{{language}}'):

1.  **Plan Title & Introduction:**
    *   Create an engaging 'planTitle', personalized if '{{userName}}' is available.
    *   Write a brief, encouraging 'introduction' to the plan.

2.  **Daily Plans (Repeat for '{{planDurationDays}}'):**
    *   For each 'dayNumber':
        *   Design a balanced set of meals: 'breakfast', 'midMorningSnack', 'lunch', 'afternoonSnack', 'dinner'. Include 'eveningSnack' only if appropriate (e.g., muscle gain, specific needs).
        *   For each 'MealSchema' object:
            *   'mealName': Clear and appealing.
            *   'description': (Optional) Brief description.
            *   'ingredients': List all ingredients with specific 'quantity' (e.g., "100", "1/2", "1") and 'unit' (e.g., "g", "cup", "medium-sized", "tbsp").
            *   'preparationSteps': Provide clear, step-by-step cooking instructions. Number them.
            *   'nutritionalInfo': Estimate 'calories' (integer), 'proteinGrams', 'carbsGrams', 'fatGrams'. Clearly state if these are estimates.
            *   'recipeImageHint': Provide a 2-4 word hint for a placeholder image (e.g., "chicken stir-fry vegetables", "berry smoothie bowl", "quinoa salad avocado"). This hint should be in English, regardless of the target language, for easier Unsplash search.
            *   'healthBenefits': (Optional) Briefly mention 1-2 benefits relevant to user goals.
            *   'detailedExplanation': Provide a concise (2-4 sentences) explanation in '{{language}}'. It should cover: a summary of the meal's nutritional value, how it supports user's goals/conditions (e.g., "This meal is high in fiber, good for diabetes management by helping stabilize blood sugar"), a brief scientific reason for its inclusion (e.g., "Oats provide slow-release energy"), one practical cooking tip or portion control advice (e.g., "Use a small bowl for this snack to manage portion size," or "Cook chicken until internal temperature reaches 165°F/74°C"), and one simple ingredient swap if applicable (e.g., "Swap spinach for kale if preferred"). Mention cultural/seasonal notes if truly relevant and simple (e.g., "A warming soup, good for cooler weather").
        *   Ensure variety in meals across days and within a day.
        *   Strictly adhere to 'allergies' and 'foodDislikes'. Incorporate 'preferredCuisines' and 'dietType' where possible.
        *   If 'medicalConditions' like 'Diabetes' are mentioned, focus on generally recommended food types (e.g., low GI, high fiber) but avoid giving specific medical dietary therapy.
        *   'dailyNutritionalSummary': Estimate total calories, protein, carbs, and fats for the day.

3.  **General Tips:** (Optional)
    *   Provide 2-3 'generalTips' for healthy eating related to the user's goals (e.g., "Stay hydrated by drinking 8 glasses of water daily," "Chew your food slowly.").

4.  **Overall Disclaimer:**
    *   MUST include an 'overallDisclaimer' (in '{{language}}'): "This diet plan is AI-generated for informational purposes only and does not constitute medical or nutritional advice. It's essential to consult with a qualified healthcare professional or registered dietitian before making any significant changes to your diet, especially if you have pre-existing health conditions or specific dietary needs. Nutritional information is estimated and may vary."

**Safety and Quality:**
*   Prioritize whole, unprocessed foods.
*   Ensure balanced macronutrient distribution appropriate for general health and stated goals (unless a specific diet like 'keto' is requested).
*   Do NOT create plans for acute illnesses, eating disorders, or severe medical conditions requiring specialist intervention. If input suggests such a scenario, the plan should be very general (e.g., focus on hydration and rest for a common cold query) and strongly emphasize professional consultation.
*   If calorie target is very low or very high without justification, aim for a more moderate, generally healthy range or state inability to meet extreme targets safely.

Output strictly in the JSON schema format. All text content within the JSON output MUST be in the specified '{{language}}', except for 'recipeImageHint'.
`,
});

const generateDietPlanFlow = ai.defineFlow(
  {
    name: 'generateDietPlanFlow',
    inputSchema: AIDietPlannerInputSchema,
    outputSchema: AIDietPlannerOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('AI Diet Planner failed to produce an output.');
    }
    // Ensure disclaimer is always present and correctly formatted, respecting language
    // The prompt already handles language for the disclaimer, but this is a fallback.
    const baseDisclaimer = "This diet plan is AI-generated for informational purposes only and does not constitute medical or nutritional advice. It's essential to consult with a qualified healthcare professional or registered dietitian before making any significant changes to your diet, especially if you have pre-existing health conditions or specific dietary needs. Nutritional information is estimated and may vary.";
    // This simple language switch for fallback is not robust. The prompt should handle translation primarily.
    if (input.language === 'es' && !output.overallDisclaimer.includes('nutricional')) {
        output.overallDisclaimer = "Este plan de dieta es generado por IA solo con fines informativos y no constituye asesoramiento médico o nutricional. Es esencial consultar con un profesional de la salud calificado o un dietista registrado antes de realizar cambios significativos en su dieta, especialmente si tiene condiciones de salud preexistentes o necesidades dietéticas específicas. La información nutricional es estimada y puede variar.";
    } else if (input.language === 'hi' && !output.overallDisclaimer.includes('चिकित्सीय')) {
         output.overallDisclaimer = "यह आहार योजना केवल सूचनात्मक उद्देश्यों के लिए एआई-जनित है और यह चिकित्सा या पोषण संबंधी सलाह का गठन नहीं करती है। अपनी आहार में कोई भी महत्वपूर्ण परिवर्तन करने से पहले एक योग्य स्वास्थ्य देखभाल पेशेवर या पंजीकृत आहार विशेषज्ञ से परामर्श करना आवश्यक है, खासकर यदि आपके पास पहले से मौजूद स्वास्थ्य स्थितियां या विशिष्ट आहार संबंधी आवश्यकताएं हैं। पोषण संबंधी जानकारी अनुमानित है और भिन्न हो सकती है।";
    } else if (!output.overallDisclaimer || output.overallDisclaimer.trim().length < 50) { // Basic check if disclaimer seems missing or too short
        output.overallDisclaimer = baseDisclaimer;
    }
    
    // Basic check for potentially problematic inputs, though the prompt handles much of this
    if (input.healthGoals.some(goal => goal.toLowerCase().includes("eating disorder")) || (input.medicalConditions && input.medicalConditions.some(cond => cond.toLowerCase().includes("eating disorder")))) {
        output.planTitle = input.language === 'es' ? "Guía General de Bienestar" : "General Wellness Guidance";
        output.introduction = `${input.userName ? input.userName + ", " : ""}${input.language === 'es' ? "Para obtener ayuda con problemas de salud complejos como los trastornos alimentarios, es crucial trabajar directamente con profesionales de la salud. Esta IA puede proporcionar consejos generales de bienestar, pero no planes terapéuticos especializados." : "For support with complex health concerns like eating disorders, it's crucial to work directly with healthcare professionals. This AI can provide general wellness tips, but not specialized therapeutic plans."}`;
        output.dailyPlans = [{
            dayNumber: 1,
            meals: {
                breakfast: { mealName: input.language === 'es' ? "Enfoque en la Hidratación" : "Focus on Hydration", ingredients: [{name: input.language === 'es' ? "Agua" : "Water", quantity: "1", unit: input.language === 'es' ? "vaso" : "glass"}], preparationSteps: [input.language === 'es' ? "Beba un vaso de agua." : "Drink a glass of water."], recipeImageHint: "glass water", healthBenefits: input.language === 'es' ? "Esencial para la salud general." : "Essential for overall health." },
                lunch: { mealName: input.language === 'es' ? "Considere una Nutrición Equilibrada" : "Consider Balanced Nutrition", ingredients: [{name: input.language === 'es' ? "Alimentos Variados" : "Varied Foods", quantity: "1", unit: input.language === 'es' ? "plato" : "plate"}], preparationSteps: [input.language === 'es' ? "Intente consumir un plato colorido con frutas, verduras, proteínas magras y granos integrales, según lo aconseje su proveedor de atención médica." : "Aim for a colorful plate with fruits, vegetables, lean protein, and whole grains, as advised by your healthcare provider."], recipeImageHint: "balanced meal plate", healthBenefits: input.language === 'es' ? "Apoya el bienestar general." : "Supports overall well-being."}
            },
            dailyNutritionalSummary: undefined
        }];
        output.generalTips = [input.language === 'es' ? "Por favor, hable con un médico o un dietista registrado que pueda brindarle asesoramiento personalizado y seguro." : "Please speak to a doctor or a registered dietitian who can provide you with personalized and safe advice."];
    }
    
    return output;
  }
);
