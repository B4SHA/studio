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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const formSchema = z.object({
  inputType: z.enum(["file", "url"]).default("file"),
  videoFile: z.custom<FileList>().optional(),
  videoUrl: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.inputType === 'file') {
    if (!data.videoFile || data.videoFile.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['videoFile'], message: 'Video file is required.' });
      return;
    }
    const file = data.videoFile[0];
    if (!file.type.startsWith("video/")) {
       ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['videoFile'], message: 'Please upload a valid video file.' });
    }
    if (file.size > 50 * 1024 * 1024) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['videoFile'], message: 'File size should be less than 50MB.' });
    }
  }
  if (data.inputType === 'url') {
    if (!data.videoUrl) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['videoUrl'], message: 'URL is required.' });
    } else {
      // Basic URL validation, the backend will do a more specific one.
      if (!data.videoUrl.startsWith('http')) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['videoUrl'], message: 'Please enter a valid URL.' });
      }
    }
  }
});


const AnalysisItem = ({ label, value }: { label: string; value: boolean }) => (
  <div className="flex items-center justify-between text-sm py-2 px-4">
    <span className="text-muted-foreground">{label}</span>
    {value ? (
      <span className="flex items-center font-medium text-destructive"><Icons.alert className="mr-1.5 h-4 w-4" /> Detected</span>
    ) : (
      <span className="flex items-center font-medium text-green-600"><Icons.checkCircle className="mr-1.5 h-4 w-4" /> Not Detected</span>
    )}
  </div>
);


export function VideoIntegrity() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VideoIntegrityOutput | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inputType: "file",
      videoFile: undefined,
      videoUrl: "",
    },
  });

  const inputType = form.watch("inputType");

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
    if (values.inputType === 'file') {
        // Keep the preview for file uploads
    } else {
        setVideoPreview(null);
    }
    
    try {
      let analysisInput = {};
      if (values.inputType === 'file' && values.videoFile?.[0]) {
        const videoDataUri = await fileToDataUri(values.videoFile[0]);
        analysisInput = { videoDataUri };
        if (!videoPreview) {
            const objectUrl = URL.createObjectURL(values.videoFile[0]);
            setVideoPreview(objectUrl);
        }
      } else if (values.inputType === 'url' && values.videoUrl) {
        analysisInput = { videoUrl: values.videoUrl };
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
  
  const getProgressIndicatorClassName = (score: number) => {
    if (score < 40) return "bg-destructive";
    if (score < 70) return "bg-accent";
    return "bg-primary";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Icons.video className="h-6 w-6" />
            Video Integrity Analysis
          </CardTitle>
          <CardDescription>
            Upload a video or provide a YouTube URL to detect deepfakes, manipulations, and other forms of AI-generated content.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="inputType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Analysis Input</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => {
                            field.onChange(value);
                            setResult(null);
                            setVideoPreview(null);
                            form.reset({inputType: value as 'file' | 'url', videoFile: undefined, videoUrl: ''});
                        }}
                        defaultValue={field.value}
                        className="grid grid-cols-2 gap-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="file" id="file" />
                          </FormControl>
                          <FormLabel htmlFor="file" className="font-normal">File Upload</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="url" id="url" />
                          </FormControl>
                          <FormLabel htmlFor="url" className="font-normal">YouTube URL</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {inputType === 'file' && (
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
              )}
              
              {inputType === 'url' && (
                 <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>YouTube Video URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.youtube.com/watch?v=..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

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
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-4 p-8">
              <Icons.spinner className="h-10 w-10 text-primary" />
              <p className="text-muted-foreground">Analyzing video... this can take some time.</p>
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
