
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

const HealthTopicSchema = z.enum([
  'hydration',
  'exercise',
  'sleep',
  'stressReduction',
  'mindfulness',
  'posture',
  'diet'
]).describe('The general health topic for the current focus of conversation.');

const ConversationalHealthCoachInputSchema = z.object({
  userMessage: z.string().describe("The user's latest message or query to the health coach. This could be an initial trigger like 'motivate me' or a response to a previous AI message."),
  healthTopic: HealthTopicSchema,
  userName: z.string().describe('The name of the user.'),
  conversationHistory: z.string().optional().describe("A summary of recent conversation turns (e.g., 'AI: Suggested a 10-min walk. User: I felt great after it!') to maintain context and track progress.")
});
export type ConversationalHealthCoachInput = z.infer<typeof ConversationalHealthCoachInputSchema>;

const ConversationalHealthCoachOutputSchema = z.object({
  coachResponse: z.string().describe("The AI coach's next message in the conversation. This should be engaging and supportive."),
  suggestedTask: z.string().optional().describe("A specific, small, achievable health task if suggested by the coach during this turn."),
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
  prompt: `You are {{userName}}'s empathetic and highly skilled Conversational Health Coach. Your goal is to guide them in building and maintaining better health habits related to {{healthTopic}}.
Employ behavioral psychology and motivational interviewing techniques:
- Start by understanding {{userName}}'s current habits and barriers related to {{healthTopic}}. Ask open-ended questions if their message doesn't provide enough detail.
- Listen actively to their '{{userMessage}}'. Reflect on their feelings and motivations.
- Use affirmations to acknowledge their efforts and strengths.
- If they express difficulty or low motivation, respond with empathy and collaboratively explore very small, achievable steps.
- Suggest personalized, small, and achievable health tasks based on their context, condition, and readiness for change.
- Track progress conversationally. Refer to information in '{{conversationHistory}}' if available, to show continuity (e.g., "Last time we talked about X, how did that go?"). Ask follow-up questions like "Did you manage to drink an extra glass of water today?" or "How did that 10-minute walk feel?".
- Adapt your tone to be supportive, encouraging, and motivating, based on their responses and perceived mood.
- If suggesting a task, clearly state it in the 'suggestedTask' output field.
- Your 'coachResponse' should be a natural continuation of the conversation.

Current user message: "{{userMessage}}"
Conversation history (if any): {{{conversationHistory}}}

Focus on the health topic: {{healthTopic}}.

Generate your response as the coach. Ensure your response is conversational and aims to build a positive rapport.
If the user's message is a trigger like "Health coach", "motivate me", "build routine", or "I want to get healthier", initiate the conversation by asking about their goals for {{healthTopic}}.
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

