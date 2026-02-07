"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Heart, Users, Mail } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

export default function AboutPage() {
  const t = useTranslations('about');
  const params = useParams();
  const locale = params.locale as string;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">{t('title')}</h1>
            <p className="text-2xl text-blue-600 dark:text-blue-400 font-semibold">
              {t('subtitle')}
            </p>
          </div>

          {/* Our Story */}
          <section className="mb-16">
            <Card className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">{t('story_title')}</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {t('story_content')}
                  </p>
                </div>
              </div>
            </Card>
          </section>

          {/* Our Mission */}
          <section className="mb-16">
            <Card className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">{t('mission_title')}</h2>
                  <p className="text-foreground leading-relaxed text-lg">
                    {t('mission_content')}
                  </p>
                </div>
              </div>
            </Card>
          </section>

          {/* Our Values */}
          <section className="mb-16">
            <Card className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4 text-foreground">{t('values_title')}</h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {t('values_content')}
                  </p>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border border-border rounded-lg">
                      <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2 text-foreground">{t('value_simplicity')}</h3>
                      <p className="text-sm text-muted-foreground">{t('value_simplicity_desc')}</p>
                    </div>
                    <div className="text-center p-4 border border-border rounded-lg">
                      <h3 className="font-semibold text-green-600 dark:text-green-400 mb-2 text-foreground">{t('value_creativity')}</h3>
                      <p className="text-sm text-muted-foreground">{t('value_creativity_desc')}</p>
                    </div>
                    <div className="text-center p-4 border border-border rounded-lg">
                      <h3 className="font-semibold text-orange-600 dark:text-orange-400 mb-2 text-foreground">{t('value_inclusivity')}</h3>
                      <p className="text-sm text-muted-foreground">{t('value_inclusivity_desc')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Get in Touch */}
          <section>
            <Card className="p-8 text-center">
              <Mail className="h-12 w-12 mx-auto mb-4 text-blue-500" />
              <h2 className="text-2xl font-bold mb-4 text-foreground">{t('contact_title')}</h2>
              <p className="mb-6 text-muted-foreground">
                {t('contact_content')}
              </p>
              <Button asChild className="bg-blue-500 hover:bg-blue-600" size="lg">
                <Link href={`/${locale}/contact`}>
                  {t('contact_button')}
                </Link>
              </Button>
            </Card>
          </section>

          {/* Organization Info */}
          <div className="text-center mt-12 text-muted-foreground">
            <p className="text-sm">{t('copyright')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
