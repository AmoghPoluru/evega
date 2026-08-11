import { describe, expect, it } from "vitest";

import { generateCSSVariables } from "../../../../src/lib/templates/css-variables";

describe("generateCSSVariables card text tokens", () => {
  it("derives readable card text from card background, not page backdrop", () => {
    const vars = generateCSSVariables({
      colors: {
        primary: "#FF6B9D",
        secondary: "#C44569",
        accent: "#FFD93D",
        background: "transparent",
        text: "#FFFFFF",
        textSecondary: "rgba(255, 255, 255, 0.75)",
        cardBackground: "#FFFFFF",
      },
      backgroundStyle: { type: "mesh-gradient" },
    });

    expect(vars["--template-text"]).toBe("#FFFFFF");
    expect(vars["--template-text-secondary"]).toBe("rgba(255, 255, 255, 0.75)");
    expect(vars["--template-card-text"]).toBe("#1A1A1A");
    expect(vars["--template-card-text-secondary"]).toBe("#6B7280");
  });

  it("uses light card text on dark card surfaces", () => {
    const vars = generateCSSVariables({
      colors: {
        primary: "#0A0A0A",
        cardBackground: "#1C1B19",
      },
    });

    expect(vars["--template-card-text"]).toBe("#FFFFFF");
    expect(vars["--template-card-text-secondary"]).toBe("rgba(255, 255, 255, 0.75)");
  });
});
