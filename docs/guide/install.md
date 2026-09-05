---
title: 下载与安装
outline: deep
---

# 下载与安装

## 获取安装包

前往主站的[下载页面](https://github.com/weimosheng/QookiX-Launcher/releases)，页面会自动识别并推荐你当前系统的安装包；也可以手动切换到其他平台。

国内用户默认走国内镜像下载，速度更快；若镜像不可用，页面会自动回退到 GitHub 源。

### 各平台提供的格式

| 平台 | 常见格式 | 说明 |
| --- | --- | --- |
| Windows | `.exe` / `.msi` | `.exe` 双击即可安装；`.msi` 适合批量部署与静默安装 |
| macOS | `.dmg` | 打开后把图标拖入 Applications 即可 |
| Linux | `.AppImage` / `.deb` / `.rpm` | AppImage 免安装；deb 对应 Debian/Ubuntu，rpm 对应 Fedora/openSUSE 等 |

> 实际提供的格式以发布页为准，不同版本可能略有增减。

## Windows

1. 下载 `.exe`（或 `.msi`）安装包。
2. 双击运行，按向导提示完成安装。
3. 若出现 SmartScreen 提示，点击「更多信息」→「仍要运行」。
4. 安装完成后从桌面快捷方式或开始菜单启动。

::: details 为什么杀毒软件会报毒？
启动器由 Tauri 打包，且未购买代码签名证书，部分杀软会按「未知发布者」规则误报。项目完全开源，你可以自行从源码构建，或把安装目录加入杀软白名单。
:::

## macOS

1. 下载 `.dmg` 文件并打开。
2. 把 **QookiX Launcher** 图标拖到 `Applications` 文件夹。
3. 首次打开时若提示「无法验证开发者」，进入 **系统设置 → 隐私与安全性**，点击「仍要打开」。

::: tip Apple Silicon
若下载到的是 x64 版本，可通过 Rosetta 2 运行；建议优先选择标注 arm64 / aarch64 的包以获得更好性能。
:::

## Linux

### AppImage（通用）

```bash
chmod +x QookiX.Launcher_*.AppImage
./QookiX.Launcher_*.AppImage
```

### Debian / Ubuntu

```bash
sudo apt install ./QookiX.Launcher_*.deb
```

### Fedora / openSUSE

```bash
sudo rpm -i QookiX.Launcher_*.rpm
```

::: warning 缺失系统依赖
若启动时报缺少 `webkit2gtk`、`libssl` 等库，按发行版安装对应依赖后重试：

```bash
# Debian / Ubuntu
sudo apt install libwebkit2gtk-4.1-0 libssl3

# Fedora
sudo dnf install webkit2gtk4.1 openssl-libs
```
:::

## 升级

启动器会在检测到新版本时提示更新，按提示确认即可。你也可以随时回到下载页手动获取最新版。

覆盖安装不会删除你的实例、模组与存档——这些数据保存在独立的游戏目录中。

## 卸载

- **Windows**：设置 → 应用 → 已安装的应用 → 卸载。
- **macOS**：把 Applications 中的 QookiX Launcher 移到废纸篓。
- **Linux**：`sudo apt remove qookix-launcher` 或 `sudo rpm -e qookix-launcher`；AppImage 直接删除文件即可。

卸载后若想彻底清理，需另外手动删除游戏目录（见[设置与调优](./settings)）。
