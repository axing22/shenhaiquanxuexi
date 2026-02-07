"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code, Zap, Mail, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function APIDocsPage() {
  const t = useTranslations("developerApi");

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <AlertCircle className="h-4 w-4" />
              {t("testing_phase")}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">{t("title")}</h1>
            <p className="text-lg text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>

          {/* Overview */}
          <section className="mb-12">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4 text-foreground">{t("overview_title")}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("overview_desc")}
              </p>
            </Card>
          </section>

          {/* Available APIs */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-foreground">{t("available_apis_title")}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Image to Prompt API */}
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Code className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">{t("image_to_prompt_title")}</h3>
                    <p className="text-muted-foreground mb-3">
                      {t("image_to_prompt_desc")}
                    </p>
                    <div className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                      <Link href="/image-to-prompt" className="hover:underline">
                        {t("try_web_interface")}
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Magic Enhance API */}
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">{t("magic_enhance_title")}</h3>
                    <p className="text-muted-foreground mb-3">
                      {t("magic_enhance_desc")}
                    </p>
                    <div className="inline-flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <Link href="/text-to-prompt" className="hover:underline">
                        {t("try_web_interface")}
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* How to Join Testing */}
          <section className="mb-12">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4 text-foreground">{t("how_to_join_title")}</h2>
              <p className="text-muted-foreground mb-6">
                {t("how_to_join_desc")}
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-muted-foreground">{t("join_requirement1")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-muted-foreground">{t("join_requirement2")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-muted-foreground">{t("join_requirement3")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-muted-foreground">{t("join_requirement4")}</span>
                </li>
              </ul>
              <Button asChild className="bg-blue-500 hover:bg-blue-600">
                <a href="mailto:pixmind.service@aimix.pro">
                  <Mail className="h-4 w-4 mr-2" />
                  {t("contact_button")}
                </a>
              </Button>
            </Card>
          </section>

          {/* Important Terms */}
          <section>
            <Card className="p-8">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-bold mb-3 text-foreground">{t("pricing_title")}</h2>
                  <p className="text-muted-foreground mb-3">
                    <strong>{t("pricing_note")}</strong>
                  </p>
                  <p className="text-muted-foreground">
                    {t("pricing_desc")}
                  </p>
                </div>
              </div>
            </Card>
          </section>

          {/* Footer Note */}
          <div className="mt-12 text-center text-muted-foreground text-sm">
            <p>{t("footer_note")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
