import { TopNav } from "@/components/landing/TopNav";
import { Hero } from "@/components/landing/Hero";
import { Mockup } from "@/components/landing/Mockup";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Privacy } from "@/components/landing/Privacy";
import { FinalCTA } from "@/components/landing/FinalCTA";

export default function LandingPage() {
  return (
    <>
      <TopNav />
      <Hero />
      <Mockup />
      <Features />
      <HowItWorks />
      <Privacy />
      <FinalCTA />
    </>
  );
}
