
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { imageVerifierAnalysis, type ImageVerifierOutput } from "@/ai/flows/image-verifier-flow";
import { fileToDataUri } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "./ui/scroll-area";
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

const formSchema = z.object({
  inputType: z.enum(["file", "url"]).default("file"),
  imageFile: z
    .custom<FileList>()
    .refine((files) => files?.length === 1, "An image file is required.")
    .refine((files) => files?.[0]?.type.startsWith("image/"), "Please upload a valid image file (e.g., JPG, PNG, WEBP).")
    .refine((files) => files?.[0]?.size <= 10 * 1024 * 1024, "File size should be less than 10MB.").optional(),
  imageUrl: z.string().url("Please enter a valid URL.").optional(),
}).superRefine((data, ctx) => {
  if (data.inputType === 'file' && !data.imageFile) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['imageFile'],
      message: 'An image file is required.',
    });
  } else if (data.inputType === 'url' && !data.imageUrl) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['imageUrl'],
      message: 'An image URL is required.',
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

export function ImageVerifier() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImageVerifierOutput | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { inputType: 'file' },
  });

  const inputType = form.watch("inputType");
  const imageUrl = form.watch("imageUrl");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("imageFile", event.target.files as FileList);
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
    }
  };
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);

    // Set preview from URL on submit
    if (values.inputType === 'url' && values.imageUrl) {
        setImagePreview(values.imageUrl);
    } else if (values.inputType === 'file') {
        // Preview is already set by handleFileChange
    } else {
        setImagePreview(null);
    }
    
    try {
        let analysisInput = {};
        if (values.inputType === 'file' && values.imageFile) {
            const imageDataUri = await fileToDataUri(values.imageFile[0]);
            analysisInput = { imageDataUri };
        } else if (values.inputType === 'url' && values.imageUrl) {
            analysisInput = { imageUrl: values.imageUrl };
        } else {
            toast({ variant: "destructive", title: "Invalid Input", description: "Please provide a file or URL." });
            setIsLoading(false);
            return;
        }

        const analysisResult = await imageVerifierAnalysis(analysisInput);
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

  const getVerdictBadgeVariant = (verdict: 'Likely Authentic' | 'Likely AI-Generated/Manipulated' | 'Uncertain') => {
    switch (verdict) {
      case 'Likely Authentic':
        return 'default';
      case 'Likely AI-Generated/Manipulated':
        return 'destructive';
      case 'Uncertain':
      default:
        return 'secondary';
    }
  };

  const getVerdictIcon = (verdict: 'Likely Authentic' | 'Likely AI-Generated/Manipulated' | 'Uncertain') => {
    switch (verdict) {
      case 'Likely Authentic':
        return <Icons.check className="mr-1.5" />;
      case 'Likely AI-Generated/Manipulated':
        return <Icons.alert className="mr-1.5" />;
      case 'Uncertain':
      default:
        return <Icons.help className="mr-1.5" />;
    }
  };

  return (
     <div className="w-full flex-1 bg-gradient-to-br from-background to-muted/40 py-8 px-4">
      <div className="container mx-auto flex flex-col items-center gap-8 max-w-5xl">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground mb-2">
            Image Verifier
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload an image or provide a URL to detect AI-generation, manipulation, and analyze any text within it.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 lg:items-start gap-8 w-full">
            <Card className="w-full shadow-lg border-2 border-border/80 bg-background/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                <Icons.image className="h-6 w-6" />
                Image Input
                </CardTitle>
                <CardDescription>
                Select an image file (Max 10MB) or provide a direct URL.
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
                                  form.clearErrors(['imageFile', 'imageUrl']);
                                  setImagePreview(null);
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
                        name="imageFile"
                        render={() => (
                            <FormItem>
                            <FormLabel>Image File</FormLabel>
                            <FormControl>
                                <Input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
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
                            name="imageUrl"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Image URL</FormLabel>
                                <FormControl>
                                <Input
                                    placeholder="https://example.com/image.jpg"
                                    {...field}
                                />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    )}
                    {imagePreview && (
                      <div className="mt-4 border-2 shadow-inner rounded-lg p-2 aspect-video relative">
                          <Image 
                            src={imagePreview} 
                            alt="Image preview"
                            fill
                            className="object-contain"
                           />
                      </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isLoading} className="w-full h-12 text-lg font-semibold">
                    {isLoading && <Icons.spinner className="mr-2" />}
                    Analyze Image
                    </Button>
                </CardFooter>
                </form>
            </Form>
            </Card>
            
            <Card className="w-full shadow-lg border-2 border-border/80 bg-background/80 backdrop-blur-sm flex flex-col min-h-[500px] lg:min-h-auto">
            <CardHeader>
                <CardTitle className="text-xl">Analysis Report</CardTitle>
                <CardDescription>
                The results of the image analysis will be displayed here.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0">
                {isLoading && (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
                    <Icons.spinner className="h-10 w-10 text-primary" />
                    <p className="text-center text-muted-foreground">Analyzing image... <br /> This may take a moment.</p>
                </div>
                )}
                {!isLoading && !result && (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                    <Icons.barChart className="mx-auto mb-4 h-10 w-10" />
                    <p>Your report is pending analysis.</p>
                </div>
                )}
                {result && (
                  <ScrollArea className="flex-1 pr-4 -mr-4">
                    <div className="flex flex-col space-y-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-lg">Image Verdict</h3>
                              <Badge variant={getVerdictBadgeVariant(result.verdict)} className="px-3 py-1 text-sm">
                              {getVerdictIcon(result.verdict)}
                              {result.verdict}
                              </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-lg">Confidence Score</h3>
                              <span className="font-bold text-2xl text-primary">{result.confidenceScore}/100</span>
                          </div>
                          <Progress value={result.confidenceScore} indicatorClassName={getProgressIndicatorClassName(result.confidenceScore)} />
                        </div>
                        <Separator />
                        <div className="divide-y rounded-md border bg-muted/20">
                            <AnalysisItem label="AI-Generated" value={result.isAiGenerated} />
                            <AnalysisItem label="Digital Manipulation" value={result.isManipulated} />
                            <AnalysisItem label="Misleading Context" value={result.isMisleadingContext} />
                        </div>
                        
                        {result.textAnalysis?.detectedText && (
                            <>
                              <Separator />
                              <Alert>
                                <Icons.news className="h-4 w-4" />
                                <AlertTitle>Text Detected in Image</AlertTitle>
                                <AlertDescription className="mt-2">
                                    <blockquote className="border-l-2 pl-4 italic my-2 text-sm max-h-32 overflow-y-auto">
                                        {result.textAnalysis.detectedText}
                                    </blockquote>
                                    <p className="font-semibold mt-3 mb-1">Text Analysis:</p>
                                    <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap break-words">
                                      {result.textAnalysis.analysis}
                                    </p>
                                </AlertDescription>
                              </Alert>
                            </>
                        )}
                        <Separator />
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Image Context</h3>
                            <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap break-words">
                                {result.context}
                            </p>
                        </div>
                        <Separator />
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Image Forensics Report</h3>
                            <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap break-words">
                                {result.report}
                            </p>
                        </div>
                    </div>
                  </ScrollArea>
                )}
            </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
