import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { VideoEffectsContent } from "./video-effects-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Video Effects - Transform Images into Videos | Pixmind",
  description: "Explore 100+ AI video effects. Transform images into stunning videos with AI Kiss, AI Hug, AI Dance, and more creative templates.",
};

export default async function VideoEffectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-purple-50 dark:to-purple-950/20">
      {/* Header Section */}
      <section className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-semibold text-foreground">AI Video Effects</h1>
        </div>
      </section>

      {/* Video Effects Grid */}
      <section className="container mx-auto px-4 py-8">
        <VideoEffectsContent locale={locale} />
      </section>

      {/* SEO Content Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-semibold mb-6 text-foreground">
              Generate Stunning Videos Online with AI Effects for Free
            </h2>
            <p className="text-lg text-muted-foreground">
              Transform static images into stunning videos with Pixmind AI's innovative templates. Simply upload your photo, choose a professional AI effect, and create stunning videos in minutes—no experience needed. Start now!
            </p>
          </div>

          {/* Feature Sections */}
          <div className="max-w-6xl mx-auto space-y-24">
            {/* Feature 1 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <h3 className="text-3xl font-semibold mb-6 text-foreground">
                  Boost Your Social Media Engagement with AI Fun Video Effects
                </h3>
                <p className="text-lg text-muted-foreground mb-6">
                  Easily generate trending content in just minutes! Our AI entertainment effects—including the AI dance video effect, AI twerk generator, and AI bikini video generator—help you transform dull photos into hilarious and unique videos that can boost likes, comments, and follows across any social media platform!
                </p>
                <Link href={`/${locale}/video-effects`}>
                  <Button size="lg" className="rounded-full px-8">
                    Try AI Fun Video Effects Now
                  </Button>
                </Link>
              </div>
              <div className="order-1 md:order-2">
                <div className="rounded-2xl overflow-hidden aspect-video">
                  <Image
                    src="https://chatmix.top/pixmind/video_effects_demo1.png"
                    alt="AI Fun Video Effects"
                    width={1280}
                    height={720}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2">
                <h3 className="text-3xl font-semibold mb-6 text-foreground">
                  Use Various AI Face Filters to Create Custom Reaction Videos
                </h3>
                <p className="text-lg text-muted-foreground mb-6">
                  Tired of the same old emojis? Transform your selfies or photos of friends into hilarious, custom reaction videos. From anger and laughter to surprise and more, you can easily create different and personalized reaction memes with our AI video effects.
                </p>
                <Link href={`/${locale}/video-effects`}>
                  <Button size="lg" className="rounded-full px-8">
                    Try AI Face Video Effects Now
                  </Button>
                </Link>
              </div>
              <div className="order-1">
                <div className="rounded-2xl overflow-hidden aspect-video">
                  <Image
                    src="https://chatmix.top/pixmind/video_effects_demo2.png"
                    alt="AI Face Video Effects"
                    width={1280}
                    height={720}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <h3 className="text-3xl font-semibold mb-6 text-foreground">
                  Generate Romantic AI Videos for Long-Distance Lovers
                </h3>
                <p className="text-lg text-muted-foreground mb-6">
                  Missing your long-distance loved ones? Turn "I miss you" into a virtual hug with our AI effects! Upload your photos, and our AI will generate heartwarming videos of hugs, kisses, and other expressions of affection.
                </p>
                <Link href={`/${locale}/video-effects`}>
                  <Button size="lg" className="rounded-full px-8">
                    Generate Your Touching Video Now
                  </Button>
                </Link>
              </div>
              <div className="order-1 md:order-2">
                <div className="rounded-2xl overflow-hidden aspect-video">
                  <Image
                    src="https://chatmix.top/pixmind/video_effects_demo3.png"
                    alt="Romantic AI Videos"
                    width={1280}
                    height={720}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2">
                <h3 className="text-3xl font-semibold mb-6 text-foreground">
                  Transform Photos into Epic AI Hero Transformation Videos
                </h3>
                <p className="text-lg text-muted-foreground mb-6">
                  Ever dreamed of becoming Iron Man, Hulk, or Captain America? Bring your favorite characters to life with our AI video effects. Instantly turn your selfies into stunning transformation videos featuring iconic heroes and characters.
                </p>
                <Link href={`/${locale}/video-effects`}>
                  <Button size="lg" className="rounded-full px-8">
                    Try AI Transformation Effects Now
                  </Button>
                </Link>
              </div>
              <div className="order-1">
                <div className="rounded-2xl overflow-hidden aspect-video">
                  <Image
                    src="https://chatmix.top/pixmind/video_effects_demo4.png"
                    alt="AI Hero Transformation Videos"
                    width={1280}
                    height={720}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-4xl font-semibold mb-6 text-foreground">
              How to Easily Create Engaging Video with Our AI Video Effects
            </h2>
            <p className="text-lg text-muted-foreground">
              Want to create a unique and wonderful video? In just three simple steps, our AI effects can help you achieve cool transitions, dreamy color adjustments, and vivid animations.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-card rounded-xl p-8 border border-border">
                <h3 className="text-2xl font-semibold mb-4 text-foreground">Step 1: Select an AI Effect</h3>
                <p className="text-muted-foreground">
                  Choose from a variety of creative AI templates, like AI Kiss, AI Hug, AI Dance, and more.
                </p>
              </div>
              <div className="bg-card rounded-xl p-8 border border-border">
                <h3 className="text-2xl font-semibold mb-4 text-foreground">Step 2: Upload Your Images</h3>
                <p className="text-muted-foreground">
                  Upload a photo or select one from your creation history. Please use a clear, high-quality photo for crisp, detailed results.
                </p>
              </div>
              <div className="bg-card rounded-xl p-8 border border-border">
                <h3 className="text-2xl font-semibold mb-4 text-foreground">Step 3: Download and Share</h3>
                <p className="text-muted-foreground">
                  Click 'Generate,' and our AI will create an HD video in just minutes. Download your watermark-free result to your device or share it on social media.
                </p>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link href={`/${locale}/video-effects`}>
                <Button size="lg" className="rounded-full px-12">
                  Try Our AI Video Effects
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-semibold mb-4 text-foreground">
                FAQs about Pixmind AI Video Effects
              </h2>
              <p className="text-lg text-muted-foreground">
                Find answers to frequently asked questions about Pixmind AI video effects.
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-xl font-semibold text-foreground">
                  What are AI video effects?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  AI video effects use advanced artificial intelligence to transform images into dynamic videos with a single click, making it easy to create eye-catching content. Choose from 100+ AI video templates, upload your image, and our AI will handle the rest.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-xl font-semibold text-foreground">
                  Are these AI video templates free to use?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes, all our AI video templates are free to use with no subscription required. Each template has a credit cost, which is displayed on the generate button.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-xl font-semibold text-foreground">
                  Are prompts needed to use these effects?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  No prompts are required. Simply upload your photo, click "Generate", and our AI will transform it into a video that matches the provided example.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-xl font-semibold text-foreground">
                  Can I use the videos I create commercially?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Commercial use is allowed for paid users. Free users can use the videos for entertainment and other non-commercial purposes.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>
    </div>
  );
}
