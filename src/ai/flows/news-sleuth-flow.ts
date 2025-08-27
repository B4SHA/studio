
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
  }),
});
export type NewsSleuthOutput = z.infer<typeof NewsSleuthOutputSchema>;

export async function newsSleuthAnalysis(input: NewsSleuthInput): Promise<NewsSleuthOutput> {
  return newsSleuthFlow(input);
}

const fetcherTool = ai.defineTool(
  {
    name: 'getArticleContentFromUrl',
    description: 'Fetches the text content of a news article from a given URL. Use this tool if the user provides a URL.',
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
  6. The reasoning behind your assessment, explicitly mentioning the sources you consulted during your analysis.
  
  IMPORTANT: The current date is {{currentDate}}. Use this as your reference point for any temporal analysis.

  The user has provided one of the following: the full text of a news article, its URL, or just its headline.

  - If the user provides a URL, you MUST use the 'getArticleContentFromUrl' tool to fetch the article's text content first. Then, use your search capabilities to analyze the fetched content.
  - If the tool returns an error, explain to the user that you were unable to retrieve the content from the URL and that they should try pasting the article text directly. In this case, set the verdict to 'Uncertain' and the score to 0.
  - If the user provides ONLY a headline or article text, you MUST use your internal search and reasoning capabilities to find corroborating information, verify claims, and check the reputation of the sources involved. Your reasoning must state that the analysis is based on public information and cite the sources you found.
  - If you can't find any information on the headline or text, explain that and set the verdict to 'Uncertain'.
  - Your analysis should be based on a comprehensive evaluation of the provided information and what you can verify from other online sources.

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
    const toolRequest = llmResponse.toolRequests.find(
      (req) => req.tool.name === 'getArticleContentFromUrl'
    );

    if (toolRequest) {
      const toolResponse = await toolRequest.run();
      const articleContent = (toolResponse as any).textContent;
      const fetchError = (toolResponse as any).error;

      if (fetchError || !articleContent) {
        return {
          credibilityReport: {
            overallScore: 0,
            verdict: 'Uncertain',
            summary: 'Could not analyze the article.',
            biases: [],
            flaggedContent: [],
            reasoning: `I was unable to retrieve the content from the provided URL. The website may be blocking automated access, or the URL may be incorrect. Please try copying and pasting the article text directly for analysis. Error: ${fetchError || 'Could not extract article text.'}`,
          },
        };
      }
      
      const finalInput = { ...input, articleText: articleContent, currentDate };
      const finalResponse = await prompt(finalInput);
      return finalResponse.output!;

    } else {
        return llmResponse.output!;
    }
  }
);
