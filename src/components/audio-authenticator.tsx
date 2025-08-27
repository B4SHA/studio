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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
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
      
      <Card className="shadow-lg h-fit">
        <CardHeader>
          <CardTitle className="text-xl">Analysis Report</CardTitle>
          <CardDescription>
            The results of the audio analysis will be displayed here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-4 p-8">
              <Icons.spinner className="h-10 w-10 text-primary" />
              <p className="text-muted-foreground text-center">Analyzing audio... <br /> This may take a moment.</p>
            </div>
          )}
          {!isLoading && !result && (
            <div className="text-center p-8 text-muted-foreground">
              <Icons.barChart className="h-10 w-10 mx-auto mb-4" />
              <p>Your report is pending analysis.</p>
            </div>
          )}
          {result && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Authenticity Assessment</h3>
                <Badge variant={result.isAuthentic ? "default" : "destructive"} className="text-base px-3 py-1">
                  {result.isAuthentic ? (
                    <Icons.check className="mr-2" />
                  ) : (
                    <Icons.alert className="mr-2" />
                  )}
                  {result.isAuthentic ? 'Likely Authentic' : 'Potential Manipulation or AI Generation'}
                </Badge>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold text-lg mb-2">Detailed Report</h3>
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{result.report}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
