"use client";

import { useState } from "react";

export default function VideoTest() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState("");
  
  const handlePlay = () => {
    const video = document.getElementById('test-video') as HTMLVideoElement;
    if (video) {
      video.play()
        .then(() => {
          setIsPlaying(true);
          setError("");
          console.log("Video playing successfully");
        })
        .catch(err => {
          setError(err.message);
          console.error("Play error:", err);
        });
    }
  };
  
  const handlePause = () => {
    const video = document.getElementById('test-video') as HTMLVideoElement;
    if (video) {
      video.pause();
      setIsPlaying(false);
    }
  };
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4 text-foreground">Video Test Page</h1>
      
      <div className="space-y-8">
        {/* Test 1: Simple video with controls */}
        <div className="border p-4 rounded">
          <h2 className="text-xl mb-2 text-foreground">Test 1: Video with Controls</h2>
          <video 
            controls 
            width="600" 
            src="/videos/anchor_demo.mp4"
            className="border"
          />
        </div>
        
        {/* Test 2: Video with custom controls */}
        <div className="border p-4 rounded">
          <h2 className="text-xl mb-2 text-foreground">Test 2: Custom Controls</h2>
          <video 
            id="test-video"
            width="600" 
            src="/videos/avatar_demo.mp4"
            className="border mb-4"
            muted
          />
          <div className="flex gap-4">
            <button 
              onClick={handlePlay}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Play
            </button>
            <button 
              onClick={handlePause}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Pause
            </button>
          </div>
          {isPlaying && <p className="mt-2 text-green-600">Video is playing</p>}
          {error && <p className="mt-2 text-red-600">Error: {error}</p>}
        </div>
        
        {/* Test 3: Direct HTML5 video */}
        <div className="border p-4 rounded">
          <h2 className="text-xl mb-2 text-foreground">Test 3: Basic HTML5 Video</h2>
          <video width="600" controls>
            <source src="/videos/anchor_demo.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        
        {/* Test 4: Video information */}
        <div className="border p-4 rounded">
          <h2 className="text-xl mb-2 text-foreground">Video Files Status</h2>
          <ul className="list-disc pl-5">
            <li>anchor_demo.mp4: <a href="/videos/anchor_demo.mp4" className="text-blue-500 underline" target="_blank">Open directly</a></li>
            <li>avatar_demo.mp4: <a href="/videos/avatar_demo.mp4" className="text-blue-500 underline" target="_blank">Open directly</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}