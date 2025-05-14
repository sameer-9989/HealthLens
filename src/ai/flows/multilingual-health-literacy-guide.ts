'use server';
/**
 * @fileOverview An AI tool that explains health terms and plans in culturally appropriate, easy-to-understand language.
 *
 * - explainHealthTerm - A function that handles the explanation of health terms and plans.
 * - ExplainHealthTermInput - The input type for the explainHealthTerm function.
 * - ExplainHealthTermOutput - The return type for the explainHealthTerm function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainHealthTermInputSchema = z.object({
  term: z.string().describe('The medical term or health plan to explain.'),
  language: z.string().describe('The language to use for the explanation.'),
  culture: z.string().describe('The cultural context to consider.'),
  educationLevel: z
    .string()
    .describe(
      'The education level of the user, to tailor the explanation accordingly. Example values: elementary, high school, college.'
    ),
});
export type ExplainHealthTermInput = z.infer<typeof ExplainHealthTermInputSchema>;

const ExplainHealthTermOutputSchema = z.object({
  explanation: z
    .string()
    .describe('The explanation of the term or plan in plain language.'),
});
export type ExplainHealthTermOutput = z.infer<typeof ExplainHealthTermOutputSchema>;

export async function explainHealthTerm(input: ExplainHealthTermInput): Promise<ExplainHealthTermOutput> {
  return explainHealthTermFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainHealthTermPrompt',
  input: {schema: ExplainHealthTermInputSchema},
  output: {schema: ExplainHealthTermOutputSchema},
  prompt: `You are a multilingual health literacy guide that explains health terms and plans in culturally appropriate, easy-to-understand language.

  Term or Plan: {{{term}}}
  Language: {{{language}}}
  Culture: {{{culture}}}
  Education Level: {{{educationLevel}}}

  Explain the term or plan in a way that is appropriate for the given language, culture, and education level.
  Ensure the explanation is easy to understand and avoids jargon.
  Consider cultural nuances and sensitivities when providing the explanation.

  Explanation:`,,
});

const explainHealthTermFlow = ai.defineFlow(
  {
    name: 'explainHealthTermFlow',
    inputSchema: ExplainHealthTermInputSchema,
    outputSchema: ExplainHealthTermOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
