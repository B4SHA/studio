# Veritas Vision

Veritas Vision is an AI-powered web application designed to help users critically analyze digital content. In an era of rampant misinformation, this toolkit provides a suite of analysis tools to detect manipulation, assess credibility, and uncover biases in news articles, videos, and audio clips.

Built with a modern tech stack, it leverages the power of Google's Gemini models through Genkit to deliver sophisticated, real-time content analysis.

## Tech Stack

This project is built on a foundation of powerful and modern technologies:

- **Framework**: **Next.js 15** (using the App Router)
- **Language**: **TypeScript**
- **UI Components**: **React**, **ShadCN UI**
- **Styling**: **Tailwind CSS**
- **Generative AI**: **Google's Gemini models** accessed via **Genkit**

## Core Features

The application is divided into three primary analysis tools:

### 1. News Sleuth

News Sleuth assesses the credibility of news articles to help users identify potential misinformation, biased reporting, and fake news.

- **How it Works**:
  - **Input**: Users can provide an article's full text, a URL, or just the headline.
  - **AI Model**: It uses the `gemini-1.5-flash` model.
  - **Process**:
    1.  If a URL is provided, the system first uses a server-side tool (`url-fetcher`) to scrape the article's text content.
    2.  The text is passed to the Gemini model with a specialized prompt that instructs it to act as an expert fake news analyst.
    3.  The AI analyzes the content for common markers of misinformation, such as sensationalist language, lack of credible sources, emotional manipulation, and logical fallacies.
  - **Output**: The tool generates a comprehensive **Credibility Report** containing:
    - An overall credibility score (0-100).
    - A final verdict (`Likely Real`, `Likely Fake`, `Uncertain`).
    - A summary and detailed reasoning for its assessment.

### 2. Video Integrity

Video Integrity scrutinizes video files to detect deepfakes, AI-generated content, and other forms of manipulation.

- **How it Works**:
  - **Input**: Users upload a video file (up to 50MB).
  - **AI Model**: This feature leverages a multimodal version of the `Gemini` model capable of processing video input.
  - **Process**:
    1.  The uploaded video is converted into a data URI and sent to the Genkit flow.
    2.  The AI model analyzes the video frame by frame, looking for visual and audio artifacts common in manipulated or synthetic media. This includes unnatural facial movements, visual inconsistencies, and audio that doesn't match the video.
  - **Output**: The **Analysis Report** includes:
    - A confidence score for the overall analysis.
    - A checklist of detected issues (e.g., `Deepfake`, `Video Manipulation`, `Synthetic Voice`).
    - A summary explaining the findings.

### 3. Audio Authenticator

Audio Authenticator examines audio clips to determine if they are authentic recordings or potential AI-generated forgeries.

- **How it Works**:
  - **Input**: Users upload an audio file (up to 10MB).
  - **AI Model**: Uses a multimodal version of the `Gemini` model capable of processing audio.
  - **Process**:
    1.  The uploaded audio is converted to a data URI.
    2.  The AI model analyzes the audio's waveform and characteristics. It is prompted to listen for signs of AI generation, such as unnatural cadence, lack of background noise, robotic artifacts, or abrupt cuts. It also looks for positive signs of authenticity, like natural speech patterns and consistent room tone.
  - **Output**: The **Analysis Report** provides:
    - A verdict (`Likely Authentic`, `Potential AI/Manipulation`, `Uncertain`).
    - A confidence score for the verdict.
    - A detailed report explaining the reasoning, which must be consistent with a final verdict.

## Getting Started

To run this project locally, you will need Node.js and npm installed.

### 1. Set Up Environment Variables

Create a file named `.env` in the project's root directory. You will need to get a Gemini API key.

- Go to [Google AI Studio](https://aistudio.google.com/) to create your API key.
- Add the key to your `.env` file:
```
GEMINI_API_KEY=YOUR_API_KEY_HERE
```

### 2. Enable the AI Service in Google Cloud

**THIS STEP IS CRUCIAL.** To avoid `403 Forbidden` errors, you must enable the necessary AI services in the Google Cloud project associated with your API key.

1.  **Find your Project:** When you create an API key, it is associated with a Google Cloud project. You can find this project in the [Google Cloud Console](https://console.cloud.google.com/).
2.  **Enable the API:**
    - Go to the **APIs & Services Dashboard** for your project.
    - Click **"+ ENABLE APIS AND SERVICES"**.
    - Search for and enable **both** of the following APIs:
        1. **Vertex AI API**
        2. **Generative Language API**
    - It is important to enable both to ensure all features work correctly.

It may take a few minutes for the services to become active after you enable them.

### 3. Understand and Manage API Rate Limits

**IMPORTANT**: If you see a `429 Too Many Requests` error, you have exceeded the free tier usage limits for the Gemini API. The free tier is very limited, especially for video analysis.

To fix this and ensure the application runs reliably, you **must enable billing** on your Google Cloud project.

1.  In the Google Cloud Console, navigate to the **Billing** section for your project.
2.  **Link a billing account.** Google often provides free credits for new accounts, which can cover initial usage.
3.  Enabling billing will move you to a "pay-as-you-go" plan with much higher usage limits, preventing rate limit errors.

### 4. Install Dependencies

Install the required npm packages:
```bash
npm install
```

### 5. Run the Development Server

Start the Next.js development server and the Genkit development server in parallel.

In one terminal, run the Next.js app:
```bash
npm run dev
```
This will start the frontend application, typically on `http://localhost:9002`.

In another terminal, run the Genkit flows:
```bash
npm run genkit:watch
```
This starts the Genkit development server, which allows your Next.js app to communicate with the AI models.

You can now access the application in your browser at the address provided by the `npm run dev` command.
