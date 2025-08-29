
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { newsSleuthAnalysis, type NewsSleuthOutput } from "@/ai/flows/news-sleuth-flow";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ScrollArea } from "./ui/scroll-area";

const formSchema = z.object({
  inputType: z.enum(["text", "url", "headline"]).default("text"),
  articleText: z.string().optional(),
  articleUrl: z.string().optional(),
  articleHeadline: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.inputType === 'text') {
    if (!data.articleText || data.articleText.length < 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['articleText'],
        message: 'Article text must be at least 100 characters long.',
      });
    }
    if (data.articleText && data.articleText.length > 10000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['articleText'],
        message: 'Article text must be less than 10,000 characters.',
      });
    }
  }
  if (data.inputType === 'url') {
    if (!data.articleUrl) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['articleUrl'], message: 'URL is required.' });
    } else {
      try {
        new URL(data.articleUrl);
      } catch {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['articleUrl'], message: 'Please enter a valid URL.' });
      }
    }
  }
  if (data.inputType === 'headline') {
    if (!data.articleHeadline || data.articleHeadline.length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['articleHeadline'],
        message: 'Headline must be at least 10 characters long.',
      });
    }
     if (data.articleHeadline && data.articleHeadline.length > 200) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['articleHeadline'],
        message: 'Headline must be less than 200 characters.',
      });
    }
  }
});

export function NewsSleuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<NewsSleuthOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inputType: "text",
      articleText: "",
      articleUrl: "",
      articleHeadline: "",
    },
  });

  const inputType = form.watch("inputType");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const analysisInput =
        values.inputType === "text" ? { articleText: values.articleText } :
        values.inputType === "url" ? { articleUrl: values.articleUrl } :
        { articleHeadline: values.articleHeadline };
      
      const analysisResult = await newsSleuthAnalysis(analysisInput);
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
  
  const getVerdictBadgeVariant = (verdict: 'Likely Real' | 'Likely Fake' | 'Uncertain') => {
    switch (verdict) {
      case 'Likely Real':
        return 'default';
      case 'Likely Fake':
        return 'destructive';
      case 'Uncertain':
      default:
        return 'secondary';
    }
  };

  const getVerdictIcon = (verdict: 'Likely Real' | 'Likely Fake' | 'Uncertain') => {
    switch (verdict) {
      case 'Likely Real':
        return <Icons.check className="mr-1.5" />;
      case 'Likely Fake':
        return <Icons.alert className="mr-1.5" />;
      case 'Uncertain':
      default:
        return <Icons.help className="mr-1.5" />;
    }
  };


  return (
    <div className="grid w-full flex-1 grid-cols-1 gap-8 lg:grid-cols-2">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Icons.news className="h-6 w-6" />
            News Sleuth
          </CardTitle>
          <CardDescription>
            Analyze an article's credibility from its text, URL, or headline to identify biases and flag potential misinformation.
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
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-3 gap-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="text" id="text" />
                          </FormControl>
                          <FormLabel htmlFor="text" className="font-normal">Article Text</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="url" id="url" />
                          </FormControl>
                          <FormLabel htmlFor="url" className="font-normal">URL</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="headline" id="headline" />
                          </FormControl>
                          <FormLabel htmlFor="headline" className="font-normal">Headline</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {inputType === "text" && (
                <FormField
                  control={form.control}
                  name="articleText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Article Text</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste the full text of the news article here..."
                          className="min-h-[200px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {inputType === "url" && (
                <FormField
                  control={form.control}
                  name="articleUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Article URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/news-article" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {inputType === "headline" && (
                <FormField
                  control={form.control}
                  name="articleHeadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Article Headline</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the news article headline" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Icons.spinner className="mr-2" />}
                Analyze
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      <Card className="flex flex-col shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Credibility Report</CardTitle>
          <CardDescription>
            The results of the news analysis will be displayed here.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col min-h-0">
          {isLoading && (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
              <Icons.spinner className="h-10 w-10 text-primary" />
              <p className="text-center text-muted-foreground">Analyzing article... <br/>This may take a moment.</p>
            </div>
          )}
          {!isLoading && !result && (
            <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
              <Icons.barChart className="mx-auto mb-4 h-10 w-10" />
              <p>Your report is pending analysis.</p>
            </div>
          )}
          {result && result.credibilityReport && (
            <ScrollArea className="h-full max-h-[60vh] lg:max-h-full">
              <div className="space-y-6 p-1">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">Verdict</h3>
                      <Badge variant={getVerdictBadgeVariant(result.credibilityReport.verdict)} className="px-3 py-1 text-sm">
                        {getVerdictIcon(result.credibilityReport.verdict)}
                        {result.credibilityReport.verdict}
                      </Badge>
                    </div>
                  <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">Credibility Score</h3>
                      <span className="font-bold text-2xl text-primary">{result.credibilityReport.overallScore}/100</span>
                  </div>
                  <Progress value={result.credibilityReport.overallScore} indicatorClassName={getProgressIndicatorClassName(result.credibilityReport.overallScore)} />
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Summary</h3>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">{result.credibilityReport.summary}</p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Identified Biases</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.credibilityReport.biases.length > 0 ? (
                      result.credibilityReport.biases.map((bias, i) => <Badge key={i} variant="secondary">{bias}</Badge>)
                    ) : (
                      <p className="text-sm text-muted-foreground">No significant biases were detected.</p>
                    )}
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Flagged Content</h3>
                  <div className="space-y-2">
                    {result.credibilityReport.flaggedContent.length > 0 ? (
                      result.credibilityReport.flaggedContent.map((flag, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-destructive">
                          <Icons.alert className="h-4 w-4 mt-0.5 shrink-0" />
                          <p className="break-words">{flag}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No specific content was flagged for low credibility.</p>
                    )}
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Analyst Reasoning</h3>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">{result.credibilityReport.reasoning}</p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Sources Consulted</h3>
                  <div className="flex flex-col gap-2">
                    {result.credibilityReport.sources.length > 0 ? (
                      result.credibilityReport.sources.map((source, i) => (
                        <Link
                          key={i}
                          href={source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate text-sm text-primary hover:underline"
                        >
                          {source}
                        </Link>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No external sources were cited for this analysis.</p>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    