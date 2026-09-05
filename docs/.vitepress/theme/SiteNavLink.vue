<template>
  <div class="qx-navlink">
    <a class="qx-navlink-item" href="/">
      <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
        <path
          fill="currentColor"
          d="M10 20v-6h4v6h5v-9h4l-9-8-9 8h4v9z"
        />
      </svg>
      返回主站
    </a>
    <a class="qx-navlink-item qx-navlink-cta" href="/download">下载</a>
  </div>
</template>

<style scoped>
.qx-navlink {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 8px;
  margin-left: 4px;
  border-left: 1px solid var(--vp-c-divider);
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
    padding-left: 0;
    margin-left: 0;
    border-left: none;
  }
}
</style>
