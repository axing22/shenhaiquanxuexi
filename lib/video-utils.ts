/**
 * 从视频文件中提取第一帧作为封面图片
 * @param videoFile 视频文件
 * @param time 截取的时间点（秒），默认为1秒
 * @returns 返回图片的 Blob 对象
 */
export async function extractVideoFrame(videoFile: File, time: number = 1): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('无法创建 canvas context'));
      return;
    }

    video.preload = 'metadata';
    video.currentTime = time;
    
    video.onloadeddata = () => {
      // 设置 canvas 尺寸与视频相同
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // 绘制当前帧到 canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // 将 canvas 转换为 Blob
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('无法生成图片'));
        }
        
        // 清理资源
        URL.revokeObjectURL(video.src);
      }, 'image/jpeg', 0.8);
    };

    video.onerror = () => {
      reject(new Error('视频加载失败'));
      URL.revokeObjectURL(video.src);
    };

    // 创建视频 URL
    video.src = URL.createObjectURL(videoFile);
  });
}

/**
 * 将 Blob 转换为 File 对象
 * @param blob Blob 对象
 * @param fileName 文件名
 * @returns File 对象
 */
export function blobToFile(blob: Blob, fileName: string): File {
  return new File([blob], fileName, { type: blob.type });
}