
'use server';
/**
 * @fileOverview Recommends digital therapeutic exercises based on user needs.
 *
 * - recommendTherapy - A function that suggests a therapeutic exercise.
 * - RecommendTherapyInput - The input type for the recommendTherapy function.
 * - RecommendTherapyOutput - The return type for the recommendTherapy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendTherapyInputSchema = z.object({
  userNeed: z.string().describe("The user's primary concern or goal, e.g., 'anxiety', 'stress relief', 'focus improvement', 'help with sleep'."),
  recentSymptoms: z.string().optional().describe("Optional: Brief description of recent symptoms the user is experiencing, e.g., 'feeling overwhelmed', 'racing thoughts', 'difficulty concentrating'."),
  userPreferences: z.string().optional().describe("Optional: Any user preferences for the type of exercise, e.g., 'something quick', 'a breathing exercise', 'a mindfulness practice'.")
});
export type RecommendTherapyInput = z.infer<typeof RecommendTherapyInputSchema>;

const RecommendTherapyOutputSchema = z.object({
  recommendedTherapyName: z.string().describe("The name of the recommended therapeutic exercise, e.g., 'Box Breathing', '5-4-3-2-1 Grounding Technique', 'Progressive Muscle Relaxation Snippet', 'Mindful Observation'."),
  description: z.string().describe("A brief description of the recommended therapy and its benefits for the user's stated need."),
  initialGuidance: z.array(z.string()).describe("A series of clear, step-by-step instructions to begin the exercise. These should be actionable and easy to follow."),
  estimatedDuration: z.string().optional().describe("An estimated duration for the exercise, e.g., 'About 3-5 minutes', 'A quick 2-minute practice'.")
});
export type RecommendTherapyOutput = z.infer<typeof RecommendTherapyOutputSchema>;

export async function recommendTherapy(input: RecommendTherapyInput): Promise<RecommendTherapyOutput> {
  return recommendTherapyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendTherapyPrompt',
  input: {schema: RecommendTherapyInputSchema},
  output: {schema: RecommendTherapyOutputSchema},
  prompt: `You are an AI assistant for a digital health platform. Your role is to recommend a simple, software-based digital therapeutic exercise to a user based on their needs. Avoid suggesting anything that requires external tools, physical objects (beyond what a user typically has like a chair), or complex physical movements not suitable for a general audience. Focus on techniques like guided breathing, simple mindfulness, grounding, or very basic cognitive restructuring prompts.

User's primary need: "{{userNeed}}"
{{#if recentSymptoms}}User's recent symptoms: "{{recentSymptoms}}"{{/if}}
{{#if userPreferences}}User's preferences: "{{userPreferences}}"{{/if}}

Based on this information:
1.  Identify a suitable therapeutic exercise from the following categories:
    *   Breathing Exercises (e.g., Box Breathing, 4-7-8 Breathing, Diaphragmatic Breathing)
    *   Mindfulness & Grounding Techniques (e.g., 5-4-3-2-1 Grounding, Mindful Observation of an object, Body Scan snippet focusing on one area)
    *   Simple Relaxation Prompts (e.g., Visualizing a calm place, Progressive Muscle Relaxation for hands and shoulders only)
    *   Brief Cognitive Prompts (e.g., "Challenge a negative thought: What's one piece of evidence against it?", "Identify one small thing you can control right now.")
2.  Provide a 'recommendedTherapyName'.
3.  Write a 'description' explaining why this therapy is helpful for their '{{userNeed}}'.
4.  Provide 'initialGuidance' as an array of 3-5 simple, actionable steps to start the exercise. Make these steps very clear and easy to perform while sitting or standing in place.
5.  Optionally provide an 'estimatedDuration'.

Example for "anxiety" and "racing thoughts":
recommendedTherapyName: "Box Breathing"
description: "Box breathing is a simple technique that can calm your nervous system and help slow down racing thoughts by focusing on a steady breathing pattern."
initialGuidance: [
  "Find a comfortable seated position.",
  "Slowly exhale all the air from your lungs.",
  "Inhale slowly through your nose for a count of 4.",
  "Hold your breath gently for a count of 4.",
  "Exhale slowly through your mouth for a count of 4.",
  "Hold your breath gently again for a count of 4.",
  "Repeat this cycle for a few minutes."
]
estimatedDuration: "About 3-5 minutes"

Do not suggest apps, websites, or other external resources. The guidance should be self-contained.
If the user need is vague, pick a general stress-reduction or mindfulness technique.
Prioritize simplicity and immediate applicability.
`,
});

const recommendTherapyFlow = ai.defineFlow(
  {
    name: 'recommendTherapyFlow',
    inputSchema: RecommendTherapyInputSchema,
    outputSchema: RecommendTherapyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
