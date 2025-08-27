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
import ytdl from 'ytdl-core';

const VideoIntegrityInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "A video, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ).optional(),
  videoUrl: z.string().url().describe('The URL of the video to analyze.').optional(),
}).refine(data => data.videoDataUri || data.videoUrl, {
    message: 'Either a video file or a video URL must be provided.',
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
  input: {schema: z.object({ videoDataUri: z.string() })},
  output: {schema: VideoIntegrityOutputSchema},
  prompt: `You are an expert in detecting AI-generated and manipulated videos.

You will analyze the video and determine if it is a deepfake, mislabeled, manipulated, satire/parody, contains a synthetic voice, or is fully AI-generated.

Analyze the following video:
{{media url=videoDataUri}}

Provide a confidence score for your analysis.
Write a short summary of your analysis.
`,
});

// Helper to convert a stream to a base64 data URI
async function streamToDataUri(stream: NodeJS.ReadableStream, mimeType: string): Promise<string> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
        chunks.push(chunk as Buffer);
    }
    const buffer = Buffer.concat(chunks);
    return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

const videoIntegrityFlow = ai.defineFlow(
  {
    name: 'videoIntegrityFlow',
    inputSchema: VideoIntegrityInputSchema,
    outputSchema: VideoIntegrityOutputSchema,
  },
  async input => {
    let videoDataUri = input.videoDataUri;

    if (input.videoUrl && !input.videoDataUri) {
      try {
        if (!ytdl.validateURL(input.videoUrl)) {
            return {
                analysis: {
                    deepfake: false,
                    mislabeling: false,
                    videoManipulation: false,
                    satireParody: false,
                    syntheticVoice: false,
                    fullyAiGenerated: false,
                    confidenceScore: 0,
                    summary: `The provided URL is not a valid YouTube URL. Please provide a valid YouTube video link for analysis.`,
                }
            };
        }
        
        const videoInfo = await ytdl.getInfo(input.videoUrl);
        // A more robust way to select a format. Prioritize low-quality, video-only mp4 streams.
        const format = ytdl.chooseFormat(videoInfo.formats, { 
          quality: 'lowestvideo',
          filter: (format) => format.container === 'mp4' && !format.hasAudio,
        });
        
        if (!format) {
             return {
                analysis: {
                    deepfake: false,
                    mislabeling: false,
                    videoManipulation: false,
                    satireParody: false,
                    syntheticVoice: false,
                    fullyAiGenerated: false,
                    confidenceScore: 0,
                    summary: "Could not find a suitable video format to download from the provided URL. The video might be private, removed, or in an unsupported format.",
                }
            };
        }

        const videoStream = ytdl(input.videoUrl, { format: format });
        videoDataUri = await streamToDataUri(videoStream, format.mimeType || 'video/mp4');

      } catch (error: any) {
        console.error("Error processing video URL:", error);
        return {
            analysis: {
                deepfake: false,
                mislabeling: false,
                videoManipulation: false,
                satireParody: false,
                syntheticVoice: false,
                fullyAiGenerated: false,
                confidenceScore: 0,
                summary: `I was unable to process the video from the provided URL. Please make sure it's a valid, public YouTube link. The tool returned the following error: ${error.message}`,
            }
        };
      }
    }
    
    if (!videoDataUri) {
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

    const {output} = await prompt({ videoDataUri });
    return output!;
  }
);
