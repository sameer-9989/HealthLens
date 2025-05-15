
'use server';
/**
 * @fileOverview Generates personalized self-care plans.
 *
 * - generateSelfCarePlan - A function that creates a self-care plan.
 * - GenerateSelfCarePlanInput - The input type for the generateSelfCarePlan function.
 * - GenerateSelfCarePlanOutput - The return type for the generateSelfCarePlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSelfCarePlanInputSchema = z.object({
  userConditionOrGoal: z.string().describe("The user's primary condition (e.g., 'common cold', 'mild anxiety', 'tension headache', 'diabetes management') or goal (e.g., 'improve sleep quality', 'stay hydrated', 'reduce daily stress', 'eat healthier')."),
  relevantHabits: z.string().optional().describe("Optional: Brief description of current habits or lifestyle factors relevant to the condition/goal, e.g., 'I often forget to drink water', 'I work long hours at a computer', 'I have trouble falling asleep most nights', 'I currently eat a lot of processed foods'."),
  durationPreference: z.string().optional().describe("Optional: User's preferred duration for the plan, e.g., 'a few days', '1 week', 'quick tips for today'. Default to a 3-5 day plan if not specified."),
  userName: z.string().optional().describe("Optional: User's name for personalization.")
});
export type GenerateSelfCarePlanInput = z.infer<typeof GenerateSelfCarePlanInputSchema>;

const PlanStepSchema = z.object({
  stepTitle: z.string().describe("A concise title for the self-care step."),
  stepType: z.enum(['diet', 'exercise', 'mindfulness', 'behavioral', 'hydration', 'sleep', 'other']).describe("Category of the self-care step."),
  stepDescription: z.string().describe("A detailed explanation of the step, how to perform it, and its benefits. For exercises, describe simple movements. For diet, give specific food type examples or meal ideas. For mindfulness, provide textual guidance."),
  frequencyOrTiming: z.string().optional().describe("Suggested frequency or timing, e.g., 'Daily', 'Morning and Evening', '3 times a day with meals', 'Before bed for 10 minutes'."),
  stepImageHint: z.string().optional().describe("A 2-3 word hint for a relevant image for this step (e.g., 'person meditating', 'drinking water', 'healthy meal', 'gentle stretching').")
});

const GenerateSelfCarePlanOutputSchema = z.object({
  planTitle: z.string().describe("A catchy and relevant title for the generated self-care plan."),
  planIntroduction: z.string().describe("A brief, encouraging introduction to the plan, personalized if userName is available."),
  planDurationSuggestion: z.string().describe("The suggested duration for following this plan, e.g., 'For the next 3 days', 'Over the next week'."),
  steps: z.array(PlanStepSchema).min(3).max(7).describe("An array of 3-7 manageable self-care steps. Each step should be simple, actionable, and entirely software-based (no external devices or simulations)."),
  motivationalTip: z.string().describe("A general motivational tip or word of encouragement related to self-care or the user's goal."),
  disclaimer: z.string().describe("A standard disclaimer stating this plan is not medical advice.")
});
export type GenerateSelfCarePlanOutput = z.infer<typeof GenerateSelfCarePlanOutputSchema>;

export async function generateSelfCarePlan(input: GenerateSelfCarePlanInput): Promise<GenerateSelfCarePlanOutput> {
  return generateSelfCarePlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSelfCarePlanPrompt',
  input: {schema: GenerateSelfCarePlanInputSchema},
  output: {schema: GenerateSelfCarePlanOutputSchema},
  prompt: `You are an AI assistant for a digital health platform. Your task is to generate a detailed, actionable, and entirely software-based self-care plan for a user. The plan should not require any external medical devices, sensors, or simulations. All advice must be implementable through information, reminders, or in-app tools (like journaling prompts or simple guided text).

User's condition or goal: "{{userConditionOrGoal}}"
{{#if userName}}User's name: {{userName}}{{/if}}
{{#if relevantHabits}}Relevant user habits/context: "{{relevantHabits}}"{{/if}}
{{#if durationPreference}}User's duration preference: "{{durationPreference}}"{{else}}Default plan duration: 3-5 days.{{/if}}

Based on this information:
1.  Create a 'planTitle' that is encouraging and relevant to "{{userConditionOrGoal}}".
2.  Write a 'planIntroduction'. If '{{userName}}' is provided, personalize it (e.g., "Hi {{userName}}, here's a plan to help you with...").
3.  Determine a 'planDurationSuggestion' (e.g., "For the next 3 days", "Over the next week"). Use '{{durationPreference}}' if available, otherwise aim for 3-5 days.
4.  Devise 3-5 (max 7) 'steps'. Each step must have:
    *   'stepTitle' (concise).
    *   'stepType' (diet, exercise, mindfulness, behavioral, hydration, sleep, other).
    *   'stepDescription' (DETAILED: For exercise, describe simple movements like stretches or bodyweight exercises that can be done at home without equipment. For diet, provide specific food type examples, simple meal ideas, or tips for healthier choices relevant to the condition/goal. For mindfulness, provide text-based guidance for a short routine. For behavioral, suggest concrete actions like setting reminders or journaling).
    *   'frequencyOrTiming' (e.g., 'Daily in the morning', '3 times a week for 20 minutes', 'After each meal').
    *   'stepImageHint': A brief 2-3 word hint for a relevant placeholder image (e.g., "deep breathing", "person walking", "healthy salad", "journal writing", "sleeping peacefully").
    *   Ensure steps are purely software-based. Example for exercise: "Gentle Neck Stretches: 1. Sit or stand tall. 2. Slowly tilt your head to the right, feeling a stretch in the left side of your neck. Hold for 15-20 seconds. 3. Return to center. 4. Repeat on the left side. Do 3 repetitions per side."
    *   If {{userConditionOrGoal}} is "common cold," steps might include: hydration goals (e.g., "Drink 8 glasses of water/herbal tea"), rest reminders (e.g., "Aim for 8 hours of sleep"), simple food suggestions (e.g., "Eat a bowl of chicken soup or broth for its soothing properties").
    *   If {{userConditionOrGoal}} is "anxiety," steps might include: a daily mindfulness prompt (e.g., "5-minute Mindful Breathing: Focus on your breath, noticing the sensation of air entering and leaving your body. If your mind wanders, gently bring your attention back to your breath."), journaling (e.g., "Journal for 10 minutes about any worries, then list one small step you can take for one of them.").
    *   If {{userConditionOrGoal}} is "diabetes management," steps might include: diet tips (e.g., "Include a source of lean protein and non-starchy vegetables with each meal. Opt for whole grains like quinoa or brown rice instead of refined grains."), hydration (e.g., "Drink a glass of water before each meal."), activity suggestion (e.g., "Take a 10-15 minute walk after your main meal.").
5.  Provide a 'motivationalTip'.
6.  Include a standard 'disclaimer': "This self-care plan is for informational purposes only and does not constitute medical advice. Consult with a healthcare professional for any health concerns, especially if you have a pre-existing condition like diabetes or are considering significant changes to your diet or exercise routine."

Focus on being supportive and providing practical, easy-to-follow advice. Make the step descriptions rich and genuinely helpful.
Output strictly according to the JSON schema.
`,
});

const generateSelfCarePlanFlow = ai.defineFlow(
  {
    name: 'generateSelfCarePlanFlow',
    inputSchema: GenerateSelfCarePlanInputSchema,
    outputSchema: GenerateSelfCarePlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
     if (!output) {
      throw new Error("Self-care plan generator failed to produce an output.");
    }
    // Ensure disclaimer is always present and correctly formatted
    output.disclaimer = "This self-care plan is for informational purposes only and does not constitute medical advice. Consult with a healthcare professional for any health concerns, especially if you have a pre-existing condition like diabetes or are considering significant changes to your diet or exercise routine.";
    return output;
  }
);
