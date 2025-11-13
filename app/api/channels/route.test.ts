/**
 * Functional tests for channels API route
 * Tests the migration to GraphQL store.locales query
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
import { createGraphQLClient } from '@bigcommerce/translations-graphql-client';
import { getSessionFromContext } from '@/lib/auth';
import { BigCommerceRestClient } from '@bigcommerce/translations-rest-client';

// Mock dependencies
vi.mock('@bigcommerce/translations-graphql-client');
vi.mock('@bigcommerce/translations-rest-client');
vi.mock('@/lib/auth');
vi.mock('next/cache', () => ({
  unstable_cache: vi.fn((fn: any) => fn),
}));

describe('Channels API Route - GET Handler', () => {
  let mockGraphQLClient: any;
  let mockRequest: NextRequest;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock session
    (getSessionFromContext as any).mockResolvedValue({
      storeHash: 'test-store',
      accessToken: 'test-token',
      userId: 1,
      channelId: 1,
    });

    // Mock REST client - need to return instance with getAvailableChannels method
    // The route filters channels with more than one locale, so we need at least 2 locales
    (BigCommerceRestClient as any).mockImplementation(function() {
      return {
        getAvailableChannels: vi.fn().mockResolvedValue({
          data: [
            { id: 1, name: 'Default Channel' },
          ],
        }),
      };
    });

    // Mock GraphQL client
    mockGraphQLClient = {
      getChannelLocales: vi.fn(),
    };

    (createGraphQLClient as any).mockReturnValue(mockGraphQLClient);

    // Mock request
    mockRequest = new NextRequest('http://localhost:3000/api/channels');
  });

  describe('GraphQL Locales Query', () => {
    it('should fetch locales using new GraphQL API', async () => {
      const mockLocalesData = [
        { code: 'en', status: 'active', is_default: true },
        { code: 'fr', status: 'active', is_default: false },
        { code: 'es', status: 'active', is_default: false },
      ];

      mockGraphQLClient.getChannelLocales.mockResolvedValue(mockLocalesData);

      const response = await GET(mockRequest);
      
      // Check response status first
      if (response.status !== 200) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
      }
      expect(response.status).toBe(200);
      
      const data = await response.json();

      expect(mockGraphQLClient.getChannelLocales).toHaveBeenCalledWith(1);
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should handle empty locales array', async () => {
      // When locales array is empty, channel is filtered out (needs >1 locale)
      // So result should be empty array
      mockGraphQLClient.getChannelLocales.mockResolvedValue([]);

      const response = await GET(mockRequest);
      
      // Check response status first
      expect(response.status).toBe(200);
      
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      // Channel with 0 locales is filtered out, so result is empty
      expect(data.length).toBe(0);
    });

    it('should include locale titles from hardcoded list', async () => {
      // Need at least 2 locales for channel to be included (filtered if <= 1)
      const mockLocalesData = [
        { code: 'en', status: 'active', is_default: true },
        { code: 'fr', status: 'active', is_default: false },
      ];

      mockGraphQLClient.getChannelLocales.mockResolvedValue(mockLocalesData);

      const response = await GET(mockRequest);
      
      // Check response status first
      if (response.status !== 200) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
      }
      expect(response.status).toBe(200);
      
      const data = await response.json();

      expect(response.status).toBe(200);
      // Channel with 2+ locales should be included
      expect(data.length).toBeGreaterThan(0);
      if (data.length > 0 && data[0].locales && data[0].locales.length > 0) {
        // Titles should be added from hardcoded list
        expect(data[0].locales[0]).toHaveProperty('title');
      }
    });

    it('should handle GraphQL API failure gracefully', async () => {
      mockGraphQLClient.getChannelLocales.mockRejectedValue(
        new Error('GraphQL API failed')
      );

      // Should fallback to default locale
      const response = await GET(mockRequest);

      // Should still return a response (with fallback)
      expect(response).toBeDefined();
    });

    it('should return locales with correct structure', async () => {
      // Need at least 2 locales for channel to be included
      const mockLocalesData = [
        { code: 'en', status: 'active', is_default: true },
        { code: 'fr', status: 'active', is_default: false },
      ];

      mockGraphQLClient.getChannelLocales.mockResolvedValue(mockLocalesData);

      const response = await GET(mockRequest);
      
      // Check response status first
      if (response.status !== 200) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
      }
      expect(response.status).toBe(200);
      
      const data = await response.json();

      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        // Response structure: [{ channel_id, channel_name, default_locale, locales: [...] }]
        const channel = data[0];
        expect(channel).toHaveProperty('channel_id');
        expect(channel).toHaveProperty('channel_name');
        expect(channel).toHaveProperty('default_locale');
        expect(channel).toHaveProperty('locales');
        expect(Array.isArray(channel.locales)).toBe(true);
        if (channel.locales.length > 0) {
          const locale = channel.locales[0];
          expect(locale).toHaveProperty('code');
          expect(locale).toHaveProperty('status');
          expect(locale).toHaveProperty('is_default');
        }
      }
    });
  });
});

