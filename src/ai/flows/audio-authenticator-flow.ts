
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
  textAnalysis: z.object({
    detectedText: z.string().optional().describe('The text transcribed from the audio clip. If no speech is found, this should be omitted.'),
    analysis: z.string().optional().describe('An analysis of the transcribed text for misinformation or misleading context. Omitted if no speech is found.'),
  }).optional().describe('An analysis of any speech found within the audio clip.'),
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
  prompt: `You are an expert in digital forensics with two specialties: audio analysis and misinformation detection.

  Your task is to perform a two-part analysis on the provided audio clip.
  
  **Part 1: Audio Forensics**
  Analyze the audio clip's technical properties to determine if it is authentic or has been manipulated or AI-generated.
  - Characteristics of authentic audio: Natural speech patterns, consistent background noise, natural emotional intonation.
  - Characteristics of manipulated/AI audio: Unnatural cadence, sterile silence, robotic artifacts, abrupt cuts.
  - Based on this, provide a 'verdict' ('Likely Authentic', 'Potential AI/Manipulation', or 'Uncertain'), a 'confidenceScore' for the verdict, and a detailed 'report' explaining your reasoning.

  **Part 2: Content and Speech Analysis**
  CRITICAL: Listen to the content of the audio to determine if there is any discernible speech.
  - If NO speech is detected (e.g., it is just music, noise, or silence), omit the 'textAnalysis' field entirely from your output.
  - If speech IS detected, you MUST:
    a. Populate 'textAnalysis.detectedText' with the full transcription of the speech.
    b. Switch roles to a misinformation analyst. Scrutinize the transcribed text. Is it being used in a misleading context? Could the content, even if authentically spoken, be used to spread misinformation (e.g., quoting song lyrics as a real statement, satire presented as fact)?
    c. Populate 'textAnalysis.analysis' with your detailed analysis of the spoken content.

  Ensure your final 'report' from Part 1 is consistent with your findings from both parts.

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
