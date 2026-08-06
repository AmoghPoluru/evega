import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductMedia, PRODUCT_MEDIA_RATIO } from "@/components/product-media";

vi.mock("next/image", () => ({
  default: ({ src, alt, fill, ...props }: { src: string; alt: string; fill?: boolean }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} data-fill={fill ? "true" : undefined} {...props} />
  ),
}));

describe("ProductMedia", () => {
  it("exposes aspect ratio map", () => {
    expect(PRODUCT_MEDIA_RATIO.portrait).toBe("4 / 5");
    expect(PRODUCT_MEDIA_RATIO.square).toBe("1 / 1");
  });

  it("renders image with alt text", () => {
    render(
      <ProductMedia src="/test.jpg" alt="Test product" ratio="square" sizes="100px" />,
    );
    expect(screen.getByRole("img", { name: "Test product" })).toBeInTheDocument();
  });

  it("uses placeholder when src is missing", () => {
    render(<ProductMedia alt="No image" ratio="portrait" sizes="100px" />);
    const img = screen.getByRole("img", { name: "No image" });
    expect(img).toHaveAttribute("src", expect.stringContaining("placeholder"));
  });
});
