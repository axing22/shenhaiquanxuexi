"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Pricing as PricingType } from "@/types/blocks/pricing";

export default function Pricing({ pricing }: { pricing: PricingType }) {
  if (!pricing || !pricing.items) {
    return null;
  }

  const handleCheckout = (item: any) => {
    console.log("Checkout clicked for:", item);
    // TODO: Implement checkout logic
    alert("Payment integration removed. Please implement your own payment system.");
  };

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{pricing.title || "Pricing"}</h1>
        {pricing.description && (
          <p className="text-lg text-muted-foreground">{pricing.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {pricing.items.map((item: any, index: number) => (
          <Card key={index} className={item.featured ? "border-primary" : ""}>
            <CardHeader>
              <CardTitle>{item.title || item.product_name}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <span className="text-4xl font-bold">
                  ${((item.amount || 0) / 100).toFixed(2)}
                </span>
                {item.interval && (
                  <span className="text-muted-foreground">/{item.interval}</span>
                )}
              </div>
              {item.features && (
                <ul className="space-y-2">
                  {item.features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleCheckout(item)}
                className="w-full"
                variant={item.featured ? "default" : "outline"}
              >
                {item.button_text || "Get Started"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
