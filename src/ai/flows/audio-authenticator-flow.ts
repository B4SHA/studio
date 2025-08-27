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
import wav from 'wav';

const AudioAuthenticatorInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      'The audio clip to analyze, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // shorter description
    ),
});
export type AudioAuthenticatorInput = z.infer<typeof AudioAuthenticatorInputSchema>;

const AudioAuthenticatorOutputSchema = z.object({
  isAuthentic: z.boolean().describe('Whether the audio is likely authentic.'),
  report: z.string().describe('A detailed report of the analysis results.'),
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

  Analyze the provided audio clip and determine if it has been manipulated or if it is AI-generated.
  Provide a detailed report including the likelihood of authenticity and the reasons for your determination.

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
        isAuthentic: false,
        report: `An error occurred during analysis: ${e.message || 'Unknown error'}`,
      };
    }
  }
);
