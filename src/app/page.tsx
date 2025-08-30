
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import Image from 'next/image';

const features = [
  {
    Icon: Icons.news,
    title: 'News Sleuth',
    description: 'Analyze news articles to assess credibility and identify potential misinformation.',
    href: '/news-sleuth',
  },
  {
    Icon: Icons.video,
    title: 'Video Integrity',
    description: 'Scrutinize videos to detect deepfakes, manipulations, and AI-generated content.',
    href: '/video-integrity',
  },
  {
    Icon: Icons.audio,
    title: 'Audio Authenticator',
    description: 'Examine audio clips to determine authenticity and flag potential AI generation.',
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
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 bg-gradient-to-br from-primary via-orange-500 to-primary dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
              Uncover the Truth
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
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
          className="w-full min-h-screen flex items-center justify-center py-8 md:py-12"
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
                <p className="text-lg text-muted-foreground mb-8">{feature.description}</p>
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
