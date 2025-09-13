
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
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

const formSchema = z.object({
  inputType: z.enum(["file", "url"]).default("file"),
  videoFile: z
    .custom<FileList>()
    .refine((files) => files?.length === 1, "Video file is required.")
    .refine((files) => files?.[0]?.type.startsWith("video/"), "Please upload a valid video file.")
    .refine((files) => files?.[0]?.size <= 50 * 1024 * 1024, "File size should be less than 50MB.").optional(),
  videoUrl: z.string().url("Please enter a valid URL.").optional(),
}).superRefine((data, ctx) => {
  if (data.inputType === 'file' && !data.videoFile) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['videoFile'],
      message: 'A video file is required.',
    });
  } else if (data.inputType === 'url' && !data.videoUrl) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['videoUrl'],
      message: 'A video URL is required.',
    });
  }
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
      inputType: 'file',
      videoUrl: '',
    },
  });

  const inputType = form.watch("inputType");
  const videoFile = form.watch("videoFile");
  const videoUrl = form.watch("videoUrl");

  useEffect(() => {
    let objectUrl: string | null = null;
    if (inputType === 'file' && videoFile && videoFile.length > 0) {
      objectUrl = URL.createObjectURL(videoFile[0]);
      setVideoPreview(objectUrl);
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [videoFile, inputType]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);

    // Set preview from URL on submit
    if (values.inputType === 'url' && values.videoUrl) {
        setVideoPreview(values.videoUrl);
    } else if (values.inputType === 'file') {
        // Preview is already set by useEffect
    } else {
        setVideoPreview(null);
    }
    
    try {
      let analysisInput = {};
      if (values.inputType === 'file' && values.videoFile) {
        const videoDataUri = await fileToDataUri(values.videoFile[0]);
        analysisInput = { videoDataUri };
      } else if (values.inputType === 'url' && values.videoUrl) {
        analysisInput = { videoUrl: values.videoUrl };
      } else {
        toast({ variant: "destructive", title: "Invalid Input", description: "Please provide a file or URL." });
        setIsLoading(false);
        return;
      }
      
      const analysisResult = await videoIntegrityAnalysis(analysisInput);
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
                    Upload a video or provide a URL to detect deepfakes, manipulations, and other signs of AI-generated content.
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
                            Select a video file (Max 50MB) or provide a direct URL.
                        </CardDescription>
                    </CardHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <CardContent className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="inputType"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormControl>
                                            <RadioGroup
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                form.clearErrors(['videoFile', 'videoUrl']);
                                                setVideoPreview(null);
                                            }}
                                            defaultValue={field.value}
                                            className="grid grid-cols-2 gap-4"
                                            >
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                <RadioGroupItem value="file" id="file" />
                                                </FormControl>
                                                <FormLabel htmlFor="file" className="font-normal cursor-pointer">Upload File</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                <RadioGroupItem value="url" id="url" />
                                                </FormControl>
                                                <FormLabel htmlFor="url" className="font-normal cursor-pointer">From URL</FormLabel>
                                            </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        </FormItem>
                                    )}
                                />
                                {inputType === 'file' && (
                                    <FormField
                                        control={form.control}
                                        name="videoFile"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Video File</FormLabel>
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
                                )}
                                {inputType === 'url' && (
                                    <FormField
                                        control={form.control}
                                        name="videoUrl"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Video URL</FormLabel>
                                            <FormControl>
                                            <Input
                                                placeholder="https://example.com/video.mp4"
                                                {...field}
                                            />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                )}


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
