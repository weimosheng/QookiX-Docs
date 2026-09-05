<div align="center">

<img src="public\qookix-icon.png" alt="QookiX Launcher" width="128" />

# QookiX Launcher Docs

**一款免费、纯净、无广告的 Minecraft 启动器**

[[官方网站]](https://qookix.swkj1.cn) | [[文档中心]](https://qookix.swkj1.cn/docs) | [[软件仓库]](https://github.com/weimosheng/QookiX-Launcher)

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
npm run docs:dev   # 文档 http://localhost:5173/docs/
```

## 部署

推送到 `main` 分支后由 Cloudflare 自动构建部署，不需要手动操作。Pull Request 会生成预览地址，合并后约 1 分钟上线。

## 许可

基于 GPL-3.0 协议开源发布。
