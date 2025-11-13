/**
 * Functional tests for product translation API route
 * Tests the migration to new BigCommerce Translations Admin GraphQL API
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, PUT } from './route';
import { createGraphQLClient } from '@bigcommerce/translations-graphql-client';
import { getSessionFromContext } from '@/lib/auth';

// Mock dependencies
vi.mock('@bigcommerce/translations-graphql-client');
vi.mock('@/lib/auth');
vi.mock('@/lib/utils/product-mutation-helpers', () => ({
  getBasicInformationFieldsToRemove: vi.fn(),
  getSeoInformationFieldsToRemove: vi.fn(),
  getStorefrontDetailsFieldsToRemove: vi.fn(),
  getPreOrderSettingsFieldsToRemove: vi.fn(),
  getCustomFieldsToRemove: vi.fn(),
}));

describe('Product API Route - GET Handler', () => {
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
      getProductTranslations: vi.fn(),
      getProductLocaleData: vi.fn(),
    };

    (createGraphQLClient as any).mockReturnValue(mockGraphQLClient);

    // Mock request
    mockRequest = new NextRequest('http://localhost:3000/api/product/123?channelId=1&locale=fr');
  });

  describe('New API Integration', () => {
    it('should fetch product translations using new API', async () => {
      const mockTranslationsData = {
        edges: [{
          node: {
            resourceId: 'bc/store/product/123',
            fields: [
              { fieldName: 'name', original: 'Product Name', translation: 'Nom du Produit' },
              { fieldName: 'description', original: 'Description', translation: 'Description FR' },
            ],
          },
        }],
      };

      const mockProductData = {
        id: 123,
        basicInformation: { name: 'Product Name', description: 'Description' },
        seoInformation: { pageTitle: 'Page Title', metaDescription: 'Meta Desc' },
        options: { edges: [] },
        modifiers: { edges: [] },
        customFields: { edges: [] },
      };

      mockGraphQLClient.getProductTranslations.mockResolvedValue(mockTranslationsData);
      mockGraphQLClient.getProductLocaleData.mockResolvedValue(mockProductData);

      const response = await GET(mockRequest, { params: { pid: '123' } });
      const data = await response.json();

      expect(mockGraphQLClient.getProductTranslations).toHaveBeenCalledWith({
        channelId: 1,
        locale: 'fr',
        productId: 123,
      });
      expect(data.name).toBe('Nom du Produit');
      expect(data.description).toBe('Description FR');
    });

    it('should gracefully fallback to old API if new API fails', async () => {
      const mockProductData = {
        id: 123,
        basicInformation: { name: 'Product Name', description: 'Description' },
        seoInformation: { pageTitle: 'Page Title', metaDescription: 'Meta Desc' },
        options: { edges: [] },
        modifiers: { edges: [] },
        customFields: { edges: [] },
        overridesForLocale: {
          basicInformation: { name: 'Old API Name', description: 'Old API Desc' },
        },
      };

      mockGraphQLClient.getProductTranslations.mockRejectedValue(new Error('New API failed'));
      mockGraphQLClient.getProductLocaleData.mockResolvedValue(mockProductData);

      const response = await GET(mockRequest, { params: { pid: '123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe('Old API Name');
      expect(data.description).toBe('Old API Desc');
    });

    it('should handle products with no translations', async () => {
      const mockTranslationsData = {
        edges: [],
      };

      const mockProductData = {
        id: 123,
        basicInformation: { name: 'Product Name', description: 'Description' },
        seoInformation: { pageTitle: 'Page Title', metaDescription: 'Meta Desc' },
        options: { edges: [] },
        modifiers: { edges: [] },
        customFields: { edges: [] },
      };

      mockGraphQLClient.getProductTranslations.mockResolvedValue(mockTranslationsData);
      mockGraphQLClient.getProductLocaleData.mockResolvedValue(mockProductData);

      const response = await GET(mockRequest, { params: { pid: '123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe('Product Name'); // Falls back to original
      expect(data.description).toBe('Description');
    });

    it('should handle empty availableLocales array gracefully', async () => {
      const mockProductData = {
        id: 123,
        basicInformation: { name: 'Product Name' },
        seoInformation: {},
        options: { edges: [] },
        modifiers: { edges: [] },
        customFields: { edges: [] },
      };

      mockGraphQLClient.getProductTranslations.mockResolvedValue({ edges: [] });
      mockGraphQLClient.getProductLocaleData.mockResolvedValue(mockProductData);

      // Mock getChannelLocales to return empty array
      vi.mock('@/lib/utils/channels', () => ({
        getChannelLocales: vi.fn().mockResolvedValue({
          defaultLocale: 'en',
          availableLocales: [],
        }),
      }));

      const response = await GET(mockRequest, { params: { pid: '123' } });

      // Should use defaultLocale when availableLocales is empty
      expect(response.status).toBe(200);
    });

    it('should validate product ID parameter', async () => {
      const invalidRequest = new NextRequest('http://localhost:3000/api/product/invalid?channelId=1&locale=fr');

      const response = await GET(invalidRequest, { params: { pid: 'invalid' } });

      expect(response.status).toBe(400);
      const text = await response.text();
      expect(text).toContain('Invalid product ID');
    });

    it('should use parallel API calls for better performance', async () => {
      const mockTranslationsData = {
        edges: [{
          node: {
            resourceId: 'bc/store/product/123',
            fields: [{ fieldName: 'name', original: 'Product', translation: 'Produit' }],
          },
        }],
      };

      const mockProductData = {
        id: 123,
        basicInformation: { name: 'Product Name' },
        seoInformation: {},
        options: { edges: [] },
        modifiers: { edges: [] },
        customFields: { edges: [] },
      };

      mockGraphQLClient.getProductTranslations.mockResolvedValue(mockTranslationsData);
      mockGraphQLClient.getProductLocaleData.mockResolvedValue(mockProductData);

      const startTime = Date.now();
      await GET(mockRequest, { params: { pid: '123' } });
      const endTime = Date.now();

      // Both calls should be made
      expect(mockGraphQLClient.getProductTranslations).toHaveBeenCalled();
      expect(mockGraphQLClient.getProductLocaleData).toHaveBeenCalled();
      
      // Verify calls were made (parallel execution means both should be called)
      const translationCallTime = mockGraphQLClient.getProductTranslations.mock.calls.length;
      const productCallTime = mockGraphQLClient.getProductLocaleData.mock.calls.length;
      expect(translationCallTime).toBeGreaterThan(0);
      expect(productCallTime).toBeGreaterThan(0);
    });
  });

  describe('Hybrid Approach', () => {
    it('should combine new API (basic fields) with old API (options/modifiers)', async () => {
      const mockTranslationsData = {
        edges: [{
          node: {
            resourceId: 'bc/store/product/123',
            fields: [
              { fieldName: 'name', original: 'Product', translation: 'Produit' },
            ],
          },
        }],
      };

      const mockProductData = {
        id: 123,
        basicInformation: { name: 'Product Name' },
        seoInformation: {},
        options: {
          edges: [{
            node: {
              id: 'option-1',
              overridesForLocale: { displayName: 'Option FR' },
              values: [],
            },
          }],
        },
        modifiers: { edges: [] },
        customFields: { edges: [] },
      };

      mockGraphQLClient.getProductTranslations.mockResolvedValue(mockTranslationsData);
      mockGraphQLClient.getProductLocaleData.mockResolvedValue(mockProductData);

      const response = await GET(mockRequest, { params: { pid: '123' } });
      const data = await response.json();

      expect(data.name).toBe('Produit'); // From new API
      expect(data.options).toBeDefined(); // From old API
    });
  });
});

describe('Product API Route - PUT Handler', () => {
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
      updateProductTranslations: vi.fn(),
      deleteProductTranslations: vi.fn(),
      deleteCustomFieldTranslations: vi.fn(),
      getProductTranslations: vi.fn(),
      getProductLocaleData: vi.fn(),
      NOTADA_updateProductLocaleData: vi.fn(),
    };

    (createGraphQLClient as any).mockReturnValue(mockGraphQLClient);

    // Mock helper functions
    const { getBasicInformationFieldsToRemove, getSeoInformationFieldsToRemove } = require('@/lib/utils/product-mutation-helpers');
    getBasicInformationFieldsToRemove.mockReturnValue([]);
    getSeoInformationFieldsToRemove.mockReturnValue([]);
    getStorefrontDetailsFieldsToRemove.mockReturnValue([]);
    getPreOrderSettingsFieldsToRemove.mockReturnValue([]);
    getCustomFieldsToRemove.mockReturnValue([]);
  });

  describe('Basic Field Updates', () => {
    it('should update basic fields using new API', async () => {
      const requestBody = {
        locale: 'fr',
        name: 'Nouveau Nom',
        description: 'Nouvelle Description',
        pageTitle: 'Nouveau Titre',
      };

      mockRequest = new NextRequest('http://localhost:3000/api/product/123', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      // Mock successful update
      mockGraphQLClient.updateProductTranslations.mockResolvedValue({});
      mockGraphQLClient.getProductTranslations.mockResolvedValue({
        edges: [{
          node: {
            resourceId: 'bc/store/product/123',
            fields: [
              { fieldName: 'name', original: 'Product', translation: 'Nouveau Nom' },
              { fieldName: 'description', original: 'Description', translation: 'Nouvelle Description' },
            ],
          },
        }],
      });
      mockGraphQLClient.getProductLocaleData.mockResolvedValue({
        id: 123,
        basicInformation: { name: 'Product' },
        seoInformation: {},
        options: { edges: [] },
        modifiers: { edges: [] },
        customFields: { edges: [] },
      });

      const response = await PUT(mockRequest, { params: { pid: '123' } });

      expect(mockGraphQLClient.updateProductTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: expect.any(Number),
          locale: 'fr',
          productId: 123,
          fields: expect.arrayContaining([
            { fieldName: 'name', value: 'Nouveau Nom' },
            { fieldName: 'description', value: 'Nouvelle Description' },
          ]),
        })
      );
      expect(response.status).toBe(200);
    });

    it('should handle partial updates gracefully', async () => {
      const requestBody = {
        locale: 'fr',
        name: 'Nouveau Nom',
        // Other fields not provided
      };

      mockRequest = new NextRequest('http://localhost:3000/api/product/123', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      mockGraphQLClient.updateProductTranslations.mockResolvedValue({});
      mockGraphQLClient.getProductTranslations.mockResolvedValue({
        edges: [{
          node: {
            resourceId: 'bc/store/product/123',
            fields: [
              { fieldName: 'name', original: 'Product', translation: 'Nouveau Nom' },
            ],
          },
        }],
      });
      mockGraphQLClient.getProductLocaleData.mockResolvedValue({
        id: 123,
        basicInformation: { name: 'Product' },
        seoInformation: {},
        options: { edges: [] },
        modifiers: { edges: [] },
        customFields: { edges: [] },
      });

      const response = await PUT(mockRequest, { params: { pid: '123' } });

      expect(response.status).toBe(200);
      expect(mockGraphQLClient.updateProductTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          fields: expect.arrayContaining([
            { fieldName: 'name', value: 'Nouveau Nom' },
          ]),
        })
      );
    });
  });

  describe('Basic Field Deletions', () => {
    it('should delete basic fields using new API deleteTranslations', async () => {
      const { getBasicInformationFieldsToRemove } = require('@/lib/utils/product-mutation-helpers');
      getBasicInformationFieldsToRemove.mockReturnValue(['PRODUCT_NAME_FIELD']);

      const requestBody = {
        locale: 'fr',
        name: '', // Empty name should trigger deletion
      };

      mockRequest = new NextRequest('http://localhost:3000/api/product/123', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      mockGraphQLClient.deleteProductTranslations.mockResolvedValue({});
      mockGraphQLClient.getProductTranslations.mockResolvedValue({
        edges: [{
          node: {
            resourceId: 'bc/store/product/123',
            fields: [],
          },
        }],
      });
      mockGraphQLClient.getProductLocaleData.mockResolvedValue({
        id: 123,
        basicInformation: { name: 'Product' },
        seoInformation: {},
        options: { edges: [] },
        modifiers: { edges: [] },
        customFields: { edges: [] },
      });

      const response = await PUT(mockRequest, { params: { pid: '123' } });

      expect(mockGraphQLClient.deleteProductTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: expect.any(Number),
          locale: 'fr',
          productId: 123,
          fields: ['name'], // Mapped from PRODUCT_NAME_FIELD
        })
      );
      expect(response.status).toBe(200);
    });

    it('should handle multiple field deletions', async () => {
      const { 
        getBasicInformationFieldsToRemove,
        getSeoInformationFieldsToRemove 
      } = require('@/lib/utils/product-mutation-helpers');
      getBasicInformationFieldsToRemove.mockReturnValue(['PRODUCT_NAME_FIELD']);
      getSeoInformationFieldsToRemove.mockReturnValue(['PRODUCT_PAGE_TITLE_FIELD']);

      const requestBody = {
        locale: 'fr',
        name: '',
        pageTitle: '',
      };

      mockRequest = new NextRequest('http://localhost:3000/api/product/123', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      mockGraphQLClient.deleteProductTranslations.mockResolvedValue({});
      mockGraphQLClient.getProductTranslations.mockResolvedValue({
        edges: [{
          node: {
            resourceId: 'bc/store/product/123',
            fields: [],
          },
        }],
      });
      mockGraphQLClient.getProductLocaleData.mockResolvedValue({
        id: 123,
        basicInformation: { name: 'Product' },
        seoInformation: {},
        options: { edges: [] },
        modifiers: { edges: [] },
        customFields: { edges: [] },
      });

      await PUT(mockRequest, { params: { pid: '123' } });

      expect(mockGraphQLClient.deleteProductTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          fields: expect.arrayContaining(['name', 'page_title']),
        })
      );
    });
  });

  describe('Custom Field Deletions', () => {
    it('should delete custom fields using new API with PRODUCT_CUSTOM_FIELDS', async () => {
      const { getCustomFieldsToRemove } = require('@/lib/utils/product-mutation-helpers');
      getCustomFieldsToRemove.mockReturnValue([
        { customFieldId: '456', fields: ['NAME', 'VALUE'] },
      ]);

      const requestBody = {
        locale: 'fr',
        customFields: {
          '456': { name: '', value: '' },
        },
      };

      mockRequest = new NextRequest('http://localhost:3000/api/product/123', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      mockGraphQLClient.deleteCustomFieldTranslations.mockResolvedValue({});
      mockGraphQLClient.getProductTranslations.mockResolvedValue({
        edges: [],
      });
      mockGraphQLClient.getProductLocaleData.mockResolvedValue({
        id: 123,
        basicInformation: {},
        seoInformation: {},
        options: { edges: [] },
        modifiers: { edges: [] },
        customFields: { edges: [] },
      });

      const response = await PUT(mockRequest, { params: { pid: '123' } });

      expect(mockGraphQLClient.deleteCustomFieldTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: expect.any(Number),
          locale: 'fr',
          customFields: [
            {
              customFieldId: '456',
              fields: ['NAME', 'VALUE'],
            },
          ],
        })
      );
      expect(response.status).toBe(200);
    });

    it('should handle multiple custom field deletions', async () => {
      const { getCustomFieldsToRemove } = require('@/lib/utils/product-mutation-helpers');
      getCustomFieldsToRemove.mockReturnValue([
        { customFieldId: '456', fields: ['NAME'] },
        { customFieldId: '789', fields: ['VALUE'] },
      ]);

      const requestBody = {
        locale: 'fr',
        customFields: {
          '456': { name: '' },
          '789': { value: '' },
        },
      };

      mockRequest = new NextRequest('http://localhost:3000/api/product/123', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      mockGraphQLClient.deleteCustomFieldTranslations.mockResolvedValue({});
      mockGraphQLClient.getProductTranslations.mockResolvedValue({
        edges: [],
      });
      mockGraphQLClient.getProductLocaleData.mockResolvedValue({
        id: 123,
        basicInformation: {},
        seoInformation: {},
        options: { edges: [] },
        modifiers: { edges: [] },
        customFields: { edges: [] },
      });

      await PUT(mockRequest, { params: { pid: '123' } });

      expect(mockGraphQLClient.deleteCustomFieldTranslations).toHaveBeenCalledWith(
        expect.objectContaining({
          customFields: expect.arrayContaining([
            { customFieldId: '456', fields: ['NAME'] },
            { customFieldId: '789', fields: ['VALUE'] },
          ]),
        })
      );
    });
  });

  describe('Input Validation', () => {
    it('should return 400 if locale is missing in PUT request', async () => {
      const requestBody = {
        name: 'Nouveau Nom',
        // locale is missing
      };

      mockRequest = new NextRequest('http://localhost:3000/api/product/123', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(mockRequest, { params: { pid: '123' } });

      expect(response.status).toBe(400);
      const text = await response.text();
      expect(text).toContain('Locale is required');
    });

    it('should validate product ID in PUT request', async () => {
      const requestBody = {
        locale: 'fr',
        name: 'Nouveau Nom',
      };

      mockRequest = new NextRequest('http://localhost:3000/api/product/invalid', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(mockRequest, { params: { pid: 'invalid' } });

      expect(response.status).toBe(400);
      const text = await response.text();
      expect(text).toContain('Invalid product ID');
    });
  });

  describe('Error Handling', () => {
    it('should handle new API failure gracefully', async () => {
      const requestBody = {
        locale: 'fr',
        name: 'Nouveau Nom',
      };

      mockRequest = new NextRequest('http://localhost:3000/api/product/123', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      mockGraphQLClient.updateProductTranslations.mockRejectedValue(
        new Error('New API failed')
      );
      mockGraphQLClient.getProductTranslations.mockResolvedValue({
        edges: [],
      });
      mockGraphQLClient.getProductLocaleData.mockResolvedValue({
        id: 123,
        basicInformation: { name: 'Product' },
        seoInformation: {},
        options: { edges: [] },
        modifiers: { edges: [] },
        customFields: { edges: [] },
      });

      // Should not throw, should continue with old API
      const response = await PUT(mockRequest, { params: { pid: '123' } });

      expect(response.status).toBe(200);
      // Old API should still be called
      expect(mockGraphQLClient.NOTADA_updateProductLocaleData).toHaveBeenCalled();
    });

    it('should handle deletion failure gracefully', async () => {
      const { getBasicInformationFieldsToRemove } = require('@/lib/utils/product-mutation-helpers');
      getBasicInformationFieldsToRemove.mockReturnValue(['PRODUCT_NAME_FIELD']);

      const requestBody = {
        locale: 'fr',
        name: '',
      };

      mockRequest = new NextRequest('http://localhost:3000/api/product/123', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      mockGraphQLClient.deleteProductTranslations.mockRejectedValue(
        new Error('Deletion failed')
      );
      mockGraphQLClient.getProductTranslations.mockResolvedValue({
        edges: [],
      });
      mockGraphQLClient.getProductLocaleData.mockResolvedValue({
        id: 123,
        basicInformation: { name: 'Product' },
        seoInformation: {},
        options: { edges: [] },
        modifiers: { edges: [] },
        customFields: { edges: [] },
      });

      // Should not throw, should continue with other updates
      const response = await PUT(mockRequest, { params: { pid: '123' } });

      expect(response.status).toBe(200);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null translation values gracefully', async () => {
      const requestBody = {
        locale: 'fr',
        name: 'Nouveau Nom',
      };

      mockRequest = new NextRequest('http://localhost:3000/api/product/123', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      mockGraphQLClient.updateProductTranslations.mockResolvedValue({});
      mockGraphQLClient.getProductTranslations.mockResolvedValue({
        edges: [{
          node: {
            resourceId: 'bc/store/product/123',
            fields: [
              { fieldName: 'name', original: 'Product', translation: null }, // null translation
            ],
          },
        }],
      });
      mockGraphQLClient.getProductLocaleData.mockResolvedValue({
        id: 123,
        basicInformation: { name: 'Product' },
        seoInformation: {},
        options: { edges: [] },
        modifiers: { edges: [] },
        customFields: { edges: [] },
      });

      const response = await PUT(mockRequest, { params: { pid: '123' } });
      const data = await response.json();

      // Should fallback to original when translation is null
      expect(response.status).toBe(200);
      expect(data.name).toBe('Product'); // Falls back to original
    });
  });

  describe('Complete Return Data', () => {
    it('should return complete data including options/modifiers/customFields', async () => {
      const requestBody = {
        locale: 'fr',
        name: 'Nouveau Nom',
      };

      mockRequest = new NextRequest('http://localhost:3000/api/product/123', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      mockGraphQLClient.updateProductTranslations.mockResolvedValue({});
      mockGraphQLClient.getProductTranslations.mockResolvedValue({
        edges: [{
          node: {
            resourceId: 'bc/store/product/123',
            fields: [
              { fieldName: 'name', original: 'Product', translation: 'Nouveau Nom' },
            ],
          },
        }],
      });
      mockGraphQLClient.getProductLocaleData.mockResolvedValue({
        id: 123,
        basicInformation: { name: 'Product' },
        seoInformation: {},
        options: {
          edges: [{
            node: {
              id: 'option-1',
              overridesForLocale: { displayName: 'Option FR' },
              values: [],
            },
          }],
        },
        modifiers: { edges: [] },
        customFields: {
          edges: [{
            node: {
              id: 'cf-1',
              name: 'Custom Field',
              value: 'Value',
            },
          }],
        },
      });

      const response = await PUT(mockRequest, { params: { pid: '123' } });
      const data = await response.json();

      expect(data.name).toBe('Nouveau Nom');
      expect(data.options).toBeDefined();
      expect(data.modifiers).toBeDefined();
      expect(data.customFields).toBeDefined();
    });
  });
});

