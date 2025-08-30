
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Icons } from '@/components/icons';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: <Icons.news className="h-12 w-12 text-primary" />,
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
    icon: <Icons.video className="h-12 w-12 text-primary" />,
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
    icon: <Icons.audio className="h-12 w-12 text-primary" />,
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

const featureVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: {
            duration: 0.8,
            ease: [0.6, 0.05, -0.01, 0.9]
        }
    }
}


export default function Home() {
  return (
    <div className="w-full flex flex-col">
        <motion.section 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="container min-h-screen flex flex-col items-center justify-center text-center py-12 md:py-20"
        >
            <motion.h1
                variants={itemVariants}
                className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 bg-gradient-to-br from-primary via-accent to-primary bg-clip-text text-transparent"
            >
                Uncover the Truth
            </motion.h1>

            <motion.p
                variants={itemVariants}
                className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto"
            >
                Your AI-powered toolkit for analyzing news, video, and audio content. We help you navigate the digital world with confidence by detecting manipulation and verifying authenticity.
            </motion.p>
             <motion.div variants={itemVariants} className="mt-8">
                <p className="text-sm text-muted-foreground animate-pulse">Scroll down to explore the tools</p>
            </motion.div>
        </motion.section>
      
        <div className="flex flex-col">
            {features.map((feature, index) => (
            <motion.section
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={featureVariants}
                className={cn(
                    "min-h-screen container flex flex-col items-center justify-center py-20 md:py-32",
                )}
            >
                <div className="w-full max-w-4xl mx-auto text-center md:text-left">
                    <div className="md:flex md:items-center md:gap-12">
                        <motion.div 
                            whileHover={{ scale: 1.1, rotate: [0, 5, -5, 0], transition: { duration: 0.4 } }}
                            className="flex-shrink-0 mb-8 md:mb-0 mx-auto md:mx-0 w-fit p-4 bg-background rounded-full shadow-lg border"
                        >
                            {feature.icon}
                        </motion.div>
                        <div className="flex-1">
                            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">{feature.title}</h2>
                            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto md:mx-0">{feature.description}</p>

                            <ul className="space-y-3 mb-10 text-left w-fit mx-auto md:mx-0">
                                {feature.details.map((detail) => (
                                    <li key={detail} className="flex items-center gap-3 text-muted-foreground">
                                        <CheckCircle className="h-5 w-5 text-primary/80 shrink-0" />
                                        <span className="text-base">{detail}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link href={feature.href}>
                                <Button size="lg" className="h-12 text-lg group">
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
    </div>
  );
}
