import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Image to Image - AI图片转图片 | 免费在线工具",
  description: "强大的AI图片转图片工具。通过参考图片生成新的AI图片，支持风格迁移和图片变换。",
};

export default async function ImageToImagePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('imageToImage');

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50 dark:from-gray-900 dark:to-green-950">
      <section className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground">
            <span className="text-foreground">{t('title_ai')}</span>
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {t('title_image_to_image')}
            </span>
            <br />
            <span className="text-foreground">{t('title_generator')}</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-4">
            {t('subtitle')}
          </p>
          <p className="text-lg text-muted-foreground mb-10">
            {t('description')}
          </p>

          <div className="bg-card rounded-2xl p-8 shadow-xl">
            <p className="text-muted-foreground">
              {t('coming_soon')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
