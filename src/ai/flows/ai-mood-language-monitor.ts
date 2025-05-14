'use server';

/**
 * @fileOverview An AI mood and language monitor that tracks tone, sentiment, and word choice in chat interactions to detect early signs of anxiety, depression, or burnout, and recommends coping strategies.
 *
 * - analyzeChatHistory - A function that analyzes chat history for mood and language patterns.
 * - AnalyzeChatHistoryInput - The input type for the analyzeChatHistory function.
 * - AnalyzeChatHistoryOutput - The return type for the analyzeChatHistory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeChatHistoryInputSchema = z.object({
  chatHistory: z.string().describe('The chat history to analyze.'),
});
export type AnalyzeChatHistoryInput = z.infer<typeof AnalyzeChatHistoryInputSchema>;

const AnalyzeChatHistoryOutputSchema = z.object({
  mood: z.string().describe('The overall mood detected in the chat history.'),
  sentiment: z.string().describe('The overall sentiment detected in the chat history.'),
  anxietyDetected: z.boolean().describe('Whether anxiety is detected in the chat history.'),
  depressionDetected: z.boolean().describe('Whether depression is detected in the chat history.'),
  burnoutDetected: z.boolean().describe('Whether burnout is detected in the chat history.'),
  copingStrategies: z
    .array(z.string())
    .describe('Recommended coping strategies based on the analysis.'),
});
export type AnalyzeChatHistoryOutput = z.infer<typeof AnalyzeChatHistoryOutputSchema>;

export async function analyzeChatHistory(input: AnalyzeChatHistoryInput): Promise<AnalyzeChatHistoryOutput> {
  return analyzeChatHistoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeChatHistoryPrompt',
  input: {schema: AnalyzeChatHistoryInputSchema},
  output: {schema: AnalyzeChatHistoryOutputSchema},
  prompt: `You are an AI assistant that analyzes chat history to detect early signs of anxiety, depression, or burnout, and recommends coping strategies.

Analyze the following chat history:

{{chatHistory}}

Based on the chat history, determine the overall mood and sentiment. Also, detect whether there are signs of anxiety, depression, or burnout. Finally, recommend coping strategies based on the analysis.

Output the result in JSON format.
`,
});

const analyzeChatHistoryFlow = ai.defineFlow(
  {
    name: 'analyzeChatHistoryFlow',
    inputSchema: AnalyzeChatHistoryInputSchema,
    outputSchema: AnalyzeChatHistoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
