
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Icons } from '@/components/icons';
import { ArrowRight, CheckCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const features = [
  {
    icon: (
      <Image
        src="https://storage.googleapis.com/project-spark-b2489c64703a45c3b28b7e6f85191fce/users/75f31c89-b04d-4726-8c0a-71404c014a42/images/clvqun7h900043b6r8n5j8m93.png"
        alt="News Sleuth"
        width={500}
        height={500}
        className="rounded-lg shadow-2xl"
        data-ai-hint="news analysis"
      />
    ),
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
    icon: (
        <Image
            src="https://storage.googleapis.com/project-spark-b2489c64703a45c3b28b7e6f85191fce/users/75f31c89-b04d-4726-8c0a-71404c014a42/images/clvqun7ha00063b6rvt732jl4.png"
            alt="Video Integrity"
            width={500}
            height={500}
            className="rounded-lg shadow-2xl"
            data-ai-hint="video analysis"
        />
    ),
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
    icon: (
        <Image
            src="https://storage.googleapis.com/project-spark-b2489c64703a45c3b28b7e6f85191fce/users/75f31c89-b04d-4726-8c0a-71404c014a42/images/clvqun7ha00083b6rf075fwnf.png"
            alt="Audio Authenticator"
            width={500}
            height={500}
            className="rounded-lg shadow-2xl"
            data-ai-hint="audio analysis"
        />
    ),
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 bg-gradient-to-br from-primary via-orange-500 to-primary dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
            Uncover the Truth
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Your essential AI-powered toolkit for critically analyzing news, video, and audio content. In an age of digital noise, Veritas Vision helps you navigate the online world with confidence by detecting manipulation, verifying authenticity, and uncovering hidden biases.
          </p>
        </motion.div>
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
          className="w-full min-h-screen flex items-center justify-center py-12 md:py-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="container grid grid-cols-1 md:grid-cols-2 items-center gap-12">
            <div className={cn("flex justify-center", index % 2 === 1 && "md:order-last")}>
              {feature.icon}
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">{feature.title}</h2>
              <p className="text-lg text-muted-foreground mb-8">{feature.description}</p>
              <ul className="space-y-4 mb-10">
                {feature.details.map((detail) => (
                  <li key={detail} className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle className="h-6 w-6 text-primary/80 shrink-0" />
                    <span>{detail}</span>
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
        </motion.section>
      ))}
    </div>
  );
}
