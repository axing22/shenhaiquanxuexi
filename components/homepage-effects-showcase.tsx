'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface EffectItem {
  template_id: number
  display_name: string
  web_thumbnail_gif_url: string
  web_thumbnail_video_url: string
  marker: string
  i18n_json: string
}

export function HomepageEffectsShowcase({ locale }: { locale: string }) {
  const router = useRouter()
  const [effects, setEffects] = useState<EffectItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    fetchEffects()
  }, [])

  useEffect(() => {
    if (selectedVideo && videoRef.current) {
      videoRef.current.play()
    }
  }, [selectedVideo])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedVideo(null)
      }
    }

    if (selectedVideo) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [selectedVideo])

  const fetchEffects = async () => {
    try {
      const response = await fetch('/api/video-effects')
      const data = await response.json()

      if (data.effect_items) {
        // 只取前8个特效
        setEffects(data.effect_items.slice(0, 8))
      }
    } catch (error) {
      console.error('Failed to fetch effects:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLocalizedName = (i18nJson: string) => {
    try {
      const i18n = JSON.parse(i18nJson)
      const localeKey = locale === 'zh' ? 'zh-CN' : 'en-US'
      return i18n[localeKey]?.display_name || i18n['en-US']?.display_name || ''
    } catch {
      return ''
    }
  }

  const handleVideoClick = (effect: EffectItem) => {
    setSelectedVideo({
      url: effect.web_thumbnail_video_url,
      title: getLocalizedName(effect.i18n_json) || effect.display_name
    })
  }

  const handleGoCreate = (effect: EffectItem, e: React.MouseEvent) => {
    e.stopPropagation()
    const effectToPass = {
      template_id: effect.template_id,
      display_name: effect.display_name,
      web_thumbnail_gif_url: effect.web_thumbnail_gif_url,
      i18n_json: effect.i18n_json,
      marker: effect.marker,
      effect_type: '1'
    }
    const effectParam = encodeURIComponent(JSON.stringify(effectToPass))
    router.push(`/${locale}/pixverse-video?effect=${effectParam}`)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto mb-12">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="relative group cursor-pointer">
            <div className="bg-card border border-border rounded-xl overflow-hidden aspect-video flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 animate-pulse"></div>
            </div>
            <div className="text-center mt-2 h-5 bg-muted rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto mb-12">
        {effects.map((effect) => {
          const localizedName = getLocalizedName(effect.i18n_json) || effect.display_name

          return (
            <div key={effect.template_id} className="flex flex-col">
              <div
                className="relative group cursor-pointer"
                onClick={() => handleVideoClick(effect)}
              >
                <div className="bg-card border border-border rounded-xl overflow-hidden aspect-video relative">
                  <img
                    src={effect.web_thumbnail_gif_url}
                    alt={localizedName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  {/* HOT 标签 */}
                  {effect.marker === 'hot' && (
                    <span className="absolute top-2 left-2 text-white text-xs font-semibold px-2 py-0.5 rounded bg-red-500 shadow-sm z-10">
                      HOT
                    </span>
                  )}

                  {/* Hover overlay with play button */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  {/* Go Create button - positioned at bottom of image */}
                  <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button
                      onClick={(e) => handleGoCreate(effect, e)}
                      className="w-full py-1.5 px-3 bg-purple-600/60 hover:bg-purple-700/70 backdrop-blur-sm text-white text-xs font-medium rounded-md shadow-md transition-all hover:scale-105"
                    >
                      {locale === 'zh' ? '开始创作' : 'Go Create'}
                    </button>
                  </div>
                </div>
              </div>
              <h3 className="text-center mt-2 text-sm font-medium text-foreground line-clamp-2">
                {localizedName}
              </h3>
            </div>
          )
        })}
      </div>

      <div className="text-center">
        <Link href={`/${locale}/video-effects`}>
          <Button
            size="lg"
            variant="outline"
            className="px-8 py-6 text-lg rounded-full border-2"
          >
            Explore More AI Video Effects →
          </Button>
        </Link>
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="relative w-full max-w-4xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {selectedVideo.title && (
              <h3 className="absolute -top-12 left-0 text-white text-lg font-medium">
                {selectedVideo.title}
              </h3>
            )}

            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                src={selectedVideo.url}
                controls
                autoPlay
                loop
                preload="metadata"
                className="w-full h-auto max-h-[80vh]"
              />
            </div>

            {/* Use this Effect Button */}
            <div className="mt-4 text-center">
              <Link href={`/${locale}/pixverse-video`}>
                <Button
                  size="lg"
                  className="px-8 py-3 text-lg rounded-full bg-primary hover:bg-primary/90"
                >
                  {locale === 'zh' ? '使用此特效' : 'Use this Effect'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
