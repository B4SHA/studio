import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { ArrowRight } from 'lucide-react';

const features = [
  {
    icon: <Icons.news className="h-8 w-8 text-primary" />,
    title: 'News Sleuth',
    description: 'Analyze news articles from text, URLs, or headlines to uncover biases, assess credibility, and identify potential misinformation.',
    href: '/news-sleuth',
  },
  {
    icon: <Icons.video className="h-8 w-8 text-primary" />,
    title: 'Video Integrity',
    description: 'Scrutinize videos from file uploads to detect deepfakes, manipulations, and other signs of AI-generated content.',
    href: '/video-integrity',
  },
  {
    icon: <Icons.audio className="h-8 w-8 text-primary" />,
    title: 'Audio Authenticator',
    description: 'Examine audio clips to determine their authenticity, flagging potential AI voice generation or signs of tampering.',
    href: '/audio-authenticator',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center container py-12 md:py-20">
      <div className="max-w-3xl text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-foreground mb-4">
          Uncover the Truth with Veritas Vision
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground">
          Your AI-powered toolkit for analyzing news, video, and audio content. We help you navigate the digital world with confidence by detecting manipulation and verifying authenticity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {features.map((feature) => (
          <Card key={feature.title} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center gap-4">
              {feature.icon}
              <CardTitle className="text-2xl">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <CardDescription className="flex-1 mb-6">{feature.description}</CardDescription>
              <Button asChild className="w-full mt-auto">
                <Link href={feature.href}>
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
