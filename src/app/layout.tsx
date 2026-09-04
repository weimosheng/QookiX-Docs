import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QookiX Launcher - 免费纯净的 Minecraft 启动器",
  description:
    "QookiX Launcher 是一款免费、纯净、无广告的 Minecraft 启动器。支持 Modrinth / CurseForge 双内容中心，模组、整合包、光影、资源包一键安装与升级。",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-bg-base`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-bg-base" suppressHydrationWarning>
        <ThemeProvider>
          {/* 固定导航 */}
          <Navbar />

          {/* 主内容区 */}
          <main className="flex-1 relative z-10">{children}</main>

          {/* 页脚 */}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
