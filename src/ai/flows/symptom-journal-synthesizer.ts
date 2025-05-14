// SymptomJournalSynthesizer
'use server';
/**
 * @fileOverview Converts user journal entries into structured medical summaries.
 *
 * - synthesizeJournalEntries - A function that converts journal entries into medical summaries.
 * - SynthesizeJournalEntriesInput - The input type for the synthesizeJournalEntries function.
 * - SynthesizeJournalEntriesOutput - The return type for the synthesizeJournalEntries function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SynthesizeJournalEntriesInputSchema = z.object({
  journalEntries: z
    .string()
    .describe('A series of journal entries detailing symptoms and experiences.'),
  patientName: z.string().describe('The name of the patient.'),
  patientAge: z.number().describe('The age of the patient.'),
  patientGender: z.string().describe('The gender of the patient.'),
});
export type SynthesizeJournalEntriesInput = z.infer<typeof SynthesizeJournalEntriesInputSchema>;

const SynthesizeJournalEntriesOutputSchema = z.object({
  medicalSummary: z
    .string()
    .describe('A structured medical summary of the journal entries.'),
});
export type SynthesizeJournalEntriesOutput = z.infer<typeof SynthesizeJournalEntriesOutputSchema>;

export async function synthesizeJournalEntries(
  input: SynthesizeJournalEntriesInput
): Promise<SynthesizeJournalEntriesOutput> {
  return synthesizeJournalEntriesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'synthesizeJournalEntriesPrompt',
  input: {schema: SynthesizeJournalEntriesInputSchema},
  output: {schema: SynthesizeJournalEntriesOutputSchema},
  prompt: `You are an AI assistant that specializes in converting patient journal entries into structured medical summaries for healthcare providers.

  Below is a series of journal entries for the following patient:

  Patient Name: {{{patientName}}}
  Patient Age: {{{patientAge}}}
  Patient Gender: {{{patientGender}}}

  Journal Entries:
  {{journalEntries}}

  Please create a concise and structured medical summary, including key symptoms, timelines, and any other relevant information for the healthcare provider.`,
});

const synthesizeJournalEntriesFlow = ai.defineFlow(
  {
    name: 'synthesizeJournalEntriesFlow',
    inputSchema: SynthesizeJournalEntriesInputSchema,
    outputSchema: SynthesizeJournalEntriesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
