"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Users, Calendar, Mail, Check } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AffiliatePage() {
  const t = useTranslations("affiliateProgram");

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">{t("title")}</h1>
            <p className="text-xl text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>

          {/* Commission Highlight */}
          <section className="mb-12">
            <Card className="p-8 text-center">
              <DollarSign className="h-16 w-16 mx-auto mb-4 text-blue-500" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">{t("commission_title")}</h2>
              <p className="text-xl text-muted-foreground">
                {t("commission_desc")}
              </p>
            </Card>
          </section>

          {/* Key Benefits */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center text-foreground">{t("benefits_title")}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">{t("tracking_title")}</h3>
                    <p className="text-muted-foreground">
                      {t("tracking_desc")}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">{t("support_title")}</h3>
                    <p className="text-muted-foreground">
                      {t("support_desc")}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">{t("payments_title")}</h3>
                    <p className="text-muted-foreground">
                      {t("payments_desc")}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">{t("revenue_title")}</h3>
                    <p className="text-muted-foreground">
                      {t("revenue_desc")}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* Who Can Join */}
          <section className="mb-12">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6 text-foreground">{t("who_title")}</h2>
              <p className="text-muted-foreground mb-6">
                {t("who_desc")}
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{t("who_item1")}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{t("who_item2")}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{t("who_item3")}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{t("who_item4")}</span>
                </div>
              </div>
            </Card>
          </section>

          {/* How to Apply */}
          <section className="mb-12">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4 text-foreground">{t("apply_title")}</h2>
              <p className="text-muted-foreground mb-6">
                {t("apply_desc")}
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">1</span>
                  </div>
                  <span className="text-muted-foreground">{t("apply_step1")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">2</span>
                  </div>
                  <span className="text-muted-foreground">{t("apply_step2")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">3</span>
                  </div>
                  <span className="text-muted-foreground">{t("apply_step3")}</span>
                </li>
              </ul>
              <Button asChild size="lg" className="bg-blue-500 hover:bg-blue-600 w-full md:w-auto">
                <a href="mailto:pixmind.service@aimix.pro">
                  <Mail className="h-5 w-5 mr-2" />
                  {t("apply_button")}
                </a>
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                {t("apply_note")}
              </p>
            </Card>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-foreground">{t("faq_title")}</h2>
            <div className="space-y-4">
              <Card className="p-6">
                <h3 className="font-semibold mb-2 text-foreground">{t("faq1_q")}</h3>
                <p className="text-muted-foreground">
                  {t("faq1_a")}
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-2 text-foreground">{t("faq2_q")}</h3>
                <p className="text-muted-foreground">
                  {t("faq2_a")}
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-2 text-foreground">{t("faq3_q")}</h3>
                <p className="text-muted-foreground">
                  {t("faq3_a")}
                </p>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
