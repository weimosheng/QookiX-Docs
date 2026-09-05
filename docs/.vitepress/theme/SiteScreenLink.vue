<template>
  <div class="qx-screen-link">
    <a class="qx-screen-link-item" href="/" target="_self" rel="noopener">返回主站</a>
    <a class="qx-screen-link-item" href="/download" target="_self" rel="noopener">下载</a>
  </div>
</template>

<style scoped>
.qx-screen-link {
  margin-top: 24px;
}

.qx-screen-link-item {
  display: block;
  border-bottom: 1px solid var(--vp-c-divider);
  padding: 12px 0 11px;
  line-height: 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  transition:
    color 0.25s,
    border-color 0.25s;
}

.qx-screen-link-item:hover {
  color: var(--vp-c-brand-1);
}
</style>
