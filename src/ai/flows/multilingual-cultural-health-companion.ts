// src/ai/flows/multilingual-cultural-health-companion.ts
'use server';
/**
 * @fileOverview An AI agent that provides culturally sensitive explanations of symptoms, self-care, and medication guidance across multiple languages.
 *
 * - explainHealthConcept - A function that explains a given health concept in a culturally sensitive and multilingual manner.
 * - ExplainHealthConceptInput - The input type for the explainHealthConcept function.
 * - ExplainHealthConceptOutput - The return type for the explainHealthConcept function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainHealthConceptInputSchema = z.object({
  concept: z.string().describe('The medical concept, symptom, self-care practice, or medication guidance to explain.'),
  language: z.string().describe('The target language for the explanation (e.g., en, es, fr).'),
  culture: z.string().describe('The cultural context to consider when explaining the concept (e.g., Mexican, Indian, etc.).'),
  educationLevel: z
    .string()
    .optional()
    .describe(
      'Optional parameter of the education level of the user. If provided, explanations will be provided in simpler terms.'
    ),
});
export type ExplainHealthConceptInput = z.infer<typeof ExplainHealthConceptInputSchema>;

const ExplainHealthConceptOutputSchema = z.object({
  explanation: z.string().describe('A culturally sensitive explanation of the health concept in the specified language.'),
});
export type ExplainHealthConceptOutput = z.infer<typeof ExplainHealthConceptOutputSchema>;

export async function explainHealthConcept(input: ExplainHealthConceptInput): Promise<ExplainHealthConceptOutput> {
  return explainHealthConceptFlow(input);
}

const explainHealthConceptPrompt = ai.definePrompt({
  name: 'explainHealthConceptPrompt',
  input: {schema: ExplainHealthConceptInputSchema},
  output: {schema: ExplainHealthConceptOutputSchema},
  prompt: `You are a multilingual and multicultural health expert. Your goal is to explain health concepts in a way that is easy to understand and culturally sensitive.

  Please explain the following concept:
  {{concept}}

  In the following language:
  {{language}}

  Taking into account the following cultural context:
  {{culture}}

  Use simpler terms when possible for users with limited medical knowledge. Output a single paragraph.
  `,
});

const explainHealthConceptFlow = ai.defineFlow(
  {
    name: 'explainHealthConceptFlow',
    inputSchema: ExplainHealthConceptInputSchema,
    outputSchema: ExplainHealthConceptOutputSchema,
  },
  async input => {
    const {output} = await explainHealthConceptPrompt(input);
    return output!;
  }
);
