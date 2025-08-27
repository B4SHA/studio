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
  articleText: z.string().optional().describe('The text content of the news article to analyze.'),
  articleUrl: z.string().url().optional().describe('The URL of the news article to analyze.'),
  articleHeadline: z.string().optional().describe('The headline of the news article to analyze.'),
}).refine(data => data.articleText || data.articleUrl || data.articleHeadline, {
  message: 'One of article text, URL, or headline must be provided.',
});
export type NewsSleuthInput = z.infer<typeof NewsSleuthInputSchema>;

const NewsSleuthOutputSchema = z.object({
  credibilityReport: z.object({
    overallScore: z.number().describe('An overall credibility score for the article (0-100).'),
    verdict: z.enum(['Likely Real', 'Likely Fake', 'Uncertain']).describe('The final verdict on the news article\'s authenticity.'),
    summary: z.string().describe('A brief summary of the article content.'),
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

  Analyze the following news information for potential biases, low credibility content, and overall trustworthiness. Provide a detailed report including:
  1. An overall credibility score (0-100).
  2. A final verdict of 'Likely Real', 'Likely Fake', or 'Uncertain' based on your analysis.
  3. A brief summary of the article.
  4. A list of potential biases identified.
  5. Specific content flagged for low credibility.
  6. The reasoning behind your assessment.

  The user has provided one of the following: a news article's full text, its URL, or just its headline. Your analysis should be based on the provided information.

  {{#if articleText}}
  News Article Text:
  {{articleText}}
  {{/if}}

  {{#if articleUrl}}
  News Article URL:
  {{articleUrl}}
  {{/if}}

  {{#if articleHeadline}}
  News Article Headline:
  {{articleHeadline}}
  {{/if}}
  `,
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
