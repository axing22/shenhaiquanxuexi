'use client'

import { HomepageEffectsShowcase } from '@/components/homepage-effects-showcase'
import { useTranslations } from 'next-intl'

export function EffectsSection({ locale }: { locale: string }) {
  const t = useTranslations('homepage')

  return (
    <section className="container mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
          {t('effects.title')}
        </h2>
        <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
          {t('effects.description')}
        </p>
      </div>

      <HomepageEffectsShowcase locale={locale} />
    </section>
  )
}
