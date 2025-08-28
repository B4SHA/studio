
'use server';

/**
 * @fileOverview A fake news detection AI agent.
 *
 * - newsSleuthAnalysis - A function that handles the news analysis process.
 * - NewsSleuthInput - The input type for the newsSleuthAnalysis function.
 * - NewsSleuthOutput - The return type for the newsSleuthAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {getArticleContentFromUrl} from '@/services/url-fetcher';
import {z} from 'genkit';

const NewsSleuthInputObjectSchema = z.object({
  articleText: z.string().optional().describe('The text content of the news article to analyze.'),
  articleUrl: z.string().url().optional().describe('The URL of the news article to analyze.'),
  articleHeadline: z.string().optional().describe('The headline of the news article to analyze.'),
});

const NewsSleuthInputSchema = NewsSleuthInputObjectSchema.refine(
  data => data.articleText || data.articleUrl || data.articleHeadline, {
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
    sources: z.array(z.string().url()).describe('A list of URLs for the sources consulted during the analysis.'),
  }),
});
export type NewsSleuthOutput = z.infer<typeof NewsSleuthOutputSchema>;

export async function newsSleuthAnalysis(input: NewsSleuthInput): Promise<NewsSleuthOutput> {
  return newsSleuthFlow(input);
}

const fetcherTool = ai.defineTool(
  {
    name: 'getArticleContentFromUrl',
    description: 'Fetches the text content of a news article from a given URL. Use this tool ONLY when you have a specific articleUrl.',
    inputSchema: z.object({
      url: z.string().url().describe('The URL of the news article to fetch.'),
    }),
    outputSchema: z.object({
      textContent: z.string().describe('The extracted text content of the article.'),
      error: z.string().optional().describe('An error message if fetching failed.'),
    }),
  },
  async (input) => getArticleContentFromUrl(input.url)
);

const prompt = ai.definePrompt({
  name: 'newsSleuthPrompt',
  tools: [fetcherTool],
  input: {schema: NewsSleuthInputObjectSchema.extend({ currentDate: z.string() })},
  output: {schema: NewsSleuthOutputSchema},
  prompt: `You are an advanced reasoning engine, like Perplexity Sonar, with expertise in identifying fake news and assessing the credibility of news articles. Your primary function is to use your search and reasoning capabilities to analyze information in real-time.

  Your goal is to analyze news information for potential biases, low credibility content, and overall trustworthiness. Provide a detailed report including:
  1. An overall credibility score (0-100).
  2. A final verdict of 'Likely Real', 'Likely Fake', or 'Uncertain'.
  3. A brief summary of the article.
  4. A list of potential biases identified.
  5. Specific content flagged for low credibility.
  6. The reasoning behind your assessment, explicitly mentioning the sources you consulted.
  7. A list of 3-5 specific hyperlink URLs for the primary source articles you consulted to generate the report. DO NOT cite homepages like google.com or cnn.com; cite the actual news articles. If you cannot find any credible source URLs, you MUST return an empty array for the 'sources' field.

  IMPORTANT: The current date is {{currentDate}}. Use this as your reference point for any temporal analysis.

  The user has provided one of the following: the full text of a news article, its URL, or just its headline.

  - If the user provides a URL (articleUrl), you MUST use the 'getArticleContentFromUrl' tool to fetch the article's text content first. Then, perform your analysis on the fetched content.
  - If the user provides ONLY a headline (articleHeadline), your FIRST step is to use your internal search capabilities to find a credible URL for a news article that matches the headline. Then, you MUST use the 'getArticleContentFromUrl' tool with that URL to get the article text. All subsequent analysis MUST be based on the text returned by the tool. If the tool returns an error, try to find a different URL and use the tool again. If multiple attempts fail, set the verdict to 'Uncertain' and the score to 0.
  - If the user provides only the article text, you must use your own internal web search and reasoning capabilities to find corroborating information and real news articles to verify the content.

  {{#if articleText}}
  News Article Text:
  {{articleText}}
  {{/if}}

  {{#if articleUrl}}
  News Article URL to analyze:
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
  async (input) => {
    const currentDate = new Date().toDateString();
    const inputWithDate = { ...input, currentDate };

    const llmResponse = await prompt(inputWithDate);
    
    return llmResponse.output!;
  }
);
