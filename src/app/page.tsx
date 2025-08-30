
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { Card } from '@/components/ui/card';

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

const tryNowFeatures = [
    {
        Icon: Icons.news,
        title: 'News Sleuth',
        description: 'Analyze news articles for credibility and bias.',
        href: '/news-sleuth',
    },
    {
        Icon: Icons.video,
        title: 'Video Integrity',
        description: 'Detect deepfakes and manipulation in videos.',
        href: '/video-integrity',
    },
    {
        Icon: Icons.audio,
        title: 'Audio Authenticator',
        description: 'Verify the authenticity of audio recordings.',
        href: '/audio-authenticator',
    },
]

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
      <section className="w-full min-h-[calc(100vh-80px)] flex flex-col items-center justify-center text-center relative p-4">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-5xl mx-auto"
          >
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 bg-gradient-to-br from-primary via-orange-500 to-primary dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
              Uncover the Truth
            </h1>
            <p className="text-2xl md:text-3xl text-muted-foreground max-w-4xl mx-auto">
              In an ocean of digital noise, Veritas Vision is your anchor for truth. Our essential AI-powered toolkit empowers you to critically analyze news, video, and audio content, navigating the online world with clarity and confidence.
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

      {/* Try It Now Section */}
      <motion.section
        className="w-full py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <div className="container">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">Try Veritas Vision Now</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {tryNowFeatures.map((feature) => (
                    <Link key={feature.href} href={feature.href} className="group">
                        <Card className="p-8 h-full flex flex-col items-center text-center transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 border-2 border-transparent hover:border-primary">
                            <feature.Icon className="h-20 w-20 mb-6 text-primary transition-transform duration-300 group-hover:scale-110" />
                            <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                            <p className="text-muted-foreground">{feature.description}</p>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
      </motion.section>

      {/* Feature Sections */}
      {features.map((feature, index) => (
        <motion.section
          key={feature.title}
          className="w-full flex items-center justify-center py-20 md:py-28"
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
