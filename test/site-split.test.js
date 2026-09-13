const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();

const MAIN_INDEX = path.join(root, 'out', 'index.html');
const DOCS_INDEX = path.join(root, 'docs', '.vitepress', 'dist', 'index.html');

function readArtifact(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `缺少构建产物 ${filePath}。请先执行 "npm run build" 与 "npm run docs:build" 再运行测试。`
    );
  }
  return fs.readFileSync(filePath, 'utf8');
}

test('主站产物挂在域名根路径，资源引用不含仓库子路径前缀', () => {
  const html = readArtifact(MAIN_INDEX);

  assert.ok(
    html.includes('/_next/static/'),
    '主站应引用根路径下的 /_next/static/ 资源'
  );
  assert.equal(
    html.includes('/QookiX-Docs/'),
    false,
    '主站产物不应再出现 GitHub Pages 的仓库子路径前缀'
  );
});

test('文档站产物独立挂在自身根路径，不再位于 /docs 前缀下', () => {
  const html = readArtifact(DOCS_INDEX);

  assert.ok(
    html.includes('/assets/'),
    '文档站应引用自身根路径下的 /assets/ 资源'
  );
  assert.equal(
    html.includes('/docs/assets/'),
    false,
    '文档站不应再生成 /docs/assets/ 这类子路径资源引用'
  );
});
