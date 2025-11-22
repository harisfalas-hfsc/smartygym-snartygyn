import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AccessGate } from '../AccessGate';
import { useAccessControl } from '@/hooks/useAccessControl';
import { BrowserRouter } from 'react-router-dom';

// Mock the useAccessControl hook
vi.mock('@/hooks/useAccessControl');

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve({ data: { is_premium: false }, error: null })),
        })),
      })),
    })),
  },
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('AccessGate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows content immediately for premium users', () => {
    vi.mocked(useAccessControl).mockReturnValue({
      userTier: 'premium',
      hasPurchased: vi.fn(() => false),
      user: { id: '123' } as any,
      isLoading: false,
      productId: 'gold',
      purchasedContent: new Set(),
      canAccessContent: vi.fn(() => true),
      canInteract: vi.fn(() => true),
      refreshAccess: vi.fn(),
    });

    const { getByText } = render(
      <TestWrapper>
        <AccessGate contentId="workout-1" contentType="workout">
          <div>Premium Content</div>
        </AccessGate>
      </TestWrapper>
    );

    expect(getByText('Premium Content')).toBeInTheDocument();
  });

  it('shows content for free users who purchased', () => {
    vi.mocked(useAccessControl).mockReturnValue({
      userTier: 'subscriber',
      hasPurchased: vi.fn(() => true),
      user: { id: '123' } as any,
      isLoading: false,
      productId: null,
      purchasedContent: new Set(['workout:workout-1']),
      canAccessContent: vi.fn(() => true),
      canInteract: vi.fn(() => true),
      refreshAccess: vi.fn(),
    });

    const { getByText } = render(
      <TestWrapper>
        <AccessGate contentId="workout-1" contentType="workout">
          <div>Purchased Content</div>
        </AccessGate>
      </TestWrapper>
    );

    expect(getByText('Purchased Content')).toBeInTheDocument();
  });

  it('shows upgrade prompt for free users without purchase', () => {
    vi.mocked(useAccessControl).mockReturnValue({
      userTier: 'subscriber',
      hasPurchased: vi.fn(() => false),
      user: { id: '123' } as any,
      isLoading: false,
      productId: null,
      purchasedContent: new Set(),
      canAccessContent: vi.fn(() => false),
      canInteract: vi.fn(() => true),
      refreshAccess: vi.fn(),
    });

    const { getByText } = render(
      <TestWrapper>
        <AccessGate contentId="workout-1" contentType="workout">
          <div>Premium Content</div>
        </AccessGate>
      </TestWrapper>
    );

    expect(getByText(/Upgrade to access this content/i)).toBeInTheDocument();
  });

  it('shows login prompt for guests', () => {
    vi.mocked(useAccessControl).mockReturnValue({
      userTier: 'guest',
      hasPurchased: vi.fn(() => false),
      user: null,
      isLoading: false,
      productId: null,
      purchasedContent: new Set(),
      canAccessContent: vi.fn(() => false),
      canInteract: vi.fn(() => false),
      refreshAccess: vi.fn(),
    });

    const { getByText } = render(
      <TestWrapper>
        <AccessGate contentId="workout-1" contentType="workout">
          <div>Premium Content</div>
        </AccessGate>
      </TestWrapper>
    );

    expect(getByText(/Sign in to access/i)).toBeInTheDocument();
  });

  it('shows loading state while checking access', () => {
    vi.mocked(useAccessControl).mockReturnValue({
      userTier: 'subscriber',
      hasPurchased: vi.fn(() => false),
      user: { id: '123' } as any,
      isLoading: true,
      productId: null,
      purchasedContent: new Set(),
      canAccessContent: vi.fn(() => false),
      canInteract: vi.fn(() => true),
      refreshAccess: vi.fn(),
    });

    const { getByText } = render(
      <TestWrapper>
        <AccessGate contentId="workout-1" contentType="workout">
          <div>Premium Content</div>
        </AccessGate>
      </TestWrapper>
    );

    expect(getByText(/Loading/i)).toBeInTheDocument();
  });
});
