/// <reference types="next" />
import { resolveSiteRootCSSVariables } from "@/lib/templates/template-engine";
import { getCachedSiteTemplate } from "@/lib/templates/site-template-cache";
import { cssVariablesToString } from "@/lib/templates/css-variables";

interface Props {
  children: React.ReactNode;
}

const Layout = async ({ children }: Props) => {
  const siteTemplate = await getCachedSiteTemplate();
  const cssVariables = cssVariablesToString(resolveSiteRootCSSVariables(siteTemplate));
  const bodyFont = siteTemplate.templateConfig.fonts?.body;

  return (
    <div
      className="flex flex-col min-h-screen"
      style={bodyFont ? { fontFamily: bodyFont } : undefined}
    >
      <style>{`:root {
        ${cssVariables}
      }`}</style>
      {children}
    </div>
  );
};

export default Layout;
