
'use server';
/**
 * @fileOverview Generates a daily wellness tip.
 *
 * - generateDailyWellnessTip - A function that creates a wellness tip.
 * - GenerateDailyWellnessTipInput - The input type for the function.
 * - GenerateDailyWellnessTipOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDailyWellnessTipInputSchema = z.object({
  userFocus: z.string().optional().describe("Optional: User's main focus area for the tip, e.g., 'hydration', 'stress management', 'better sleep', 'healthy eating', 'exercise motivation'."),
  language: z.string().optional().describe("Optional: Target language for the tip, e.g., 'en', 'es', 'hi', 'kn'. Default is English."),
  age: z.number().int().positive().optional().describe("Optional: User's age for more tailored tips."),
  healthGoals: z.array(z.string()).optional().describe("Optional: User's specific health goals, e.g., ['lose weight', 'manage diabetes', 'increase energy'].")
});
export type GenerateDailyWellnessTipInput = z.infer<typeof GenerateDailyWellnessTipInputSchema>;

const GenerateDailyWellnessTipOutputSchema = z.object({
  wellnessTip: z.string().describe("A concise and actionable wellness tip."),
  category: z.string().describe("The category of the wellness tip, e.g., 'Hydration', 'Mindfulness', 'Nutrition', 'Physical Activity', 'Sleep Hygiene'.")
});
export type GenerateDailyWellnessTipOutput = z.infer<typeof GenerateDailyWellnessTipOutputSchema>;

export async function generateDailyWellnessTip(input: GenerateDailyWellnessTipInput): Promise<GenerateDailyWellnessTipOutput> {
  return generateDailyWellnessTipFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDailyWellnessTipPrompt',
  input: {schema: GenerateDailyWellnessTipInputSchema},
  output: {schema: GenerateDailyWellnessTipOutputSchema},
  prompt: `You are an AI Health and Wellness Coach. Your task is to provide a concise, actionable, and encouraging daily wellness tip.

Consider the following user inputs if provided:
{{#if userFocus}}User's Focus Area: "{{userFocus}}"{{/if}}
{{#if age}}User's Age: {{age}}{{/if}}
{{#if healthGoals}}User's Health Goals: {{#each healthGoals}}"{{this}}" {{/each}}{{/if}}
{{#if language}}Target Language: "{{language}}" (Ensure the entire response, including category, is in this language. If the language is not common or you are unsure, default to English. Prioritize clarity and helpfulness.){{/if}}

Based on the provided information (or general wellness principles if no specific focus is given):
1.  Generate a 'wellnessTip'. It should be practical and easy to implement.
    - If a 'userFocus' is provided, tailor the tip to that area.
    - If 'age' or 'healthGoals' are provided, try to make the tip more relevant to them without making assumptions or giving medical advice. For example, if age suggests an older adult, a tip might focus on gentle mobility. If a goal is 'manage diabetes', a tip might relate to mindful eating or regular light activity.
    - If no specific focus is provided, offer a general wellness tip covering areas like hydration, movement, mindfulness, sleep, or nutrition.
2.  Assign a 'category' to the tip (e.g., "Hydration", "Mindfulness", "Nutrition", "Physical Activity", "Sleep Hygiene", "Stress Management", "General Wellness").

Example Tip (userFocus: 'hydration'):
wellnessTip: "Start your day with a glass of water before anything else. It helps rehydrate your body after sleep and kickstarts your metabolism."
category: "Hydration"

Example Tip (userFocus: 'stress management', language: 'es'):
wellnessTip: "Tómate 5 minutos para respirar profundamente cuando te sientas abrumado. Inhala lentamente por la nariz y exhala lentamente por la boca. Esto puede ayudar a calmar tu sistema nervioso."
category: "Mindfulness" (or "Manejo del Estrés")

Example Tip (no focus, general):
wellnessTip: "Try to incorporate a short 10-minute walk into your day, perhaps during a lunch break. It's a great way to boost circulation and clear your mind."
category: "Physical Activity"

Ensure the tip is positive and motivational.
The response must be in JSON format according to the output schema.
Avoid overly complex language or medical jargon.
Do not give prescriptive medical advice. Tips should be general wellness suggestions.
Ensure the entire response, including category and tip, is in the specified 'language' if provided.
`,
});

const generateDailyWellnessTipFlow = ai.defineFlow(
  {
    name: 'generateDailyWellnessTipFlow',
    inputSchema: GenerateDailyWellnessTipInputSchema,
    outputSchema: GenerateDailyWellnessTipOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      return {
        wellnessTip: "Remember to take a few moments for yourself today, perhaps by stretching or enjoying a quiet cup of tea. Small acts of self-care can make a big difference.",
        category: "General Wellness"
      };
    }
    return output;
  }
);

    