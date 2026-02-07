"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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
import { Upload, Image, FileText, Check, Copy, Loader2, X, Wand2, Edit, Globe, Video, Camera } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function VideoToPromptPage() {
  const t = useTranslations("videoToPrompt");
  const params = useParams();
  const locale = params.locale as string;
  const [mounted, setMounted] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState("normal");
  const [apiStatus, setApiStatus] = useState<"checking" | "configured" | "not_configured" | "error">("not_configured");
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Text to Prompt states
  const [textPrompt, setTextPrompt] = useState<string>("");
  const [resultPrompt, setResultPrompt] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTranslateDialogOpen, setIsTranslateDialogOpen] = useState(false);
  const [editInstruction, setEditInstruction] = useState<string>("");
  const [targetLanguage, setTargetLanguage] = useState<string>("en");

  // Text to Video states
  const [textVideoPrompt, setTextVideoPrompt] = useState<string>("");
  const [videoResultPrompt, setVideoResultPrompt] = useState<string>("");
  const [isVideoProcessing, setIsVideoProcessing] = useState(false);

  // Image to Video states
  const [videoImage, setVideoImage] = useState<File | null>(null);
  const [videoImagePreview, setVideoImagePreview] = useState<string | null>(null);
  const [videoPromptResult, setVideoPromptResult] = useState<string>("");
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [cameraMovement, setCameraMovement] = useState<string>("auto");
  const [outputLanguage, setOutputLanguage] = useState<string>("en");

  // Check if component is mounted (client-side)
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Check API status on mount
  React.useEffect(() => {
    if (!mounted) return;
    
    setApiStatus("checking");
    fetch("/api/image-to-prompt")
      .then(res => res.json())
      .then(data => {
        console.log("API Status Response:", data);
        setApiStatus(data.status === "configured" ? "configured" : "not_configured");
        setIsDemoMode(data.demo_mode || false);
      })
      .catch((error) => {
        console.error("Failed to check API status:", error);
        setApiStatus("error");
        setIsDemoMode(true);
      });
  }, [mounted]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("file_too_large"));
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
        toast.error(t("invalid_file_type"));
      }
    }
  };

  const handleGeneratePrompt = async () => {
    if (!selectedImage) {
      toast.error(t("error_upload_first"));
      return;
    }

    setIsGenerating(true);

    try {
      const formData = new FormData();
      formData.append("img", selectedImage);
      formData.append("promptType", selectedModel);
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
        toast.success(t("success_generated"));
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error generating prompt:", error);
      toast.error(error instanceof Error ? error.message : t("error_generate_failed"));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPrompt = () => {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt);
      toast.success(t("success_copied"));
    }
  };

  // Text to Prompt handlers
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
        toast.success(t("success_generated"));
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error enhancing prompt:", error);
      toast.error(error instanceof Error ? error.message : t("error_generate_failed"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditWithAI = async () => {
    if (!textPrompt.trim()) {
      toast.error("Please enter a prompt first");
      return;
    }

    if (!editInstruction.trim()) {
      toast.error("Please enter edit instructions");
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
        setEditInstruction(""); // Clear instruction for next use
        toast.success("Prompt edited successfully!");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error editing prompt:", error);
      toast.error(error instanceof Error ? error.message : "Failed to edit prompt. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTranslate = async () => {
    if (!textPrompt.trim()) {
      toast.error("Please enter a prompt first");
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
        toast.success("Prompt translated successfully!");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error translating prompt:", error);
      toast.error(error instanceof Error ? error.message : "Failed to translate prompt. Please try again.");
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

  // Text to Video handlers
  const handleTextToVideoGenerate = async () => {
    if (!textVideoPrompt.trim()) {
      toast.error(t("error_enter_prompt"));
      return;
    }

    setIsVideoProcessing(true);

    try {
      const response = await fetch("/api/text-to-video-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: textVideoPrompt,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate video prompt");
      }

      const result = await response.json();

      if (result.success && result.videoPrompt) {
        setVideoResultPrompt(result.videoPrompt);
        toast.success(t("success_generated"));
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error generating video prompt:", error);
      toast.error(error instanceof Error ? error.message : t("error_generate_failed"));
    } finally {
      setIsVideoProcessing(false);
    }
  };

  const handleCopyVideoPrompt = () => {
    if (videoResultPrompt) {
      navigator.clipboard.writeText(videoResultPrompt);
      toast.success(t("success_copied"));
    }
  };

  // Image to Video handlers
  const handleVideoImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processVideoImageFile(file);
    }
  };

  const processVideoImageFile = (file: File) => {
    if (file.size > 4 * 1024 * 1024) {
      toast.error(t("file_too_large"));
      return;
    }

    setVideoImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setVideoImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleVideoImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        processVideoImageFile(file);
      } else {
        toast.error(t("invalid_file_type"));
      }
    }
  };

  const handleImageToVideoGenerate = async () => {
    if (!videoImage) {
      toast.error(t("error_upload_first"));
      return;
    }

    setIsVideoGenerating(true);

    try {
      const formData = new FormData();
      formData.append("img", videoImage);
      formData.append("cameraMovement", cameraMovement);
      formData.append("outputLanguage", outputLanguage);

      const response = await fetch("/api/image-to-video-prompt", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate video prompt");
      }

      const result = await response.json();

      if (result.success && result.videoPrompt) {
        setVideoPromptResult(result.videoPrompt);
        toast.success(t("success_generated"));
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error generating video prompt:", error);
      toast.error(error instanceof Error ? error.message : t("error_generate_failed"));
    } finally {
      setIsVideoGenerating(false);
    }
  };

  const handleCopyVideoImagePrompt = () => {
    if (videoPromptResult) {
      navigator.clipboard.writeText(videoPromptResult);
      toast.success(t("success_copied"));
    }
  };

  // Prevent hydration mismatch by not rendering dynamic content until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-purple-50/20 dark:to-purple-950/10">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 text-foreground">Free Image to Prompt Generator</h1>
            <p className="text-muted-foreground">
              Convert Image to Prompt to generate your own image
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
          {apiStatus === "not_configured" && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-lg">
              <span className="text-sm text-foreground">
                {t("api_not_configured")}
              </span>
            </div>
          )}
          {apiStatus === "checking" && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-900/30 text-muted-foreground rounded-lg">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-foreground">{t("api_checking")}</span>
            </div>
          )}
        </div>

        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="text-to-video" className="w-full">
            <TabsList className="mb-8 bg-card p-1 border border-border">
              <TabsTrigger
                value="text-to-video"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white px-6 py-2.5 rounded-md transition-all flex items-center gap-2"
              >
                <Video className="h-4 w-4" />
                <span className="hidden sm:inline">{t("tab_text_to_video")}</span>
                <span className="sm:hidden">T2V</span>
              </TabsTrigger>
              <TabsTrigger
                value="image-to-video"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white px-6 py-2.5 rounded-md transition-all flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                <span className="hidden sm:inline">{t("tab_image_to_video")}</span>
                <span className="sm:hidden">I2V</span>
              </TabsTrigger>
            </TabsList>
            {/* Text to Video TabsContent */}
            <TabsContent value="text-to-video">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 items-start">
                {/* Left Panel - Input */}
                <div>
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4 text-foreground">{t("prompt_label")}</h3>
                    <div className="relative">
                      <Textarea
                        placeholder={t("prompt_placeholder")}
                        value={textVideoPrompt}
                        onChange={(e) => setTextVideoPrompt(e.target.value)}
                        maxLength={2048}
                        className="min-h-[200px] resize-none border-purple-300 dark:border-purple-700 focus:border-purple-500 focus:ring-purple-500"
                      />
                      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-1 rounded">
                        {textVideoPrompt.length}/2048
                      </div>
                    </div>

                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-purple-300 dark:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all hover:scale-105"
                        onClick={handleTextToVideoGenerate}
                        disabled={isVideoProcessing || !textVideoPrompt.trim()}
                      >
                        {isVideoProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {t("processing")}
                          </>
                        ) : (
                          <>
                            <Wand2 className="h-4 w-4 mr-2" />
                            {t("magic_enhance")}
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-2">
                        {t("video_prompt_formula")}
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        {t("formula_desc")}
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                        <li>{t("formula_tip1")}</li>
                        <li>{t("formula_tip2")}</li>
                        <li>{t("formula_tip3")}</li>
                        <li>{t("formula_tip4")}</li>
                      </ul>
                    </div>
                  </Card>
                </div>

                {/* Arrow Indicator - Only visible on large screens */}
                <div className="hidden lg:flex items-center justify-center pt-20">
                  <div className={`text-4xl font-bold transition-all duration-500 ${
                    isVideoProcessing 
                      ? 'text-purple-600 dark:text-purple-400 animate-pulse' 
                      : 'text-gray-300 dark:text-gray-700'
                  }`}>
                    &gt;&gt;
                  </div>
                </div>

                {/* Right Panel - Result */}
                <div>
                  <Card className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold text-foreground">{t("result_label")}</h3>
                      {videoResultPrompt && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCopyVideoPrompt}
                          className="hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          {t("copy")}
                        </Button>
                      )}
                    </div>
                    <div className="min-h-[200px] p-4 bg-muted/10/50 rounded-lg border border-border transition-all duration-300">
                      {isVideoProcessing ? (
                        <div className="flex flex-col items-center justify-center h-full text-purple-600 dark:text-purple-400">
                          <Loader2 className="h-12 w-12 mb-4 animate-spin" />
                          <p className="text-sm font-medium">{t("generating_message")}</p>
                          <p className="text-xs text-muted-foreground mt-2">{t("generating_wait")}</p>
                        </div>
                      ) : videoResultPrompt ? (
                        <div className="animate-in fade-in duration-500">
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{videoResultPrompt}</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                          <Video className="h-12 w-12 mb-4 opacity-50" />
                          <p className="text-sm">{t("result_placeholder")}</p>
                          <p className="text-xs text-muted-foreground mt-2">{t("result_hint")}</p>
                        </div>
                      )}
                    </div>

                    {videoResultPrompt && !isVideoProcessing && (
                      <div className="mt-4 flex gap-2 animate-in fade-in duration-500">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setTextVideoPrompt(videoResultPrompt);
                            setVideoResultPrompt("");
                            toast.success(t("moved_to_input"));
                          }}
                          className="flex-1 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        >
                          ↑ {t("use_as_input")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setVideoResultPrompt("");
                            toast.success(t("result_cleared"));
                          }}
                          className="hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <X className="h-4 w-4 mr-1" />
                          {t("clear")}
                        </Button>
                      </div>
                    )}
                  </Card>
                </div>
              </div>

              {/* How to Use Section */}
              <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30">
                      <Video className="h-5 w-5 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-foreground">{t("what_is_title")}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("what_is_desc")}
                  </p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30">
                      <Wand2 className="h-5 w-5 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-foreground">{t("what_makes_good_title")}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("what_makes_good_desc")}
                  </p>
                </Card>
              </div>
            </TabsContent>

            {/* Image to Video TabsContent */}
            <TabsContent value="image-to-video">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Panel - Upload & Settings */}
                <div>
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4 text-foreground">{t("upload_image")}</h3>
                    <label htmlFor="video-image-upload" className="cursor-pointer">
                      <div
                        className="border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-lg p-8 text-center hover:border-purple-400 transition-colors h-[300px] flex items-center justify-center"
                        onDragOver={handleDragOver}
                        onDrop={handleVideoImageDrop}
                      >
                        {videoImagePreview ? (
                          <div className="relative w-full">
                            <img
                              src={videoImagePreview}
                              alt="Uploaded"
                              className="max-w-full h-auto rounded-lg mx-auto max-h-[250px] object-contain"
                            />
                            <Button
                              size="sm"
                              variant="destructive"
                              className="absolute top-2 right-2"
                              onClick={(e) => {
                                e.preventDefault();
                                setVideoImage(null);
                                setVideoImagePreview(null);
                                setVideoPromptResult("");
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <Upload className="h-12 w-12 mx-auto mb-4 text-purple-400" />
                            <p className="text-lg font-medium mb-2">{t("upload_hint")}</p>
                            <p className="text-sm text-muted-foreground">{t("upload_format")}</p>
                          </div>
                        )}
                      </div>
                      <input
                        id="video-image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleVideoImageUpload}
                      />
                    </label>

                    <div className="mt-6 space-y-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          {t("camera_movement")}
                        </label>
                        <Select value={cameraMovement} onValueChange={setCameraMovement}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">{t("camera_auto")}</SelectItem>
                            <SelectItem value="static">{t("camera_static")}</SelectItem>
                            <SelectItem value="subject-tracking">{t("camera_tracking")}</SelectItem>
                            <SelectItem value="handheld">{t("camera_handheld")}</SelectItem>
                            <SelectItem value="push-in">{t("camera_push_in")}</SelectItem>
                            <SelectItem value="pull-out">{t("camera_pull_out")}</SelectItem>
                            <SelectItem value="zoom-in">{t("camera_zoom_in")}</SelectItem>
                            <SelectItem value="zoom-out">{t("camera_zoom_out")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          {t("output_language")}
                        </label>
                        <Select value={outputLanguage} onValueChange={setOutputLanguage}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="zh">中文</SelectItem>
                            <SelectItem value="es">Español</SelectItem>
                            <SelectItem value="fr">Français</SelectItem>
                            <SelectItem value="de">Deutsch</SelectItem>
                            <SelectItem value="ja">日本語</SelectItem>
                            <SelectItem value="ko">한국어</SelectItem>
                            <SelectItem value="pt">Português</SelectItem>
                            <SelectItem value="ru">Русский</SelectItem>
                            <SelectItem value="ar">العربية</SelectItem>
                            <SelectItem value="it">Italiano</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                        onClick={handleImageToVideoGenerate}
                        disabled={isVideoGenerating || !videoImage}
                      >
                        {isVideoGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t("generating")}
                          </>
                        ) : (
                          t("generate_prompt")
                        )}
                      </Button>
                    </div>
                  </Card>
                </div>

                {/* Right Panel - Result */}
                <div>
                  <Card className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold text-foreground">{t("generated_video_prompt")}</h3>
                      {videoPromptResult && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCopyVideoImagePrompt}
                          className="hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          {t("copy")}
                        </Button>
                      )}
                    </div>
                    <div className="min-h-[400px] p-4 bg-muted/10/50 rounded-lg border border-border">
                      {isVideoGenerating ? (
                        <div className="flex flex-col items-center justify-center h-full text-purple-600 dark:text-purple-400">
                          <Loader2 className="h-12 w-12 mb-4 animate-spin" />
                          <p className="text-sm font-medium">{t("analyzing_message")}</p>
                          <p className="text-xs text-muted-foreground mt-2">{t("generating_wait")}</p>
                        </div>
                      ) : videoPromptResult ? (
                        <div className="animate-in fade-in duration-500">
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{videoPromptResult}</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                          <Camera className="h-12 w-12 mb-4 opacity-50" />
                          <p className="text-sm">{t("generated_placeholder")}</p>
                          <p className="text-xs text-muted-foreground mt-2">{t("generated_hint")}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </div>

              {/* How to Use Section */}
              <div className="mt-16">
                <h3 className="text-2xl font-bold text-center mb-8 text-foreground">{t("how_to_use_title")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <Card className="p-4">
                    <div className="text-2xl font-bold text-purple-600 mb-2">1</div>
                    <p className="text-sm">{t("i2v_step1")}</p>
                  </Card>
                  <Card className="p-4">
                    <div className="text-2xl font-bold text-purple-600 mb-2">2</div>
                    <p className="text-sm">{t("i2v_step2")}</p>
                  </Card>
                  <Card className="p-4">
                    <div className="text-2xl font-bold text-purple-600 mb-2">3</div>
                    <p className="text-sm">{t("i2v_step3")}</p>
                  </Card>
                  <Card className="p-4">
                    <div className="text-2xl font-bold text-purple-600 mb-2">4</div>
                    <p className="text-sm">{t("i2v_step4")}</p>
                  </Card>
                  <Card className="p-4">
                    <div className="text-2xl font-bold text-purple-600 mb-2">5</div>
                    <p className="text-sm">{t("i2v_step5")}</p>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          {/* Edit with AI Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <Edit className="h-5 w-5 text-purple-600" />
                    Edit with AI
                  </DialogTitle>
                  <DialogDescription className="text-base pt-2">
                    Tell AI how you want to modify your prompt. Be specific about what to change.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Edit Instruction
                  </label>
                  <Textarea
                    placeholder="Example: Make it more artistic, add sunset lighting, change to watercolor style..."
                    value={editInstruction}
                    onChange={(e) => setEditInstruction(e.target.value)}
                    className="min-h-[120px] focus:border-purple-500 focus:ring-purple-500"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    💡 Tip: Be clear and specific. For example: "Add more details about the lighting" or "Change the style to cyberpunk"
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
                    Cancel
                  </Button>
                  <Button
                    onClick={handleEditWithAI}
                    disabled={!editInstruction.trim()}
                    className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all"
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    Apply Edit
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
                    Translate Prompt
                  </DialogTitle>
                  <DialogDescription className="text-base pt-2">
                    Choose your preferred target language for translation.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Target Language
                  </label>
                  <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                    <SelectTrigger className="w-full h-11 focus:ring-purple-500">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem value="en">
                        <span className="flex items-center gap-2">
                          🇬🇧 English
                        </span>
                      </SelectItem>
                      <SelectItem value="zh">
                        <span className="flex items-center gap-2">
                          🇨🇳 中文 (Chinese)
                        </span>
                      </SelectItem>
                      <SelectItem value="es">
                        <span className="flex items-center gap-2">
                          🇪🇸 Español (Spanish)
                        </span>
                      </SelectItem>
                      <SelectItem value="fr">
                        <span className="flex items-center gap-2">
                          🇫🇷 Français (French)
                        </span>
                      </SelectItem>
                      <SelectItem value="de">
                        <span className="flex items-center gap-2">
                          🇩🇪 Deutsch (German)
                        </span>
                      </SelectItem>
                      <SelectItem value="ja">
                        <span className="flex items-center gap-2">
                          🇯🇵 日本語 (Japanese)
                        </span>
                      </SelectItem>
                      <SelectItem value="ko">
                        <span className="flex items-center gap-2">
                          🇰🇷 한국어 (Korean)
                        </span>
                      </SelectItem>
                      <SelectItem value="pt">
                        <span className="flex items-center gap-2">
                          🇵🇹 Português (Portuguese)
                        </span>
                      </SelectItem>
                      <SelectItem value="ru">
                        <span className="flex items-center gap-2">
                          🇷🇺 Русский (Russian)
                        </span>
                      </SelectItem>
                      <SelectItem value="ar">
                        <span className="flex items-center gap-2">
                          🇸🇦 العربية (Arabic)
                        </span>
                      </SelectItem>
                      <SelectItem value="it">
                        <span className="flex items-center gap-2">
                          🇮🇹 Italiano (Italian)
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-2">
                    💡 Tip: English prompts work best with most AI image generators
                  </p>
                </div>
                <DialogFooter className="gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsTranslateDialogOpen(false)}
                    className="flex-1 sm:flex-none"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleTranslate}
                    className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Translate
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <p className="text-muted-foreground mb-2">
              {t("cta_text")}{" "}
              <a href="#" className="text-purple-600 hover:underline font-medium">
                {t("cta_link")}
              </a>{" "}
              {t("cta_suffix")}
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
