/**
 * @fileOverview A service to download video content from a URL using an external API.
 */
'use server';

export async function downloadVideoFromUrl(
  url: string
): Promise<{ videoDataUri?: string; error?: string }> {
  const apiKey = process.env.RAPIDAPI_KEY;

  if (!apiKey) {
    return {
      error:
        'Video download service is not configured. The RAPIDAPI_KEY is missing.',
    };
  }

  const apiUrl = `https://all-in-one-media-downloader-api.p.rapidapi.com/download?url=${encodeURIComponent(url)}`;
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host':
        'all-in-one-media-downloader-api.p.rapidapi.com',
    },
  };

  try {
    // First, get the direct video link from the downloader API
    const apiResponse = await fetch(apiUrl, options);
    if (!apiResponse.ok) {
      const errorBody = await apiResponse.text();
      console.error('RapidAPI Error:', errorBody);
      return {
        error: `Failed to get video download link from API: ${apiResponse.statusText}`,
      };
    }

    const jsonResponse = await apiResponse.json();
    const videoDownloadUrl = jsonResponse.medias?.[0]?.url;

    if (!videoDownloadUrl) {
        console.error('API Response missing downloadUrl:', jsonResponse);
        return {
            error: 'The API did not return a valid download URL. The URL might be unsupported or the API response format may have changed.',
        };
    }

    // Now, fetch the actual video content from the direct link
    const videoResponse = await fetch(videoDownloadUrl);
    if (!videoResponse.ok) {
      return {
        error: `Failed to download video content: ${videoResponse.statusText}`,
      };
    }

    const contentType =
      videoResponse.headers.get('content-type') || 'video/mp4';
    const buffer = await videoResponse.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const videoDataUri = `data:${contentType};base64,${base64}`;

    return { videoDataUri };
  } catch (error: any) {
    console.error('Error in video download service:', error);
    return { error: `An unexpected error occurred: ${error.message}` };
  }
}
