import type { Transition, Variants } from "framer-motion";

/**
 * 全站动效参数。曲线与时长取自启动器本体（SideBar.vue 的滑动指示器用的就是
 * cubic-bezier(.22,1,.36,1)），让网站与客户端有同一套运动性格。
 */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const EASE_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const EASE_INOUT: [number, number, number, number] = [0.76, 0, 0.24, 1];

/** 秒。instant/fast/standard/medium/slow 五档，不再全站共用一个 0.6。 */
export const DUR = {
  tap: 0.1,
  fast: 0.16,
  standard: 0.3,
  medium: 0.46,
  slow: 0.72,
  cinematic: 1.15,
} as const;

export const SPRING_SNAPPY: Transition = {
  type: "spring",
  stiffness: 350,
  damping: 28,
  mass: 1,
};

export const SPRING_HEAVY: Transition = {
  type: "spring",
  stiffness: 150,
  damping: 35,
  mass: 1.5,
};

/**
 * 逐行裁切揭示：文字先被压在行下，靠 clip 展开而不是整块淡入。
 * 行与行之间 0.08s —— 编辑式节奏。
 */
export function lineReveal(delay = 0, step = 0.08): Variants {
  return {
    hidden: { opacity: 0, y: "0.42em", clipPath: "inset(0 0 105% 0)" },
    visible: (i: number = 0) => ({
      opacity: 1,
      y: 0,
      clipPath: "inset(0 0 -5% 0)",
      transition: {
        duration: DUR.slow,
        ease: EASE_EXPO,
        delay: delay + (i as number) * step,
      },
    }),
  };
}

/** 细线沿水平方向画出：用于账本与分隔线，替代无意义的方块上浮。 */
export const ruleDraw: Variants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: DUR.medium, ease: EASE },
  },
};

/** 只位移、不淡入的入场：适合已经「在那里」的内容。 */
export function riseOnce(offset = 14, delay = 0): Variants {
  return {
    hidden: { y: offset },
    visible: {
      y: 0,
      transition: { duration: DUR.medium, ease: EASE, delay },
    },
  };
}
