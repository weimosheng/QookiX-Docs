import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Screenshots from "@/components/Screenshots";
import Showcase from "@/components/Showcase";
import Stats from "@/components/Stats";
import CtaSection from "@/components/CtaSection";

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <Features />
      <Screenshots />
      <Showcase />
      <Stats />
      <CtaSection />
    </div>
  );
}
