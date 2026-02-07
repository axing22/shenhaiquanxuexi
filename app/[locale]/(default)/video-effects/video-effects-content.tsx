'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface EffectItem {
  template_id: number
  display_name: string
  web_thumbnail_url: string
  web_thumbnail_video_url: string
  web_thumbnail_gif_url: string
  marker: string
  i18n_json: string
  channel_ids: number[]
  display_prompt?: string
  effect_type?: string
}

interface Channel {
  channel_id: number
  channel_name: string
  i18n_json: {
    'en-US': { channel_name: string }
    'zh-CN': { channel_name: string }
  }
}

// 缓存管理
const effectsCache = {
  data: null as any,
  timestamp: 0,
  ttl: 5 * 60 * 1000 // 5分钟缓存
}

const channelsCache = {
  data: null as Channel[] | null,
  timestamp: 0,
  ttl: 5 * 60 * 1000 // 5分钟缓存
}

const ITEMS_PER_PAGE = 20

export function VideoEffectsContent({ locale }: { locale: string }) {
  const router = useRouter()
  const [effectItems, setEffectItems] = useState<EffectItem[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [selectedChannel, setSelectedChannel] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    fetchChannels()
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

  // 切换分类时重置页码
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedChannel])

  const fetchChannels = async () => {
    try {
      // 检查缓存
      const now = Date.now()
      if (channelsCache.data && (now - channelsCache.timestamp) < channelsCache.ttl) {
        console.log('Using cached channels data')
        setChannels(channelsCache.data)
        return
      }

      const response = await fetch('/api/video-effects/channels')
      const data = await response.json()

      // 更新缓存
      channelsCache.data = data
      channelsCache.timestamp = now

      setChannels(data)
    } catch (error) {
      console.error('Failed to fetch channels:', error)
    }
  }

  const fetchEffects = async () => {
    try {
      // 检查缓存
      const now = Date.now()
      if (effectsCache.data && (now - effectsCache.timestamp) < effectsCache.ttl) {
        console.log('Using cached effects data')
        processEffectsData(effectsCache.data)
        setLoading(false)
        return
      }

      const response = await fetch('/api/video-effects')
      const data = await response.json()

      // 更新缓存
      effectsCache.data = data
      effectsCache.timestamp = now

      processEffectsData(data)
    } catch (error) {
      console.error('Failed to fetch effects:', error)
    } finally {
      setLoading(false)
    }
  }

  const processEffectsData = (data: any) => {
    if (data.effect_items) {
      setEffectItems(data.effect_items)
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

  const getLocalizedChannelName = (channel: Channel) => {
    const localeKey = locale === 'zh' ? 'zh-CN' : 'en-US'
    return channel.i18n_json[localeKey]?.channel_name || channel.i18n_json['en-US']?.channel_name || channel.channel_name
  }

  const filteredEffects = selectedChannel === 0
    ? effectItems
    : effectItems.filter(item => item.channel_ids && item.channel_ids.includes(selectedChannel))

  // 分页计算
  const totalPages = Math.ceil(filteredEffects.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const displayedEffects = filteredEffects.slice(startIndex, endIndex)

  const handleVideoClick = (item: EffectItem) => {
    setSelectedVideo({
      url: item.web_thumbnail_video_url,
      title: getLocalizedName(item.i18n_json) || item.display_name
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading effects...</div>
      </div>
    )
  }

  return (
    <>
      {/* Category Filters */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {channels.map((channel) => (
            <button
              key={channel.channel_id}
              onClick={() => setSelectedChannel(channel.channel_id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedChannel === channel.channel_id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-foreground hover:bg-muted border border-border'
              }`}
            >
              {getLocalizedChannelName(channel)}
            </button>
          ))}
        </div>
      </div>

      {/* Effects Grid - 卡片大小减少30% */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {displayedEffects.map((effect) => {
          const localizedName = getLocalizedName(effect.i18n_json) || effect.display_name

          return (
            <EffectCard
              key={effect.template_id}
              effect={effect}
              localizedName={localizedName}
              locale={locale}
              onClick={() => handleVideoClick(effect)}
              onGoCreate={(effectData) => {
                // 将 effect 数据序列化后传递
                const fullEffect = effectData as any;
                const effectToPass = {
                  template_id: fullEffect.template_id,
                  display_name: fullEffect.display_name,
                  web_thumbnail_gif_url: fullEffect.web_thumbnail_gif_url,
                  i18n_json: fullEffect.i18n_json,
                  marker: fullEffect.marker,
                  effect_type: fullEffect.effect_type || '1',
                  display_prompt: fullEffect.display_prompt
                };
                console.log('[Go Create] Effect data:', effectToPass);
                const effectParam = encodeURIComponent(JSON.stringify(effectToPass));
                console.log('[Go Create] Navigating to:', `/${locale}/pixverse-video?effect=${effectParam}`);
                router.push(`/${locale}/pixverse-video?effect=${effectParam}`);
              }}
            />
          )
        })}
      </div>

      {/* 分页控件 */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-card border border-border text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
          >
            {locale === 'zh' ? '上一页' : 'Previous'}
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
              // 显示逻辑: 始终显示第一页、最后一页、当前页及其前后各1页
              const showPage =
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)

              const showEllipsisBefore = page === currentPage - 2 && currentPage > 3
              const showEllipsisAfter = page === currentPage + 2 && currentPage < totalPages - 2

              if (showEllipsisBefore || showEllipsisAfter) {
                return (
                  <span key={page} className="px-2 text-muted-foreground">
                    ...
                  </span>
                )
              }

              if (!showPage) return null

              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`min-w-[40px] h-10 rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border text-foreground hover:bg-muted'
                  }`}
                >
                  {page}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg bg-card border border-border text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
          >
            {locale === 'zh' ? '下一页' : 'Next'}
          </button>
        </div>
      )}

      {/* 显示统计 */}
      <div className="mt-4 text-center text-sm text-muted-foreground">
        {locale === 'zh'
          ? `显示 ${startIndex + 1}-${Math.min(endIndex, filteredEffects.length)} 项，共 ${filteredEffects.length} 项`
          : `Showing ${startIndex + 1}-${Math.min(endIndex, filteredEffects.length)} of ${filteredEffects.length} effects`
        }
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoModal
          videoRef={videoRef}
          selectedVideo={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </>
  )
}

// 特效卡片组件 - 使用 memo 优化性能
function EffectCard({ effect, localizedName, locale, onClick, onGoCreate }: {
  effect: EffectItem
  localizedName: string
  locale: string
  onClick: () => void
  onGoCreate: (effect: EffectItem) => void
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (isVisible && !imageLoaded && !imageError) {
      // 设置超时，如果3秒后还没加载完成，就隐藏loading
      const timeout = setTimeout(() => {
        if (!imageLoaded) {
          setImageLoaded(true)
        }
      }, 3000)

      return () => clearTimeout(timeout)
    }
  }, [isVisible, imageLoaded, imageError])

  const handleImageLoad = () => {
    setImageLoaded(true)
    setImageError(false)
  }

  const handleImageError = () => {
    setImageLoaded(true)
    setImageError(true)
  }

  return (
    <div ref={cardRef} className="flex flex-col scale-100 hover:scale-105 transition-transform">
      <div
        className="group relative w-full rounded-lg cursor-pointer bg-card border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        onClick={onClick}
      >
        <div className="aspect-[224/168] relative bg-gradient-to-br from-purple-500/10 to-pink-500/10 overflow-hidden">
          {isVisible ? (
            <>
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <img
                ref={imgRef}
                src={effect.web_thumbnail_gif_url}
                alt={localizedName}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                loading="lazy"
                decoding="async"
              />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-8 h-8 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}

          {/* Play overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
            <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>

          {/* Go Create button - positioned at bottom of image */}
          <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onGoCreate(effect)
              }}
              className="w-full py-1 px-2 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-medium rounded shadow-lg transition-all hover:scale-105"
            >
              {locale === 'zh' ? '开始创作' : 'Go Create'}
            </button>
          </div>
        </div>

        {effect.marker === 'hot' && (
          <span className="absolute top-1.5 left-1.5 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-500 shadow-sm z-10">
            HOT
          </span>
        )}
      </div>

      <div className="mt-1.5">
        <div className="flex items-center justify-center">
          <span className="text-xs font-medium text-foreground text-center line-clamp-2">
            {localizedName}
          </span>
        </div>
      </div>
    </div>
  )
}

// 视频播放器模态框组件
function VideoModal({ videoRef, selectedVideo, onClose }: {
  videoRef: React.RefObject<HTMLVideoElement>
  selectedVideo: { url: string; title: string }
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
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
      </div>
    </div>
  )
}
