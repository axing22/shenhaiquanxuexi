"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Users, Calendar, Mail, Check } from "lucide-react";

export default function AffiliatePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Affiliate Program</h1>
            <p className="text-xl text-muted-foreground">
              Earn recurring commissions by promoting Pixmind
            </p>
          </div>

          {/* Commission Highlight */}
          <section className="mb-12">
            <Card className="p-8 text-center">
              <DollarSign className="h-16 w-16 mx-auto mb-4 text-blue-500" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Earn 30% Commission</h2>
              <p className="text-xl text-muted-foreground">
                On all subscription payments (including renewals and upgrades) for the first year
              </p>
            </Card>
          </section>

          {/* Key Benefits */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center text-foreground">Program Benefits</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">Real-time Tracking</h3>
                    <p className="text-muted-foreground">
                      Monitor your performance with our comprehensive dashboard
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
                    <h3 className="text-lg font-semibold mb-2 text-foreground">Dedicated Support</h3>
                    <p className="text-muted-foreground">
                      Get help from our affiliate support team whenever you need it
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
                    <h3 className="text-lg font-semibold mb-2 text-foreground">Monthly Payments</h3>
                    <p className="text-muted-foreground">
                      Receive payments via PayPal on NET-15 schedule (15th of each month)
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
                    <h3 className="text-lg font-semibold mb-2 text-foreground">Recurring Revenue</h3>
                    <p className="text-muted-foreground">
                      Earn on renewals and upgrades, not just initial subscriptions
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* Who Can Join */}
          <section className="mb-12">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6 text-foreground">Who Can Join?</h2>
              <p className="text-muted-foreground mb-6">
                We welcome diverse professionals and creators:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Content creators and bloggers</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">AI and technology enthusiasts</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Digital marketers</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Educators and course creators</span>
                </div>
              </div>
            </Card>
          </section>

          {/* How to Apply */}
          <section className="mb-12">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4 text-foreground">How to Apply</h2>
              <p className="text-muted-foreground mb-6">
                Ready to join our affiliate program? Send us an email with:
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">1</span>
                  </div>
                  <span className="text-muted-foreground">Your details and background</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">2</span>
                  </div>
                  <span className="text-muted-foreground">Your promotional strategy or platform</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">3</span>
                  </div>
                  <span className="text-muted-foreground">How you plan to promote Pixmind</span>
                </li>
              </ul>
              <Button asChild size="lg" className="bg-blue-500 hover:bg-blue-600 w-full md:w-auto">
                <a href="mailto:pixmind.service@aimix.pro">
                  <Mail className="h-5 w-5 mr-2" />
                  Apply Now: pixmind.service@aimix.pro
                </a>
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Our team will review your application and provide next steps guidance.
              </p>
            </Card>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-foreground">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <Card className="p-6">
                <h3 className="font-semibold mb-2 text-foreground">What does the 30% commission cover?</h3>
                <p className="text-muted-foreground">
                  You earn 30% on all subscription payments including initial subscriptions, renewals, and plan upgrades for the first year after a customer signs up through your referral link.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-2 text-foreground">How and when do I get paid?</h3>
                <p className="text-muted-foreground">
                  Commissions are paid monthly via PayPal on a NET-15 schedule, meaning you receive payment on the 15th of the following month for the previous month's earnings.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-2 text-foreground">What promotional methods are accepted?</h3>
                <p className="text-muted-foreground">
                  We accept diverse promotion strategies from various professional backgrounds including content creation, social media, email marketing, and educational platforms. Share your approach in your application.
                </p>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
