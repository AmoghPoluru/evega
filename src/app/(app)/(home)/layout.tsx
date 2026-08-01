/// <reference types="next" />
import { getPayload } from "payload";
import config from "@payload-config";

import {
  resolveSiteTemplate,
  resolveSiteRootCSSVariables,
} from "@/lib/templates/template-engine";
import { cssVariablesToString } from "@/lib/templates/css-variables";

interface Props {
  children: React.ReactNode;
}

const Layout = async ({ children }: Props) => {
  const payload = await getPayload({ config });
  const siteTemplate = await resolveSiteTemplate(payload);
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
