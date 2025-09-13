
'use server';

/**
 * @fileOverview Flow for analyzing images to detect manipulation or AI generation, and to analyze any text within the image.
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
    ).optional(),
  imageUrl: z.string().url().optional().describe('The URL of the image file to analyze.'),
}).refine(data => data.imageDataUri || data.imageUrl, {
  message: 'Either an image file or a URL must be provided.',
});
export type ImageVerifierInput = z.infer<typeof ImageVerifierInputSchema>;

const ImageVerifierOutputSchema = z.object({
  verdict: z.enum(['Likely Authentic', 'Likely AI-Generated/Manipulated', 'Uncertain']).describe("The final verdict on the image's authenticity."),
  confidenceScore: z.number().min(0).max(100).describe('The confidence score for the verdict (0-100).'),
  isAiGenerated: z.boolean().describe('Whether the image is likely AI-generated.'),
  isManipulated: z.boolean().describe('Whether the image shows signs of manipulation (e.g., photoshop).'),
  isMisleadingContext: z.boolean().describe('Whether the image, authentic or not, might be used in a misleading context (e.g. wrong time/place).'),
  report: z.string().describe('A detailed report of the analysis results, explaining the verdict.'),
  context: z.string().describe('Any available context about the image, such as its origin or subject matter. If no context can be found, this should state that none was available.'),
  textAnalysis: z.object({
    detectedText: z.string().optional().describe('The text detected within the image. If no text is found, this should be omitted.'),
    analysis: z.string().optional().describe('An analysis of the detected text for authenticity, misinformation, or fake news. Omitted if no text is found.'),
  }).optional().describe('An analysis of any text found within the image.'),
});
export type ImageVerifierOutput = z.infer<typeof ImageVerifierOutputSchema>;

export async function imageVerifierAnalysis(
  input: ImageVerifierInput
): Promise<ImageVerifierOutput> {
  return imageVerifierFlow(input);
}

const prompt = ai.definePrompt({
  name: 'imageVerifierPrompt',
  input: {schema: z.object({ imageDataUri: z.string() })},
  output: {schema: ImageVerifierOutputSchema},
  prompt: `You are a multi-disciplinary expert in digital forensics, combining the skills of an image analyst and a fake news investigator.

  Your task is to perform a two-part analysis on the provided image:
  
  **Part 1: Image Forensics**
  Analyze the image for authenticity. Look for signs of AI generation or digital manipulation.
  Characteristics of AI-generated or manipulated images may include:
  - Unnatural textures or details (e.g., skin, hair, backgrounds).
  - Inconsistent lighting, shadows, or reflections.
  - Anatomical impossibilities (e.g., extra fingers, strange proportions).
  - Warping or artifacts around edited areas.
  
  Based on the image forensics, you will:
  1. Determine if the image is 'Likely AI-Generated/Manipulated', 'Likely Authentic', or 'Uncertain'.
  2. Provide a confidence score (0-100) for your verdict.
  3. Explicitly set 'isAiGenerated' and 'isManipulated' booleans.
  4. Use your internal knowledge and reverse-image-search capabilities to find context for the image. In the 'context' field, describe what the image depicts (e.g., "A photo of the Eiffel Tower at night") or state that no context could be found.
  5. Based on the context, determine if the image could be used in a misleading way (e.g., an old photo presented as new, a photo from a different location, etc.). Set the 'isMisleadingContext' boolean accordingly.
  6. Provide a detailed 'report' justifying your forensics verdict and all your findings.

  **Part 2: Text Analysis (If Applicable)**
  CRITICAL: First, examine the image to see if it contains any significant text (e.g., a headline, a sign, a social media post screenshot).
  - If NO text is detected, omit the 'textAnalysis' field from your output.
  - If text IS detected, you MUST:
    a. Populate 'textAnalysis.detectedText' with the exact text you extracted from the image.
    b. Switch roles to a fake news analyst. Scrutinize the 'detectedText'. Is it a known fake news headline? Does it contain sensational language, logical fallacies, or misinformation?
    c. Populate 'textAnalysis.analysis' with a detailed report of your findings about the text, explaining why it might be authentic, fake, or misleading.

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
      let imageDataUri = input.imageDataUri;
      
      if (input.imageUrl) {
        const response = await fetch(input.imageUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch image from URL: ${response.statusText}`);
        }
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        imageDataUri = `data:${contentType};base64,${base64}`;
      }

      if (!imageDataUri) {
        throw new Error('No image data available for analysis.');
      }

      const {output} = await prompt({ imageDataUri });
      return output!;
    } catch (e: any) {
      console.error('Error during image analysis:', e);
      return {
        verdict: 'Uncertain',
        confidenceScore: 0,
        isAiGenerated: false,
        isManipulated: false,
        isMisleadingContext: false,
        report: `An error occurred during analysis: ${e.message || 'Unknown error'}`,
        context: 'Context could not be determined due to an analysis error.'
      };
    }
  }
);
