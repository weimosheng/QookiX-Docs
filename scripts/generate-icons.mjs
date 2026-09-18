/**
 * 生成符合搜索引擎要求的站点图标。
 *
 * 背景：仓库里原先的 favicon.ico 其实是一张 512×512 的 PNG（只是改了扩展名），
 * 且 512 不是 48 的倍数，Google / 百度 / 必应都不会采用，导致搜索结果里没有图标。
 *
 * 本脚本以 public/qookix-icon.png 为源图生成：
 * - public/favicon.ico        真正的多尺寸 ICO（内嵌 16 / 32 / 48 的 PNG）
 * - public/favicon-48.png     48×48（Google 要求尺寸为 48 的倍数）
 * - public/favicon-96.png     96×96
 * - public/favicon-192.png    192×192（Google 推荐的大图）
 * - public/favicon-512.png    512×512（PWA 安装图标）
 * - public/apple-touch-icon.png 180×180
 *
 * 依赖 sharp（已随 vitepress 间接安装）。缺失时降级为直接复制源图，绝不中断构建。
 */

import { existsSync, copyFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "public", "qookix-icon.png");
const faviconIco = join(root, "public", "favicon.ico");

async function main() {
  if (!existsSync(source)) {
    console.warn("[icons] 未找到 public/qookix-icon.png，跳过图标生成");
    return;
  }

  let sharp;
  try {
    ({ default: sharp } = await import("sharp"));
  } catch {
    console.warn(
      "[icons] 未找到 sharp，退化为复制源图（图标仍可用，但不保证各引擎都展示）"
    );
    copyFileSync(source, faviconIco);
    return;
  }

  const render = (size) =>
    sharp(source)
      .resize(size, size, { fit: "cover" })
      .png({ compressionLevel: 9 })
      .toBuffer();

  await Promise.all([
    writeFile("favicon-48.png", await render(48)),
    writeFile("favicon-96.png", await render(96)),
    writeFile("favicon-192.png", await render(192)),
    writeFile("favicon-512.png", await render(512)),
    writeFile("apple-touch-icon.png", await render(180)),
  ]);

  // 组装 ICO：ICONDIR + N × ICONDIRENTRY + 内嵌 PNG 数据
  const sizes = [16, 32, 48];
  const payloads = await Promise.all(sizes.map((size) => render(size)));

  const dir = Buffer.alloc(6 + 16 * sizes.length);
  dir.writeUInt16LE(0, 0); // reserved
  dir.writeUInt16LE(1, 2); // 1 = icon
  dir.writeUInt16LE(sizes.length, 4); // 图片数量

  let offset = dir.length;
  sizes.forEach((size, i) => {
    const base = 6 + 16 * i;
    dir.writeUInt8(size >= 256 ? 0 : size, base); // width（0 表示 256）
    dir.writeUInt8(size >= 256 ? 0 : size, base + 1); // height
    dir.writeUInt8(0, base + 2); // 调色板色数
    dir.writeUInt8(0, base + 3); // reserved
    dir.writeUInt16LE(1, base + 4); // color planes
    dir.writeUInt16LE(32, base + 6); // 位深
    dir.writeUInt32LE(payloads[i].length, base + 8); // 数据长度
    dir.writeUInt32LE(offset, base + 12); // 数据偏移
    offset += payloads[i].length;
  });

  writeFileSync(faviconIco, Buffer.concat([dir, ...payloads]));
  console.log("[icons] 已生成 favicon.ico 与各尺寸 PNG");
}

function writeFile(name, buffer) {
  return new Promise((resolve, reject) => {
    try {
      writeFileSync(join(root, "public", name), buffer);
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

main().catch((err) => {
  console.warn("[icons] 图标生成失败（已忽略，不影响构建）：", err?.message ?? err);
  try {
    if (existsSync(source) && !existsSync(faviconIco)) {
      copyFileSync(source, faviconIco);
    }
  } catch {
    /* 兜底也失败时保持现状，不阻断构建 */
  }
});
