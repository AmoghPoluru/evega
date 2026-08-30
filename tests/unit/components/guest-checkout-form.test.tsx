import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  GuestCheckoutForm,
  type GuestCheckoutFormRef,
} from '@/modules/checkout/ui/components/guest-checkout-form';

/**
 * UI tests for GuestCheckoutForm component
 * Covers field rendering and the imperative validate() contract
 */

// Labels are not associated with inputs via htmlFor, so fields are located by autocomplete token.
const field = (container: HTMLElement, autoComplete: string) => {
  const element = container.querySelector<HTMLInputElement | HTMLSelectElement>(
    `[autocomplete="${autoComplete}"]`
  );
  if (!element) throw new Error(`No field with autocomplete="${autoComplete}"`);
  return element;
};

const renderForm = () => {
  const ref = React.createRef<GuestCheckoutFormRef>();
  const { container } = render(<GuestCheckoutForm ref={ref} />);
  return { ref, container };
};

const validate = async (ref: React.RefObject<GuestCheckoutFormRef>) => {
  let result: Awaited<ReturnType<GuestCheckoutFormRef['validate']>> = null;
  await act(async () => {
    result = await ref.current!.validate();
  });
  return result;
};

describe('GuestCheckoutForm Component', () => {
  it('should render all required fields with required markers', () => {
    const { container } = renderForm();

    for (const label of [
      'Email',
      'Phone',
      'Full name',
      'Street address',
      'City',
      'State',
      'ZIP code',
    ]) {
      const labelElement = screen.getByText(label, { selector: 'label' });
      expect(labelElement).toBeInTheDocument();
      expect(labelElement.textContent).toContain('*');
    }

    expect(field(container, 'email')).toHaveAttribute('type', 'email');
    expect(field(container, 'tel')).toHaveAttribute('type', 'tel');
    expect(field(container, 'name')).toBeInTheDocument();
    expect(field(container, 'street-address')).toBeInTheDocument();
    expect(field(container, 'address-level2')).toBeInTheDocument();
    expect(field(container, 'postal-code')).toBeInTheDocument();

    const state = field(container, 'address-level1');
    expect(state.tagName).toBe('SELECT');
    expect(screen.getByRole('option', { name: 'Select state' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'CA' })).toBeInTheDocument();
  });

  it('should return null and show errors when all fields are empty', async () => {
    const { ref } = renderForm();

    expect(await validate(ref)).toBeNull();

    expect(screen.getByText('Valid email is required')).toBeInTheDocument();
    expect(screen.getByText('Full name is required')).toBeInTheDocument();
    expect(screen.getByText('Phone number is required')).toBeInTheDocument();
    expect(screen.getByText('Street address is required')).toBeInTheDocument();
    expect(screen.getByText('City is required')).toBeInTheDocument();
    expect(screen.getByText('State is required')).toBeInTheDocument();
    expect(
      screen.getByText('Invalid ZIP code format (e.g., 12345 or 12345-6789)')
    ).toBeInTheDocument();
  });

  it('should return null when email and ZIP code are malformed', async () => {
    const user = userEvent.setup();
    const { ref, container } = renderForm();

    await user.type(field(container, 'email'), 'notanemail');
    await user.type(field(container, 'name'), 'Ada Lovelace');
    await user.type(field(container, 'tel'), '+1-555-123-4567');
    await user.type(field(container, 'street-address'), '1 Analytical Way');
    await user.type(field(container, 'address-level2'), 'San Francisco');
    await user.selectOptions(field(container, 'address-level1'), 'CA');
    await user.type(field(container, 'postal-code'), '123');

    expect(await validate(ref)).toBeNull();

    expect(screen.getByText('Valid email is required')).toBeInTheDocument();
    expect(
      screen.getByText('Invalid ZIP code format (e.g., 12345 or 12345-6789)')
    ).toBeInTheDocument();
    expect(screen.queryByText('Full name is required')).not.toBeInTheDocument();
    expect(screen.queryByText('State is required')).not.toBeInTheDocument();
  });

  it('should resolve with guest checkout data when all fields are valid', async () => {
    const user = userEvent.setup();
    const { ref, container } = renderForm();

    await user.type(field(container, 'email'), 'guest@example.com');
    await user.type(field(container, 'name'), 'Ada Lovelace');
    await user.type(field(container, 'tel'), '+1-555-123-4567');
    await user.type(field(container, 'street-address'), '1 Analytical Way');
    await user.type(field(container, 'address-level2'), 'San Francisco');
    await user.selectOptions(field(container, 'address-level1'), 'CA');
    await user.type(field(container, 'postal-code'), '94105');

    expect(await validate(ref)).toEqual({
      guestEmail: 'guest@example.com',
      guestShippingAddress: {
        fullName: 'Ada Lovelace',
        street: '1 Analytical Way',
        city: 'San Francisco',
        state: 'CA',
        zipcode: '94105',
        phone: '+1-555-123-4567',
        country: 'United States',
      },
    });
  });
});
