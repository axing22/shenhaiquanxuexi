"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Download, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface CompressedImage {
  original: File;
  compressed: Blob | null;
  originalSize: number;
  compressedSize: number;
  savings: number;
  preview: string;
  compressedPreview: string | null;
}

type OutputFormat = "auto" | "webp" | "jpeg" | "png";

export default function ImageCompressPage() {
  const t = useTranslations("imageCompress");
  const [images, setImages] = useState<CompressedImage[]>([]);
  const [compressing, setCompressing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("auto");
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState("");

  // 前端WebP压缩
  const compressImageToWebP = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = document.createElement("img");
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          let width = img.width;
          let height = img.height;

          const maxDimension = 4096;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, 0, 0, width, height);
          }

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error("WebP compression failed"));
              }
            },
            "image/webp",
            0.85
          );
        };
        img.onerror = () => reject(new Error("Failed to load image"));
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
    });
  };

  // 后端API压缩（PNG/JPEG）
  const compressImageViaAPI = async (file: File, format: "png" | "jpeg"): Promise<{ blob: Blob; compressedSize: number; compressedUrl: string }> => {
    const reader = new FileReader();
    const base64 = await new Promise<string>((resolve, reject) => {
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const response = await fetch('/api/image-slimCompress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64: base64,
        format: format,
        quality: 80,
        mode: 'url'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'API compression failed');
    }

    const result = await response.json();

    // 检查返回的数据结构 (code 1000 表示成功)
    if (result.code !== 1000 && result.code !== 0) {
      throw new Error(result.message || 'API returned error');
    }

    const data = result.data;

    // 直接下载压缩后的图片，通过代理API
    if (data.compressedUrl) {
      const proxyUrl = `/api/image-download?url=${encodeURIComponent(data.compressedUrl)}`;
      const imageResponse = await fetch(proxyUrl);
      const blob = await imageResponse.blob();
      const blobUrl = URL.createObjectURL(blob);

      return {
        blob: blob,
        compressedSize: data.compressedSize,
        compressedUrl: blobUrl
      };
    } else if (data.url) {
      const proxyUrl = `/api/image-download?url=${encodeURIComponent(data.url)}`;
      const imageResponse = await fetch(proxyUrl);
      const blob = await imageResponse.blob();
      const blobUrl = URL.createObjectURL(blob);

      return {
        blob: blob,
        compressedSize: data.compressedSize,
        compressedUrl: blobUrl
      };
    } else if (data.imageBase64) {
      // 如果返回base64，转换为blob
      const base64Data = data.imageBase64.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: `image/${format}` });
      const blobUrl = URL.createObjectURL(blob);
      return {
        blob: blob,
        compressedSize: data.compressedSize || byteArray.length,
        compressedUrl: blobUrl
      };
    }

    throw new Error('Invalid API response: no url or imageBase64');
  };

  const compressImage = async (file: File, format: OutputFormat): Promise<{ blob: Blob; compressedSize: number; compressedUrl: string }> => {
    // 确定目标格式
    let targetFormat: "webp" | "png" | "jpeg" = "webp";

    if (format === "auto") {
      // auto模式：保持原格式
      if (file.type === "image/png") {
        targetFormat = "png";
      } else if (file.type === "image/jpeg" || file.type === "image/jpg") {
        targetFormat = "jpeg";
      } else if (file.type === "image/webp") {
        targetFormat = "webp";
      }
    } else {
      targetFormat = format as "webp" | "png" | "jpeg";
    }

    // WebP使用前端压缩
    if (targetFormat === "webp") {
      const blob = await compressImageToWebP(file);
      const blobUrl = URL.createObjectURL(blob);
      return { blob, compressedSize: blob.size, compressedUrl: blobUrl };
    }

    // PNG/JPEG使用后端API压缩
    return await compressImageViaAPI(file, targetFormat);
  };

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter((file) => {
      if (!file.type.match(/image\/(png|jpe?g|webp)/)) {
        toast.error(t("invalid_file_type"));
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t("file_too_large"));
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setCompressing(true);
    setProgress(0);

    const total = validFiles.length;
    const minDurationPerFile = 3000; // 每个文件至少 3 秒
    const maxDurationPerFile = 5000; // 每个文件最多 5 秒

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      setCurrentFile(file.name);

      // 随机选择一个持续时间（3-5秒）
      const duration = Math.random() * (maxDurationPerFile - minDurationPerFile) + minDurationPerFile;
      const startTime = Date.now();

      try {
        // 阶段 1: 0-20% - 读取文件
        setProgress(Math.round(((i) / total) * 100));
        await new Promise(resolve => setTimeout(resolve, duration * 0.2));
        setProgress(Math.round(((i) / total) * 100) + Math.round(20 / total));

        // 阶段 2: 20-50% - 开始压缩
        const preview = URL.createObjectURL(file);
        await new Promise(resolve => setTimeout(resolve, duration * 0.15));
        setProgress(Math.round(((i) / total) * 100) + Math.round(35 / total));

        // 阶段 3: 50-80% - 压缩处理中
        const compressPromise = compressImage(file, outputFormat);
        await new Promise(resolve => setTimeout(resolve, duration * 0.2));
        setProgress(Math.round(((i) / total) * 100) + Math.round(60 / total));

        const compressResult = await compressPromise;

        // 阶段 4: 80-95% - 生成预览
        await new Promise(resolve => setTimeout(resolve, duration * 0.15));
        setProgress(Math.round(((i) / total) * 100) + Math.round(80 / total));

        // 使用返回的 blob URL 作为预览
        const compressedPreview = compressResult.compressedUrl;

        const originalSize = file.size;
        const compressedSize = compressResult.compressedSize;
        const savings = Math.round(((originalSize - compressedSize) / originalSize) * 100);

        // 阶段 5: 95-100% - 完成
        await new Promise(resolve => setTimeout(resolve, duration * 0.1));

        setImages((prev) => [
          ...prev,
          {
            original: file,
            compressed: compressResult.blob,
            originalSize,
            compressedSize,
            savings,
            preview,
            compressedPreview,
          },
        ]);

        // 确保至少经过了指定的时间
        const elapsed = Date.now() - startTime;
        if (elapsed < duration) {
          await new Promise(resolve => setTimeout(resolve, duration - elapsed));
        }

        // 完成当前文件
        setProgress(Math.round(((i + 1) / total) * 100));
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error: any) {
        console.error("Compression error:", error);
        toast.error(error.message || t("compression_failed"));
      }
    }

    setCompressing(false);
    setProgress(0);
    setCurrentFile("");
    toast.success(t("compression_success"));
  }, [outputFormat, t]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const downloadImage = (image: CompressedImage) => {
    if (!image.compressed || !image.compressedPreview) return;

    const originalName = image.original.name.replace(/\.[^/.]+$/, "");
    let extension = "png";

    // 从 blob type 判断格式
    if (image.compressed.type === "image/webp") {
      extension = "webp";
    } else if (image.compressed.type === "image/jpeg" || image.compressed.type === "image/jpg") {
      extension = "jpg";
    } else if (image.compressed.type === "image/png") {
      extension = "png";
    }

    // 直接使用已有的 blob URL 下载
    const a = document.createElement("a");
    a.href = image.compressedPreview;
    a.download = `${originalName}-compressed.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(t("download_success"));
  };

  const downloadAll = () => {
    images.forEach((image) => {
      if (image.compressed) {
        downloadImage(image);
      }
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      const removed = newImages.splice(index, 1)[0];
      URL.revokeObjectURL(removed.preview);
      // 只清理本地 blob URL，不清理远程 URL
      if (removed.compressedPreview && removed.compressedPreview.startsWith('blob:')) {
        URL.revokeObjectURL(removed.compressedPreview);
      }
      return newImages;
    });
  };

  const clearAll = () => {
    images.forEach((image) => {
      URL.revokeObjectURL(image.preview);
      // 只清理本地 blob URL，不清理远程 URL
      if (image.compressedPreview && image.compressedPreview.startsWith('blob:')) {
        URL.revokeObjectURL(image.compressedPreview);
      }
    });
    setImages([]);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const totalSavings = images.reduce((acc, img) => acc + (img.originalSize - img.compressedSize), 0);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
          <p className="text-base text-muted-foreground">{t("subtitle")}</p>
        </div>

        {/* Output Format Selection */}
        <Card className="mb-3 p-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm mb-0.5">{t("output_format")}</h3>
              <p className="text-xs text-muted-foreground">{t("output_format_desc")}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={outputFormat === "auto" ? "default" : "outline"}
                size="sm"
                onClick={() => setOutputFormat("auto")}
              >
                {t("format_auto")}
              </Button>
              <Button
                variant={outputFormat === "webp" ? "default" : "outline"}
                size="sm"
                onClick={() => setOutputFormat("webp")}
              >
                WebP
              </Button>
              <Button
                variant={outputFormat === "jpeg" ? "default" : "outline"}
                size="sm"
                onClick={() => setOutputFormat("jpeg")}
              >
                JPEG
              </Button>
              <Button
                variant={outputFormat === "png" ? "default" : "outline"}
                size="sm"
                onClick={() => setOutputFormat("png")}
              >
                PNG
              </Button>
            </div>
          </div>
        </Card>

        {/* Upload Area and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Upload Area */}
          <Card className="lg:col-span-2">
            <div
              className={`p-6 border-2 border-dashed rounded-lg transition-colors ${
                dragActive ? "border-primary bg-primary/5" : "border-border"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="text-center">
                <Upload className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
                <h3 className="text-base font-semibold mb-1.5">{t("upload_title")}</h3>
                <p className="text-xs text-muted-foreground mb-2.5">{t("upload_description")}</p>
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileInput}
                  className="hidden"
                />
                <Button asChild disabled={compressing} size="sm">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {t("select_images")}
                  </label>
                </Button>
                <p className="text-xs text-muted-foreground mt-2.5">{t("supported_formats")}</p>
              </div>
            </div>
          </Card>

          {/* Stats */}
          {images.length > 0 && (
            <div className="flex flex-col gap-3">
              <Card className="p-4 flex-1">
                <div className="text-center">
                  <ImageIcon className="w-6 h-6 mx-auto mb-1.5 text-primary" />
                  <div className="text-xl font-bold">{images.length}</div>
                  <div className="text-xs text-muted-foreground">{t("images_compressed")}</div>
                </div>
              </Card>
              <Card className="p-4 flex-1">
                <div className="text-center">
                  <Download className="w-6 h-6 mx-auto mb-1.5 text-green-500" />
                  <div className="text-xl font-bold">{formatSize(totalSavings)}</div>
                  <div className="text-xs text-muted-foreground">{t("total_saved")}</div>
                </div>
              </Card>
              <Card className="p-4 flex-1">
                <div className="text-center">
                  <div className="text-xl font-bold">
                    {Math.round((totalSavings / images.reduce((acc, img) => acc + img.originalSize, 0)) * 100)}%
                  </div>
                  <div className="text-xs text-muted-foreground">{t("average_reduction")}</div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {images.length > 0 && (
          <div className="flex gap-3 mb-4">
            <Button onClick={downloadAll} size="sm">
              <Download className="w-4 h-4 mr-2" />
              {t("download_all")}
            </Button>
            <Button onClick={clearAll} variant="outline" size="sm">
              <X className="w-4 h-4 mr-2" />
              {t("clear_all")}
            </Button>
          </div>
        )}

        {/* Compressing Progress */}
        {compressing && (
          <Card className="p-4 mb-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <div>
                    <p className="font-semibold text-sm">{t("compressing")}</p>
                    <p className="text-xs text-muted-foreground">{currentFile}</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-primary">{progress}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Image List */}
        <div className="space-y-3">
          {images.map((image, index) => (
            <Card key={index} className="p-4">
              <div className="flex flex-col md:flex-row gap-4 items-start">
                {/* Preview */}
                <div className="flex gap-3">
                  <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <Image
                      src={image.preview}
                      alt="Original"
                      fill
                      className="object-cover"
                    />
                  </div>
                  {image.compressedPreview && (
                    <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <Image
                        src={image.compressedPreview}
                        alt="Compressed"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm mb-1.5 truncate">{image.original.name}</h4>
                  <div className="space-y-0.5 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>{t("original_size")}:</span>
                      <span className="font-medium">{formatSize(image.originalSize)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("compressed_size")}:</span>
                      <span className="font-medium text-green-600">{formatSize(image.compressedSize)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("savings")}:</span>
                      <span className="font-bold text-green-600">{image.savings}%</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <Button onClick={() => downloadImage(image)} size="sm">
                    <Download className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">{t("download")}</span>
                  </Button>
                  <Button onClick={() => removeImage(index)} variant="outline" size="sm">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* How it works */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6 text-center">{t("how_it_works_title")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="font-semibold mb-2">{t("step1_title")}</h3>
              <p className="text-sm text-muted-foreground">{t("step1_desc")}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="font-semibold mb-2">{t("step2_title")}</h3>
              <p className="text-sm text-muted-foreground">{t("step2_desc")}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="font-semibold mb-2">{t("step3_title")}</h3>
              <p className="text-sm text-muted-foreground">{t("step3_desc")}</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6 text-center">{t("faq_title")}</h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            <Card className="p-6">
              <h3 className="font-semibold mb-2">{t("faq_q1")}</h3>
              <p className="text-sm text-muted-foreground">{t("faq_a1")}</p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">{t("faq_q2")}</h3>
              <p className="text-sm text-muted-foreground">{t("faq_a2")}</p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">{t("faq_q3")}</h3>
              <p className="text-sm text-muted-foreground">{t("faq_a3")}</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
