import { Header } from "@/types/blocks/header";
import { Hero } from "@/types/blocks/hero";
import { Section } from "@/types/blocks/section";
import { Footer } from "@/types/blocks/footer";
import { Pricing } from "@/types/blocks/pricing";
import { TextToSpeech } from "@/types/blocks/text-to-speech";
import { PainPointsData } from "@/components/blocks/pain-points";

export interface LandingPage {
  header?: Header;
  hero?: Hero;
  branding?: Section;
  introduce?: Section;
  textToSpeech?: Section;
  benefit?: Section;
  usage?: Section;
  feature?: Section;
  pain_points?: PainPointsData;
  showcase?: Section;
  stats?: Section;
  pricing?: Pricing;
  testimonial?: Section;
  faq?: Section;
  cta?: Section;
  footer?: Footer;
}

export interface PricingPage {
  pricing?: Pricing;
}

export interface ShowcasePage {
  showcase?: Section;
}
