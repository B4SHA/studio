
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '@/components/icons';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: <Icons.news className="h-10 w-10 text-primary" />,
    title: 'News Sleuth',
    description: 'Analyze news articles from text, URLs, or headlines to uncover biases, assess credibility, and identify potential misinformation.',
    href: '/news-sleuth',
  },
  {
    icon: <Icons.video className="h-10 w-10 text-primary" />,
    title: 'Video Integrity',
    description: 'Scrutinize videos from file uploads to detect deepfakes, manipulations, and other signs of AI-generated content.',
    href: '/video-integrity',
  },
  {
    icon: <Icons.audio className="h-10 w-10 text-primary" />,
    title: 'Audio Authenticator',
    description: 'Examine audio clips to determine their authenticity, flagging potential AI voice generation or signs of tampering.',
    href: '/audio-authenticator',
  },
];

const splashVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const featureVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};


export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500); // Show splash for 2.5 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center">
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={splashVariants}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-background z-50"
          >
            <Icons.shield className="h-24 w-24 text-primary animate-shield-pulse" />
            <h1 className="mt-6 text-2xl font-bold text-foreground">Welcome to Veritas Vision</h1>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
      {!showSplash && (
        <motion.div 
            key="content"
            initial="hidden"
            animate="visible"
            variants={contentVariants}
            className="container py-12 md:py-20 text-center"
        >
          <motion.h1
            variants={contentVariants}
            className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 bg-gradient-to-br from-primary via-accent to-primary bg-clip-text text-transparent"
          >
            Uncover the Truth
          </motion.h1>

          <motion.p
            variants={contentVariants}
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-16"
          >
            Your AI-powered toolkit for analyzing news, video, and audio content. We help you navigate the digital world with confidence by detecting manipulation and verifying authenticity.
          </motion.p>
          
          <motion.div 
            variants={contentVariants}
            className="max-w-2xl mx-auto space-y-12"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={featureVariants}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                className="group"
              >
                <Link href={feature.href} className="block p-8 rounded-lg transition-colors duration-300 bg-black/10 hover:bg-white/5 border border-transparent hover:border-primary/40 shadow-lg hover:shadow-primary/20 backdrop-blur-md">
                    <div className="flex flex-col md:flex-row items-center gap-6 text-left">
                        <motion.div 
                            whileHover={{ rotate: [0, 10, -10, 0], transition: { duration: 0.4 } }}
                            className="flex-shrink-0"
                        >
                            {feature.icon}
                        </motion.div>
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold mb-2 text-foreground">{feature.title}</h2>
                            <p className="text-muted-foreground mb-4">{feature.description}</p>
                            <Button variant="link" className="p-0 h-auto text-primary text-base">
                                Launch Tool <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </div>
                    </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
