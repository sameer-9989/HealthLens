// src/ai/flows/care-coordination-hub.ts
'use server';

/**
 * @fileOverview Organizes health-related tasks, notes, and questions before doctor visits and summarizes key points post-visit.
 *
 * - careCoordination - A function that handles the care coordination process.
 * - CareCoordinationInput - The input type for the careCoordination function.
 * - CareCoordinationOutput - The return type for the careCoordination function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CareCoordinationInputSchema = z.object({
  visitType: z
    .string()(
      'Whether this is a pre-visit organization or a post-visit summary. Should be either pre-visit or post-visit.'
    )
    .describe(
      'Whether this is a pre-visit organization of notes and questions, or a post-visit summary of key points.'
    ),
  patientNotes: z
    .string()
    .describe('Notes about the patient, their symptoms, and health concerns.'),
});

export type CareCoordinationInput = z.infer<typeof CareCoordinationInputSchema>;

const CareCoordinationOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A summary of the key points, tasks, and questions for the doctor visit.'
    ),
});

export type CareCoordinationOutput = z.infer<typeof CareCoordinationOutputSchema>;

export async function careCoordination(input: CareCoordinationInput): Promise<CareCoordinationOutput> {
  return careCoordinationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'careCoordinationPrompt',
  input: {schema: CareCoordinationInputSchema},
  output: {schema: CareCoordinationOutputSchema},
  prompt: `You are a helpful assistant that organizes and summarizes patient information for doctor visits.

You will receive patient notes and be asked to either organize them into tasks and questions before a visit, or summarize the key points after a visit.

Patient Notes: {{{patientNotes}}}
Visit Type: {{{visitType}}}

Instructions: Based on the patient notes and visit type, generate a summary of the key points, tasks, and questions for the doctor visit.
Visit Type can be pre-visit or post-visit.
If visitType is pre-visit, organize notes into tasks and questions.
If visitType is post-visit, summarize key points.

Summary:`,
});

const careCoordinationFlow = ai.defineFlow(
  {
    name: 'careCoordinationFlow',
    inputSchema: CareCoordinationInputSchema,
    outputSchema: CareCoordinationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
