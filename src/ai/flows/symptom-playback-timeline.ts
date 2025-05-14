'use server';
/**
 * @fileOverview Generates a visual and narrative log of symptom progression over time.
 *
 * - generateSymptomTimeline - A function that generates the symptom timeline.
 * - SymptomTimelineInput - The input type for the generateSymptomTimeline function.
 * - SymptomTimelineOutput - The return type for the generateSymptomTimeline function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SymptomEntrySchema = z.object({
  date: z.string().describe('The date of the symptom entry (ISO format).'),
  symptoms: z.array(z.string()).describe('List of symptoms experienced on this date.'),
  notes: z.string().describe('Any additional notes or context for this entry.'),
});

const SymptomTimelineInputSchema = z.object({
  userId: z.string().describe('The ID of the user.'),
  symptomEntries: z.array(SymptomEntrySchema).describe('A list of symptom entries over time.'),
});
export type SymptomTimelineInput = z.infer<typeof SymptomTimelineInputSchema>;

const SymptomTimelineOutputSchema = z.object({
  timelineNarrative: z.string().describe('A narrative summary of the symptom progression over time.'),
  keyPatterns: z.array(z.string()).describe('Identified patterns or trends in the symptom history.'),
});
export type SymptomTimelineOutput = z.infer<typeof SymptomTimelineOutputSchema>;

export async function generateSymptomTimeline(input: SymptomTimelineInput): Promise<SymptomTimelineOutput> {
  return symptomTimelineFlow(input);
}

const symptomTimelinePrompt = ai.definePrompt({
  name: 'symptomTimelinePrompt',
  input: {schema: SymptomTimelineInputSchema},
  output: {schema: SymptomTimelineOutputSchema},
  prompt: `You are an AI assistant specializing in summarizing medical records and identifying key patterns in patient symptom history.

  Given the following symptom entries for user ID {{{userId}}}, generate a narrative summary of the symptom progression over time and identify any key patterns or trends.

  Symptom Entries:
  {{#each symptomEntries}}
  - Date: {{{date}}}
    Symptoms: {{#each symptoms}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
    Notes: {{{notes}}}
  {{/each}}

  Timeline Narrative: A concise summary of how the user's symptoms have evolved over time.

  Key Patterns: A bulleted list of any recurring patterns or potential triggers identified in the symptom history.
  `,
});

const symptomTimelineFlow = ai.defineFlow(
  {
    name: 'symptomTimelineFlow',
    inputSchema: SymptomTimelineInputSchema,
    outputSchema: SymptomTimelineOutputSchema,
  },
  async input => {
    const {output} = await symptomTimelinePrompt(input);
    return output!;
  }
);
