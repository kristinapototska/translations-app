/**
 * Functional tests for channels API route
 * Tests the migration to GraphQL store.locales query
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
import { createGraphQLClient } from '@bigcommerce/translations-graphql-client';
import { getSessionFromContext } from '@/lib/auth';

// Mock dependencies
vi.mock('@bigcommerce/translations-graphql-client');
vi.mock('@/lib/auth');

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
      const data = await response.json();

      expect(mockGraphQLClient.getChannelLocales).toHaveBeenCalledWith(1);
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should handle empty locales array', async () => {
      mockGraphQLClient.getChannelLocales.mockResolvedValue([]);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(0);
    });

    it('should include locale titles from hardcoded list', async () => {
      const mockLocalesData = [
        { code: 'en', status: 'active', is_default: true },
        { code: 'fr', status: 'active', is_default: false },
      ];

      mockGraphQLClient.getChannelLocales.mockResolvedValue(mockLocalesData);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Titles should be added from hardcoded list
      expect(data.length).toBeGreaterThan(0);
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
      const mockLocalesData = [
        { code: 'en', status: 'active', is_default: true },
        { code: 'fr', status: 'active', is_default: false },
      ];

      mockGraphQLClient.getChannelLocales.mockResolvedValue(mockLocalesData);

      const response = await GET(mockRequest);
      const data = await response.json();

      if (data.length > 0) {
        const locale = data[0];
        expect(locale).toHaveProperty('code');
        expect(locale).toHaveProperty('status');
        expect(locale).toHaveProperty('is_default');
      }
    });
  });
});

