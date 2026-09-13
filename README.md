<div align="center">

<img src="public\qookix-icon.png" alt="QookiX Launcher" width="128" />

# QookiX Launcher Docs

**一款免费、纯净、无广告的 Minecraft 启动器**

[[官方网站]](https://www.qookix.cn) | [[文档中心]](https://docs.qookix.cn) | [[软件仓库]](https://github.com/weimosheng/QookiX-Launcher)

| 仓库 | 内容 | 适合反馈什么 |
|---|---|---|
| **QookiX-Docs**（本仓库） | 官网页面、使用文档 | 文档错漏、文案、网站显示问题 |
| [QookiX-Launcher](https://github.com/weimosheng/QookiX-Launcher) | 启动器客户端源码 | 启动器 Bug、功能建议 |

启动器本体不在这个仓库，软件本身的问题请到上面第二个仓库反馈。

</div>

## 改文档

最省事的方式：打开任意文档页面，点底部的「在 GitHub 上编辑此页」，改完直接提交 Pull Request。全程在网页完成，不需要装任何环境。

本地修改的话，文档都在 `docs/guide/` 下，一个 `.md` 对应一个页面。新增页面时记得在 `docs/.vitepress/config.mts` 的 `sidebar` 里加一项，否则侧边栏不会出现入口：

```ts
{ text: "页面标题", link: "/guide/xxx" }
```

## 本地预览（可选）

需要 Node.js 22 或更高版本。

```bash
npm install
npm run dev        # 主站 http://localhost:3000
npm run docs:dev   # 文档站 http://localhost:5173/
```

## 部署

官网与文档站是两个独立站点，各自在 Vercel 建一个项目，都指向本仓库 `weimosheng/QookiX-Docs`，并分别绑定子域名：

| 站点 | 域名 | Framework Preset | Build Command | Output Directory |
|---|---|---|---|---|
| 官网 | `www.qookix.cn` | Next.js | `npm run build` | `out` |
| 文档站 | `docs.qookix.cn` | Other | `npm run docs:build` | `docs/.vitepress/dist` |

两个项目都随 `main` 分支自动构建部署。

因为域名不同，跨站跳转必须用绝对地址：主站侧统一从 `src/lib/site.ts` 取 `DOCS_URL`，文档站侧在 `docs/.vitepress/config.mts` 里用 `MAIN_SITE`。不要写 `/docs/`、`/download` 这类同站相对路径，否则会指到错误的站点上去。

> 注：`wrangler.toml` / `worker/` 那套 Cloudflare 部署只发布 `out/`，即官网。文档站已不再打进 `out/docs/`，如仍要保留 Cloudflare 通道，需另行为文档站单独配置部署。

## 许可

基于 GPL-3.0 协议开源发布。
