
'use server';

/**
 * @fileOverview A video integrity analysis AI agent.
 *
 * - videoIntegrityAnalysis - A function that handles the video integrity analysis process.
 * - VideoIntegrityInput - The input type for the videoIntegrityAnalysis function.
 * - VideoIntegrityOutput - The return type for the videoIntegrityAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VideoIntegrityInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "A video, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    )
});

export type VideoIntegrityInput = z.infer<typeof VideoIntegrityInputSchema>;

const VideoIntegrityOutputSchema = z.object({
  analysis: z.object({
    deepfake: z.boolean().describe('Whether the video is a deepfake.'),
    misleadingContext: z.boolean().describe('Whether the video is presented in a misleading context (e.g. wrong time or place).'),
    videoManipulation: z.boolean().describe('Whether the video has been manipulated.'),
    satireParody: z.boolean().describe('Whether the video is satire or parody.'),
    syntheticVoice: z.boolean().describe('Whether the video contains a synthetic voice.'),
    fullyAiGenerated: z.boolean().describe('Whether the video is fully AI-generated.'),
    confidenceScore: z.number().min(0).max(100).describe('The confidence in the accuracy of the overall analysis, from 0 to 100.'),
    summary: z.string().describe('A summary of the analysis.'),
  }),
});
export type VideoIntegrityOutput = z.infer<typeof VideoIntegrityOutputSchema>;

export async function videoIntegrityAnalysis(input: VideoIntegrityInput): Promise<VideoIntegrityOutput> {
  return videoIntegrityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'videoIntegrityPrompt',
  input: {schema: VideoIntegrityInputSchema},
  output: {schema: VideoIntegrityOutputSchema},
  prompt: `You are an expert in detecting AI-generated and manipulated videos.

You will analyze the video and determine if it is a deepfake, used in a misleading context, manipulated, satire/parody, contains a synthetic voice, or is fully AI-generated.

Analyze the following video:
{{media url=videoDataUri}}

Provide a confidence score for your analysis. The confidence score should reflect how certain you are about your overall analysis. A high score (e.g., 95) means you are very sure of your findings, whether the video is real or fake.
Write a short summary of your analysis.
`,
  model: 'googleai/gemini-1.5-flash',
});

const videoIntegrityFlow = ai.defineFlow(
  {
    name: 'videoIntegrityFlow',
    inputSchema: VideoIntegrityInputSchema,
    outputSchema: VideoIntegrityOutputSchema,
  },
  async input => {
    try {
        if (!input.videoDataUri) {
             return {
                analysis: {
                    deepfake: false,
                    misleadingContext: false,
                    videoManipulation: false,
                    satireParody: false,
                    syntheticVoice: false,
                    fullyAiGenerated: false,
                    confidenceScore: 0,
                    summary: "No video data was provided for analysis.",
                }
            };
        }

        const {output} = await prompt({ videoDataUri: input.videoDataUri });
        return output!;
    } catch (e: any) {
        console.error('Error during video analysis:', e);
        return {
            analysis: {
                deepfake: false,
                misleadingContext: false,
                videoManipulation: false,
                satireParody: false,
                syntheticVoice: false,
                fullyAiGenerated: false,
                confidenceScore: 0,
                summary: `An error occurred during analysis: ${e.message || 'Unknown error'}. This may be due to a temporary issue with the AI service. Please try again later.`,
            }
        };
    }
  }
);
