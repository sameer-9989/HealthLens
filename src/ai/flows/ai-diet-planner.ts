
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
  calorieTarget: z.number().int().positive().optional().describe("Optional: Specific daily calorie target. If not provided, AI should estimate a reasonable target based on profile and goals, or create a balanced plan without strict calorie counting if appropriate for the goal (e.g. general healthy eating).")
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
  healthBenefits: z.string().optional().describe("Briefly list 1-2 key health benefits of this meal in relation to the user's goals if apparent.")
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
{{#if calorieTarget}}Specific Daily Calorie Target: {{calorieTarget}} kcal{{else}}Calorie Target: Estimate based on profile and goals, or focus on balanced, healthy meals if goals are non-specific (e.g., 'general healthy eating'). If estimating calories, state it's an estimate.{{/if}}

Instructions for Plan Generation:

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
            *   'recipeImageHint': Provide a 2-4 word hint for a placeholder image (e.g., "chicken stir-fry vegetables", "berry smoothie bowl", "quinoa salad avocado").
            *   'healthBenefits': (Optional) Briefly mention 1-2 benefits relevant to user goals.
        *   Ensure variety in meals across days and within a day.
        *   Strictly adhere to 'allergies' and 'foodDislikes'. Incorporate 'preferredCuisines' and 'dietType' where possible.
        *   If 'medicalConditions' like 'Diabetes' are mentioned, focus on generally recommended food types (e.g., low GI, high fiber) but avoid giving specific medical dietary therapy.
        *   'dailyNutritionalSummary': Estimate total calories, protein, carbs, and fats for the day.

3.  **General Tips:** (Optional)
    *   Provide 2-3 'generalTips' for healthy eating related to the user's goals (e.g., "Stay hydrated by drinking 8 glasses of water daily," "Chew your food slowly.").

4.  **Overall Disclaimer:**
    *   MUST include an 'overallDisclaimer': "This diet plan is AI-generated for informational purposes only and does not constitute medical or nutritional advice. It's essential to consult with a qualified healthcare professional or registered dietitian before making any significant changes to your diet, especially if you have pre-existing health conditions or specific dietary needs. Nutritional information is estimated and may vary."

**Safety and Quality:**
*   Prioritize whole, unprocessed foods.
*   Ensure balanced macronutrient distribution appropriate for general health and stated goals (unless a specific diet like 'keto' is requested).
*   Do NOT create plans for acute illnesses, eating disorders, or severe medical conditions requiring specialist intervention. If input suggests such a scenario, the plan should be very general (e.g., focus on hydration and rest for a common cold query) and strongly emphasize professional consultation.
*   If calorie target is very low or very high without justification, aim for a more moderate, generally healthy range or state inability to meet extreme targets safely.

Output strictly in the JSON schema format.
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
    // Ensure disclaimer is always present and correctly formatted
    output.overallDisclaimer = "This diet plan is AI-generated for informational purposes only and does not constitute medical or nutritional advice. It's essential to consult with a qualified healthcare professional or registered dietitian before making any significant changes to your diet, especially if you have pre-existing health conditions or specific dietary needs. Nutritional information is estimated and may vary.";
    
    // Basic check for potentially problematic inputs, though the prompt handles much of this
    if (input.healthGoals.some(goal => goal.toLowerCase().includes("eating disorder")) || (input.medicalConditions && input.medicalConditions.some(cond => cond.toLowerCase().includes("eating disorder")))) {
        // Modify output to be very generic and strongly advise professional help.
        // This is a simplified safety net; more robust clinical safety would require more complex logic.
        output.planTitle = "General Wellness Guidance";
        output.introduction = `${input.userName ? input.userName + ", " : ""}For support with complex health concerns like eating disorders, it's crucial to work directly with healthcare professionals. This AI can provide general wellness tips, but not specialized therapeutic plans.`;
        output.dailyPlans = [{
            dayNumber: 1,
            meals: {
                breakfast: { mealName: "Focus on Hydration", ingredients: [{name: "Water", quantity: "1", unit: "glass"}], preparationSteps: ["Drink a glass of water."], recipeImageHint: "glass water", healthBenefits: "Essential for overall health." },
                lunch: { mealName: "Consider Balanced Nutrition", ingredients: [{name: "Varied Foods", quantity: "1", unit: "plate"}], preparationSteps: ["Aim for a colorful plate with fruits, vegetables, lean protein, and whole grains, as advised by your healthcare provider."], recipeImageHint: "balanced meal plate", healthBenefits: "Supports overall well-being."}
            },
            dailyNutritionalSummary: undefined
        }];
        output.generalTips = ["Please speak to a doctor or a registered dietitian who can provide you with personalized and safe advice."];
    }
    
    return output;
  }
);

    

