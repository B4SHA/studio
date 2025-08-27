
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import { Progress } from "@/components/ui/progress";

const formSchema = z.object({
  videoFile: z
    .custom<FileList>()
    .refine((files) => files?.length === 1, "Video file is required.")
    .refine((files) => files?.[0]?.type.startsWith("video/"), "Please upload a valid video file.")
    .refine((files) => files?.[0]?.size <= 50 * 1024 * 1024, "File size should be less than 50MB."),
});

function AnalysisItem({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm py-2 px-4">
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("videoFile", event.target.files as FileList);
      const objectUrl = URL.createObjectURL(file);
      setVideoPreview(objectUrl);
    }
  };

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
  
  const getProgressIndicatorClassName = (score: number) => {
    if (score < 40) return "bg-destructive";
    if (score < 70) return "bg-accent";
    return "bg-primary";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Icons.video className="h-6 w-6" />
            Video Integrity Analysis
          </CardTitle>
          <CardDescription>
            Upload a video file to detect deepfakes, manipulations, and other signs of AI-generated content.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="videoFile"
                render={() => (
                  <FormItem>
                    <FormLabel>Video File (Max 50MB)</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="video/*"
                        onChange={handleFileChange}
                        className="file:text-foreground"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {videoPreview && (
                <div className="mt-4 rounded-lg overflow-hidden border">
                   <video controls src={videoPreview} className="w-full aspect-video" />
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Icons.spinner className="mr-2" />}
                Analyze Video
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card className="shadow-lg h-fit">
        <CardHeader>
          <CardTitle className="text-xl">Analysis Report</CardTitle>
          <CardDescription>
            The results of the video integrity analysis will appear here.
          </Description>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-4 p-8">
              <Icons.spinner className="h-10 w-10 text-primary" />
              <p className="text-muted-foreground text-center">Analyzing video... <br/>This can take some time, especially for longer videos.</p>
            </div>
          )}
          {!isLoading && !result && (
            <div className="text-center p-8 text-muted-foreground">
              <Icons.barChart className="h-10 w-10 mx-auto mb-4" />
              <p>Your report is pending analysis.</p>
            </div>
          )}
          {result && result.analysis && (
            <div className="space-y-4">
               {result.analysis.confidenceScore > 0 && (
                <>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-lg">Confidence Score</h3>
                        <span className="font-bold text-2xl text-primary">{result.analysis.confidenceScore.toFixed(0)}%</span>
                    </div>
                    <Progress value={result.analysis.confidenceScore} indicatorClassName={getProgressIndicatorClassName(result.analysis.confidenceScore)} />
                  </div>
                  
                  <div className="divide-y rounded-md border">
                    <AnalysisItem label="Deepfake" value={result.analysis.deepfake} />
                    <AnalysisItem label="Video Manipulation" value={result.analysis.videoManipulation} />
                    <AnalysisItem label="Synthetic Voice" value={result.analysis.syntheticVoice} />
                    <AnalysisItem label="Fully AI-Generated" value={result.analysis.fullyAiGenerated} />
                    <AnalysisItem label="Satire or Parody" value={result.analysis.satireParody} />
                    <AnalysisItem label="Mislabeling" value={result.analysis.mislabeling} />
                  </div>
                </>
              )}

              <div>
                <h3 className="font-semibold text-lg mb-2">Analysis Summary</h3>
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{result.analysis.summary}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
