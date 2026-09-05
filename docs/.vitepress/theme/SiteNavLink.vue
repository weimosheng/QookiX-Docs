<template>
  <div class="qx-navlink">
    <a class="qx-navlink-item qx-navlink-ghost" href="/" target="_self" rel="noopener">返回主站</a>
    <a class="qx-navlink-item qx-navlink-cta" href="/download" target="_self" rel="noopener">下载</a>
  </div>
</template>

<style scoped>
.qx-navlink {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qx-navlink::before {
  content: "";
  width: 1px;
  height: 24px;
  margin-right: 8px;
  margin-left: 24px;
  background-color: var(--vp-c-divider);
}

.qx-navlink-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  white-space: nowrap;
  transition: color 0.25s;
}

.qx-navlink-item:hover {
  color: var(--vp-c-brand-1);
}

.qx-navlink-ghost {
  padding: 5px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  transition: color 0.25s, border-color 0.25s;
}

.qx-navlink-ghost:hover {
  border-color: var(--vp-c-brand-1);
}

.qx-navlink-cta {
  padding: 5px 14px;
  border-radius: 8px;
  color: var(--vp-c-bg);
  background: linear-gradient(
    135deg,
    var(--vp-c-brand-1),
    var(--vp-c-brand-2)
  );
  font-weight: 600;
}

.qx-navlink-cta:hover {
  color: var(--vp-c-bg);
  filter: brightness(1.08);
}

@media (max-width: 767px) {
  .qx-navlink {
    display: none;
  }
}
</style>
