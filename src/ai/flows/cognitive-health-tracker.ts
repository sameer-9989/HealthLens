// CognitiveHealthTracker
'use server';
/**
 * @fileOverview Cognitive Health Tracker AI agent.
 *
 * - cognitiveHealthTracker - A function that provides daily prompts to assess cognitive functions.
 * - CognitiveHealthTrackerInput - The input type for the cognitiveHealthTracker function.
 * - CognitiveHealthTrackerOutput - The return type for the cognitiveHealthTracker function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CognitiveHealthTrackerInputSchema = z.object({
  userDetails: z
    .string()
    .describe(
      'Briefly describe the user, including their age, caregiver status, and any known cognitive concerns.'
    ),
});
export type CognitiveHealthTrackerInput = z.infer<typeof CognitiveHealthTrackerInputSchema>;

const CognitiveHealthTrackerOutputSchema = z.object({
  prompt: z
    .string()
    .describe(
      'A daily prompt tailored to assess memory, focus, or emotional resilience, considering user details.'
    ),
});
export type CognitiveHealthTrackerOutput = z.infer<typeof CognitiveHealthTrackerOutputSchema>;

export async function cognitiveHealthTracker(input: CognitiveHealthTrackerInput): Promise<CognitiveHealthTrackerOutput> {
  return cognitiveHealthTrackerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'cognitiveHealthTrackerPrompt',
  input: {schema: CognitiveHealthTrackerInputSchema},
  output: {schema: CognitiveHealthTrackerOutputSchema},
  prompt: `You are an AI cognitive health assistant. Your role is to generate a daily prompt to help assess the user's memory, focus, or emotional resilience.

  Consider the following details about the user when generating the prompt:
  {{{userDetails}}}

  The prompt should be clear, concise, and relevant to the user's situation.  It should encourage reflection and provide insights into their cognitive state.
`,
});

const cognitiveHealthTrackerFlow = ai.defineFlow(
  {
    name: 'cognitiveHealthTrackerFlow',
    inputSchema: CognitiveHealthTrackerInputSchema,
    outputSchema: CognitiveHealthTrackerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
