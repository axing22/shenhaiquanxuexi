import { Metadata } from 'next'

/**
 * SEO配置接口
 */
interface SEOConfig {
  title: string
  description: string
  keywords?: string
  locale: string
  path: string
  image?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
}

/**
 * 生成页面Metadata（包含OG、Twitter Card等）
 */
export function generateSEOMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords,
    locale,
    path,
    image = '/og-image.jpg',
    type = 'website',
    publishedTime,
    modifiedTime,
  } = config

  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || ''
  const url = `${baseUrl}${locale === 'en' ? '' : `/${locale}`}${path}`
  const imageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`

  return {
    title,
    description,
    keywords,
    authors: [{ name: 'Pixmind' }],
    creator: 'Pixmind',
    publisher: 'Pixmind',

    // Open Graph
    openGraph: {
      type,
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      url,
      title,
      description,
      siteName: 'Pixmind',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: '@imagetoprompt',
    },

    // Canonical URL
    alternates: {
      canonical: url,
      languages: {
        'zh-CN': `${baseUrl}/zh${path}`,
        'en-US': `${baseUrl}${path}`,
      },
    },

    // 其他元数据
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Verification (可选，添加你的验证码)
    // verification: {
    //   google: 'your-google-verification-code',
    //   yandex: 'your-yandex-verification-code',
    //   bing: 'your-bing-verification-code',
    // },
  }
}

/**
 * 生成 Schema.org 组织结构化数据
 */
export function generateOrganizationSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || ''

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Pixmind',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'Professional AI image generation and analysis platform with image-to-prompt and text-to-image capabilities',
    sameAs: [
      // 添加你的社交媒体链接
      // 'https://twitter.com/yourprofile',
      // 'https://facebook.com/yourprofile',
      // 'https://linkedin.com/company/yourprofile',
    ],
  }
}

/**
 * 生成 Schema.org 产品结构化数据
 */
export function generateProductSchema(product: {
  name: string
  description: string
  image: string
  price?: number
  currency?: string
  rating?: number
  reviewCount?: number
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    ...(product.price && {
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: product.currency || 'USD',
        availability: 'https://schema.org/InStock',
      },
    }),
    ...(product.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount || 0,
      },
    }),
  }
}

/**
 * 生成 Schema.org 文章结构化数据
 */
export function generateArticleSchema(article: {
  title: string
  description: string
  image: string
  publishedTime: string
  modifiedTime?: string
  author: string
}) {
  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || ''

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image,
    datePublished: article.publishedTime,
    dateModified: article.modifiedTime || article.publishedTime,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Pixmind',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
  }
}

/**
 * 生成 Schema.org 面包屑导航结构化数据
 */
export function generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>) {
  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || ''

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  }
}

/**
 * 生成 Schema.org FAQ 结构化数据
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

/**
 * 生成 Schema.org 视频结构化数据
 */
export function generateVideoSchema(video: {
  name: string
  description: string
  thumbnailUrl: string
  uploadDate: string
  duration?: string
  contentUrl?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.name,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    uploadDate: video.uploadDate,
    ...(video.duration && { duration: video.duration }),
    ...(video.contentUrl && { contentUrl: video.contentUrl }),
  }
}
