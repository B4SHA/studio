
'use server';

/**
 * @fileOverview Flow for analyzing audio clips to detect manipulation or AI generation.
 *
 * - audioAuthenticatorAnalysis - Analyzes audio for authenticity.
 * - AudioAuthenticatorInput - Input type for audio analysis.
 * - AudioAuthenticatorOutput - Output type for analysis results.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AudioAuthenticatorInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "The audio clip to analyze, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AudioAuthenticatorInput = z.infer<typeof AudioAuthenticatorInputSchema>;

const AudioAuthenticatorOutputSchema = z.object({
  verdict: z.enum(['Likely Authentic', 'Potential AI/Manipulation', 'Uncertain']).describe("The final verdict on the audio's authenticity."),
  confidenceScore: z.number().min(0).max(100).describe('The confidence score for the verdict (0-100).'),
  report: z.string().describe('A detailed report of the analysis results, explaining the verdict and considering if the content could be misleading.'),
});
export type AudioAuthenticatorOutput = z.infer<typeof AudioAuthenticatorOutputSchema>;

export async function audioAuthenticatorAnalysis(
  input: AudioAuthenticatorInput
): Promise<AudioAuthenticatorOutput> {
  return audioAuthenticatorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'audioAuthenticatorPrompt',
  input: {schema: AudioAuthenticatorInputSchema},
  output: {schema: AudioAuthenticatorOutputSchema},
  prompt: `You are an expert in audio forensics and AI-generated content detection.

  Your task is to analyze the provided audio clip to determine if it has been manipulated or is AI-generated.
  
  Characteristics of authentic audio may include:
  - Natural speech patterns, including "ums", "ahs", and pauses.
  - Consistent background noise or room ambiance.
  - Natural emotional intonation and pitch variation.

  Characteristics of AI-generated or manipulated audio may include:
  - Unnatural cadence or rhythm.
  - Lack of typical background noise or sterile silence between words.
  - Metallic or robotic artifacts in the voice.
  - Abrupt cuts or changes in audio quality.

  Based on your analysis, you will provide a final verdict ('Likely Authentic', 'Potential AI/Manipulation', or 'Uncertain') and a confidence score for that verdict.

  You must also provide a detailed report explaining your reasoning. The report MUST justify the verdict you have chosen, citing specific audio characteristics that support your conclusion.
  
  CRITICAL: In your report, also consider the content of what is being said. Even if the audio is authentic, briefly mention if the content is of a nature that could be easily taken out of context or used to spread misinformation. Ensure there is no contradiction between the verdict and the report.

  Audio: {{media url=audioDataUri}}`,
});

const audioAuthenticatorFlow = ai.defineFlow(
  {
    name: 'audioAuthenticatorFlow',
    inputSchema: AudioAuthenticatorInputSchema,
    outputSchema: AudioAuthenticatorOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      return output!;
    } catch (e: any) {
      console.error('Error during audio analysis:', e);
      return {
        verdict: 'Uncertain',
        confidenceScore: 0,
        report: `An error occurred during analysis: ${e.message || 'Unknown error'}`,
      };
    }
  }
);
