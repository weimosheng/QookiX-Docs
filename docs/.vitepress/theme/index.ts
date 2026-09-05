import { defineComponent, h, watch } from "vue";
import DefaultTheme from "vitepress/theme";
import { useData } from "vitepress";
import HomeCta from "./HomeCta.vue";
import SiteNavLink from "./SiteNavLink.vue";
import SiteScreenLink from "./SiteScreenLink.vue";
import "./custom.css";

export default {
  extends: DefaultTheme,

  Layout: defineComponent({
    name: "QookiXLayout",
    setup(_, { slots }) {
      const { isDark } = useData();

      // 文档站切换深浅色时回写主站的 key，来回跳转主题保持一致
      watch(
        isDark,
        (v) => {
          try {
            localStorage.setItem("qookix-theme", v ? "dark" : "light");
          } catch {
            /* 隐私模式下忽略 */
          }
        },
        { immediate: true }
      );

      return () =>
        h(DefaultTheme.Layout, null, {
          // 透传默认插槽
          default: () => slots.default?.(),
          // 导航栏右侧追加「返回主站」（/ 与 /download 属于主站，不走 docs 的 base）
          "nav-bar-content-after": () => h(SiteNavLink),
          // 移动端 hamburger 菜单追加「返回主站 / 下载」
          "nav-screen-content-after": () => h(SiteScreenLink),
          // 首页 features 之后的 CTA
          "home-features-after": () => h(HomeCta),
        });
    },
  }),
};
