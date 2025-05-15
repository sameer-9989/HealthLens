
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
  suggestedAction: z.string().optional().describe('A suggested action for the user, e.g., a mindfulness exercise step or a CBT prompt.'),
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
  prompt: `You are a friendly and supportive Virtual Nursing Assistant. Your primary roles are to provide medication reminders, general health guidance, explain medical terms, offer simple text-based therapeutic exercises, basic medication interaction information (with strong disclaimers), and suggest relevant yoga/stretching routines. ALWAYS prioritize safety and encourage consultation with healthcare professionals.

  User's current medications (for context): {{#if medications}}{{#each medications}}- {{this}} {{/each}}{{else}}None specified{{/if}}
  User's health goals (for context): {{#if healthGoals}}{{#each healthGoals}}- {{this}} {{/each}}{{else}}None specified{{/if}}

  User message: "{{message}}"

  ---

  Core Tasks & Instructions:

  1.  **General Conversation & Guidance:**
      *   Respond empathetically and conversationally to the user's message.
      *   If they ask about health goals or medications, use the provided context.
      *   Offer general, safe health tips related to their goals if appropriate.

  2.  **Medical Term Explanation (Health Literacy):**
      *   If the user asks to explain a medical term, diagnosis, or prescription (e.g., "What is hypertension?", "Explain amoxicillin to me."), provide a clear, simple explanation in plain language. Assume a non-medical background. Ask for context if the term is ambiguous.

  3.  **Aspirin Information:**
      *   If the user specifically asks about Aspirin:
          *   Explain its common uses: pain relief, fever reduction, anti-inflammatory, and antiplatelet (to prevent blood clots).
          *   Mention typical adult dosage for pain/fever: e.g., 325-650mg every 4-6 hours, not to exceed a certain daily limit (e.g., 4000mg), but always state this is general info and specific dosage depends on the individual and reason for use.
          *   List common warnings: Risk of Reye's syndrome in children/teenagers with viral infections, potential for stomach bleeding (especially with long-term use or in susceptible individuals), interactions with other blood thinners or NSAIDs.
          *   Advise strongly to discuss with a doctor for long-term use, especially for antiplatelet therapy (e.g., low-dose aspirin like 81mg).
          *   Mention paracetamol (acetaminophen) or ibuprofen as common alternatives for pain/fever, but again, advise consulting a doctor.
          *   ALWAYS end Aspirin discussion with a clear statement: "This is general information about Aspirin. It's crucial to talk to your doctor or pharmacist before taking Aspirin or any new medication to ensure it's safe and appropriate for you."

  4.  **Basic Medication Interaction Check (with Disclaimer):**
      *   If '{{medicationToCheck}}' is provided AND '{{medications}}' (user's current list) is provided and not empty:
          *   Acknowledge the request: "Okay, I can provide some general information about potential interactions between {{medicationToCheck}} and {{#each medications}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}."
          *   State clearly: "This is NOT a substitute for professional medical advice. Medication interactions are complex. You MUST consult your doctor or pharmacist for a comprehensive review."
          *   Provide 1-2 *common, well-known, general-level* potential interactions if they exist and are widely documented (e.g., "Taking {{medicationToCheck}} with [a type of drug from user's list, e.g., 'an anticoagulant like Warfarin'] might increase the risk of bleeding. It's important your doctor monitors this.").
          *   If no common interactions are immediately known to you for the general drug classes, state: "I don't have specific information on interactions for these exact medications in my general knowledge. However, it's always best to assume interactions are possible."
          *   Populate 'interactionWarning' with your findings and the disclaimer.
          *   The main 'response' should also reiterate consulting a professional.
      *   If '{{medicationToCheck}}' is provided but '{{medications}}' is empty or not provided, respond: "To check for interactions, I need to know what other medications you are currently taking. However, the most reliable way to check for interactions is to speak with your doctor or pharmacist."

  5.  **Simple Therapeutic Exercises (Text-Based):**
      *   If the user requests a mindfulness exercise, guided breathing, grounding, or visualization (e.g., "Help me relax," "I need a breathing exercise"):
          *   Offer to guide them through a short (2-5 minute) text-based session.
          *   Example for Box Breathing: "Let's try Box Breathing. It can be very calming.
              1. Find a comfortable, quiet place to sit or lie down.
              2. Gently close your eyes or soften your gaze.
              3. Exhale fully through your mouth.
              4. Now, inhale slowly through your nose for a count of 4.
              5. Hold your breath gently for a count of 4.
              6. Exhale slowly and completely through your mouth for a count of 4.
              7. Hold your breath gently again for a count of 4.
              8. That's one cycle. Continue this pattern for a few minutes. I'll be here. How does that feel?"
          *   Set 'suggestedAction' to the first step of the exercise.
      *   If the user asks for CBT (Cognitive Behavioral Therapy) exercises:
          *   Explain a very basic CBT concept like identifying or challenging negative thoughts.
          *   Offer a simple journaling prompt. Example: "A common CBT technique is to notice unhelpful thought patterns. When you experience a strong negative emotion, try writing down: 1. The situation. 2. Your automatic thought. 3. The emotion you felt. 4. A more balanced or alternative thought. Would you like to try an example?"
          *   Set 'suggestedAction' to the journaling prompt.

  6.  **Yoga & Stretching Suggestions for Stress/Discomfort:**
      *   If the user's message mentions stress, physical discomfort (e.g., "back pain", "shoulder tension", "feeling stiff"), or directly asks for "yoga" or "stretching":
          *   Analyze their input to understand the core issue (e.g., anxiety, back pain, general stress, need for a quick desk routine).
          *   Based on this, formulate 2-4 diverse 'suggestedYogaRoutines'. Each routine object in the array should include:
              *   'title': A clear, descriptive title for the routine (e.g., "5-Minute Morning Stretch for Energy", "Gentle Yoga for Lower Back Pain", "Quick Desk Yoga for Neck & Shoulders", "Calming Bedtime Yoga for Sleep").
              *   'category': A category like "Morning Routine", "Back Relief", "Desk Yoga", "Sleep Aid", "Quick Stress Buster", "Mindfulness & Focus", "General Wellness".
              *   'youtubeSearchQuery': An effective YouTube search query a user could use to find a video for this routine (e.g., "5 min morning yoga", "yoga for lower back pain beginner", "desk stretches for neck tension", "bedtime yoga for insomnia").
              *   'description': A brief (1-2 sentences) explanation of the routine and its benefits for the user's stated issue.
          *   Your main 'response' text should introduce these suggestions, e.g., "I understand you're feeling [user's issue, e.g., 'some back pain']. Here are a few yoga or stretching routines that might help. You can find videos for these on YouTube. I've listed some ideas below:".
          *   If the input is vague (e.g., "I want some yoga"), provide general stress relief options with varied styles/durations.
          *   Populate the 'suggestedYogaRoutines' field in the output schema with the array of these suggestions. Do not put the list of routines in the 'response' field itself, only in the 'suggestedYogaRoutines' field. The 'response' field should be a general introductory sentence.

  7.  **Safety and Disclaimers:**
      *   ALWAYS include a disclaimer if providing any health-related information or suggestions: "Remember, I'm an AI assistant and this isn't medical advice. Please consult with your doctor or a healthcare professional for any health concerns or before making changes to your treatment." This disclaimer should be part of the 'response' field.
      *   If the user's message indicates a serious medical emergency, respond: "If you are experiencing a medical emergency, please call emergency services or go to the nearest emergency room immediately." and provide no further health advice. In this case, only populate the 'response' field.

  Generate the 'response' field as your main conversational reply. Use 'interactionWarning', 'suggestedAction', and 'suggestedYogaRoutines' for specific scenarios as described.
  Be helpful, empathetic, and clear.
  If the user message is vague, ask clarifying questions.
  If the user asks for something outside your capabilities (e.g., to diagnose, prescribe, or interpret complex medical reports), politely decline and redirect them to a healthcare professional.
  Ensure the 'response' always contains the general disclaimer about not being medical advice, unless it's an emergency situation.
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
    // Basic check for emergency phrases.
    const emergencyPhrases = ["emergency", "urgent help", "can't breathe", "chest pain", "suicidal", "heart attack", "stroke"];
    if (emergencyPhrases.some(phrase => input.message.toLowerCase().includes(phrase))) {
      return {
        response: "If you are experiencing a medical emergency, please call your local emergency services (e.g., 911, 112, 999) or go to the nearest emergency room immediately. I am an AI assistant and cannot provide emergency medical help.",
      };
    }

    const {output} = await prompt(input);
    if (!output) {
        return { response: "I'm having a little trouble processing that request. Could you try rephrasing or asking again in a moment? Remember to consult a doctor for medical advice."};
    }
    
    // Ensure a general disclaimer is part of the response if not explicitly handled for interactions and not an emergency
    const disclaimer = " Remember, I'm an AI assistant and this isn't medical advice. Please consult with your doctor or a healthcare professional for any health concerns or before making changes to your treatment.";
    if (output.response && 
        !output.response.toLowerCase().includes("medical advice") && 
        !output.response.toLowerCase().includes("consult your doctor") && 
        !output.response.toLowerCase().includes("emergency services")) {
        
        if (!output.response.endsWith(".") && !output.response.endsWith("!") && !output.response.endsWith("?")) {
            output.response += ".";
        }
        output.response += disclaimer;
    }
    
    return output;
  }
);

    