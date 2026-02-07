'use client';

import { useEffect, useRef, useState } from 'react';

const videos = [
  'https://chatmix.top/pixmind/index_video_demo1.mp4',
  'https://chatmix.top/pixmind/index_video_demo2.mp4',
];

export function VideoCarousel() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // 预加载所有视频
  useEffect(() => {
    videoRefs.current.forEach((video) => {
      if (video) {
        video.load();
      }
    });
  }, []);

  // 处理视频播放结束
  useEffect(() => {
    const currentVideo = videoRefs.current[currentVideoIndex];
    if (!currentVideo) return;

    const handleVideoEnd = () => {
      const nextIndex = (currentVideoIndex + 1) % videos.length;
      setCurrentVideoIndex(nextIndex);

      // 立即播放下一个视频
      const nextVideo = videoRefs.current[nextIndex];
      if (nextVideo) {
        nextVideo.currentTime = 0;
        nextVideo.play().catch((error) => {
          console.log('Video autoplay failed:', error);
        });
      }
    };

    currentVideo.addEventListener('ended', handleVideoEnd);

    return () => {
      currentVideo.removeEventListener('ended', handleVideoEnd);
    };
  }, [currentVideoIndex]);

  // 播放当前视频
  useEffect(() => {
    const currentVideo = videoRefs.current[currentVideoIndex];
    if (currentVideo) {
      currentVideo.play().catch((error) => {
        console.log('Video autoplay failed:', error);
      });
    }
  }, [currentVideoIndex]);

  return (
    <div className="relative w-full h-full">
      {videos.map((videoSrc, index) => (
        <video
          key={videoSrc}
          ref={(el) => {
            videoRefs.current[index] = el;
          }}
          className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-500 ${
            index === currentVideoIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
          muted
          playsInline
          preload="auto"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ))}
    </div>
  );
}
