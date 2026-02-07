"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Hero as HeroType } from "@/types/blocks/hero";
import Icon from "@/components/icon";
import { useRouter } from "@/i18n/routing";
import { RiPlayFill } from "react-icons/ri";
import { useTranslations } from "next-intl";
import { trackTryItNowClick } from "@/lib/analytics";

export default function Hero({ hero }: { hero: HeroType }) {
  const router = useRouter();
  const t = useTranslations();

  const handleStartCreating = () => {
    // 追踪 Try It Now 点击
    trackTryItNowClick('hero');
    router.push('/' as any);
  };

  if (hero.disabled) {
    return null;
  }

  return (
    <>
      {/* 现代渐变背景 */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-400/15 to-purple-400/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-r from-indigo-400/15 to-pink-400/15 rounded-full blur-2xl" />
      </div>

      <section className="relative min-h-[80vh] py-20 flex items-center">
        <div className="container">
          {/* 品牌标题区域 */}
          <div className="text-center mb-16 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/50 text-sm font-semibold text-blue-600 dark:text-blue-400 mb-6 animate-fade-in">
              <Icon name="image" className="w-4 h-4" />
              {t('landing.hero.badge')}
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold mb-6 animate-fade-in-up">
              <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                Pixmind
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-4 animate-fade-in-up animation-delay-200">
              {t('landing.hero.subtitle')}
            </p>

            <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 animate-fade-in-up animation-delay-300">
              {t('landing.hero.description')}
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16 animate-fade-in-up animation-delay-400">
              <Button
                className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                size="lg"
                onClick={handleStartCreating}
              >
                <RiPlayFill className="mr-2" />
                {t('landing.hero.start_creating')}
              </Button>
            </div>
          </div>

          {/* 功能展示区域 */}
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {t('landing.hero.showcase_title')}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {t('landing.hero.showcase_subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
              {/* Image to Prompt */}
              <div className="group relative rounded-2xl overflow-hidden bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon name="image" className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  Image to Prompt
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Transform any image into detailed, optimized prompts for AI art generation
                </p>
              </div>

              {/* Text to Image */}
              <div className="group relative rounded-2xl overflow-hidden bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon name="sparkles" className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  Text to Image
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Generate stunning AI images from text descriptions with advanced models
                </p>
              </div>

              {/* AI Art Tools */}
              <div className="group relative rounded-2xl overflow-hidden bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon name="palette" className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  AI Art Tools
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Professional tools for AI image analysis, editing, and creation
                </p>
              </div>
            </div>

            {/* 更多功能按钮 */}
            <div className="text-center mt-12">
              <Button
                variant="outline"
                onClick={handleStartCreating}
                className="px-8 py-3 text-lg font-medium bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 hover:shadow-lg"
              >
                {t('landing.hero.explore_more')}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
