
import { config } from 'dotenv';
config();

import '@/ai/flows/audio-authenticator-flow.ts';
import '@/ai/flows/video-integrity-flow.ts';
import '@/ai/flows/news-sleuth-flow.ts';
import '@/ai/flows/image-verifier-flow.ts';
import '@/services/url-fetcher.ts';
