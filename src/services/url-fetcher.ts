/**
 * @fileOverview A service to fetch and extract the main content from a URL.
 */
'use server';

import {JSDOM} from 'jsdom';

export async function getArticleContentFromUrl(url: string): Promise<{textContent: string; error?: string}> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      return {textContent: '', error: `Failed to fetch URL: ${response.status} ${response.statusText}`};
    }

    const html = await response.text();
    const dom = new JSDOM(html, {url});
    const document = dom.window.document;

    // Remove common clutter
    ['script', 'style', 'nav', 'header', 'footer', 'aside'].forEach(selector => {
      document.querySelectorAll(selector).forEach(el => el.remove());
    });

    // A simple heuristic: find the element with the most <p> tags, likely the main content.
    let mainContentElement: HTMLElement | null = null;
    let maxParagraphs = 0;

    document.body.querySelectorAll('div, main, article, section').forEach(container => {
      const paragraphCount = container.querySelectorAll('p').length;
      if (paragraphCount > maxParagraphs) {
        maxParagraphs = paragraphCount;
        mainContentElement = container as HTMLElement;
      }
    });

    // Fallback to body if no better element is found
    if (!mainContentElement || maxParagraphs < 2) {
      mainContentElement = document.body;
    }
    
    let textContent = mainContentElement.textContent || '';
    
    // Clean up the text
    textContent = textContent.replace(/\s\s+/g, ' ').replace(/\n\s*\n/g, '\n').trim();

    if (textContent.length < 200) { // Check if content seems too short
        textContent = document.body.textContent || '';
        textContent = textContent.replace(/\s\s+/g, ' ').replace(/\n\s*\n/g, '\n').trim();
    }

    if (!textContent) {
        return {textContent: '', error: 'Could not extract meaningful text content from the page.'};
    }

    return {textContent};
  } catch (error: any) {
    console.error('Error fetching URL content:', error);
    return {textContent: '', error: `An unexpected error occurred: ${error.message}`};
  }
}
