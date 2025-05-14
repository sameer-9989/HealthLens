// 'use server';

/**
 * @fileOverview A flow for creating a downloadable emergency sheet.
 *
 * - createEmergencySheet - A function that helps users create a downloadable emergency sheet.
 * - CreateEmergencySheetInput - The input type for the createEmergencySheet function.
 * - CreateEmergencySheetOutput - The return type for the createEmergencySheet function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateEmergencySheetInputSchema = z.object({
  name: z.string().describe('The patient\'s full name.'),
  birthDate: z.string().describe('The patient\'s date of birth (YYYY-MM-DD).'),
  conditions: z.string().describe('A list of the patient\'s medical conditions.'),
  medications: z.string().describe('A list of the patient\'s current medications, including dosages.'),
  allergies: z.string().describe('A list of the patient\'s allergies, including reactions.'),
  emergencyContactName: z.string().describe('The name of the emergency contact.'),
  emergencyContactPhone: z.string().describe('The phone number of the emergency contact.'),
  insuranceProvider: z.string().describe('The patient\'s insurance provider.'),
  insurancePolicyNumber: z.string().describe('The patient\'s insurance policy number.'),
  additionalInformation: z.string().describe('Any additional information that might be helpful in an emergency.'),
});

export type CreateEmergencySheetInput = z.infer<typeof CreateEmergencySheetInputSchema>;

const CreateEmergencySheetOutputSchema = z.object({
  emergencySheetContent: z.string().describe('The generated content for the emergency sheet in a markdown format.'),
});

export type CreateEmergencySheetOutput = z.infer<typeof CreateEmergencySheetOutputSchema>;

export async function createEmergencySheet(input: CreateEmergencySheetInput): Promise<CreateEmergencySheetOutput> {
  return createEmergencySheetFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createEmergencySheetPrompt',
  input: {schema: CreateEmergencySheetInputSchema},
  output: {schema: CreateEmergencySheetOutputSchema},
  prompt: `You are an AI assistant that helps users create a downloadable emergency sheet.

  Based on the provided information, generate a markdown formatted emergency sheet that includes the following:

  # Emergency Information Sheet

  **Patient Name:** {{{name}}}
  **Date of Birth:** {{{birthDate}}}

  ## Medical Information

  **Conditions:** {{{conditions}}}
  **Medications:** {{{medications}}}
  **Allergies:** {{{allergies}}}

  ## Emergency Contact

  **Contact Name:** {{{emergencyContactName}}}
  **Contact Phone:** {{{emergencyContactPhone}}}

  ## Insurance Information

  **Insurance Provider:** {{{insuranceProvider}}}
  **Policy Number:** {{{insurancePolicyNumber}}}

  ## Additional Information

  {{{additionalInformation}}}
  `,
});

const createEmergencySheetFlow = ai.defineFlow(
  {
    name: 'createEmergencySheetFlow',
    inputSchema: CreateEmergencySheetInputSchema,
    outputSchema: CreateEmergencySheetOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
