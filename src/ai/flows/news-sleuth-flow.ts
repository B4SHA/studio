'use server';

/**
 * @fileOverview A fake news detection AI agent.
 *
 * - newsSleuthAnalysis - A function that handles the news analysis process.
 * - NewsSleuthInput - The input type for the newsSleuthAnalysis function.
 * - NewsSleuthOutput - The return type for the newsSleuthAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NewsSleuthInputSchema = z.object({
  articleText: z.string().describe('The text content of the news article to analyze.'),
});
export type NewsSleuthInput = z.infer<typeof NewsSleuthInputSchema>;

const NewsSleuthOutputSchema = z.object({
  credibilityReport: z.object({
    overallScore: z.number().describe('An overall credibility score for the article (0-100).'),
    biases: z.array(z.string()).describe('A list of potential biases identified in the article.'),
    flaggedContent: z.array(z.string()).describe('Specific content flagged for low credibility.'),
    reasoning: z.string().describe('The reasoning behind the credibility assessment.'),
  }),
});
export type NewsSleuthOutput = z.infer<typeof NewsSleuthOutputSchema>;

export async function newsSleuthAnalysis(input: NewsSleuthInput): Promise<NewsSleuthOutput> {
  return newsSleuthFlow(input);
}

const prompt = ai.definePrompt({
  name: 'newsSleuthPrompt',
  input: {schema: NewsSleuthInputSchema},
  output: {schema: NewsSleuthOutputSchema},
  prompt: `You are an expert in identifying fake news and assessing the credibility of news articles.

  Analyze the following news article for potential biases, low credibility content, and overall trustworthiness. Provide a detailed report including an overall credibility score (0-100), a list of potential biases identified, specific content flagged for low credibility, and the reasoning behind your assessment.

  News Article:
  {{articleText}}`,
});

const newsSleuthFlow = ai.defineFlow(
  {
    name: 'newsSleuthFlow',
    inputSchema: NewsSleuthInputSchema,
    outputSchema: NewsSleuthOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
