// src/ai/flows/behavioral-health-nudging.ts
'use server';

/**
 * @fileOverview Detects unhealthy behavioral patterns from chat interactions and provides nudges.
 *
 * - behavioralHealthNudging - A function that analyzes chat interactions and provides personalized nudges.
 * - BehavioralHealthNudgingInput - The input type for the behavioralHealthNudging function.
 * - BehavioralHealthNudgingOutput - The return type for the behavioralHealthNudging function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BehavioralHealthNudgingInputSchema = z.object({
  chatHistory: z
    .string()
    .describe('The chat history between the user and the AI.'),
});
export type BehavioralHealthNudgingInput = z.infer<typeof BehavioralHealthNudgingInputSchema>;

const BehavioralHealthNudgingOutputSchema = z.object({
  nudge: z.string().describe('A personalized nudge, positive reinforcement, or journaling prompt for the user.'),
});
export type BehavioralHealthNudgingOutput = z.infer<typeof BehavioralHealthNudgingOutputSchema>;

export async function behavioralHealthNudging(input: BehavioralHealthNudgingInput): Promise<BehavioralHealthNudgingOutput> {
  return behavioralHealthNudgingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'behavioralHealthNudgingPrompt',
  input: {schema: BehavioralHealthNudgingInputSchema},
  output: {schema: BehavioralHealthNudgingOutputSchema},
  prompt: `You are an AI behavioral health assistant. Analyze the chat history provided and identify any unhealthy behavioral patterns. Provide a personalized nudge, positive reinforcement, or journaling prompt to help the user.

Chat History:
{{chatHistory}}`,
});

const behavioralHealthNudgingFlow = ai.defineFlow(
  {
    name: 'behavioralHealthNudgingFlow',
    inputSchema: BehavioralHealthNudgingInputSchema,
    outputSchema: BehavioralHealthNudgingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
