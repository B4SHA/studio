
/**
 * @fileoverview This file is responsible for the initial setup of the Genkit environment.
 * It ensures that environment variables are loaded from the .env file before any other
 * AI-related modules are imported. This is critical to prevent race conditions where
 * plugins might be initialized before the necessary API keys are available.
 */
import 'dotenv/config';
import './genkit'; // This will now execute after dotenv has been configured.
