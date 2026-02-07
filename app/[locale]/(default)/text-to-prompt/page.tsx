"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Image, FileText, Copy, Loader2, X, Wand2, Edit, Globe } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function TextToPromptPage() {
  const t = useTranslations("textToPrompt");
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [textPrompt, setTextPrompt] = useState<string>("");
  const [resultPrompt, setResultPrompt] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTranslateDialogOpen, setIsTranslateDialogOpen] = useState(false);
  const [editInstruction, setEditInstruction] = useState<string>("");
  const [targetLanguage, setTargetLanguage] = useState<string>("en");

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleMagicEnhance = async () => {
    if (!textPrompt.trim()) {
      toast.error(t("error_enter_prompt"));
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("/api/text-to-prompt/magic-enhance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: textPrompt,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to enhance prompt");
      }

      const result = await response.json();

      if (result.success && result.enhancedPrompt) {
        setResultPrompt(result.enhancedPrompt);
        toast.success(t("success_enhanced"));
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error enhancing prompt:", error);
      toast.error(error instanceof Error ? error.message : t("error_enhance_failed"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditWithAI = async () => {
    if (!textPrompt.trim()) {
      toast.error(t("error_enter_prompt"));
      return;
    }

    if (!editInstruction.trim()) {
      toast.error(t("error_enter_instructions"));
      return;
    }

    setIsProcessing(true);
    setIsEditDialogOpen(false);

    try {
      const response = await fetch("/api/text-to-prompt/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: textPrompt,
          instruction: editInstruction,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to edit prompt");
      }

      const result = await response.json();

      if (result.success && result.editedPrompt) {
        setResultPrompt(result.editedPrompt);
        setEditInstruction("");
        toast.success(t("success_edited"));
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error editing prompt:", error);
      toast.error(error instanceof Error ? error.message : t("error_edit_failed"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTranslate = async () => {
    if (!textPrompt.trim()) {
      toast.error(t("error_enter_prompt"));
      return;
    }

    setIsProcessing(true);
    setIsTranslateDialogOpen(false);

    try {
      const response = await fetch("/api/text-to-prompt/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: textPrompt,
          targetLanguage: targetLanguage,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to translate prompt");
      }

      const result = await response.json();

      if (result.success && result.translatedPrompt) {
        setResultPrompt(result.translatedPrompt);
        toast.success(t("success_translated"));
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error translating prompt:", error);
      toast.error(error instanceof Error ? error.message : t("error_translate_failed"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyResultPrompt = () => {
    if (resultPrompt) {
      navigator.clipboard.writeText(resultPrompt);
      toast.success(t("success_copied"));
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-purple-50/20 dark:to-purple-950/10">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-purple-50/20 dark:to-purple-950/10">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-foreground">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex justify-start mb-8">
            <Tabs defaultValue="text-to-prompt">
              <TabsList className="bg-card p-1 border border-border">
                <TabsTrigger
                  value="image-to-prompt"
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white px-6 py-2.5 rounded-md transition-all flex items-center gap-2"
                  onClick={() => router.push(`/${locale}/image-to-prompt`)}
                >
                  <Image className="h-4 w-4" />
                  {t("tab_image_to_prompt")}
                </TabsTrigger>
                <TabsTrigger
                  value="text-to-prompt"
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white px-6 py-2.5 rounded-md transition-all flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  {t("tab_text_to_prompt")}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4">
            {/* Left Panel - Input */}
            <Card className="p-4 flex flex-col">
              <h3 className="font-semibold mb-3 text-sm text-foreground">{t("prompt_label")}</h3>
              <div className="relative h-[280px]">
                <Textarea
                  placeholder=""
                  value={textPrompt}
                  onChange={(e) => setTextPrompt(e.target.value)}
                  maxLength={2048}
                  className="h-full resize-none border-purple-300 dark:border-purple-700 focus:border-purple-500 focus:ring-purple-500 text-sm"
                />
                {!textPrompt && (
                  <div className="absolute top-3 left-3 right-3 pointer-events-none text-muted-foreground dark:text-muted-foreground">
                    <p className="text-xs mb-2">{t("prompt_placeholder")}</p>
                    <p className="text-xs font-medium mb-1.5">{t("tips_label")}</p>
                    <ul className="text-xs space-y-1">
                      <li>• {t("tip1")}</li>
                      <li>• {t("tip2")}</li>
                      <li>• {t("tip3")}</li>
                      <li>• {t("tip4")}</li>
                    </ul>
                  </div>
                )}
                <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-1 rounded">
                  {textPrompt.length}/2048
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-purple-300 dark:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all hover:scale-105 text-xs h-8 px-3"
                  onClick={handleMagicEnhance}
                  disabled={isProcessing || !textPrompt.trim()}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                      {t("processing")}
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-3 w-3 mr-1.5" />
                      {t("magic_enhance")}
                    </>
                  )}
                </Button>
                {/* Temporarily hidden - will be enabled later */}
                {/* <Button
                  variant="outline"
                  size="sm"
                  className="border-purple-300 dark:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all hover:scale-105 text-xs h-8 px-3"
                  onClick={() => setIsEditDialogOpen(true)}
                  disabled={isProcessing || !textPrompt.trim()}
                >
                  <Edit className="h-3 w-3 mr-1.5" />
                  Edit with AI
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-purple-300 dark:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all hover:scale-105 text-xs h-8 px-3"
                  onClick={() => setIsTranslateDialogOpen(true)}
                  disabled={isProcessing || !textPrompt.trim()}
                >
                  <Globe className="h-3 w-3 mr-1.5" />
                  Translate
                </Button> */}
              </div>
            </Card>

            {/* Arrow Indicator */}
            <div className="hidden lg:flex items-center justify-center px-2">
              <div className={`text-2xl font-bold transition-all duration-500 ${
                isProcessing
                  ? 'text-purple-600 dark:text-purple-400 animate-pulse'
                  : 'text-gray-300 dark:text-gray-700'
              }`}>
                &gt;&gt;
              </div>
            </div>

            {/* Right Panel - Result */}
            <Card className="p-4 flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-sm text-foreground">{t("result_label")}</h3>
                {resultPrompt && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyResultPrompt}
                    className="hover:bg-purple-50 dark:hover:bg-purple-900/20 h-8 text-xs px-3"
                  >
                    <Copy className="h-3 w-3 mr-1.5" />
                    {t("copy")}
                  </Button>
                )}
              </div>
              <div className="h-[280px] overflow-y-auto p-3 bg-muted/10/50 rounded-lg border border-border transition-all duration-300">
                {isProcessing ? (
                  <div className="flex flex-col items-center justify-center h-full text-purple-600 dark:text-purple-400">
                    <Loader2 className="h-10 w-10 mb-3 animate-spin" />
                    <p className="text-sm font-medium">{t("processing_message")}</p>
                    <p className="text-xs text-muted-foreground mt-2">{t("processing_wait")}</p>
                  </div>
                ) : resultPrompt ? (
                  <div className="animate-in fade-in duration-500">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{resultPrompt}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <FileText className="h-10 w-10 mb-3 opacity-50" />
                    <p className="text-sm">{t("result_placeholder")}</p>
                    <p className="text-xs text-muted-foreground mt-2">{t("result_hint")}</p>
                  </div>
                )}
              </div>

              <div className="mt-3 h-8">
                {resultPrompt && !isProcessing ? (
                  <div className="flex gap-2 animate-in fade-in duration-500">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setResultPrompt("");
                        toast.success(t("success_cleared"));
                      }}
                      className="hover:bg-red-50 dark:hover:bg-red-900/20 text-xs h-8 px-3"
                    >
                      <X className="h-3 w-3 mr-1.5" />
                      {t("clear")}
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => {
                        router.push(`/${locale}/txt-to-image/nano-banana?prompt=${encodeURIComponent(resultPrompt)}`);
                      }}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs h-8 px-3"
                    >
                      {t("generate_image")}
                    </Button>
                  </div>
                ) : (
                  <div className="h-full"></div>
                )}
              </div>
            </Card>
          </div>

          {/* How to Use Text Prompt Generator */}
          <div className="mt-20">
            <h2 className="text-4xl font-bold text-center mb-4 text-foreground">{t("how_to_use_title")}</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              {t("how_to_use_subtitle")}
            </p>

            {/* Magic Enhance Section */}
            <div className="mb-16 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-3xl p-8 md:p-12">
              <h3 className="text-3xl font-bold mb-4 text-center text-foreground">{t("magic_enhance")}</h3>
              <p className="text-center text-muted-foreground mb-8">
                {t("magic_enhance_desc")}
              </p>

              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="bg-card rounded-2xl p-6 shadow-lg">
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <p className="text-sm font-medium text-muted-foreground mb-2">{t("example_original")}</p>
                      <p className="text-sm">{t("example_input")}</p>
                    </div>
                    <div className="flex justify-center">
                      <div className="text-2xl text-purple-600">↓</div>
                    </div>
                    <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-4">
                      <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-2">{t("example_after_enhance")}</p>
                      <p className="text-xs leading-relaxed">{t("example_output")}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">1</div>
                    <div>
                      <p className="font-medium">{t("step1")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">2</div>
                    <div>
                      <p className="font-medium">{t("step2")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">3</div>
                    <div>
                      <p className="font-medium">{t("step3")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">4</div>
                    <div>
                      <p className="font-medium">{t("step4")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit with AI Section */}
            <div className="mb-16 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-3xl p-8 md:p-12">
              <h3 className="text-3xl font-bold mb-4 text-center text-foreground">{t("edit_with_ai")}</h3>
              <p className="text-center text-muted-foreground mb-8">
                {t("edit_with_ai_desc")}
              </p>

              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="bg-card rounded-2xl p-6 shadow-lg">
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <p className="text-sm font-medium text-muted-foreground mb-2">{t("example_original")}</p>
                      <p className="text-xs leading-relaxed">{t("edit_example_input")}</p>
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs font-medium text-muted-foreground mb-1">{t("edit_instructions_label")}</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">{t("edit_example_instruction")}</p>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <div className="text-2xl text-blue-600">↓</div>
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-4">
                      <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2">{t("edit_example_after")}</p>
                      <p className="text-xs leading-relaxed">{t("edit_example_output")}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
                    <div>
                      <p className="font-medium">{t("edit_step1")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">2</div>
                    <div>
                      <p className="font-medium">{t("edit_step2")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">3</div>
                    <div>
                      <p className="font-medium">{t("edit_step3")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">4</div>
                    <div>
                      <p className="font-medium">{t("edit_step4")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">5</div>
                    <div>
                      <p className="font-medium">{t("edit_step5")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Translate Section */}
            <div className="mb-16 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-3xl p-8 md:p-12">
              <h3 className="text-3xl font-bold mb-4 text-center text-foreground">{t("translate")}</h3>
              <p className="text-center text-muted-foreground mb-8">
                {t("translate_desc")}
              </p>

              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="bg-card rounded-2xl p-6 shadow-lg">
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-green-200 dark:border-green-800 rounded-lg p-4">
                      <p className="text-sm font-medium text-muted-foreground mb-2">{t("example_original")}</p>
                      <p className="text-xs leading-relaxed">{t("translate_example_input")}</p>
                    </div>
                    <div className="flex justify-center">
                      <div className="text-2xl text-green-600">↓</div>
                    </div>
                    <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-4">
                      <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-2">{t("translate_example_after")}</p>
                      <p className="text-xs leading-relaxed">{t("translate_example_output")}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">1</div>
                    <div>
                      <p className="font-medium">{t("translate_step1")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">2</div>
                    <div>
                      <p className="font-medium">{t("translate_step2")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">3</div>
                    <div>
                      <p className="font-medium">{t("translate_step3")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">4</div>
                    <div>
                      <p className="font-medium">{t("translate_step4")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">5</div>
                    <div>
                      <p className="font-medium">{t("translate_step5")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20 mb-12">
            <h2 className="text-4xl font-bold text-center mb-4 text-foreground">{t("faq_title")}</h2>
            <p className="text-center text-muted-foreground mb-12">
              {t("faq_subtitle")}
            </p>

            <div className="max-w-3xl mx-auto space-y-3">
              <details className="group bg-card rounded-xl border border-border">
                <summary className="font-medium text-base cursor-pointer list-none flex items-center justify-between px-5 py-4 hover:bg-muted/20 transition-colors rounded-xl">
                  {t("faq1_q")}
                  <span className="ml-2 text-muted-foreground transform group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-5 pb-4 pt-2 text-sm text-muted-foreground border-t border-gray-100 dark:border-gray-700">
                  {t("faq1_a")}
                </div>
              </details>

              <details className="group bg-card rounded-xl border border-border">
                <summary className="font-medium text-base cursor-pointer list-none flex items-center justify-between px-5 py-4 hover:bg-muted/20 transition-colors rounded-xl">
                  {t("faq2_q")}
                  <span className="ml-2 text-muted-foreground transform group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-5 pb-4 pt-2 text-sm text-muted-foreground border-t border-gray-100 dark:border-gray-700">
                  {t("faq2_a")}
                </div>
              </details>

              <details className="group bg-card rounded-xl border border-border">
                <summary className="font-medium text-base cursor-pointer list-none flex items-center justify-between px-5 py-4 hover:bg-muted/20 transition-colors rounded-xl">
                  {t("faq3_q")}
                  <span className="ml-2 text-muted-foreground transform group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-5 pb-4 pt-2 text-sm text-muted-foreground border-t border-gray-100 dark:border-gray-700">
                  {t("faq3_a")}
                </div>
              </details>

              <details className="group bg-card rounded-xl border border-border">
                <summary className="font-medium text-base cursor-pointer list-none flex items-center justify-between px-5 py-4 hover:bg-muted/20 transition-colors rounded-xl">
                  {t("faq4_q")}
                  <span className="ml-2 text-muted-foreground transform group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-5 pb-4 pt-2 text-sm text-muted-foreground border-t border-gray-100 dark:border-gray-700">
                  {t("faq4_a")}
                </div>
              </details>
            </div>
          </div>

          {/* Edit with AI Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Edit className="h-5 w-5 text-purple-600" />
                  {t("edit_with_ai")}
                </DialogTitle>
                <DialogDescription className="text-base pt-2">
                  {t("edit_dialog_desc")}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {t("edit_instruction_label")}
                </label>
                <Textarea
                  placeholder={t("edit_instruction_placeholder")}
                  value={editInstruction}
                  onChange={(e) => setEditInstruction(e.target.value)}
                  className="min-h-[120px] focus:border-purple-500 focus:ring-purple-500"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {t("edit_instruction_tip")}
                </p>
              </div>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditInstruction("");
                  }}
                  className="flex-1 sm:flex-none"
                >
                  {t("cancel")}
                </Button>
                <Button
                  onClick={handleEditWithAI}
                  disabled={!editInstruction.trim()}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  {t("apply_edit")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Translate Dialog */}
          <Dialog open={isTranslateDialogOpen} onOpenChange={setIsTranslateDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Globe className="h-5 w-5 text-purple-600" />
                  {t("translate_dialog_title")}
                </DialogTitle>
                <DialogDescription className="text-base pt-2">
                  {t("translate_dialog_desc")}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {t("target_language")}
                </label>
                <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                  <SelectTrigger className="w-full h-11 focus:ring-purple-500">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="en">🇬🇧 English</SelectItem>
                    <SelectItem value="zh">🇨🇳 中文 (Chinese)</SelectItem>
                    <SelectItem value="es">🇪🇸 Español (Spanish)</SelectItem>
                    <SelectItem value="fr">🇫🇷 Français (French)</SelectItem>
                    <SelectItem value="de">🇩🇪 Deutsch (German)</SelectItem>
                    <SelectItem value="ja">🇯🇵 日本語 (Japanese)</SelectItem>
                    <SelectItem value="ko">🇰🇷 한국어 (Korean)</SelectItem>
                    <SelectItem value="pt">🇵🇹 Português (Portuguese)</SelectItem>
                    <SelectItem value="ru">🇷🇺 Русский (Russian)</SelectItem>
                    <SelectItem value="ar">🇸🇦 العربية (Arabic)</SelectItem>
                    <SelectItem value="it">🇮🇹 Italiano (Italian)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  {t("translate_tip")}
                </p>
              </div>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsTranslateDialogOpen(false)}
                  className="flex-1 sm:flex-none"
                >
                  {t("cancel")}
                </Button>
                <Button
                  onClick={handleTranslate}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  {t("translate")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <p className="text-muted-foreground mb-2">
              {t("cta_text")}{" "}
              <Link href={`/${locale}/image-to-prompt`} className="text-purple-600 hover:underline font-medium">
                {t("cta_link")}
              </Link>
            </p>
          </div>

          {/* Bottom Section */}
          <div className="mt-16 pb-8">
            <h2 className="text-3xl font-bold text-center mb-4 text-foreground">
              {t("bottom_title")}
            </h2>
            <p className="text-center text-muted-foreground">
              {t("bottom_subtitle")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
