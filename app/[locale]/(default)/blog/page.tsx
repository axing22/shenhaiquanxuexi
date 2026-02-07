"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

export default function BlogPage() {
  const t = useTranslations('blog');
  const params = useParams();
  const locale = params.locale as string;

  const articles = [
    {
      title: t('article_what_is_prompt_title'),
      description: t('article_what_is_prompt_desc'),
      slug: "what-is-an-image-prompt",
      date: "2025-01-15",
      category: t('category_tutorial'),
    },
  ];

  return (
    <div className="min-h-screen bg-muted/10">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <BookOpen className="h-8 w-8 text-blue-500" />
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">{t('title')}</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>

          {/* Articles Grid */}
          <div className="grid gap-6">
            {articles.map((article) => (
              <Card key={article.slug} className="p-8 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-full">
                        {article.category}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(article.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold mb-3 text-foreground">{article.title}</h2>
                    <p className="text-muted-foreground mb-4">
                      {article.description}
                    </p>
                  </div>
                  <Button asChild className="bg-blue-500 hover:bg-blue-600 gap-2">
                    <Link href={`/${locale}/blog/${article.slug}`}>
                      {t('read_more')}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Empty State for Future Articles */}
          <div className="mt-12 text-center text-muted-foreground">
            <p>{t('more_coming')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
