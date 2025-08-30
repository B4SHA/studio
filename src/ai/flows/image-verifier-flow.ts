
'use server';

/**
 * @fileOverview Flow for analyzing images to detect manipulation or AI generation.
 *
 * - imageVerifierAnalysis - Analyzes an image for authenticity.
 * - ImageVerifierInput - Input type for image analysis.
 * - ImageVerifierOutput - Output type for analysis results.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImageVerifierInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "The image to analyze, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ImageVerifierInput = z.infer<typeof ImageVerifierInputSchema>;

const ImageVerifierOutputSchema = z.object({
  verdict: z.enum(['Likely Authentic', 'Likely AI-Generated/Manipulated', 'Uncertain']).describe("The final verdict on the image's authenticity."),
  confidenceScore: z.number().min(0).max(100).describe('The confidence score for the verdict (0-100).'),
  isAiGenerated: z.boolean().describe('Whether the image is likely AI-generated.'),
  isManipulated: z.boolean().describe('Whether the image shows signs of manipulation (e.g., photoshop).'),
  report: z.string().describe('A detailed report of the analysis results, explaining the verdict.'),
  context: z.string().describe('Any available context about the image, such as its origin or subject matter. If no context can be found, this should state that none was available.')
});
export type ImageVerifierOutput = z.infer<typeof ImageVerifierOutputSchema>;

export async function imageVerifierAnalysis(
  input: ImageVerifierInput
): Promise<ImageVerifierOutput> {
  return imageVerifierFlow(input);
}

const prompt = ai.definePrompt({
  name: 'imageVerifierPrompt',
  input: {schema: ImageVerifierInputSchema},
  output: {schema: ImageVerifierOutputSchema},
  prompt: `You are an expert in digital image forensics, specializing in detecting AI-generated images and digital manipulation.

  Your task is to analyze the provided image to determine its authenticity.
  
  Characteristics of AI-generated or manipulated images may include:
  - Unnatural textures or details (e.g., skin, hair, backgrounds).
  - Inconsistent lighting, shadows, or reflections.
  - Anatomical impossibilities (e.g., extra fingers, strange proportions).
  - Warping or artifacts around edited areas.
  - Lack of fine detail expected in a real photograph.

  Based on your analysis, you will:
  1. Determine if the image is 'Likely AI-Generated/Manipulated', 'Likely Authentic', or 'Uncertain'.
  2. Provide a confidence score (0-100) for your verdict.
  3. Explicitly set 'isAiGenerated' and 'isManipulated' booleans.
  4. Provide a detailed 'report' justifying your verdict, citing specific visual evidence.
  5. Use your internal knowledge and reverse-image-search capabilities to find context for the image. In the 'context' field, describe what the image depicts (e.g., "A photo of the Eiffel Tower at night") or state that no context could be found.

  Image for analysis: {{media url=imageDataUri}}`,
});

const imageVerifierFlow = ai.defineFlow(
  {
    name: 'imageVerifierFlow',
    inputSchema: ImageVerifierInputSchema,
    outputSchema: ImageVerifierOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      return output!;
    } catch (e: any) {
      console.error('Error during image analysis:', e);
      return {
        verdict: 'Uncertain',
        confidenceScore: 0,
        isAiGenerated: false,
        isManipulated: false,
        report: `An error occurred during analysis: ${e.message || 'Unknown error'}`,
        context: 'Context could not be determined due to an analysis error.'
      };
    }
  }
);
