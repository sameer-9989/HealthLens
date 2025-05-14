'use server';

/**
 * @fileOverview An AI tool that explains medical terms, diagnoses, or prescriptions in plain language.
 *
 * - explainMedicalTerm - A function that handles the explanation process.
 * - ExplainMedicalTermInput - The input type for the explainMedicalTerm function.
 * - ExplainMedicalTermOutput - The return type for the explainMedicalTerm function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainMedicalTermInputSchema = z.object({
  term: z.string().describe('The medical term, diagnosis, or prescription to explain.'),
  context: z.string().describe('The context in which the term is being used.'),
  educationLevel: z
    .string()
    .describe(
      'The education level of the user. Should be one of: elementary, high school, college, graduate.'
    ),
});
export type ExplainMedicalTermInput = z.infer<typeof ExplainMedicalTermInputSchema>;

const ExplainMedicalTermOutputSchema = z.object({
  explanation: z.string().describe('The explanation of the medical term in plain language.'),
});
export type ExplainMedicalTermOutput = z.infer<typeof ExplainMedicalTermOutputSchema>;

export async function explainMedicalTerm(
  input: ExplainMedicalTermInput
): Promise<ExplainMedicalTermOutput> {
  return explainMedicalTermFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainMedicalTermPrompt',
  input: {schema: ExplainMedicalTermInputSchema},
  output: {schema: ExplainMedicalTermOutputSchema},
  prompt: `You are a helpful AI assistant that explains medical terms in plain language.

  The user has the following education level: {{{educationLevel}}}.
  The medical term is: {{{term}}}.
  The context is: {{{context}}}.

  Explain the medical term in plain language that is appropriate for the user's education level and context.
  `,
});

const explainMedicalTermFlow = ai.defineFlow(
  {
    name: 'explainMedicalTermFlow',
    inputSchema: ExplainMedicalTermInputSchema,
    outputSchema: ExplainMedicalTermOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
