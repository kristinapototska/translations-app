/**
 * Test file for app/products/[pid]/page.tsx
 * 
 * Tests the app extension authentication fix
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import ProductInfo from './page';

// Mock Next.js navigation hooks
vi.mock('next/navigation', () => ({
  useParams: vi.fn(),
  useSearchParams: vi.fn(),
  useRouter: vi.fn(),
}));

// Mock hooks
vi.mock('@/hooks/useMounted', () => ({
  useHasMounted: vi.fn(() => true),
}));

vi.mock('@/hooks/useChannels', () => ({
  useChannels: vi.fn(),
}));

// Mock components
vi.mock('@/components/error-message', () => ({
  default: () => <div data-testid="error-message">Error Message</div>,
}));

vi.mock('@/components/loading-indicator', () => ({
  LoadingScreen: () => <div data-testid="loading-screen">Loading...</div>,
}));

vi.mock('@/components/product-form', () => ({
  default: ({ productId, context }: { productId: number; context: string }) => (
    <div data-testid="product-form">
      Product {productId} with context: {context}
    </div>
  ),
}));

describe('ProductInfo - App Extension Authentication', () => {
  const mockRouter = {
    replace: vi.fn(),
    push: vi.fn(),
    back: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
  });

  describe('When context is present', () => {
    it('should render product form directly without redirect', () => {
      (useParams as any).mockReturnValue({ pid: '123' });
      (useSearchParams as any).mockReturnValue({
        get: (key: string) => key === 'context' ? 'valid-context-token' : null,
      });
      (useChannels as any).mockReturnValue({
        channels: [{ channel_id: 1, channel_name: 'Default', locales: [] }],
        isLoading: false,
        error: null,
      });

      render(<ProductInfo />);

      expect(screen.getByTestId('product-form')).toBeInTheDocument();
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });
  });

  describe('When signed_payload_jwt is present but context is missing', () => {
    it('should redirect to /api/load with signed_payload_jwt and redirect_path', () => {
      (useParams as any).mockReturnValue({ pid: '123' });
      (useSearchParams as any).mockReturnValue({
        get: (key: string) => {
          if (key === 'signed_payload_jwt') return 'test-jwt-token';
          if (key === 'context') return null;
          return null;
        },
      });

      // Mock window.location
      Object.defineProperty(window, 'location', {
        value: {
          href: 'https://example.com/products/123?signed_payload_jwt=test-jwt-token',
          origin: 'https://example.com',
          pathname: '/products/123',
        },
        writable: true,
      });

      render(<ProductInfo />);

      expect(mockRouter.replace).toHaveBeenCalledWith(
        expect.stringContaining('/api/load')
      );
      expect(mockRouter.replace).toHaveBeenCalledWith(
        expect.stringContaining('signed_payload_jwt=test-jwt-token')
      );
      expect(mockRouter.replace).toHaveBeenCalledWith(
        expect.stringContaining('redirect_path=/products/123')
      );
    });

    it('should show loading screen during redirect', () => {
      (useParams as any).mockReturnValue({ pid: '123' });
      (useSearchParams as any).mockReturnValue({
        get: (key: string) => {
          if (key === 'signed_payload_jwt') return 'test-jwt-token';
          return null;
        },
      });

      render(<ProductInfo />);

      expect(screen.getByTestId('loading-screen')).toBeInTheDocument();
    });
  });

  describe('When both context and signed_payload_jwt are missing', () => {
    it('should show error message', () => {
      (useParams as any).mockReturnValue({ pid: '123' });
      (useSearchParams as any).mockReturnValue({
        get: () => null,
      });

      render(<ProductInfo />);

      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });
  });

  describe('Query parameter preservation', () => {
    it('should preserve additional query parameters during redirect', () => {
      (useParams as any).mockReturnValue({ pid: '123' });
      (useSearchParams as any).mockReturnValue({
        get: (key: string) => {
          if (key === 'signed_payload_jwt') return 'test-jwt-token';
          if (key === 'test_param') return 'test_value';
          return null;
        },
      });

      Object.defineProperty(window, 'location', {
        value: {
          href: 'https://example.com/products/123?signed_payload_jwt=test-jwt-token&test_param=test_value',
          origin: 'https://example.com',
          pathname: '/products/123',
        },
        writable: true,
      });

      render(<ProductInfo />);

      expect(mockRouter.replace).toHaveBeenCalledWith(
        expect.stringContaining('test_param=test_value')
      );
    });
  });
});

