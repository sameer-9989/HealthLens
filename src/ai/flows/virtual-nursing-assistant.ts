'use server';

/**
 * @fileOverview A virtual nursing assistant AI agent.
 *
 * - virtualNursingAssistant - A function that handles the virtual nursing assistant process.
 * - VirtualNursingAssistantInput - The input type for the virtualNursingAssistant function.
 * - VirtualNursingAssistantOutput - The return type for the virtualNursingAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VirtualNursingAssistantInputSchema = z.object({
  message: z.string().describe('The message from the user.'),
  medications: z.array(z.string()).optional().describe('The list of medications the user is taking.'),
  healthGoals: z.array(z.string()).optional().describe('The list of health goals the user has.'),
});
export type VirtualNursingAssistantInput = z.infer<typeof VirtualNursingAssistantInputSchema>;

const VirtualNursingAssistantOutputSchema = z.object({
  response: z.string().describe('The response from the virtual nursing assistant.'),
});
export type VirtualNursingAssistantOutput = z.infer<typeof VirtualNursingAssistantOutputSchema>;

export async function virtualNursingAssistant(input: VirtualNursingAssistantInput): Promise<VirtualNursingAssistantOutput> {
  return virtualNursingAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'virtualNursingAssistantPrompt',
  input: {schema: VirtualNursingAssistantInputSchema},
  output: {schema: VirtualNursingAssistantOutputSchema},
  prompt: `You are a virtual nursing assistant. Your goal is to provide medication reminders and general health guidance to the user. Be conversational and supportive.

  Here are the user's medications, if any: {{#if medications}}{{{medications}}}{{else}}None{{/if}}
  Here are the user's health goals, if any: {{#if healthGoals}}{{{healthGoals}}}{{else}}None{{/if}}

  User message: {{{message}}}`,
});

const virtualNursingAssistantFlow = ai.defineFlow(
  {
    name: 'virtualNursingAssistantFlow',
    inputSchema: VirtualNursingAssistantInputSchema,
    outputSchema: VirtualNursingAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
