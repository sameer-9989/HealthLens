'use server';

/**
 * @fileOverview Implements a conversational health coach that provides personalized habit-building conversations.
 *
 * - conversationalHealthCoach - A function that orchestrates the conversational health coaching process.
 * - ConversationalHealthCoachInput - The input type for the conversationalHealthCoach function.
 * - ConversationalHealthCoachOutput - The return type for the conversationalHealthCoach function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConversationalHealthCoachInputSchema = z.object({
  topic: z.enum(['sleep', 'diet', 'hydration']).describe('The health topic to focus on.'),
  progress: z.string().describe('Description of current progress on the chosen topic.'),
  needs: z.string().optional().describe('Specific user needs or challenges related to the topic.'),
  userName: z.string().describe('The name of the user.'),
});
export type ConversationalHealthCoachInput = z.infer<typeof ConversationalHealthCoachInputSchema>;

const ConversationalHealthCoachOutputSchema = z.object({
  conversation: z.string().describe('The AI-generated conversation for habit building.'),
});
export type ConversationalHealthCoachOutput = z.infer<typeof ConversationalHealthCoachOutputSchema>;

export async function conversationalHealthCoach(
  input: ConversationalHealthCoachInput
): Promise<ConversationalHealthCoachOutput> {
  return conversationalHealthCoachFlow(input);
}

const prompt = ai.definePrompt({
  name: 'conversationalHealthCoachPrompt',
  input: {schema: ConversationalHealthCoachInputSchema},
  output: {schema: ConversationalHealthCoachOutputSchema},
  prompt: `You are a personalized health coach, having a conversation with {{userName}} about improving their {{topic}} habits.

  Current Progress: {{progress}}
  {% if needs %}User Needs: {{needs}}{% endif %}

  Generate a short, engaging conversation that provides encouragement, actionable tips, and dynamically adjusts advice based on the user's progress and needs. The tone should be supportive and motivational.
  The conversation should be no more than 5 turns.
  End the conversation with a question encouraging the user to continue improving.
  `,
});

const conversationalHealthCoachFlow = ai.defineFlow(
  {
    name: 'conversationalHealthCoachFlow',
    inputSchema: ConversationalHealthCoachInputSchema,
    outputSchema: ConversationalHealthCoachOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
