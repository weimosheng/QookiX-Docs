"use client";

import { useEffect, useState } from "react";

/** 设备展示模式：模拟桌面启动器还是 Android 启动器 */
export type DeviceKind = "desktop" | "mobile";

const KEY = "qx:device";

/**
 * 默认值优先读取 localStorage，其次根据 UA 判断。
 * 服务器初始渲染一律给 "desktop"（避免 SSR 不一致），
 * 客户端 hydration 后 useEffect 里再同步一次。
 */
function detectInitial(): DeviceKind {
  if (typeof window === "undefined") return "desktop";
  try {
    const stored = window.localStorage.getItem(KEY);
    if (stored === "desktop" || stored === "mobile") return stored;
  } catch {
    /* 隐私模式等场景 localStorage 不可用 */
  }
  const ua = window.navigator.userAgent.toLowerCase();
  if (/android|iphone|ipad|mobile|harmonyos/i.test(ua)) return "mobile";
  return "desktop";
}

export function useDevice() {
  const [device, setDevice] = useState<DeviceKind>("desktop");

  useEffect(() => {
    setDevice(detectInitial());
  }, []);

  const switchDevice = (next: DeviceKind) => {
    setDevice(next);
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      /* ignore */
    }
  };

  return { device, switchDevice };
}
