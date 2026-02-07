"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lightbulb, Image as ImageIcon, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function WhatIsAnImagePromptPage() {
  const t = useTranslations('blog.whatIsImagePrompt');

  return (
    <div className="min-h-screen bg-muted/10">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-8">
            <Button asChild variant="ghost" className="gap-2">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                {t('backToHome')}
              </Link>
            </Button>
          </div>

          {/* Article Header */}
          <article className="prose prose-lg dark:prose-invert max-w-none">
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                {t('title')}
              </h1>
              <p className="text-lg text-muted-foreground">
                {t('subtitle')}
              </p>
            </div>

            {/* Introduction */}
            <Card className="p-8 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">{t('introduction.title')}</h2>
                  <p className="text-foreground leading-relaxed">
                    {t('introduction.content')}
                  </p>
                </div>
              </div>
            </Card>

            {/* Understanding Image Prompts */}
            <section className="mb-8">
              <Card className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-4 text-foreground">{t('understanding.title')}</h2>
                    <p className="text-foreground leading-relaxed mb-4">
                      {t('understanding.paragraph1')}
                    </p>
                    <p className="text-foreground leading-relaxed">
                      {t('understanding.paragraph2')}
                    </p>
                  </div>
                </div>
              </Card>
            </section>

            {/* Key Components */}
            <section className="mb-8">
              <h2 className="text-3xl font-bold mb-6 text-foreground">{t('components.title')}</h2>

              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                    {t('components.subject.title')}
                  </h3>
                  <p className="text-foreground leading-relaxed">
                    {t('components.subject.description')}
                  </p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    {t('components.style.title')}
                  </h3>
                  <p className="text-foreground leading-relaxed">
                    {t('components.style.description')}
                  </p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="h-5 w-5 text-orange-500" />
                    {t('components.composition.title')}
                  </h3>
                  <p className="text-foreground leading-relaxed">
                    {t('components.composition.description')}
                  </p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="h-5 w-5 text-purple-500" />
                    {t('components.lighting.title')}
                  </h3>
                  <p className="text-foreground leading-relaxed">
                    {t('components.lighting.description')}
                  </p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="h-5 w-5 text-pink-500" />
                    {t('components.colors.title')}
                  </h3>
                  <p className="text-foreground leading-relaxed">
                    {t('components.colors.description')}
                  </p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="h-5 w-5 text-cyan-500" />
                    {t('components.details.title')}
                  </h3>
                  <p className="text-foreground leading-relaxed">
                    {t('components.details.description')}
                  </p>
                </Card>
              </div>
            </section>

            {/* Examples */}
            <section className="mb-8">
              <Card className="p-8 bg-card">
                <h2 className="text-2xl font-bold mb-6 text-foreground">{t('examples.title')}</h2>

                <div className="space-y-6">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <p className="font-semibold mb-2">{t('examples.basic.label')}</p>
                    <p className="text-foreground italic">
                      "{t('examples.basic.prompt')}"
                    </p>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <p className="font-semibold mb-2">{t('examples.enhanced.label')}</p>
                    <p className="text-foreground italic">
                      "{t('examples.enhanced.prompt')}"
                    </p>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4">
                    <p className="font-semibold mb-2">{t('examples.advanced.label')}</p>
                    <p className="text-foreground italic">
                      "{t('examples.advanced.prompt')}"
                    </p>
                  </div>
                </div>
              </Card>
            </section>

            {/* Best Practices */}
            <section className="mb-8">
              <Card className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-4 text-foreground">{t('bestPractices.title')}</h2>
                    <ul className="space-y-3 text-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 font-bold">•</span>
                        <span dangerouslySetInnerHTML={{ __html: t.raw('bestPractices.tip1') }} />
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 font-bold">•</span>
                        <span dangerouslySetInnerHTML={{ __html: t.raw('bestPractices.tip2') }} />
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 font-bold">•</span>
                        <span dangerouslySetInnerHTML={{ __html: t.raw('bestPractices.tip3') }} />
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 font-bold">•</span>
                        <span dangerouslySetInnerHTML={{ __html: t.raw('bestPractices.tip4') }} />
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 font-bold">•</span>
                        <span dangerouslySetInnerHTML={{ __html: t.raw('bestPractices.tip5') }} />
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 font-bold">•</span>
                        <span dangerouslySetInnerHTML={{ __html: t.raw('bestPractices.tip6') }} />
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
            </section>

            {/* Conclusion */}
            <section className="mb-8">
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-4 text-foreground">{t('conclusion.title')}</h2>
                <p className="text-foreground leading-relaxed mb-4">
                  {t('conclusion.paragraph1')}
                </p>
                <p className="text-foreground leading-relaxed">
                  {t('conclusion.paragraph2')}
                </p>
              </Card>
            </section>

            {/* CTA */}
            <div className="mt-12 text-center">
              <Card className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-foreground">{t('cta.title')}</h3>
                <p className="text-muted-foreground mb-6">
                  {t('cta.description')}
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Button asChild className="bg-blue-500 hover:bg-blue-600">
                    <Link href="/image-to-prompt">
                      {t('cta.button1')}
                    </Link>
                  </Button>
                  <Button asChild className="bg-green-500 hover:bg-green-600">
                    <Link href="/text-to-prompt">
                      {t('cta.button2')}
                    </Link>
                  </Button>
                </div>
              </Card>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
