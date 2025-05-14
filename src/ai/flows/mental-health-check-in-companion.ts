'use server';

/**
 * @fileOverview Provides emotionally intelligent mental health check-ins using sentiment analysis and mood detection.
 *
 * - mentalHealthCheckIn - A function that initiates a mental health check-in and provides personalized support.
 * - MentalHealthCheckInInput - The input type for the mentalHealthCheckIn function.
 * - MentalHealthCheckInOutput - The return type for the mentalHealthCheckIn function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MentalHealthCheckInInputSchema = z.object({
  recentActivity: z
    .string()
    .describe('Description of the user\'s recent activities and feelings.'),
});
export type MentalHealthCheckInInput = z.infer<typeof MentalHealthCheckInInputSchema>;

const MentalHealthCheckInOutputSchema = z.object({
  sentiment: z
    .string()
    .describe('The overall sentiment detected in the user\'s input (e.g., positive, negative, neutral).'),
  mood: z.string().describe('The identified mood of the user (e.g., happy, sad, anxious).'),
  supportMessage: z
    .string()
    .describe('A personalized support message tailored to the user\'s sentiment and mood.'),
});
export type MentalHealthCheckInOutput = z.infer<typeof MentalHealthCheckInOutputSchema>;

export async function mentalHealthCheckIn(input: MentalHealthCheckInInput): Promise<MentalHealthCheckInOutput> {
  return mentalHealthCheckInFlow(input);
}

const prompt = ai.definePrompt({
  name: 'mentalHealthCheckInPrompt',
  input: {schema: MentalHealthCheckInInputSchema},
  output: {schema: MentalHealthCheckInOutputSchema},
  prompt: `You are an AI mental health companion that helps users check in with their mental state and provides personalized support.

  Analyze the user's recent activities and feelings to detect their sentiment and mood. Provide a supportive message based on your analysis.

  Recent Activity and Feelings: {{{recentActivity}}}

  Respond in the following JSON format:
  {
    "sentiment": "<sentiment>",
    "mood": "<mood>",
    "supportMessage": "<personalized support message>"
  }`,
});

const mentalHealthCheckInFlow = ai.defineFlow(
  {
    name: 'mentalHealthCheckInFlow',
    inputSchema: MentalHealthCheckInInputSchema,
    outputSchema: MentalHealthCheckInOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
