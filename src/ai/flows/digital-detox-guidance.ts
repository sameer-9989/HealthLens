
'use server';
/**
 * @fileOverview Provides guidance for digital detox.
 *
 * - getDigitalDetoxGuidance - A function that provides digital detox tips.
 * - DigitalDetoxInput - The input type for the getDigitalDetoxGuidance function.
 * - DigitalDetoxOutput - The return type for the getDigitalDetoxGuidance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DigitalDetoxInputSchema = z.object({
  userConcern: z.string().min(5).describe("The user's specific concern or goal regarding digital detox, e.g., 'I feel addicted to my phone', 'I want to reduce screen time before bed', 'How can I be more present?'."),
  userName: z.string().optional().describe("Optional: User's name for personalization.")
});
export type DigitalDetoxInput = z.infer<typeof DigitalDetoxInputSchema>;

const DigitalDetoxOutputSchema = z.object({
  introduction: z.string().describe("A personalized introduction addressing the user's concern."),
  screenTimeRisksGuide: z.array(z.object({ title: z.string(), point: z.string() })).describe("A short text guide (2-3 points) explaining common risks of excessive screen time relevant to the concern (e.g., sleep disruption, reduced focus, social comparison)."),
  journalingPrompts: z.array(z.string()).length(2).describe("Two journaling prompts to help the user reflect on their relationship with technology and their digital habits."),
  activityChallenges: z.array(z.object({ title: z.string(), description: z.string() })).length(2).describe("Two simple, actionable screen-free activity challenges or suggestions."),
  aiNudgeSuggestion: z.string().describe("A suggestion for an AI-powered nudge the platform could offer (conceptually, as the AI cannot set actual nudges), e.g., 'Consider setting a reminder to take a 5-minute screen break every hour.'"),
  motivationalMessage: z.string().describe("An encouraging closing message.")
});
export type DigitalDetoxOutput = z.infer<typeof DigitalDetoxOutputSchema>;

export async function getDigitalDetoxGuidance(input: DigitalDetoxInput): Promise<DigitalDetoxOutput> {
  return digitalDetoxGuidanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'digitalDetoxGuidancePrompt',
  input: {schema: DigitalDetoxInputSchema},
  output: {schema: DigitalDetoxOutputSchema},
  prompt: `You are an AI assistant helping {{#if userName}}{{userName}}{{else}}a user{{/if}} with digital detox. Their concern/goal is: "{{userConcern}}"

Based on this, provide the following:
1.  'introduction': A brief, empathetic introduction acknowledging their concern/goal.
2.  'screenTimeRisksGuide': 2-3 key points about the risks of excessive screen time, tailored to their concern if possible. Each point should have a 'title' and a 'point' (explanation).
    Example point: { title: "Sleep Disruption", point: "Blue light from screens can interfere with melatonin production, making it harder to fall asleep and reducing sleep quality." }
3.  'journalingPrompts': Two distinct journaling prompts to encourage reflection on their digital habits and feelings about technology use.
    Example prompt: "When do I feel most compelled to use my device, and what am I hoping to gain or avoid in those moments?"
4.  'activityChallenges': Two simple, actionable screen-free activity challenges or suggestions they can try. Each should have a 'title' and 'description'.
    Example challenge: { title: "Device-Free Meal", description: "Choose one meal today to eat without any screens. Focus on the food and your surroundings or company." }
5.  'aiNudgeSuggestion': A conceptual suggestion for an AI-powered nudge the app could provide to help them.
    Example nudge: "You could set a 'Tech-Free Zone' reminder for your bedroom after 9 PM."
6.  'motivationalMessage': A short, encouraging closing message.

Ensure the tone is supportive and practical. All suggestions should be actionable without external devices (beyond their primary phone/computer for accessing this app).
Strictly follow the JSON output schema.
`,
});

const digitalDetoxGuidanceFlow = ai.defineFlow(
  {
    name: 'digitalDetoxGuidanceFlow',
    inputSchema: DigitalDetoxInputSchema,
    outputSchema: DigitalDetoxOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("Digital detox guidance flow failed to produce an output.");
    }
    return output;
  }
);
