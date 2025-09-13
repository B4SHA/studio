
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
import type { Stream } from 'stream';

const VideoIntegrityInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "A video, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ).optional(),
  videoUrl: z.string().url().optional().describe('The URL of the video file to analyze.'),
}).refine(data => data.videoDataUri || data.videoUrl, {
  message: 'Either a video file or a URL must be provided.',
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
    audioTextAnalysis: z.object({
      detectedText: z.string().optional().describe('The text transcribed from the video\'s audio track. Omitted if no speech is found.'),
      analysis: z.string().optional().describe('An analysis of the transcribed text for misinformation or fake news. Omitted if no speech is found.'),
    }).optional().describe('An analysis of any speech found within the video\'s audio.'),
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
  prompt: `You are a multi-disciplinary expert in digital forensics, combining video analysis with audio and text investigation.

  Your task is to perform a two-part analysis on the provided video.

  **Part 1: Visual and Audio Forensics**
  Analyze the video for authenticity. You will determine if it is a deepfake, used in a misleading context, manipulated, satire/parody, contains a synthetic voice, or is fully AI-generated.
  
  **Visual Analysis:**
  - Look for visual artifacts, unnatural movements, inconsistent lighting, and other signs of manipulation.
  
  **Audio Analysis (CRITICAL for Synthetic Voice Detection):**
  - Listen for audio artifacts that suggest a synthetic voice. Pay extremely close attention to:
    - **Cadence and Intonation:** Is the speech pattern unnatural, too perfect, or lacking normal human emotion?
    - **Background Noise:** Is the audio unnaturally sterile or clean, lacking the subtle ambient sounds of a real recording?
    - **Digital Artifacts:** Are there any slight robotic tones, distortions, or unusual frequencies?
    - **Breathing and Pauses:** Are breaths non-existent or do they sound unnatural?
  
  **Contextual Analysis:**
  - Use your internal knowledge to determine if the video is being presented in a misleading context (e.g., wrong time or place).
  - Provide a confidence score for your overall analysis. The confidence score should reflect how certain you are about your findings, whether the video is real or fake.
  - Write a short summary of your forensic analysis. Your summary MUST be consistent with your findings (e.g., if 'syntheticVoice' is true, do not describe the audio as "natural-sounding").

  **Part 2: Spoken Text Analysis (If Applicable)**
  CRITICAL: Listen to the audio track of the video to determine if it contains any discernible speech.
  - If NO speech is detected, omit the 'audioTextAnalysis' field from your output.
  - If speech IS detected, you MUST:
    a. Populate 'audioTextAnalysis.detectedText' with the full transcription of the speech.
    b. Switch roles to a fake news analyst. Scrutinize the transcribed text. Does it contain misinformation, conspiracy theories, or manipulative language?
    c. Populate 'audioTextAnalysis.analysis' with a detailed report of your findings about the spoken content, explaining why it might be credible, fake, or misleading.

  Analyze the following video:
  {{media url=videoDataUri}}
  `,
  model: 'googleai/gemini-1.5-pro',
});

async function streamToBuffer(stream: Stream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(chunk as Buffer));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

const videoIntegrityFlow = ai.defineFlow(
  {
    name: 'videoIntegrityFlow',
    inputSchema: VideoIntegrityInputSchema,
    outputSchema: VideoIntegrityOutputSchema,
  },
  async input => {
    try {
        let videoDataUri = input.videoDataUri;
        
        if (input.videoUrl) {
            if (ytdl.validateURL(input.videoUrl)) {
              const stream = ytdl(input.videoUrl, { filter: 'audioandvideo', quality: 'lowest' });
              const buffer = await streamToBuffer(stream);
              videoDataUri = `data:video/mp4;base64,${buffer.toString('base64')}`;
            } else {
              const response = await fetch(input.videoUrl);
              if (!response.ok) {
                  throw new Error(`Failed to fetch video from URL: ${response.statusText}`);
              }
              const contentType = response.headers.get('content-type') || 'video/mp4';
              const buffer = await response.arrayBuffer();
              const base64 = Buffer.from(buffer).toString('base64');
              videoDataUri = `data:${contentType};base64,${base64}`;
            }
        }

        if (!videoDataUri) {
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

        const {output} = await prompt({ videoDataUri });
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
