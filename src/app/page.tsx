
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Icons } from '@/components/icons';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: <Icons.news className="h-10 w-10 text-primary" />,
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
    icon: <Icons.video className="h-10 w-10 text-primary" />,
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
    icon: <Icons.audio className="h-10 w-10 text-primary" />,
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
  visible: { opacity: 1, y: 0 },
};


export default function Home() {
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="container py-12 md:py-20 text-center"
    >
      <motion.h1
        variants={itemVariants}
        className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 bg-gradient-to-br from-primary via-accent to-primary bg-clip-text text-transparent"
      >
        Uncover the Truth
      </motion.h1>

      <motion.p
        variants={itemVariants}
        className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-16"
      >
        Your AI-powered toolkit for analyzing news, video, and audio content. We help you navigate the digital world with confidence by detecting manipulation and verifying authenticity.
      </motion.p>
      
      <div className="max-w-2xl mx-auto space-y-12">
        {features.map((feature) => (
          <motion.div
            key={feature.title}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={itemVariants}
            transition={{ duration: 0.5, ease: "easeOut" }}
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

                        <ul className="space-y-2 mb-6">
                            {feature.details.map((detail) => (
                                <li key={detail} className="flex items-center gap-2 text-muted-foreground text-sm">
                                    <CheckCircle className="h-4 w-4 text-primary/80 shrink-0" />
                                    <span>{detail}</span>
                                </li>
                            ))}
                        </ul>

                        <Button variant="link" className="p-0 h-auto text-primary text-base">
                            Launch Tool <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </div>
                </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
