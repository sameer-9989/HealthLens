
'use server';
/**
 * @fileOverview Cognitive Health Tracker AI agent. Helps users monitor and improve cognitive and emotional wellness.
 *
 * - processCognitiveCheckIn - A function that handles cognitive check-ins, asks questions, and analyzes responses.
 * - CognitiveCheckInInput - The input type for the processCognitiveCheckIn function.
 * - CognitiveCheckInOutput - The return type for the processCognitiveCheckIn function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CognitiveCheckInInputSchema = z.object({
  userMessage: z.string().describe("The user's message, which could be an initial trigger (e.g., 'Track my focus'), a response to a previous question, or a general statement about their cognitive state."),
  userId: z.string().describe("User ID for context, though not directly used for database lookups in this flow."),
  conversationContext: z.string().optional().describe("Relevant snippets from previous interactions or known cognitive states to provide context for the AI's analysis and response generation. E.g., 'User previously mentioned feeling foggy. AI asked about concentration. User is now responding.'"),
});
export type CognitiveCheckInInput = z.infer<typeof CognitiveCheckInInputSchema>;

const CognitiveAnalysisSchema = z.object({
    cognitiveFatigueDetected: z.boolean().optional().describe("Whether cognitive fatigue is detected in the user's message or context."),
    stressPatternDetected: z.boolean().optional().describe("Whether a stress pattern is detected."),
    emotionalDeclineDetected: z.boolean().optional().describe("Whether emotional decline is suggested by the user's language or tone."),
    earlyCognitiveDeclineSigns: z.boolean().optional().describe("Whether there are potential early signs of cognitive decline based on memory, focus issues described."),
    burnoutSigns: z.boolean().optional().describe("Whether signs of burnout are detected."),
    summary: z.string().optional().describe("A brief textual summary of the AI's analysis of the user's cognitive state.")
  }).optional().describe("Detailed analysis of the user's cognitive state based on the input, if an analysis was performed. This should only be populated if the AI performs an analysis step.");

const CognitiveCheckInOutputSchema = z.object({
  aiResponse: z.string().describe("The AI's response to the user. This could be a new question, an observation, an analysis with supportive suggestions, or an empathetic acknowledgment."),
  analysis: CognitiveAnalysisSchema,
  isAskingQuestion: z.boolean().describe("True if the aiResponse is primarily posing a question to the user, false otherwise."),
});
export type CognitiveCheckInOutput = z.infer<typeof CognitiveCheckInOutputSchema>;

export async function processCognitiveCheckIn(input: CognitiveCheckInInput): Promise<CognitiveCheckInOutput> {
  return cognitiveCheckInFlow(input);
}

const prompt = ai.definePrompt({
  name: 'cognitiveCheckInPrompt',
  input: {schema: CognitiveCheckInInputSchema},
  output: {schema: CognitiveCheckInOutputSchema},
  prompt: `You are an empathetic and insightful Cognitive Health Tracker AI. Your goal is to help user {{userId}} monitor and improve their cognitive and emotional wellness through brief, non-intrusive interactions.

User's message: "{{userMessage}}"
Previous conversation context (if any): {{{conversationContext}}}

Follow these instructions:

1.  **Determine Intent & Respond Appropriately:**
    *   **If userMessage is an initial trigger** (e.g., "Track my focus", "Cognitive check-in", "Brain fog", "Memory issues", or if conversationContext is minimal):
        *   Your 'aiResponse' should be a simple, non-intrusive daily cognitive reflection question. Choose one from:
            *   "How has your concentration been today?"
            *   "Were you able to remember your tasks and appointments easily today?"
            *   "Would you say you felt more mentally sharp or a bit foggy today?"
            *   "How would you rate your focus level today - high, medium, or low?"
            *   "Did anything specific make it hard to concentrate or remember things today?"
        *   Set 'isAskingQuestion' to true. Do not provide 'analysis' in this case.
    *   **If userMessage appears to be a response to a question, or a statement about their cognitive/emotional state:**
        *   Analyze the 'userMessage' (and 'conversationContext' if provided) for tone, language use, and consistency. Look for patterns related to cognitive fatigue, stress, emotional state, memory, and focus.
        *   Populate the 'analysis' object with your findings (e.g., cognitiveFatigueDetected: true, summary: "User reports feeling mentally exhausted."). Be cautious and avoid definitive diagnoses.
        *   Your 'aiResponse' should be supportive and empathetic. It could:
            *   Reflect on their input (e.g., "It sounds like focus was a challenge today.").
            *   If potential concerns are mild and detected for the first time, offer a general supportive suggestion (e.g., "Sometimes a short break or a quick walk can help with that. Is that something you might try?").
            *   If concerns seem persistent (indicated by conversationContext or repeated statements), you can gently suggest that if these feelings continue, exploring self-care plans or talking to someone might be helpful. (e.g., "If this feeling of fogginess continues for a while, remember there are strategies and resources that can support you.") You cannot directly connect to care plans.
            *   You might ask a follow-up clarifying question if needed, or a different type of reflection question. If so, set 'isAskingQuestion' to true. Otherwise, set it to false.

2.  **Tone:** Maintain a friendly, compassionate, and adaptive tone. Validate their feelings.
3.  **Privacy:** Do not ask for PII beyond what's implicitly in the conversation.
4.  **Output:** Ensure 'aiResponse' is generated for all interactions. 'analysis' should only be populated if an analysis is performed. 'isAskingQuestion' must always be set.

Example for initial trigger:
UserMessage: "Cognitive check-in"
AI Response: "Okay! How has your concentration been today?"
IsAskingQuestion: true
Analysis: (empty or not present)

Example for user response indicating issues:
UserMessage: "I felt super foggy all day and couldn't remember anything."
ConversationContext: "AI asked about mental sharpness yesterday."
AI Response: "It sounds like today was quite challenging with that fogginess and memory issues. It's okay to have days like that. Sometimes ensuring good sleep can make a difference. How has your sleep been lately?"
IsAskingQuestion: true
Analysis: { cognitiveFatigueDetected: true, earlyCognitiveDeclineSigns: true, summary: "User reports significant mental fog and memory difficulties." }
`,
});

const cognitiveCheckInFlow = ai.defineFlow(
  {
    name: 'cognitiveCheckInFlow',
    inputSchema: CognitiveCheckInInputSchema,
    outputSchema: CognitiveCheckInOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

