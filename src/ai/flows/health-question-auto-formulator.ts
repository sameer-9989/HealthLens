'use server';

/**
 * @fileOverview This file defines a Genkit flow for helping users formulate the right questions to ask their doctor based on their current condition and symptoms.
 *
 * - healthQuestionAutoFormulator - A function that helps users formulate questions for their doctor.
 * - HealthQuestionAutoFormulatorInput - The input type for the healthQuestionAutoFormulator function.
 * - HealthQuestionAutoFormulatorOutput - The return type for the healthQuestionAutoFormulator function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HealthQuestionAutoFormulatorInputSchema = z.object({
  condition: z.string().describe('The user\'s current health condition.'),
  symptoms: z.string().describe('A description of the user\'s symptoms.'),
});
export type HealthQuestionAutoFormulatorInput = z.infer<
  typeof HealthQuestionAutoFormulatorInputSchema
>;

const HealthQuestionAutoFormulatorOutputSchema = z.object({
  suggestedQuestions: z
    .array(z.string())
    .describe('A list of suggested questions for the user to ask their doctor.'),
});
export type HealthQuestionAutoFormulatorOutput = z.infer<
  typeof HealthQuestionAutoFormulatorOutputSchema
>;

export async function healthQuestionAutoFormulator(
  input: HealthQuestionAutoFormulatorInput
): Promise<HealthQuestionAutoFormulatorOutput> {
  return healthQuestionAutoFormulatorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'healthQuestionAutoFormulatorPrompt',
  input: {schema: HealthQuestionAutoFormulatorInputSchema},
  output: {schema: HealthQuestionAutoFormulatorOutputSchema},
  prompt: `You are an AI assistant designed to help users prepare for their doctor appointments.
  Based on the user's current condition and symptoms, suggest a list of questions they should ask their doctor to get the most out of their appointment.

  Condition: {{{condition}}}
  Symptoms: {{{symptoms}}}

  Please provide the questions in a numbered list.
  `,
});

const healthQuestionAutoFormulatorFlow = ai.defineFlow(
  {
    name: 'healthQuestionAutoFormulatorFlow',
    inputSchema: HealthQuestionAutoFormulatorInputSchema,
    outputSchema: HealthQuestionAutoFormulatorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
