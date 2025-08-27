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
    mislabeling: z.boolean().describe('Whether the video is mislabeled.'),
    videoManipulation: z.boolean().describe('Whether the video has been manipulated.'),
    satireParody: z.boolean().describe('Whether the video is satire or parody.'),
    syntheticVoice: z.boolean().describe('Whether the video contains a synthetic voice.'),
    fullyAiGenerated: z.boolean().describe('Whether the video is fully AI-generated.'),
    confidenceScore: z.number().describe('The confidence score of the analysis.'),
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

You will analyze the video and determine if it is a deepfake, mislabeled, manipulated, satire/parody, contains a synthetic voice, or is fully AI-generated.

Analyze the following video:
{{media url=videoDataUri}}

Provide a confidence score for your analysis.
Write a short summary of your analysis.
`,
});

const videoIntegrityFlow = ai.defineFlow(
  {
    name: 'videoIntegrityFlow',
    inputSchema: VideoIntegrityInputSchema,
    outputSchema: VideoIntegrityOutputSchema,
  },
  async input => {
    if (!input.videoDataUri) {
         return {
            analysis: {
                deepfake: false,
                mislabeling: false,
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
  }
);
