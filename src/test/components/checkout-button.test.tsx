import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CheckoutButton } from '@/modules/checkout/ui/components/checkout-button';

/**
 * UI tests for CheckoutButton component
 * Tests user interactions and cart state
 */

// Mock useCart hook
const mockUseCart = vi.fn(() => ({
  totalItems: 0,
  items: [],
  productIds: [],
}));

vi.mock('@/modules/checkout/hooks/use-cart', () => ({
  useCart: () => mockUseCart(),
}));

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock Button component
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, asChild, className, ...props }: any) => {
    if (asChild) {
      return <div className={className} {...props}>{children}</div>;
    }
    return <button className={className} {...props}>{children}</button>;
  },
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ShoppingCartIcon: () => <svg data-testid="cart-icon" />,
}));

describe('CheckoutButton Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCart.mockReturnValue({
      totalItems: 0,
      items: [],
      productIds: [],
    });
  });

  it('should render checkout button', async () => {
    render(<CheckoutButton />);
    
    // Wait for component to mount (uses useEffect)
    await waitFor(() => {
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/checkout');
    });
  });

  it('should display cart item count when items exist', async () => {
    mockUseCart.mockReturnValue({
      totalItems: 3,
      items: [{ productId: '1' }, { productId: '2' }, { productId: '3' }],
      productIds: ['1', '2', '3'],
    });
    
    render(<CheckoutButton />);
    
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('should not display count when cart is empty', async () => {
    mockUseCart.mockReturnValue({
      totalItems: 0,
      items: [],
      productIds: [],
    });
    
    render(<CheckoutButton />);
    
    await waitFor(() => {
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      // Count should not be visible when 0
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });
  });

  it('should hide button when hideIfEmpty is true and cart is empty', () => {
    mockUseCart.mockReturnValue({
      totalItems: 0,
      items: [],
      productIds: [],
    });
    
    const { container } = render(<CheckoutButton hideIfEmpty />);
    
    // Component should return null when hideIfEmpty and totalItems === 0
    expect(container.firstChild).toBeNull();
  });

  it('should show button when hideIfEmpty is true but cart has items', async () => {
    mockUseCart.mockReturnValue({
      totalItems: 2,
      items: [{ productId: '1' }, { productId: '2' }],
      productIds: ['1', '2'],
    });
    
    render(<CheckoutButton hideIfEmpty />);
    
    await waitFor(() => {
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
    });
  });
});
