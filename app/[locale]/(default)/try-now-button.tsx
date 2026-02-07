"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { trackTryItNowClick } from "@/lib/analytics";

export function TryNowButton({ locale, label }: { locale: string; label: string }) {
  return (
    <Link
      href={`/${locale}/txt-to-image/nano-banana`}
      onClick={() => trackTryItNowClick('hero')}
    >
      <Button
        size="lg"
        className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg rounded-full"
      >
        {label}
      </Button>
    </Link>
  );
}
