'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { 
  Upload, 
  X, 
  FileVideo, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface FileWithPreview extends File {
  preview?: string;
}

interface FileUploadProps {
  accept?: Record<string, string[]>;
  multiple?: boolean;
  maxSize?: number;
  onFilesChange?: (files: File[]) => void;
  className?: string;
  disabled?: boolean;
  uploadProgress?: number;
  isUploading?: boolean;
  type?: 'video' | 'image';
}

export function FileUpload({
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    'video/*': ['.mp4', '.mov', '.avi', '.mkv']
  },
  multiple = false,
  maxSize = 200 * 1024 * 1024, // 200MB
  onFilesChange,
  className,
  disabled = false,
  uploadProgress = 0,
  isUploading = false,
  type = 'image'
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const [isDragActive, setIsDragActive] = useState(false);

  const validateFile = useCallback((file: File) => {
    // Check file size
    if (file.size > maxSize) {
      return `文件 "${file.name}" 太大，请选择小于 ${Math.round(maxSize / 1024 / 1024)}MB 的文件`;
    }

    // Check file type
    const fileType = file.type;
    const isValidType = Object.keys(accept).some(acceptKey => {
      if (acceptKey === 'image/*' && fileType.startsWith('image/')) return true;
      if (acceptKey === 'video/*' && fileType.startsWith('video/')) return true;
      return accept[acceptKey]?.some(ext => file.name.toLowerCase().endsWith(ext.replace('.', '')));
    });

    if (!isValidType) {
      return `文件 "${file.name}" 格式不支持`;
    }

    return null;
  }, [accept, maxSize]);

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    setErrors([]);
    const fileArray = Array.from(newFiles);
    const validFiles: FileWithPreview[] = [];
    const errorMessages: string[] = [];

    // Validate files
    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errorMessages.push(error);
      } else {
        const fileWithPreview = Object.assign(file, {
          preview: type === 'image' ? URL.createObjectURL(file) : undefined
        });
        validFiles.push(fileWithPreview);
      }
    });

    // Check file count limit
    if (!multiple && validFiles.length > 1) {
      errorMessages.push('只能选择一个文件');
      return;
    }

    if (errorMessages.length > 0) {
      setErrors(errorMessages);
    }

    if (validFiles.length > 0) {
      const updatedFiles = multiple ? [...files, ...validFiles] : validFiles;
      setFiles(updatedFiles);
      onFilesChange?.(updatedFiles);
    }
  }, [files, multiple, onFilesChange, type, validateFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragActive(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    if (disabled || isUploading) return;
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors text-center',
          isDragActive && 'border-primary bg-primary/5',
          files.length > 0 && 'border-primary bg-primary/5',
          (disabled || isUploading) && 'opacity-50 cursor-not-allowed',
          'hover:border-primary hover:bg-primary/5'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload-input')?.click()}
      >
        <input
          id="file-upload-input"
          type="file"
          className="hidden"
          accept={Object.keys(accept).join(',')}
          multiple={multiple}
          onChange={handleFileInputChange}
          disabled={disabled || isUploading}
        />
        
        <div className="space-y-2">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
            {files.length > 0 ? (
              <CheckCircle2 className="h-6 w-6 text-primary" />
            ) : (
              <Upload className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          
          {files.length > 0 ? (
            <div>
              <p className="font-medium">
                {type === 'video' 
                  ? `已选择视频: ${files[0].name}`
                  : `已选择 ${files.length} 个文件`
                }
              </p>
              <p className="text-sm text-muted-foreground">
                点击或拖拽添加更多文件
              </p>
            </div>
          ) : (
            <div>
              <p className="font-medium">
                {isDragActive ? '释放文件到这里' : '点击上传或拖拽文件到这里'}
              </p>
              <p className="text-sm text-muted-foreground">
                {type === 'video' 
                  ? '支持 MP4, MOV 格式 (h264编码)，最大 200MB，分辨率 360p ~ 4K，时长 5秒 ~ 5分钟'
                  : '图片格式支持 .jpg/.jpeg/.png，文件大小不超过10MB，分辨率不小于300×300px，宽高比1:2.5～2.5:1'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>上传进度</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">
            已选择文件 ({files.length})
          </h4>
          <div className="grid gap-2">
            {files.map((file, index) => (
              <Card key={index} className="p-3">
                <div className="flex items-center gap-3">
                  {/* File Icon/Preview */}
                  <div className="flex-shrink-0">
                    {type === 'image' && file.preview ? (
                      <div className="relative w-10 h-10">
                        <Image
                          src={file.preview}
                          alt={file.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    ) : type === 'video' ? (
                      <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                        <FileVideo className="h-5 w-5 text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  
                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => removeFile(index)}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}