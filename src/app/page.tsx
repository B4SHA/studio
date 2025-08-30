
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Icons } from '@/components/icons';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: <Icons.news className="h-8 w-8 text-primary" />,
    title: 'News Sleuth',
    description: 'Analyze news articles from text, URLs, or headlines to uncover biases, assess credibility, and identify potential misinformation.',
    details: [
        'Input by article text, URL, or headline',
        'Generates a credibility score (0-100)',
        'Provides a final verdict (Likely Real/Fake)',
        'Identifies biases and flagged content',
        'Cites sources used for analysis'
    ],
    href: '/news-sleuth',
  },
  {
    icon: <Icons.video className="h-8 w-8 text-primary" />,
    title: 'Video Integrity',
    description: 'Scrutinize videos from file uploads to detect deepfakes, manipulations, and other signs of AI-generated content.',
    details: [
        'Accepts video file uploads (up to 50MB)',
        'Detects deepfakes and manipulations',
        'Identifies fully AI-generated video',
        'Checks for synthetic voices',
        'Provides a confidence score for the analysis'
    ],
    href: '/video-integrity',
  },
  {
    icon: <Icons.audio className="h-8 w-8 text-primary" />,
    title: 'Audio Authenticator',
    description: 'Examine audio clips to determine their authenticity, flagging potential AI voice generation or signs of tampering.',
    details: [
        'Accepts audio file uploads (up to 10MB)',
        'Determines authenticity (Likely Authentic/AI)',
        'Detects unnatural cadence and audio artifacts',
        'Provides a detailed report and confidence score',
        'Flags signs of audio tampering or cuts'
    ],
    href: '/audio-authenticator',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

export default function Home() {
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center">
        <motion.section 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="container text-center py-16 md:py-24"
        >
            <motion.h1
                variants={itemVariants}
                className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 bg-gradient-to-br from-primary via-orange-500 to-primary dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent"
            >
                Uncover the Truth
            </motion.h1>

            <motion.p
                variants={itemVariants}
                className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12"
            >
                Your AI-powered toolkit for analyzing news, video, and audio content. We help you navigate the digital world with confidence by detecting manipulation and verifying authenticity.
            </motion.p>
            
            <motion.div 
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {features.map((feature) => (
                <motion.div key={feature.title} variants={itemVariants}>
                  <Card className="h-full flex flex-col text-left shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="flex-row items-center gap-4">
                        {feature.icon}
                        <CardTitle className="text-2xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <p className="text-muted-foreground mb-6 flex-1">{feature.description}</p>
                      <ul className="space-y-3 mb-8">
                        {feature.details.map((detail) => (
                            <li key={detail} className="flex items-start gap-3 text-muted-foreground">
                                <CheckCircle className="h-5 w-5 text-primary/80 shrink-0 mt-0.5" />
                                <span className="text-sm">{detail}</span>
                            </li>
                        ))}
                      </ul>
                      <Link href={feature.href} className="mt-auto">
                        <Button className="w-full group">
                            Launch {feature.title} 
                            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

        </motion.section>
    </div>
  );
}
