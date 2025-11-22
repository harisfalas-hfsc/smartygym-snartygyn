import { describe, test, expect, vi, beforeEach } from 'vitest';
import { canUserAccessContent, canPurchaseContent, type AccessCheckParams } from '../access-control';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('Access Control - canUserAccessContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // PUBLIC CONTENT TESTS
  test('guest can access public content (blog, exercise library)', async () => {
    const result = await canUserAccessContent({
      userId: null,
      userTier: 'guest',
      purchasedContent: new Set(),
      contentType: 'blog',
    });
    
    expect(result.allowed).toBe(true);
    expect(result.canPurchase).toBe(false);
  });

  test('guest can access exercise library', async () => {
    const result = await canUserAccessContent({
      userId: null,
      userTier: 'guest',
      purchasedContent: new Set(),
      contentType: 'exercise-library',
    });
    
    expect(result.allowed).toBe(true);
    expect(result.canPurchase).toBe(false);
  });

  // GUEST ACCESS TESTS
  test('guest CANNOT access workouts', async () => {
    const result = await canUserAccessContent({
      userId: null,
      userTier: 'guest',
      purchasedContent: new Set(),
      contentType: 'workout',
      contentId: 'test-workout-1',
    });
    
    expect(result.allowed).toBe(false);
    expect(result.requiresAuth).toBe(true);
    expect(result.reason).toContain('log in');
  });

  test('guest CANNOT access programs', async () => {
    const result = await canUserAccessContent({
      userId: null,
      userTier: 'guest',
      purchasedContent: new Set(),
      contentType: 'program',
      contentId: 'test-program-1',
    });
    
    expect(result.allowed).toBe(false);
    expect(result.requiresAuth).toBe(true);
  });

  // FREE SUBSCRIBER TESTS
  test('free subscriber CAN access free tools', async () => {
    const result = await canUserAccessContent({
      userId: 'user-123',
      userTier: 'subscriber',
      purchasedContent: new Set(),
      contentType: 'tool',
    });
    
    expect(result.allowed).toBe(true);
    expect(result.canPurchase).toBe(false);
  });

  test('free subscriber CAN access free workout', async () => {
    // Mock database response: is_premium = false
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({
          data: { is_premium: false, is_standalone_purchase: false, price: 0 },
          error: null,
        }),
      }),
    });

    (supabase.from as any).mockReturnValue({
      select: mockSelect,
    });

    const result = await canUserAccessContent({
      userId: 'user-123',
      userTier: 'subscriber',
      purchasedContent: new Set(),
      contentType: 'workout',
      contentId: 'free-workout-1',
    });
    
    expect(result.allowed).toBe(true);
    expect(mockSelect).toHaveBeenCalledWith('is_premium, is_standalone_purchase, price');
  });

  test('free subscriber CANNOT access premium workout', async () => {
    // Mock database response: is_premium = true
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({
          data: { is_premium: true, is_standalone_purchase: false, price: 0 },
          error: null,
        }),
      }),
    });

    (supabase.from as any).mockReturnValue({
      select: mockSelect,
    });

    const result = await canUserAccessContent({
      userId: 'user-123',
      userTier: 'subscriber',
      purchasedContent: new Set(),
      contentType: 'workout',
      contentId: 'premium-workout-1',
    });
    
    expect(result.allowed).toBe(false);
    expect(result.requiresPremium).toBe(true);
    expect(result.canPurchase).toBe(false);
  });

  test('free subscriber CAN access premium workout IF purchased', async () => {
    const result = await canUserAccessContent({
      userId: 'user-123',
      userTier: 'subscriber',
      purchasedContent: new Set(['workout:premium-workout-1']),
      contentType: 'workout',
      contentId: 'premium-workout-1',
    });
    
    expect(result.allowed).toBe(true);
    expect(result.reason).toBe('Purchased');
    expect(result.canPurchase).toBe(false);
  });

  test('free subscriber CAN purchase if content is standalone purchasable', async () => {
    // Mock: is_premium=true, is_standalone_purchase=true, price=29.99
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({
          data: { 
            is_premium: true, 
            is_standalone_purchase: true, 
            price: 29.99 
          },
          error: null,
        }),
      }),
    });

    (supabase.from as any).mockReturnValue({
      select: mockSelect,
    });

    const result = await canUserAccessContent({
      userId: 'user-123',
      userTier: 'subscriber',
      purchasedContent: new Set(),
      contentType: 'workout',
      contentId: 'purchasable-workout',
    });
    
    expect(result.allowed).toBe(false);
    expect(result.canPurchase).toBe(true);
    expect(result.requiresPremium).toBe(true);
  });

  // PREMIUM USER TESTS (CRITICAL!)
  test('🚨 premium user CAN access ALL content', async () => {
    const result = await canUserAccessContent({
      userId: 'premium-user-123',
      userTier: 'premium',
      purchasedContent: new Set(),
      contentType: 'workout',
      contentId: 'any-workout',
    });
    
    expect(result.allowed).toBe(true);
    expect(result.canPurchase).toBe(false); // CRITICAL
    expect(result.reason).toBe('Included in premium subscription');
  });

  test('🚨 premium user CAN access premium programs', async () => {
    const result = await canUserAccessContent({
      userId: 'premium-user-123',
      userTier: 'premium',
      purchasedContent: new Set(),
      contentType: 'program',
      contentId: 'premium-program-1',
    });
    
    expect(result.allowed).toBe(true);
    expect(result.canPurchase).toBe(false); // CRITICAL
  });

  test('🚨 premium user CANNOT purchase standalone content', async () => {
    const canPurchase = canPurchaseContent('premium', false);
    expect(canPurchase).toBe(false);
  });

  // CONTENT NOT FOUND
  test('returns error when content not found in database', async () => {
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
    });

    (supabase.from as any).mockReturnValue({
      select: mockSelect,
    });

    const result = await canUserAccessContent({
      userId: 'user-123',
      userTier: 'subscriber',
      purchasedContent: new Set(),
      contentType: 'workout',
      contentId: 'non-existent',
    });
    
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('Content not found');
    expect(result.canPurchase).toBe(false);
  });

  test('returns error when database query fails', async () => {
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      }),
    });

    (supabase.from as any).mockReturnValue({
      select: mockSelect,
    });

    const result = await canUserAccessContent({
      userId: 'user-123',
      userTier: 'subscriber',
      purchasedContent: new Set(),
      contentType: 'workout',
      contentId: 'error-workout',
    });
    
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('Content not found');
  });
});

describe('Access Control - canPurchaseContent', () => {
  test('guest cannot purchase', () => {
    expect(canPurchaseContent('guest', false)).toBe(false);
  });

  test('free subscriber can purchase', () => {
    expect(canPurchaseContent('subscriber', false)).toBe(true);
  });

  test('🚨 CRITICAL: premium user CANNOT purchase', () => {
    expect(canPurchaseContent('premium', false)).toBe(false);
  });

  test('user who already purchased cannot purchase again', () => {
    expect(canPurchaseContent('subscriber', true)).toBe(false);
  });

  test('premium user cannot purchase even if not already purchased', () => {
    expect(canPurchaseContent('premium', false)).toBe(false);
  });
});
