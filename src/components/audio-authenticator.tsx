
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { audioAuthenticatorAnalysis, type AudioAuthenticatorOutput } from "@/ai/flows/audio-authenticator-flow";
import { fileToDataUri } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "./ui/scroll-area";

const formSchema = z.object({
  audioFile: z
    .custom<FileList>()
    .refine((files) => files?.length === 1, "Audio file is required.")
    .refine((files) => files?.[0]?.type.startsWith("audio/"), "Please upload a valid audio file.")
    .refine((files) => files?.[0]?.size <= 10 * 1024 * 1024, "File size should be less than 10MB."),
});

export function AudioAuthenticator() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AudioAuthenticatorOutput | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("audioFile", event.target.files as FileList);
      const objectUrl = URL.createObjectURL(file);
      setAudioPreview(objectUrl);
    }
  };
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const audioDataUri = await fileToDataUri(values.audioFile[0]);
      const analysisResult = await audioAuthenticatorAnalysis({ audioDataUri });
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

  const getVerdictBadgeVariant = (verdict: 'Likely Authentic' | 'Potential AI/Manipulation' | 'Uncertain') => {
    switch (verdict) {
      case 'Likely Authentic':
        return 'default';
      case 'Potential AI/Manipulation':
        return 'destructive';
      case 'Uncertain':
      default:
        return 'secondary';
    }
  };

  const getVerdictIcon = (verdict: 'Likely Authentic' | 'Potential AI/Manipulation' | 'Uncertain') => {
    switch (verdict) {
      case 'Likely Authentic':
        return <Icons.check className="mr-1.5" />;
      case 'Potential AI/Manipulation':
        return <Icons.alert className="mr-1.5" />;
      case 'Uncertain':
      default:
        return <Icons.help className="mr-1.5" />;
    }
  };


  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Icons.audio className="h-6 w-6" />
            Audio Authenticator
          </CardTitle>
          <CardDescription>
            Upload an audio clip to analyze its authenticity and detect potential AI generation or manipulation.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <FormField
                control={form.control}
                name="audioFile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Audio File (Max 10MB)</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="audio/*"
                        onChange={handleFileChange}
                        className="file:text-foreground"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {audioPreview && (
                 <div className="mt-4">
                  <audio controls src={audioPreview} className="w-full">
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Icons.spinner className="mr-2" />}
                Analyze Audio
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      <Card className="shadow-lg flex flex-col">
        <CardHeader>
          <CardTitle className="text-xl">Analysis Report</CardTitle>
          <CardDescription>
            The results of the audio analysis will be displayed here.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0">
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-4 p-8 h-full">
              <Icons.spinner className="h-10 w-10 text-primary" />
              <p className="text-muted-foreground text-center">Analyzing audio... <br /> This may take a moment.</p>
            </div>
          )}
          {!isLoading && !result && (
            <div className="text-center p-8 text-muted-foreground h-full flex flex-col justify-center items-center">
              <Icons.barChart className="h-10 w-10 mx-auto mb-4" />
              <p>Your report is pending analysis.</p>
            </div>
          )}
          {result && (
            <ScrollArea className="h-full">
              <div className="space-y-6 p-1">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Verdict</h3>
                    <Badge variant={getVerdictBadgeVariant(result.verdict)} className="text-sm px-3 py-1">
                      {getVerdictIcon(result.verdict)}
                      {result.verdict}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-lg">Confidence Score</h3>
                      <span className="font-bold text-2xl text-primary">{result.confidenceScore}/100</span>
                  </div>
                  <Progress value={result.confidenceScore} indicatorClassName={getProgressIndicatorClassName(result.confidenceScore)} />
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Detailed Report</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap break-words">{result.report}</p>
                </div>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
