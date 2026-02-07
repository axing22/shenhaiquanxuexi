import ConsoleLayout from "@/components/console/layout";
import { ReactNode } from "react";
import { Sidebar } from "@/types/blocks/sidebar";
import { getTranslations } from "next-intl/server";

export default async function ({ children }: { children: ReactNode }) {
  // ✅ 优化：移除服务端严格鉴权，让客户端组件处理
  // 原因：SSR 时无法正确读取 cookie 中的 token，导致已登录用户被重定向
  // 改为：SSR 正常渲染，客户端组件（Profile）会检查登录状态
  
  const t = await getTranslations();

  const sidebar: Sidebar = {
    nav: {
      items: [
        {
          title: t("user.my_orders"),
          url: "/my-orders",
          icon: "RiOrderPlayLine",
          is_active: false,
        },
        {
          title: t("my_credits.title"),
          url: "/my-credits",
          icon: "RiBankCardLine",
          is_active: false,
        },
        {
          title: t("my_invites.title"),
          url: "/my-invites",
          icon: "RiMoneyCnyCircleFill",
          is_active: false,
        },
        {
          title: t("api_keys.title"),
          url: "/api-keys",
          icon: "RiKey2Line",
          is_active: false,
        },
      ],
    },
  };

  return <ConsoleLayout sidebar={sidebar}>{children}</ConsoleLayout>;
}
