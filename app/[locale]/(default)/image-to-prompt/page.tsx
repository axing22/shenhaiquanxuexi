"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Image, FileText, Check, Copy, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { PromptHistoryDialog } from "@/components/prompt-history-dialog";
import { savePromptToHistory } from "@/lib/prompt-history";
import { useTranslations } from "next-intl";

export default function ImageToPromptPage() {
  const t = useTranslations("imageToPrompt");
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState("normal");
  const [uploadMethod, setUploadMethod] = useState<"upload" | "url">("upload");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [showHistory, setShowHistory] = useState(false);
  const [promptLanguage, setPromptLanguage] = useState("en");

  // Check if component is mounted (client-side)
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("toast.fileTooLarge"));
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        processImageFile(file);
      } else {
        toast.error(t("toast.invalidFileType"));
      }
    }
  };

  const handleLoadImageUrl = async () => {
    if (!imageUrl.trim()) {
      toast.error(t("toast.invalidUrl"));
      return;
    }

    try {
      // Validate URL format
      const url = new URL(imageUrl);

      // Set preview directly
      setImagePreview(imageUrl);

      // Create a temporary image to verify it loads and convert to File
      const img = document.createElement('img');
      img.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = imageUrl;
      });

      // Convert image to canvas then to blob
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert image to blob'));
          }
        }, 'image/jpeg', 0.95);
      });

      const file = new File([blob], "url-image.jpg", { type: 'image/jpeg' });
      setSelectedImage(file);

      toast.success(t("toast.imageLoaded"));
    } catch (error) {
      console.error("Error loading image URL:", error);
      // If CORS fails, still allow the preview but create a fallback
      if (imagePreview === imageUrl) {
        toast.warning(t("toast.corsWarning"));
        // Try to use the URL directly without converting to File
        // The API will need to handle URL as well
      } else {
        toast.error(t("toast.invalidImageUrl"));
      }
    }
  };

  const handleGeneratePrompt = async () => {
    if (!selectedImage && !imagePreview) {
      toast.error(t("toast.noImageSelected"));
      return;
    }

    setIsGenerating(true);

    try {
      const formData = new FormData();

      if (selectedImage) {
        // Use uploaded file or converted blob
        formData.append("img", selectedImage);
      } else if (uploadMethod === "url" && imageUrl) {
        // Use URL directly if no file was created
        formData.append("imageUrl", imageUrl);
      }

      // Language name mapping
      const languageNames: Record<string, string> = {
        "en": "English",
        "es": "Español",
        "fr": "Français",
        "de": "Deutsch",
        "zh": "简体中文",
        "zh-TW": "繁體中文",
        "ko": "한국어",
        "ru": "Русский",
        "ja": "日本語",
        "it": "Italiano",
        "pt": "Português",
        "ar": "العربية",
        "hi": "हिन्दी",
        "tr": "Türkçe",
        "vi": "Tiếng Việt",
        "id": "Bahasa Indonesia"
      };

      formData.append("promptType", selectedModel);
      formData.append("language", languageNames[promptLanguage] || "English");
      formData.append("userQuery", "Generate a detailed AI image prompt for this image");

      const response = await fetch("/api/image-to-prompt", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate prompt");
      }

      const result = await response.json();

      if (result.success && result.prompt) {
        setGeneratedPrompt(result.prompt);
        // Save to history
        savePromptToHistory(result.prompt, selectedModel, imagePreview || undefined);
        toast.success(t("toast.promptGenerated"));
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error generating prompt:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate prompt. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPrompt = () => {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt);
      toast.success(t("toast.promptCopied"));
    }
  };

  // Prevent hydration mismatch by not rendering dynamic content until mounted
  if (!mounted) {
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
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
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
            <Tabs defaultValue="image-to-prompt">
              <TabsList className="bg-card p-1 border border-border">
                <TabsTrigger
                  value="image-to-prompt"
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white px-6 py-2.5 rounded-md transition-all flex items-center gap-2"
                >
                  <Image className="h-4 w-4" />
                  {t("tabs.imageToPrompt")}
                </TabsTrigger>
                <TabsTrigger
                  value="text-to-prompt"
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white px-6 py-2.5 rounded-md transition-all flex items-center gap-2"
                  onClick={() => router.push(`/${locale}/text-to-prompt`)}
                >
                  <FileText className="h-4 w-4" />
                  {t("tabs.textToPrompt")}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Main Content */}
          <div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-lg p-4 h-[280px] flex flex-col">
                    {/* Upload Method Tabs - Inside Upload Box */}
                    <div className="flex gap-3 mb-4">
                      <button
                        onClick={() => setUploadMethod("upload")}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          uploadMethod === "upload"
                            ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-medium"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {t("upload.uploadImage")}
                      </button>
                      <button
                        onClick={() => setUploadMethod("url")}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          uploadMethod === "url"
                            ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-medium"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {t("upload.inputImageUrl")}
                      </button>
                    </div>

                    {/* Upload Content Area */}
                    <div className="flex-1 flex items-center justify-center">
                      {uploadMethod === "upload" ? (
                        <label htmlFor="image-upload" className="cursor-pointer w-full h-full flex items-center justify-center">
                          <div
                            className="text-center w-full"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                          >
                            <Upload className="h-10 w-10 mx-auto mb-3 text-purple-400" />
                            <p className="text-sm font-medium mb-1">{t("upload.dragDrop")}</p>
                            <p className="text-xs text-muted-foreground">{t("upload.fileFormat")}</p>
                          </div>
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                        </label>
                      ) : (
                        <div className="w-full px-4">
                          <Image className="h-10 w-10 mx-auto mb-3 text-purple-400" />
                          <p className="text-sm font-medium mb-3 text-center">{t("upload.enterUrl")}</p>
                          <input
                            type="text"
                            placeholder={t("upload.urlPlaceholder")}
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="w-full px-3 py-1.5 text-sm border border-border rounded-lg mb-3 bg-card text-foreground"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleLoadImageUrl();
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full border-purple-300 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                            onClick={handleLoadImageUrl}
                          >
                            {t("upload.loadUrl")}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Card className="p-4 h-[280px]">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-sm text-foreground">{t("preview.title")}</h3>
                      {imagePreview && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview(null);
                            setImageUrl("");
                            setGeneratedPrompt("");
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <div className="h-[calc(100%-2.5rem)] flex items-center justify-center overflow-hidden">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-w-full max-h-full rounded-lg object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Image className="h-12 w-12 mb-2" />
                          <p className="text-sm">{t("preview.placeholder")}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </div>

              {/* Model Selection */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-foreground mb-4">{t("models.selectTitle")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className={`p-4 cursor-pointer border-2 transition-all relative ${selectedModel === 'normal' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'hover:border-purple-300'
                  }`} onClick={() => setSelectedModel('normal')}>
                  {selectedModel === 'normal' && (
                    <div className="absolute top-3 right-3">
                      <Check className="h-5 w-5 text-purple-600" />
                    </div>
                  )}
                  <h4 className="font-semibold text-foreground mb-2">{t("models.generalTitle")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("models.generalDesc")}
                  </p>
                </Card>

                <Card className={`p-4 cursor-pointer border-2 transition-all relative ${selectedModel === 'flux' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'hover:border-purple-300'
                  }`} onClick={() => setSelectedModel('flux')}>
                  {selectedModel === 'flux' && (
                    <div className="absolute top-3 right-3">
                      <Check className="h-5 w-5 text-purple-600" />
                    </div>
                  )}
                  <h4 className="font-semibold text-foreground mb-2">{t("models.fluxTitle")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("models.fluxDesc")}
                  </p>
                </Card>

                <Card className={`p-4 cursor-pointer border-2 transition-all relative ${selectedModel === 'midjouney' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'hover:border-purple-300'
                  }`} onClick={() => setSelectedModel('midjouney')}>
                  {selectedModel === 'midjouney' && (
                    <div className="absolute top-3 right-3">
                      <Check className="h-5 w-5 text-purple-600" />
                    </div>
                  )}
                  <h4 className="font-semibold text-foreground mb-2">{t("models.midjourneyTitle")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("models.midjourneyDesc")}
                  </p>
                </Card>

                <Card className={`p-4 cursor-pointer border-2 transition-all relative ${selectedModel === 'stableDiffusion' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'hover:border-purple-300'
                  }`} onClick={() => setSelectedModel('stableDiffusion')}>
                  {selectedModel === 'stableDiffusion' && (
                    <div className="absolute top-3 right-3">
                      <Check className="h-5 w-5 text-purple-600" />
                    </div>
                  )}
                  <h4 className="font-semibold text-foreground mb-2">{t("models.stableDiffusionTitle")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("models.stableDiffusionDesc")}
                  </p>
                </Card>
                </div>

                {/* Prompt Language Selection */}
                <div className="mt-6 flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-semibold text-foreground whitespace-nowrap">
                      {t("models.promptLanguage")}
                    </label>
                    <select
                      value={promptLanguage}
                      onChange={(e) => setPromptLanguage(e.target.value)}
                      className="px-4 py-2.5 border-2 border-border rounded-lg bg-card text-foreground focus:outline-none focus:border-purple-500 transition-colors max-w-[300px]"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="zh">简体中文</option>
                      <option value="zh-TW">繁體中文</option>
                      <option value="ko">한국어</option>
                      <option value="ru">Русский</option>
                      <option value="ja">日本語</option>
                      <option value="it">Italiano</option>
                      <option value="pt">Português</option>
                      <option value="ar">العربية</option>
                      <option value="hi">हिन्दी</option>
                      <option value="tr">Türkçe</option>
                      <option value="vi">Tiếng Việt</option>
                      <option value="id">Bahasa Indonesia</option>
                    </select>
                  </div>
                  {promptLanguage !== "en" && (
                    <p className="text-xs text-muted-foreground">
                      {t("models.languageHint")}
                    </p>
                  )}
                </div>
              </div>

              {/* Generate Button */}
              <div className="mt-8 flex flex-col md:flex-row gap-4 items-center justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8"
                  onClick={handleGeneratePrompt}
                  disabled={isGenerating || (!selectedImage && !imagePreview)}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("generate.generating")}
                    </>
                  ) : (
                    t("generate.button")
                  )}
                </Button>

                <Button
                  variant="link"
                  className="text-purple-600"
                  onClick={() => setShowHistory(true)}
                >
                  {t("generate.viewHistory")}
                </Button>
              </div>

              {/* Generated Prompt Output Box */}
              <div className="mt-8 border-2 border-purple-300 dark:border-purple-700 rounded-lg p-6 min-h-[200px]">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-muted-foreground">
                    {generatedPrompt ? "" : t("result.placeholder")}
                  </p>
                  {generatedPrompt && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyPrompt}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {t("result.copy")}
                    </Button>
                  )}
                </div>
                {generatedPrompt && (
                  <div>
                    <p className="text-sm whitespace-pre-wrap">{generatedPrompt}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="mt-16 text-center">
            <p className="text-muted-foreground mb-2">
              {t("cta.text")}{" "}
              <Link href={`/${locale}/text-to-prompt`} className="text-purple-600 hover:underline font-medium">
                {t("cta.link")}
              </Link>
            </p>
          </div>

          {/* Bottom Section */}
          <div className="mt-16 pb-8">
            <h2 className="text-3xl font-bold text-center mb-4 text-foreground">
              {t("bottom.title")}
            </h2>
            <p className="text-center text-muted-foreground">
              {t("bottom.description")}
            </p>
          </div>
        </div>
      </div>

      {/* History Dialog */}
      <PromptHistoryDialog open={showHistory} onOpenChange={setShowHistory} />
    </div>
  );
}
