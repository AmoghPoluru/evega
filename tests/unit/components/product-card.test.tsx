import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductCard } from '@/modules/products/ui/components/product-card';

/**
 * UI tests for ProductCard component
 * Tests component rendering, interactions, and user flows
 */

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, fill, ...props }: any) => (
    <img src={src} alt={alt} data-fill={fill} {...props} />
  ),
}));

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock formatCurrency utility
vi.mock('@/lib/utils', () => ({
  formatCurrency: (price: number) => `$${(price / 100).toFixed(2)}`,
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('ProductCard Component', () => {
  it('should render product name', () => {
    render(
      <ProductCard
        id="product-123"
        name="Test Product"
        price={9999}
        imageUrl={null}
      />
    );
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('should render product price', () => {
    render(
      <ProductCard
        id="product-123"
        name="Test Product"
        price={9999}
        imageUrl={null}
      />
    );
    
    // Price is formatted as $99.99 (9999 cents / 100)
    expect(screen.getByText('$99.99')).toBeInTheDocument();
  });

  it('should render product image when available', () => {
    render(
      <ProductCard
        id="product-123"
        name="Test Product"
        price={9999}
        imageUrl="/test-image.jpg"
      />
    );
    
    const image = screen.getByAltText('Test Product');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/test-image.jpg');
  });

  it('should render placeholder when image is missing', () => {
    render(
      <ProductCard
        id="product-123"
        name="Test Product"
        price={9999}
        imageUrl={null}
      />
    );
    
    const image = screen.getByAltText('Test Product');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/placeholder.png');
  });

  it('should link to product page', () => {
    render(
      <ProductCard
        id="product-123"
        name="Test Product"
        price={9999}
        imageUrl={null}
      />
    );
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/products/product-123');
  });

  it('should render vendor name when provided', () => {
    render(
      <ProductCard
        id="product-123"
        name="Test Product"
        price={9999}
        imageUrl={null}
        vendor={{
          id: 'vendor-123',
          name: 'Test Vendor',
          slug: 'test-vendor',
        }}
      />
    );
    
    expect(screen.getByText('Test Vendor')).toBeInTheDocument();
  });
});
