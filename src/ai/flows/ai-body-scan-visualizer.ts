
'use server';
/**
 * @fileOverview An AI agent that provides information about selected body parts.
 *
 * - getBodyPartInfo - A function that provides info and resources for a body part.
 * - GetBodyPartInfoInput - The input type for the getBodyPartInfo function.
 * - GetBodyPartInfoOutput - The return type for the getBodyPartInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GetBodyPartInfoInputSchema = z.object({
  bodyPart: z.string().min(3).describe("The specific body part the user is interested in, e.g., 'lower back', 'knee', 'shoulders', 'neck', 'feet'."),
  concern: z.string().optional().describe("Optional: Specific concern related to the body part, e.g., 'pain', 'stiffness', 'general care', 'strengthening'.")
});
export type GetBodyPartInfoInput = z.infer<typeof GetBodyPartInfoInputSchema>;

export const GetBodyPartInfoOutputSchema = z.object({
  bodyPartName: z.string().describe("The validated or common name of the body part."),
  commonIssues: z.string().describe("A brief overview of common issues, discomforts, or conditions associated with this body part (e.g., 'Strains, sprains, disc issues for lower back')."),
  generalCareTips: z.string().describe("General tips for caring for this body part, including posture, movement, or preventative measures."),
  exerciseTypes: z.string().optional().describe("Types of exercises usually beneficial for this body part (e.g., 'Stretching, core strengthening for lower back')."),
  youtubeSearchQuery: z.string().describe("A concise YouTube search query to find videos explaining common issues, exercises, or care for that body area (e.g., 'lower back pain causes and stretches', 'knee strengthening exercises for runners')."),
  anatomicalImageHint: z.string().max(30).describe("A 1-3 word hint for a relevant medical illustration or anatomical image of the body part (e.g., 'spine anatomy', 'knee joint', 'shoulder muscles'). This will be used for data-ai-hint."),
});
export type GetBodyPartInfoOutput = z.infer<typeof GetBodyPartInfoOutputSchema>;

export async function getBodyPartInfo(input: GetBodyPartInfoInput): Promise<GetBodyPartInfoOutput> {
  return getBodyPartInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getBodyPartInfoPrompt',
  input: {schema: GetBodyPartInfoInputSchema},
  output: {schema: GetBodyPartInfoOutputSchema},
  prompt: `You are an AI Health Information Assistant. Your task is to provide concise, general information about a specified human body part, including common issues, care tips, and relevant search queries for educational videos.

User wants information about: "{{bodyPart}}"
{{#if concern}}Specific concern: "{{concern}}"{{/if}}

Instructions:
1.  Identify and confirm the 'bodyPartName' (e.g., if user says "low back", use "Lower Back").
2.  List 'commonIssues' associated with this body part (1-2 sentences). If a 'concern' is mentioned (like 'pain'), tailor this slightly.
3.  Provide 'generalCareTips' for maintaining the health of this body part (1-2 sentences).
4.  Optionally, suggest general 'exerciseTypes' beneficial for it (e.g., "Stretching, Strengthening").
5.  Generate a 'youtubeSearchQuery' (max 5 words) that a user could use on YouTube to find relevant videos about common issues, care, or exercises for this body part. Tailor slightly if a 'concern' is provided.
6.  Provide an 'anatomicalImageHint' (1-3 words) for a clear medical illustration or anatomical image of this body part (e.g., "knee joint diagram", "shoulder anatomy").

Example for bodyPart "knee" and concern "stiffness":
bodyPartName: "Knee"
commonIssues: "The knee is prone to issues like ligament sprains, meniscus tears, arthritis, and stiffness from inactivity or overuse."
generalCareTips: "Maintain a healthy weight, strengthen supporting muscles (quads, hamstrings), and use proper form during exercise. Warm-up before activity and cool-down after."
exerciseTypes: "Low-impact exercises like swimming or cycling, gentle range-of-motion exercises, quadriceps and hamstring strengthening."
youtubeSearchQuery: "knee stiffness relief exercises"
anatomicalImageHint: "knee anatomy illustration"

Strictly follow the JSON output schema.
ALWAYS include a disclaimer in 'generalCareTips' or 'commonIssues': "This information is for general knowledge only and not medical advice. Consult a healthcare professional for any pain, injury, or health concerns."
`,
});

const getBodyPartInfoFlow = ai.defineFlow(
  {
    name: 'getBodyPartInfoFlow',
    inputSchema: GetBodyPartInfoInputSchema,
    outputSchema: GetBodyPartInfoOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('AI Body Scan Visualizer failed to produce an output.');
    }
    const disclaimer = " This information is for general knowledge only and not medical advice. Consult a healthcare professional for any pain, injury, or health concerns.";
     if (output.generalCareTips && !output.generalCareTips.toLowerCase().includes("medical advice")) {
        output.generalCareTips += disclaimer;
    } else if (output.commonIssues && !output.commonIssues.toLowerCase().includes("medical advice")) {
        output.commonIssues += disclaimer;
    }
    return output;
  }
);
