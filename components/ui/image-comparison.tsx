'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface ImageComparisonProps {
  beforeImage: string
  afterImage: string
  beforeAlt?: string
  afterAlt?: string
  className?: string
}

export function ImageComparison({
  beforeImage,
  afterImage,
  beforeAlt = 'Before',
  afterAlt = 'After',
  className = ''
}: ImageComparisonProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = (x / rect.width) * 100

    setSliderPosition(Math.min(Math.max(percentage, 0), 100))
  }, [])

  const handleMouseDown = () => setIsDragging(true)
  const handleMouseUp = () => setIsDragging(false)

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return
    handleMove(e.clientX)
  }, [isDragging, handleMove])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return
    handleMove(e.touches[0].clientX)
  }, [isDragging, handleMove])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove)
      document.addEventListener('touchend', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleTouchMove])

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-[4/3] overflow-hidden rounded-lg select-none ${className}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      {/* Before Image (Full) */}
      <div className="absolute inset-0">
        <Image
          src={beforeImage}
          alt={beforeAlt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* After Image (Clipped) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <Image
          src={afterImage}
          alt={afterAlt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Slider */}
      <div
        className="absolute inset-y-0 w-0.5 bg-white cursor-ew-resize"
        style={{
          left: `${sliderPosition}%`,
          boxShadow: '0 0 4px rgba(0, 0, 0, 0.35)'
        }}
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-2 rounded-full border-2 border-white"
          style={{
            width: '56px',
            height: '56px',
            backdropFilter: 'blur(7px)',
            backgroundColor: 'rgba(0, 0, 0, 0.125)',
            boxShadow: '0 0 4px rgba(0, 0, 0, 0.35)'
          }}
        >
          {/* Left Arrow */}
          <div
            style={{
              width: 0,
              height: 0,
              borderTop: '8px solid transparent',
              borderRight: '10px solid white',
              borderBottom: '8px solid transparent'
            }}
          />
          {/* Right Arrow */}
          <div
            style={{
              width: 0,
              height: 0,
              borderTop: '8px solid transparent',
              borderRight: '10px solid white',
              borderBottom: '8px solid transparent',
              transform: 'rotate(180deg)'
            }}
          />
        </div>
      </div>
    </div>
  )
}
