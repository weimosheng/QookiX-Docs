import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Screenshots from "@/components/Screenshots";
import Showcase from "@/components/Showcase";
import Stats from "@/components/Stats";
import CharRainBackground from "@/components/CharRainBackground";

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <Features />
      <Screenshots />
      <Showcase />
      <Stats />

      {/* 底部 CTA */}
      <section className="relative py-28 px-6 overflow-hidden">
        <CharRainBackground />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-5">
            准备好开始了吗？
          </h2>
          <p className="text-text-secondary text-lg mb-10">
            立即下载 QookiX Launcher，体验纯净、高效、美观的 Minecraft 启动方式。
          </p>
          <a
            href="/download"
            className="btn-primary text-base !px-10 !py-4"
          >
            前往下载页面
          </a>
        </div>
      </section>
    </div>
  );
}
