
'use server';
/**
 * @fileOverview An AI agent that busts common health myths.
 *
 * - bustHealthMyth - A function that debunks or confirms a health myth.
 * - BustHealthMythInput - The input type for the bustHealthMyth function.
 * - BustHealthMythOutput - The return type for the bustHealthMyth function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const BustHealthMythInputSchema = z.object({
  mythQuery: z.string().min(10).describe("The health myth or question the user wants to bust or get an answer for, e.g., 'Is garlic effective for colds?', 'Does cracking knuckles cause arthritis?'."),
});
export type BustHealthMythInput = z.infer<typeof BustHealthMythInputSchema>;

export const BustHealthMythOutputSchema = z.object({
  explanation: z.string().describe("The AI's detailed explanation, either debunking or confirming the myth with reasoning and evidence if possible. Should state if more research is needed."),
  youtubeSearchQuery: z.string().describe("A concise YouTube search query to find a video explainer related to the myth (e.g., 'garlic for colds myth video', 'cracking knuckles arthritis evidence')."),
  imageHint: z.string().max(30).describe("A 1-3 word hint for a relevant illustrative image (e.g., 'garlic cloves', 'hand xray', 'herbal tea immune'). This will be used for data-ai-hint for a placeholder image."),
  isMythTrue: z.boolean().nullable().describe("Whether the myth is considered true, false, or if it's complex/uncertain (null)."),
  confidenceLevel: z.enum(['High', 'Medium', 'Low', 'Uncertain']).describe("The AI's confidence in its assessment of the myth."),
});
export type BustHealthMythOutput = z.infer<typeof BustHealthMythOutputSchema>;

export async function bustHealthMyth(input: BustHealthMythInput): Promise<BustHealthMythOutput> {
  return bustHealthMythFlow(input);
}

const prompt = ai.definePrompt({
  name: 'bustHealthMythPrompt',
  input: {schema: BustHealthMythInputSchema},
  output: {schema: BustHealthMythOutputSchema},
  prompt: `You are an AI Health Myth Buster. Your goal is to analyze common health myths or questions and provide evidence-based, clear explanations.

User's myth/question: "{{mythQuery}}"

Instructions:
1.  Analyze the 'mythQuery'.
2.  Determine if the myth is generally considered true, false, or if the evidence is complex/uncertain. Set 'isMythTrue' accordingly (true, false, or null for uncertain/complex).
3.  State your 'confidenceLevel' in this assessment (High, Medium, Low, Uncertain).
4.  Provide a detailed 'explanation'. If debunking, explain why it's a myth. If confirming, explain the supporting evidence. If complex, explain the nuances. Cite general scientific consensus where possible, without referring to specific studies or papers.
5.  Generate a 'youtubeSearchQuery' (max 5 words) that a user could use on YouTube to find a relevant educational video from a trusted health creator or verified channel about this myth.
6.  Provide an 'imageHint' (1-3 words) for a relevant placeholder image (e.g., if myth is about garlic, hint could be "garlic cloves").

Example for "Does cracking knuckles cause arthritis?":
isMythTrue: false
confidenceLevel: High
explanation: "Cracking knuckles does not cause arthritis. The sound is from gas bubbles in the synovial fluid. While it might annoy others, studies have not found a link to arthritis. However, habitual, forceful cracking could theoretically lead to other minor issues in rare cases, but not arthritis itself."
youtubeSearchQuery: "cracking knuckles arthritis myth"
imageHint: "hand xray"

Output strictly in the JSON schema format.
Always advise users to consult healthcare professionals for personal medical advice. This explanation is for informational purposes.
`,
});

const bustHealthMythFlow = ai.defineFlow(
  {
    name: 'bustHealthMythFlow',
    inputSchema: BustHealthMythInputSchema,
    outputSchema: BustHealthMythOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('AI Health Myth Buster failed to produce an output.');
    }
    // Ensure explanation includes a general disclaimer
    const disclaimer = "\n\nRemember, this information is for educational purposes and not medical advice. Always consult a healthcare professional for personal health concerns.";
    if (!output.explanation.includes("medical advice") && !output.explanation.includes("healthcare professional")) {
        output.explanation += disclaimer;
    }
    return output;
  }
);
