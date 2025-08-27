import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewsSleuth } from "@/components/news-sleuth";
import { VideoIntegrity } from "@/components/video-integrity";
import { AudioAuthenticator } from "@/components/audio-authenticator";
import { Icons } from "@/components/icons";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4">
          <Icons.shield className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Veritas Vision
          </h1>
        </div>
      </header>
      <main className="flex-1 container py-8">
        <Tabs defaultValue="news" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto sm:h-10">
            <TabsTrigger value="news" className="py-2">
              <Icons.news className="mr-2" />
              News Sleuth
            </TabsTrigger>
            <TabsTrigger value="video" className="py-2">
              <Icons.video className="mr-2" />
              Video Integrity
            </TabsTrigger>
            <TabsTrigger value="audio" className="py-2">
              <Icons.audio className="mr-2" />
              Audio Authenticator
            </TabsTrigger>
          </TabsList>
          <TabsContent value="news" className="mt-6">
            <NewsSleuth />
          </TabsContent>
          <TabsContent value="video" className="mt-6">
            <VideoIntegrity />
          </TabsContent>
          <TabsContent value="audio" className="mt-6">
            <AudioAuthenticator />
          </TabsContent>
        </Tabs>
      </main>
      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-20 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
            Built by Firebase Studio. AI may produce inaccurate information.
          </p>
        </div>
      </footer>
    </div>
  );
}
