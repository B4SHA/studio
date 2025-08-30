
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';

const features = [
  {
    Icon: Icons.news,
    title: 'News Sleuth',
    description: 'Combat misinformation by analyzing news articles. Provide a URL, text, or just a headline, and our AI will generate a comprehensive credibility report to help you distinguish fact from fiction.',
    featureList: [
      'Multi-Format Analysis: Accepts article text, URLs, or just headlines for flexible analysis.',
      'Credibility Score: Receive a clear, data-driven credibility score from 0-100.',
      'Source Verification: Uncovers biases and lists the sources consulted for its analysis.',
    ],
    href: '/news-sleuth',
  },
  {
    Icon: Icons.video,
    title: 'Video Integrity',
    description: "In the age of deepfakes, seeing isn't always believing. Upload a video, and our tool will perform a deep analysis to detect signs of manipulation, giving you a confidence score on its authenticity.",
    featureList: [
      'Deepfake Detection: Identifies common artifacts of AI-generated or manipulated video.',
      'Frame-by-Frame Scrutiny: Analyzes video for visual inconsistencies and manipulation.',
      'Audio-Visual Sync: Detects synthetic voices and audio that doesn\'t match the visuals.',
    ],
    href: '/video-integrity',
  },
  {
    Icon: Icons.audio,
    title: 'Audio Authenticator',
    description: 'Is that recording real or AI-generated? Upload an audio clip, and our authenticator will scrutinize it for tell-tale signs of artificial generation or manipulation.',
    featureList: [
      'AI Voice Detection: Listens for robotic artifacts and unnatural speech patterns.',
      'Authenticity Verdict: Delivers a clear verdict on whether the audio is authentic or likely manipulated.',
      'Detailed Reporting: Provides a comprehensive report explaining the findings.',
    ],
    href: '/audio-authenticator',
  },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: "easeOut" } 
  },
};

export default function Home() {
  return (
    <div className="w-full flex-1 flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full min-h-screen flex flex-col items-center justify-center text-center relative p-4">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-gradient-to-br from-primary via-orange-500 to-primary dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
              Uncover the Truth
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Your essential AI-powered toolkit for critically analyzing news, video, and audio content. In an age of digital noise, Veritas Vision helps you navigate the online world with confidence by detecting manipulation, verifying authenticity, and uncovering hidden biases.
            </p>
          </motion.div>
        </div>
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-10"
        >
            <ChevronDown className="h-8 w-8 text-muted-foreground animate-bounce" />
        </motion.div>
      </section>

      {/* Feature Sections */}
      {features.map((feature, index) => (
        <motion.section
          key={feature.title}
          className="w-full min-h-screen flex items-center justify-center py-16 md:py-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12">
              <div className={cn("flex justify-center", index % 2 === 1 && "md:order-last")}>
                <feature.Icon className="w-48 h-48 md:w-64 md:h-64 text-primary" />
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">{feature.title}</h2>
                <p className="text-lg text-muted-foreground mb-6">{feature.description}</p>
                <ul className="space-y-3 text-left mb-8">
                  {feature.featureList.map((item, i) => (
                     <li key={i} className="flex items-start">
                        <Icons.checkCircle className="h-5 w-5 text-primary mr-3 mt-1 shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                     </li>
                  ))}
                </ul>
                <Link href={feature.href}>
                  <Button size="lg" className="group text-lg">
                    Launch {feature.title}
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.section>
      ))}
    </div>
  );
}
