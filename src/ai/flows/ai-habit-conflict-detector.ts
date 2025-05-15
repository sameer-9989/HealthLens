
'use server';
/**
 * @fileOverview An AI agent that detects potential conflicts in user's health habits or routines.
 *
 * - detectHabitConflicts - A function that analyzes habits for conflicts.
 * - DetectHabitConflictsInput - The input type for the detectHabitConflicts function.
 * - DetectHabitConflictsOutput - The return type for the detectHabitConflicts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectHabitConflictsInputSchema = z.object({
  habitsDescription: z.string().min(10).describe("A description of the user's current habits, routine, or specific habits they want to combine. E.g., 'I want to try intermittent fasting while also training for a marathon.', 'My daily routine includes intense morning workouts and only 2 meals a day.'"),
  healthConditions: z.string().optional().describe("Optional: Any known health conditions of the user, e.g., 'hypertension', 'diabetes type 2', 'recovering from injury'. This helps in providing more relevant conflict analysis."),
});
export type DetectHabitConflictsInput = z.infer<typeof DetectHabitConflictsInputSchema>;

const DetectHabitConflictsOutputSchema = z.object({
  conflictAnalysis: z.string().describe("The AI's detailed analysis of potential conflicts, risks, or contraindications based on the described habits and any health conditions. Explains why certain combinations might be harmful or suboptimal."),
  positiveSynergies: z.string().optional().describe("If applicable, any positive synergies or benefits of the described habit combinations, assuming they are generally safe."),
  recommendations: z.string().describe("Actionable recommendations for safer alternatives, modifications to the routine, or things to monitor. Should emphasize consulting a professional."),
  youtubeSearchQuery: z.string().describe("A concise YouTube search query to find educational videos explaining why certain routine combinations might be harmful or beneficial (e.g., 'risks of fasting with hypertension exercise', 'combining keto and endurance training')."),
  imageHintDiagram: z.string().max(30).describe("A 1-3 word hint for a diagram or infographic illustrating healthy vs. conflicting routines or the impact of habits (e.g., 'habit synergy chart', 'conflicting routines graphic'). This will be used for data-ai-hint."),
});
export type DetectHabitConflictsOutput = z.infer<typeof DetectHabitConflictsOutputSchema>;

export async function detectHabitConflicts(input: DetectHabitConflictsInput): Promise<DetectHabitConflictsOutput> {
  return detectHabitConflictsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectHabitConflictsPrompt',
  input: {schema: DetectHabitConflictsInputSchema},
  output: {schema: DetectHabitConflictsOutputSchema},
  prompt: `You are an AI Health Routine Analyst. Your goal is to identify potential conflicts, risks, or contraindications in a user's described health habits or routines, especially in combination or in the context of specific health conditions.

User's habits/routine description: "{{habitsDescription}}"
{{#if healthConditions}}User's known health conditions: "{{healthConditions}}"{{/if}}

Instructions:
1.  Analyze the 'habitsDescription' and any 'healthConditions'.
2.  Provide a 'conflictAnalysis': Detail potential negative interactions, risks (e.g., nutrient deficiencies, overtraining, blood sugar issues), or reasons why the combination might be inadvisable, especially considering any stated health conditions.
3.  If there are clear positive synergies and the combination is generally safe, briefly mention them in 'positiveSynergies'. Otherwise, this can be omitted or state "No clear positive synergies noted without professional guidance."
4.  Offer 'recommendations': Suggest safer alternatives, modifications, aspects to discuss with a healthcare professional or dietitian, or key things to monitor if attempting the routine.
5.  Generate a 'youtubeSearchQuery' (max 5 words) for educational videos on the risks or benefits of such habit combinations or related health advice.
6.  Provide an 'imageHintDiagram' (1-3 words) for a conceptual diagram illustrating healthy vs. conflicting routines or the physiological impact (e.g., "balanced routine chart", "stress impact diagram").

Example for habitsDescription "Intermittent fasting with intense daily marathon training" and healthConditions "None stated":
conflictAnalysis: "Combining intermittent fasting with intense daily marathon training can be challenging. Potential risks include insufficient energy for workouts, muscle loss if protein intake isn't carefully managed within eating windows, and difficulty in recovery. Nutrient timing becomes critical."
positiveSynergies: "Some athletes explore fasted training for metabolic adaptations, but this requires careful planning and is not suitable for everyone."
recommendations: "Consider modifying the intensity or frequency of training, ensuring adequate calorie and nutrient intake during eating windows, and prioritizing recovery. Consulting a sports dietitian is highly recommended to tailor a plan that supports both goals safely. Monitor energy levels, performance, and recovery closely."
youtubeSearchQuery: "intermittent fasting marathon training risks"
imageHintDiagram: "energy balance chart"

Strictly follow the JSON output schema.
Crucially, ALWAYS end your 'recommendations' or 'conflictAnalysis' with a strong disclaimer: "This analysis is for informational purposes only and not medical or nutritional advice. Consult with a doctor, registered dietitian, or other qualified healthcare professional before making significant changes to your diet or exercise routine, especially if you have any health conditions."
`,
});

const detectHabitConflictsFlow = ai.defineFlow(
  {
    name: 'detectHabitConflictsFlow',
    inputSchema: DetectHabitConflictsInputSchema,
    outputSchema: DetectHabitConflictsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('AI Habit Conflict Detector failed to produce an output.');
    }
    const disclaimer = " This analysis is for informational purposes only and not medical or nutritional advice. Consult with a doctor, registered dietitian, or other qualified healthcare professional before making significant changes to your diet or exercise routine, especially if you have any health conditions.";
    if (!output.recommendations.toLowerCase().includes("medical advice") && !output.recommendations.toLowerCase().includes("healthcare professional")) {
        output.recommendations += disclaimer;
    } else if (!output.conflictAnalysis.toLowerCase().includes("medical advice") && !output.conflictAnalysis.toLowerCase().includes("healthcare professional")) {
         output.conflictAnalysis += disclaimer;
    }
    return output;
  }
);
