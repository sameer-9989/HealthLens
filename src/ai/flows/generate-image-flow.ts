
'use server';
/**
 * @fileOverview An AI flow to generate images based on text prompts.
 *
 * - generateImage - A function that generates an image.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageInputSchema = z.object({
  prompt: z.string().min(5).describe('A descriptive text prompt for image generation.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageDataUri: z.string().describe('The generated image as a data URI (base64 encoded).'),
  revisedPrompt: z.string().optional().describe('The prompt that was actually used by the model, if revised.'),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  return generateImageFlow(input);
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async (input) => {
    try {
      const {media, promptFeedback} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp',
        prompt: input.prompt,
        config: {
          responseModalities: ['TEXT', 'IMAGE'], // Must provide both
        },
      });

      if (media && media.url) {
        return {
          imageDataUri: media.url, // This will be the data URI string
          revisedPrompt: promptFeedback?.prompt,
        };
      } else {
        throw new Error('Image generation did not return media URL.');
      }
    } catch (error) {
      console.error('Error in generateImageFlow:', error);
      // Check if the error is a Genkit specific error with more details
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during image generation.';
      if ((error as any)?.cause?.message) {
         // For Genkit errors that might wrap API errors
        throw new Error(`Image generation failed: ${(error as any).cause.message}`);
      }
      throw new Error(`Image generation failed: ${errorMessage}`);
    }
  }
);
