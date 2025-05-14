
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
  userConditionOrGoal: z.string().describe("The user's primary condition (e.g., 'common cold', 'mild anxiety', 'tension headache') or goal (e.g., 'improve sleep quality', 'stay hydrated', 'reduce daily stress')."),
  relevantHabits: z.string().optional().describe("Optional: Brief description of current habits or lifestyle factors relevant to the condition/goal, e.g., 'I often forget to drink water', 'I work long hours at a computer', 'I have trouble falling asleep most nights'."),
  durationPreference: z.string().optional().describe("Optional: User's preferred duration for the plan, e.g., 'a few days', '1 week', 'quick tips for today'. Default to a 3-5 day plan if not specified."),
  userName: z.string().optional().describe("Optional: User's name for personalization.")
});
export type GenerateSelfCarePlanInput = z.infer<typeof GenerateSelfCarePlanInputSchema>;

const PlanStepSchema = z.object({
  stepTitle: z.string().describe("A concise title for the self-care step."),
  stepDescription: z.string().describe("A brief explanation of the step and how to perform it."),
  frequencyOrTiming: z.string().optional().describe("Suggested frequency or timing, e.g., 'Daily', 'Morning and Evening', '3 times a day', 'Before bed'.")
});

const GenerateSelfCarePlanOutputSchema = z.object({
  planTitle: z.string().describe("A catchy and relevant title for the generated self-care plan."),
  planIntroduction: z.string().describe("A brief, encouraging introduction to the plan, personalized if userName is available."),
  planDurationSuggestion: z.string().describe("The suggested duration for following this plan, e.g., 'For the next 3 days', 'Over the next week'."),
  steps: z.array(PlanStepSchema).describe("An array of 3-5 manageable self-care steps. Each step should be simple, actionable, and entirely software-based (no external devices or simulations)."),
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
  prompt: `You are an AI assistant for a digital health platform. Your task is to generate a simple, actionable, and entirely software-based self-care plan for a user. The plan should not require any external medical devices, sensors, or simulations. All advice must be implementable through information, reminders, or in-app tools (like journaling prompts or simple guided text).

User's condition or goal: "{{userConditionOrGoal}}"
{{#if userName}}User's name: {{userName}}{{/if}}
{{#if relevantHabits}}Relevant user habits/context: "{{relevantHabits}}"{{/if}}
{{#if durationPreference}}User's duration preference: "{{durationPreference}}"{{else}}Default plan duration: 3-5 days.{{/if}}

Based on this information:
1.  Create a 'planTitle' that is encouraging and relevant to "{{userConditionOrGoal}}".
2.  Write a 'planIntroduction'. If '{{userName}}' is provided, personalize it (e.g., "Hi {{userName}}, here's a plan to help you with...").
3.  Determine a 'planDurationSuggestion' (e.g., "For the next 3 days", "Over the next week"). Use '{{durationPreference}}' if available, otherwise aim for 3-5 days.
4.  Devise 3-5 'steps'. Each step must have a 'stepTitle', 'stepDescription', and optionally 'frequencyOrTiming'.
    *   Steps should be simple and actionable (e.g., "Set a reminder to drink a glass of water every 2 hours," "Try a 5-minute mindful breathing exercise using app guidance," "Journal for 10 minutes about your day before bed," "Take a 5-minute screen break every hour").
    *   Ensure steps are purely software-based. For example, instead of "Use a humidifier," suggest "Track your water intake in the app." Instead of "Go for a walk," suggest "Schedule a 15-minute stretching break." (if stretching guidance can be app-based).
    *   If {{userConditionOrGoal}} is "common cold," steps might include: rest reminders, hydration goals, noting symptoms.
    *   If {{userConditionOrGoal}} is "anxiety," steps might include: a daily mindfulness prompt, journaling, a simple breathing exercise.
5.  Provide a 'motivationalTip'.
6.  Include a standard 'disclaimer': "This self-care plan is for informational purposes only and does not constitute medical advice. Consult with a healthcare professional for any health concerns."

Focus on being supportive and providing practical, easy-to-follow advice.
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
    return output!;
  }
);
