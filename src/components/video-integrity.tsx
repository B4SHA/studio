
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { videoIntegrityAnalysis, type VideoIntegrityOutput } from "@/ai/flows/video-integrity-flow";
import { fileToDataUri } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

const formSchema = z.object({
  videoFile: z
    .custom<FileList>()
    .refine((files) => files?.length === 1, "Video file is required.")
    .refine((files) => !!files?.[0], "Video file is required.")
    .refine((files) => files?.[0]?.type.startsWith("video/"), "Please upload a valid video file.")
    .refine((files) => files?.[0]?.size <= 50 * 1024 * 1024, "File size should be less than 50MB."),
});

function AnalysisItem({ label, value }: { label: string; value: boolean }) {
    return (
        <div className="flex items-center justify-between text-sm py-3 px-4 rounded-lg transition-colors hover:bg-muted/50">
            <span className="text-muted-foreground">{label}</span>
            {value ? (
                <span className="flex items-center font-semibold text-destructive"><Icons.alert className="mr-1.5 h-4 w-4" /> Detected</span>
            ) : (
                <span className="flex items-center font-medium text-primary"><Icons.checkCircle className="mr-1.5 h-4 w-4" /> Not Detected</span>
            )}
        </div>
    );
}

export function VideoIntegrity() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VideoIntegrityOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videoFile: undefined,
    },
  });

  const videoFile = form.watch("videoFile");
  const videoPreview = videoFile && videoFile.length > 0 ? URL.createObjectURL(videoFile[0]) : null;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!values.videoFile || values.videoFile.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No file selected',
        description: 'Please select a video file before analyzing.',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);
    
    try {
      const videoDataUri = await fileToDataUri(values.videoFile[0]);
      const analysisResult = await videoIntegrityAnalysis({ videoDataUri });
      setResult(analysisResult);
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error.message || "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full flex-1 bg-gradient-to-br from-background to-muted/40 py-8 px-4">
        <div className="container mx-auto flex flex-col items-center gap-8 max-w-2xl">
            <div className="text-center w-full">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground mb-2">
                    Video Integrity
                </h1>
                <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                    Upload a video file to detect deepfakes, manipulations, and other signs of AI-generated content.
                </p>
            </div>

            <Card className="w-full shadow-lg border-2 border-border/80 bg-background/80 backdrop-blur-sm">
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Icons.video className="h-6 w-6" />
                            Video Input
                        </CardTitle>
                        <CardDescription>
                            Select a video file for analysis (Max 50MB).
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Input
                          type="file"
                          accept="video/*"
                          className="file:text-foreground h-12 text-base"
                          {...form.register("videoFile")}
                      />
                      <FormMessage>{form.formState.errors.videoFile?.message}</FormMessage>

                    {videoPreview && (
                        <div className="mt-4 overflow-hidden rounded-lg border-2 shadow-inner">
                            <video
                                controls
                                src={videoPreview}
                                className="aspect-video w-full"
                                onCanPlay={(e) => (e.currentTarget.volume = 0.5)}
                            />
                        </div>
                    )}
                    </CardContent>
                    <CardFooter>
                    <Button type="submit" disabled={isLoading} className="w-full h-12 text-lg font-semibold">
                        {isLoading && <Icons.spinner className="mr-2" />}
                        Analyze Video
                    </Button>
                    </CardFooter>
                </form>
                </Form>
            </Card>

            { (isLoading || result) && (
                <Card className="w-full shadow-lg border-2 border-border/80 bg-background/80 backdrop-blur-sm flex flex-col min-h-[500px]">
                    <CardHeader>
                        <CardTitle className="text-xl">Analysis Report</CardTitle>
                        <CardDescription>
                            The results of the video integrity analysis will appear here.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col min-h-0">
                        {isLoading && (
                        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
                            <Icons.spinner className="h-10 w-10 text-primary" />
                            <p className="text-center text-muted-foreground">Analyzing video... <br/>This can take some time, especially for longer videos.</p>
                        </div>
                        )}
                        {result && result.analysis && (
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="px-1 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-lg">Analysis Confidence</h3>
                                    <span className="font-bold text-2xl text-primary">{result.analysis.confidenceScore.toFixed(0)}%</span>
                                </div>
                                <Progress value={result.analysis.confidenceScore} indicatorClassName="bg-primary" />
                            </div>
                            <Separator className="my-4" />
                            <div className="flex-1 min-h-0">
                                <ScrollArea className="h-full pr-4">
                                    <div className="space-y-4">
                                        <div className="divide-y divide-border/50 rounded-md border border-border/50 bg-background/95">
                                            <AnalysisItem label="Deepfake" value={result.analysis.deepfake} />
                                            <AnalysisItem label="Video Manipulation" value={result.analysis.videoManipulation} />
                                            <AnalysisItem label="Synthetic Voice" value={result.analysis.syntheticVoice} />
                                            <AnalysisItem label="Fully AI-Generated" value={result.analysis.fullyAiGenerated} />
                                            <AnalysisItem label="Satire or Parody" value={result.analysis.satireParody} />
                                            <AnalysisItem label="Mislabeling" value={result.analysis.mislabeling} />
                                        </div>
                                    
                                        <div className="pt-2">
                                        <h3 className="font-semibold text-lg mb-2">Analysis Summary</h3>
                                        <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">
                                            {result.analysis.summary}
                                        </p>
                                        </div>
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    </div>
  );
}
