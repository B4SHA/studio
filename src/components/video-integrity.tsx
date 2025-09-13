
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { videoIntegrityAnalysis, type VideoIntegrityOutput } from "@/ai/flows/video-integrity-flow";
import { fileToDataUri } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import { Progress } from "@/components/ui/progress";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

const formSchema = z.object({
  videoFile: z
    .custom<FileList>()
    .refine((files) => files?.length === 1, "Video file is required.")
    .refine((files) => files?.[0]?.type.startsWith("video/"), "Please upload a valid video file.")
    .refine((files) => files?.[0]?.size <= 50 * 1024 * 1024, "File size should be less than 50MB."),
});

function AnalysisItem({ label, value }: { label: string; value: boolean }) {
    return (
        <div className="flex items-center justify-between text-sm py-2 px-3">
            <span className="text-muted-foreground">{label}</span>
            {value ? (
                <span className="flex items-center font-medium text-destructive"><Icons.alert className="mr-1.5 h-4 w-4" /> Detected</span>
            ) : (
                <span className="flex items-center font-medium text-primary"><Icons.checkCircle className="mr-1.5 h-4 w-4" /> Not Detected</span>
            )}
        </div>
    );
}

export function VideoIntegrity() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VideoIntegrityOutput | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videoFile: undefined,
    },
  });

  const videoFile = form.watch("videoFile");

  useEffect(() => {
    if (videoFile && videoFile.length > 0) {
      const file = videoFile[0];
      const objectUrl = URL.createObjectURL(file);
      setVideoPreview(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    } else {
        setVideoPreview(null);
    }
  }, [videoFile]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    
    try {
      const videoDataUri = await fileToDataUri(values.videoFile[0]);
      const analysisResult = await videoIntegrityAnalysis({ videoDataUri });
      setResult(analysisResult);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full flex-1 bg-gradient-to-br from-background to-muted/40 py-8 px-4">
        <div className="container mx-auto flex flex-col items-center gap-8 max-w-5xl">
            <div className="text-center">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground mb-2">
                    Video Integrity
                </h1>
                <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                    Upload a video to detect deepfakes, manipulations, and other signs of AI-generated content.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 lg:items-start gap-8 w-full">
                <Card className="w-full shadow-lg border-2 border-border/80 bg-background/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Icons.video className="h-6 w-6" />
                            Video Input
                        </CardTitle>
                        <CardDescription>
                            Select a video file for analysis (Max 50MB).
                        </CardDescription>
                    </CardHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="videoFile"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                        <Input
                                            type="file"
                                            accept="video/*"
                                            onChange={(e) => field.onChange(e.target.files)}
                                            className="file:text-foreground h-12 text-base"
                                        />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />

                                {videoPreview && (
                                    <div className="mt-4 rounded-lg overflow-hidden border-2 shadow-inner">
                                    <video controls src={videoPreview} className="w-full aspect-video" />
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

                <Card className="w-full shadow-lg border-2 border-border/80 bg-background/80 backdrop-blur-sm flex flex-col min-h-[500px] lg:min-h-auto">
                    <CardHeader>
                        <CardTitle className="text-xl">Analysis Report</CardTitle>
                        <CardDescription>
                            The results of the video analysis will appear here.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col min-h-0">
                        {isLoading && (
                        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
                            <Icons.spinner className="h-10 w-10 text-primary" />
                            <p className="text-muted-foreground text-center">Analyzing video... <br/>This can take some time, especially for longer videos.</p>
                        </div>
                        )}
                        {!isLoading && !result && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                            <Icons.barChart className="h-10 w-10 mx-auto mb-4" />
                            <p>Your report is pending analysis.</p>
                        </div>
                        )}
                        {result && result.analysis && (
                        <div className="flex-1 flex flex-col min-h-0">
                            <ScrollArea className="h-full pr-4">
                                <div className="space-y-4">
                                    {result.analysis.confidenceScore > 0 ? (
                                        <>
                                        <div className="px-1 space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h3 className="font-semibold text-lg">Analysis Confidence</h3>
                                                <span className="font-bold text-2xl text-primary">{result.analysis.confidenceScore.toFixed(0)}%</span>
                                            </div>
                                            <Progress value={result.analysis.confidenceScore} indicatorClassName="bg-primary" />
                                        </div>
                                        <Separator className="my-4" />
                                        <div className="divide-y rounded-md border bg-muted/20">
                                            <AnalysisItem label="Deepfake" value={result.analysis.deepfake} />
                                            <AnalysisItem label="Video Manipulation" value={result.analysis.videoManipulation} />
                                            <AnalysisItem label="Synthetic Voice" value={result.analysis.syntheticVoice} />
                                            <AnalysisItem label="Fully AI-Generated" value={result.analysis.fullyAiGenerated} />
                                            <AnalysisItem label="Satire or Parody" value={result.analysis.satireParody} />
                                            <AnalysisItem label="Misleading Context" value={result.analysis.misleadingContext} />
                                        </div>
                                        <Separator className="my-4" />
                                        </>
                                    ) : null}

                                    {result.analysis.audioTextAnalysis?.detectedText && (
                                        <>
                                        <Alert>
                                          <Icons.audio className="h-4 w-4" />
                                          <AlertTitle>Speech Detected in Video</AlertTitle>
                                          <AlertDescription className="mt-2">
                                              <p className="font-semibold mb-2">Transcript:</p>
                                              <blockquote className="border-l-2 pl-4 italic my-2 text-sm max-h-32 overflow-y-auto">
                                                  {result.analysis.audioTextAnalysis.detectedText}
                                              </blockquote>
                                              <p className="font-semibold mt-3 mb-1">Transcript Analysis:</p>
                                              <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap break-words">
                                                {result.analysis.audioTextAnalysis.analysis}
                                              </p>
                                          </AlertDescription>
                                        </Alert>
                                        <Separator />
                                      </>
                                    )}

                                    <div>
                                        <h3 className="font-semibold text-lg mb-2">Forensics Summary</h3>
                                        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{result.analysis.summary}</p>
                                    </div>
                                </div>
                            </ScrollArea>
                        </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
