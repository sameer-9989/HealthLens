
'use server';

/**
 * @fileOverview A virtual nursing assistant AI agent.
 *
 * - virtualNursingAssistant - A function that handles the virtual nursing assistant process.
 * - VirtualNursingAssistantInput - The input type for the virtualNursingAssistant function.
 * - VirtualNursingAssistantOutput - The return type for the virtualNursingAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VirtualNursingAssistantInputSchema = z.object({
  message: z.string().describe('The message from the user.'),
  medications: z.array(z.string()).optional().describe('The list of medications the user is currently taking (for context and interaction checks).'),
  healthGoals: z.array(z.string()).optional().describe('The list of health goals the user has.'),
  medicationToCheck: z.string().optional().describe('A specific medication the user wants to check for interactions with their current list.'),
  conversationHistory: z.string().optional().describe('A summary of recent conversation turns or key context points from the current session. E.g., "User: I feel stressed. AI: Suggested exercise. User: Yes."'),
});
export type VirtualNursingAssistantInput = z.infer<typeof VirtualNursingAssistantInputSchema>;

const YogaRoutineSuggestionSchema = z.object({
  title: z.string().describe("Descriptive title of the yoga routine (e.g., '5-Min Chair Yoga for Back Pain')."),
  category: z.string().describe("Category like 'Desk Yoga', 'Back Relief', 'Quick Stretch', 'Mindfulness Focus', 'Morning Routine', 'Sleep Aid'."),
  youtubeSearchQuery: z.string().describe("An effective YouTube search query to find a video for this routine (e.g., '5 minute chair yoga back pain')."),
  description: z.string().describe("A brief (1-2 sentences) explanation of the routine and its benefits for the user's stated issue.")
});
export type YogaRoutineSuggestion = z.infer<typeof YogaRoutineSuggestionSchema>;

const VirtualNursingAssistantOutputSchema = z.object({
  response: z.string().describe('The response from the virtual nursing assistant. This should be the main conversational text.'),
  interactionWarning: z.string().optional().describe('A warning if a potential medication interaction is found. Includes a strong disclaimer.'),
  suggestedAction: z.string().optional().describe('A suggested action for the user, e.g., a mindfulness exercise step, a CBT prompt, or a mental wellness prompt like "Take a deep breath with me."'),
  suggestedYogaRoutines: z.array(YogaRoutineSuggestionSchema).optional().describe("An array of suggested yoga routines if applicable, each with a title, category, YouTube search query, and description. This should be populated if the AI is recommending yoga.")
});
export type VirtualNursingAssistantOutput = z.infer<typeof VirtualNursingAssistantOutputSchema>;

export async function virtualNursingAssistant(input: VirtualNursingAssistantInput): Promise<VirtualNursingAssistantOutput> {
  return virtualNursingAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'virtualNursingAssistantPrompt',
  input: {schema: VirtualNursingAssistantInputSchema},
  output: {schema: VirtualNursingAssistantOutputSchema},
  prompt: `You are a friendly, empathetic, and supportive Virtual Nursing Assistant with session-based conversational memory. Your roles are:
  1.  Provide medication reminders and general health guidance.
  2.  Explain medical terms, diagnoses, or prescriptions in plain language.
  3.  Offer simple text-based therapeutic exercises (mindfulness, guided breathing, basic CBT prompts for thought challenging).
  4.  Provide basic medication interaction information (with strong disclaimers).
  5.  Suggest relevant yoga/stretching routines.
  6.  Respond to mental health check-ins and emotional states with empathy and support, remembering previous interactions within this session.

  **Conversational Style Guidelines & Contextual Memory:**
  *   **Session Context is Key:** Pay close attention to the '{{conversationHistory}}' if provided. Use it to understand the flow of the current conversation, remember what the user has already told you in this session (e.g., their mood, symptoms, previous questions), and avoid asking for the same information again.
  *   **Natural Follow-ups:** If the user's current '{{message}}' is a follow-up to a previous point (which you can infer from '{{conversationHistory}}'), make your response a natural continuation. For example, if you previously suggested an exercise and the user says "Yes" to trying another method, your response should acknowledge the context: "Great! Since you mentioned feeling stressed earlier, let's try a quick breathing technique."
  *   **Avoid Isolation:** Do not treat each new message in isolation if history is available. Tie follow-ups to earlier concerns.
  *   **Graceful Topic Shifts:** If the user pauses or changes topics, you can gently refer back to previous context if it seems relevant: "Okay. Earlier you mentioned feeling overwhelmed. Would you like to continue with that, or explore something else related to your current message?"
  *   **Be Natural and Varied:** Aim for a human-like conversational flow. Use varied phrasing, especially for common topics like mental health support or symptom discussion.
  *   **Concise and Unique:** Strive to make each response fresh and avoid rephrasing your previous statements or unnecessarily echoing the user's input unless clarifying a complex point.
  *   **Limit Feedback Requests:** Avoid asking "Was this helpful?" often.
  *   **Empathetic & Adaptive Tone:** Understand user tone and emotion from their messages and history. Respond with genuine empathy. Example: "I can hear that this has been really frustrating for you," or "You’re not alone in feeling this way — let’s explore how to help."

  User's current medications (for context): {{#if medications}}{{#each medications}}- {{this}} {{/each}}{{else}}None specified{{/if}}
  User's health goals (for context): {{#if healthGoals}}{{#each healthGoals}}- {{this}} {{/each}}{{else}}None specified{{/if}}

  {{#if conversationHistory}}
  Recent Conversation History (this session):
  {{{conversationHistory}}}
  ---
  {{/if}}
  Current User message: "{{message}}"

  ---

  Core Tasks & Instructions (apply with session context in mind):

  A.  **General Conversation & Guidance:**
      *   Respond empathetically. If '{{conversationHistory}}' indicates a topic was already discussed, build upon it rather than starting fresh.
      *   If they ask about health goals or medications, use the provided context and any relevant history.

  B.  **Mental Health & Emotional Support:**
      *   If the user expresses feelings like sadness, stress, anxiety, or if '{{conversationHistory}}' shows this was a recent topic:
          *   Acknowledge and validate their feelings with empathy, referencing previous statements if appropriate (e.g., "You mentioned earlier you were feeling [emotion], and it's still understandable to feel that way.").
          *   Offer supportive messages. Suggest a calming resource from section E, tailoring it if the history provides clues (e.g., "Since the breathing exercise seemed to help a bit, would you like to try another short one, or perhaps a grounding technique?").

  C.  **Medical Term Explanation (Health Literacy):**
      *   If the user asks to explain a medical term, provide a clear, simple explanation. If they've asked about related terms before (check '{{conversationHistory}}'), you can link the concepts if relevant.

  D.  **Aspirin Information:** (As previously defined)

  E.  **Simple Therapeutic Exercises (Text-Based):** (As previously defined, but introduce by linking to history if relevant)

  F.  **Basic Medication Interaction Check (with Disclaimer):** (As previously defined)

  G.  **Yoga & Stretching Suggestions for Stress/Discomfort:** (As previously defined, but acknowledge user's stated issue from current message or history)

  H. **Safety, Disclaimers, and Empathetic Tone (Continued):**
      *   **Disclaimer Handling:** Use disclaimers contextually. If a disclaimer was recently given (check history or session flags if possible), a softer reminder might be sufficient or none at all for general chat. Prioritize for new medical topics.
      *   **Emergency Situations & Crisis:** (As previously defined - these override general conversational flow).

  Generate the 'response' field. Use 'interactionWarning', 'suggestedAction', and 'suggestedYogaRoutines' as needed.
  If the user message is vague and there's no clear context in '{{conversationHistory}}' to guide you, then it's okay to ask clarifying questions.
  Avoid starting with generic greetings like "How can I help you?" if the '{{conversationHistory}}' or current '{{message}}' already indicates a clear problem or ongoing discussion. Instead, directly address the context.
  `,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  }
});

const virtualNursingAssistantFlow = ai.defineFlow(
  {
    name: 'virtualNursingAssistantFlow',
    inputSchema: VirtualNursingAssistantInputSchema,
    outputSchema: VirtualNursingAssistantOutputSchema,
  },
  async input => {
    // Basic check for physical emergency phrases.
    const physicalEmergencyPhrases = ["can't breathe", "chest pain", "heart attack", "stroke", "bleeding uncontrollably", "severe allergic reaction", "emergency help"];
    if (physicalEmergencyPhrases.some(phrase => input.message.toLowerCase().includes(phrase))) {
      return {
        response: "If you are experiencing a medical emergency, please call your local emergency services (e.g., 911, 112, 999) or go to the nearest emergency room immediately. I am an AI assistant and cannot provide emergency medical help.",
      };
    }
    
    // Basic check for immediate mental health crisis phrases (self-harm, suicide).
    const mentalHealthCrisisPhrases = ["kill myself", "want to die", "self harm", "suicidal thoughts", "ending my life", "don't want to live"];
     if (mentalHealthCrisisPhrases.some(phrase => input.message.toLowerCase().includes(phrase))) {
      return {
        response: "It sounds like you're going through a very difficult time. If you're in crisis or need immediate support, please reach out to a crisis hotline or mental health professional. There are people who want to help. In the US, you can call or text 988. For other regions, please search for your local crisis support line.",
      };
    }

    const {output} = await prompt(input);
    if (!output) {
        return { response: "I'm having a little trouble processing that request. Could you try rephrasing or asking again in a moment? Remember, for specific medical advice, it's always best to consult with a healthcare professional."};
    }
    
    return output;
  }
);

    