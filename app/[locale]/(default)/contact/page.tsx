"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Twitter } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function ContactPage() {
  const t = useTranslations('contact');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">{t('title')}</h1>
            <p className="text-lg text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>

          {/* Testimonial CTA */}
          <Card className="p-8 mb-12">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-3 text-foreground">{t('testimonial_title')}</h3>
              <p className="text-muted-foreground mb-6">
                {t('testimonial_content')}
              </p>
              <Button asChild className="bg-blue-500 hover:bg-blue-600">
                <Link href="https://ijarxpcwej.feishu.cn/share/base/form/shrcn8zOCRLngGIjTBOCDcZOSlC" target="_blank">
                  {t('testimonial_button')}
                </Link>
              </Button>
            </div>
          </Card>

          {/* Contact Methods */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Email */}
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-4">
                  <Mail className="h-8 w-8 text-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">{t('email_title')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('email_content')}
                </p>
                <Button asChild variant="outline" className="w-full">
                  <a href={`mailto:${t('email_address')}`}>
                    {t('email_address')}
                  </a>
                </Button>
              </div>
            </Card>

            {/* Social Media */}
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                  <Twitter className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">{t('social_title')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('social_content')}
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="https://x.com/SplendorZhang" target="_blank">
                    {t('social_handle')}
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
