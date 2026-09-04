import { Heart } from "lucide-react";
import GithubIcon from "./GithubIcon";

export default function Footer() {
  return (
    <footer className="relative border-t border-border-subtle bg-bg-elevated/50">
      {/* 金色流光装饰 */}
      <div className="absolute top-0 left-0 right-0 h-[1px] shimmer-line" />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <img
                src="/qookix-icon.png"
                alt="QookiX"
                width={36}
                height={36}
                className="object-contain"
                style={{ imageRendering: "pixelated" }}
              />
              <div className="flex flex-col leading-none">
                <span className="font-bold text-text-primary text-[15px] tracking-wide">QookiX</span>
                <span className="text-[10px] text-text-tertiary tracking-widest uppercase">Launcher</span>
              </div>
            </div>
            <p className="text-text-secondary text-sm max-w-md leading-relaxed">
              一款免费、纯净、无广告的 Minecraft 启动器。
              支持 Modrinth / CurseForge 双内容中心，模组、整合包、光影、资源包一键安装与升级。
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a
                href="https://github.com/weimosheng/QookiX-Launcher"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg bg-bg-card border border-border-subtle text-text-secondary hover:text-accent hover:border-border-accent transition-colors"
              >
                <GithubIcon size={18} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-text-primary text-sm mb-4">相关链接</h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="https://github.com/weimosheng/QookiX-Launcher/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-text-secondary hover:text-accent transition-colors"
                >
                  GitHub Releases
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/weimosheng/QookiX-Launcher/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-text-secondary hover:text-accent transition-colors"
                >
                  反馈问题
                </a>
              </li>
              <li>
                <a
                  href="https://modrinth.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-text-secondary hover:text-accent transition-colors"
                >
                  Modrinth
                </a>
              </li>
              <li>
                <a
                  href="https://www.curseforge.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-text-secondary hover:text-accent transition-colors"
                >
                  CurseForge
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border-subtle flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-text-tertiary">
            © {new Date().getFullYear()} QookiX Launcher. Licensed under GPL-3.0.
          </p>
          <p className="text-xs text-text-tertiary flex items-center gap-1.5">
            Made with <Heart size={12} className="text-accent fill-accent" /> by weimosheng
          </p>
        </div>

        {/* 非官方免责声明 */}
        <div className="mt-6 text-center">
          <p className="text-[11px] text-text-tertiary/80 leading-relaxed">
            非 Minecraft 官方服务。未经 Mojang 或 Microsoft 批准，亦与其无关联。
          </p>
        </div>
      </div>
    </footer>
  );
}
