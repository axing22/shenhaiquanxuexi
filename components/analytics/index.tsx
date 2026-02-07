import GoogleAnalytics from "./google-analytics";
import OpenPanelAnalytics from "./open-panel";
import Plausible from "./plausible";

export default function Analytics() {
  // 在开发环境也加载 Google Analytics，方便测试事件追踪
  // OpenPanel 和 Plausible 仍然只在生产环境加载
  const isProduction = process.env.NODE_ENV === "production";

  return (
    <>
      {isProduction && <OpenPanelAnalytics />}
      <GoogleAnalytics />
      {isProduction && <Plausible />}
    </>
  );
}
