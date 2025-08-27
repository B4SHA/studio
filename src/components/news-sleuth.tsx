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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  articleText: z.string().min(100, "Article text must be at least 100 characters long.").max(10000, "Article text must be less than 10,000 characters."),
});

export function NewsSleuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<NewsSleuthOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { articleText: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const analysisResult = await newsSleuthAnalysis({ articleText: values.articleText });
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

  const getProgressColor = (score: number) => {
    if (score < 40) return "bg-destructive";
    if (score < 70) return "bg-accent";
    return "bg-green-500";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Icons.news className="h-6 w-6" />
            News Sleuth
          </CardTitle>
          <CardDescription>
            Paste the text of a news article below to analyze its credibility, identify biases, and flag potential misinformation.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <FormField
                control={form.control}
                name="articleText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Article Text</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste the full text of the news article here..."
                        className="min-h-[250px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Icons.spinner className="mr-2" />}
                Analyze Article
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      <Card className="shadow-lg h-fit">
        <CardHeader>
          <CardTitle className="text-xl">Credibility Report</CardTitle>
          <CardDescription>
            The results of the news analysis will be displayed here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-4 p-8">
              <Icons.spinner className="h-10 w-10 text-primary" />
              <p className="text-muted-foreground">Analyzing article... this may take a moment.</p>
            </div>
          )}
          {!isLoading && !result && (
            <div className="text-center p-8 text-muted-foreground">
              <Icons.barChart className="h-10 w-10 mx-auto mb-4" />
              <p>Your report is pending analysis.</p>
            </div>
          )}
          {result && result.credibilityReport && (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-lg">Overall Credibility Score</h3>
                    <span className="font-bold text-2xl text-primary">{result.credibilityReport.overallScore}/100</span>
                </div>
                <Progress value={result.credibilityReport.overallScore} indicatorClassName={getProgressColor(result.credibilityReport.overallScore)} />
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
                        <p>{flag}</p>
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
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{result.credibilityReport.reasoning}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
