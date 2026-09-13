const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('next export should not hardcode root paths for static assets in the generated HTML', () => {
  const html = fs.readFileSync(path.join(process.cwd(), 'out/index.html'), 'utf8');
  const hasHardcodedRootAsset = html.includes('href="/_next/static/chunks/0j2zmquh6aa4s.css"') ||
    html.includes('href="/_next/static/media/797e433ab948586e-s.p.0r6juujl39pe6.woff2"') ||
    html.includes('src="/_next/static/chunks/19mx3mg6lkumu.js"');

  assert.equal(hasHardcodedRootAsset, false, 'Static asset URLs should respect the GitHub Pages base path instead of forcing domain-root /_next paths.');
});
