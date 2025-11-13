/**
 * Functional tests for GraphQL client methods
 * Tests the new methods for product translations API
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GraphQLClient } from './client';
import {
  GetProductTranslationsDocument,
  UpdateProductTranslationsDocument,
  DeleteProductTranslationsDocument,
  GetChannelLocalesDocument,
} from './queries/product.tada';
import { GetChannelLocalesDocument as LocalesDocument } from './queries/locales.tada';

describe('GraphQL Client - Product Translations Methods', () => {
  let client: GraphQLClient;
  let mockRequest: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRequest = vi.fn().mockResolvedValue({
      data: {
        store: {
          translations: {
            edges: [],
          },
        },
      },
    });

    client = new GraphQLClient('test-store', 'test-token');
    (client as any).request = mockRequest;
  });

  describe('getProductTranslations', () => {
    it('should fetch product translations with correct parameters', async () => {
      const mockResponse = {
        data: {
          store: {
            translations: {
              edges: [{
                node: {
                  resourceId: 'bc/store/product/123',
                  fields: [
                    { fieldName: 'name', original: 'Product', translation: 'Produit' },
                  ],
                },
              }],
            },
          },
        },
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await client.getProductTranslations({
        channelId: 1,
        locale: 'fr',
        productId: 123,
      });

      expect(mockRequest).toHaveBeenCalled();
      const callArgs = mockRequest.mock.calls[0];
      expect(callArgs[0]).toHaveProperty('query');
      expect(callArgs[0].query).toContain('query');
      expect(callArgs[1]).toHaveProperty('channelId', 'bc/store/channel/1');
      expect(callArgs[1]).toHaveProperty('localeId', 'bc/store/locale/fr');
      expect(callArgs[1]).toHaveProperty('resourceIds');
      expect(callArgs[1].resourceIds).toContain('bc/store/product/123');

      expect(result).toBeDefined();
      expect(result.edges).toBeDefined();
    });

    it('should throw error when translations data is missing', async () => {
      mockRequest.mockResolvedValue({
        data: null,
      });

      await expect(
        client.getProductTranslations({
          channelId: 1,
          locale: 'fr',
          productId: 123,
        })
      ).rejects.toThrow();
    });
  });

  describe('updateProductTranslations', () => {
    it('should update product translations with correct parameters', async () => {
      const mockResponse = {
        data: {
          translation: {
            updateTranslations: {
              __typename: 'UpdateTranslationsPayload',
              errors: [],
            },
          },
        },
      };

      mockRequest.mockResolvedValue(mockResponse);

      await client.updateProductTranslations({
        channelId: 1,
        locale: 'fr',
        productId: 123,
        fields: [
          { fieldName: 'name', value: 'Nouveau Nom' },
          { fieldName: 'description', value: 'Nouvelle Description' },
        ],
      });

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.stringContaining('mutation'),
        }),
        expect.objectContaining({
          input: expect.objectContaining({
            resourceType: 'PRODUCTS',
            channelId: 'bc/store/channel/1',
            localeId: 'bc/store/locale/fr',
            entities: expect.arrayContaining([
              expect.objectContaining({
                resourceId: 'bc/store/product/123',
                fields: expect.arrayContaining([
                  { fieldName: 'name', value: 'Nouveau Nom' },
                ]),
              }),
            ]),
          }),
        })
      );
    });

    it('should throw error when update fails', async () => {
      const mockResponse = {
        data: {
          translation: {
            updateTranslations: {
              __typename: 'UpdateTranslationsPayload',
              errors: [
                { __typename: 'Error', message: 'Update failed' },
              ],
            },
          },
        },
      };

      mockRequest.mockResolvedValue(mockResponse);

      await expect(
        client.updateProductTranslations({
          channelId: 1,
          locale: 'fr',
          productId: 123,
          fields: [{ fieldName: 'name', value: 'Test' }],
        })
      ).rejects.toThrow('Update failed');
    });
  });

  describe('deleteProductTranslations', () => {
    it('should delete product translations with correct parameters', async () => {
      const mockResponse = {
        data: {
          translation: {
            deleteTranslations: {
              __typename: 'DeleteTranslationsPayload',
              errors: [],
            },
          },
        },
      };

      mockRequest.mockResolvedValue(mockResponse);

      await client.deleteProductTranslations({
        channelId: 1,
        locale: 'fr',
        productId: 123,
        fields: ['name', 'description'],
      });

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.stringContaining('mutation'),
        }),
        expect.objectContaining({
          input: expect.objectContaining({
            resourceType: 'PRODUCTS',
            channelId: 'bc/store/channel/1',
            localeId: 'bc/store/locale/fr',
            resources: expect.arrayContaining([
              expect.objectContaining({
                resourceId: 'bc/store/product/123',
                fields: ['name', 'description'],
              }),
            ]),
          }),
        })
      );
    });

    it('should throw error when deletion fails', async () => {
      const mockResponse = {
        data: {
          translation: {
            deleteTranslations: {
              __typename: 'DeleteTranslationsPayload',
              errors: [
                { __typename: 'Error', message: 'Deletion failed' },
              ],
            },
          },
        },
      };

      mockRequest.mockResolvedValue(mockResponse);

      await expect(
        client.deleteProductTranslations({
          channelId: 1,
          locale: 'fr',
          productId: 123,
          fields: ['name'],
        })
      ).rejects.toThrow('Deletion failed');
    });
  });

  describe('deleteCustomFieldTranslations', () => {
    it('should delete custom field translations with PRODUCT_CUSTOM_FIELDS', async () => {
      const mockResponse = {
        data: {
          translation: {
            deleteTranslations: {
              __typename: 'DeleteTranslationsPayload',
              errors: [],
            },
          },
        },
      };

      mockRequest.mockResolvedValue(mockResponse);

      await client.deleteCustomFieldTranslations({
        channelId: 1,
        locale: 'fr',
        customFields: [
          { customFieldId: '456', fields: ['NAME', 'VALUE'] },
        ],
      });

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.stringContaining('mutation'),
        }),
        expect.objectContaining({
          input: expect.objectContaining({
            resourceType: 'PRODUCT_CUSTOM_FIELDS',
            channelId: 'bc/store/channel/1',
            localeId: 'bc/store/locale/fr',
            resources: expect.arrayContaining([
              expect.objectContaining({
                resourceId: 'bc/store/product-custom-field/456',
                fields: ['NAME', 'VALUE'],
              }),
            ]),
          }),
        })
      );
    });

    it('should handle multiple custom field deletions', async () => {
      const mockResponse = {
        data: {
          translation: {
            deleteTranslations: {
              __typename: 'DeleteTranslationsPayload',
              errors: [],
            },
          },
        },
      };

      mockRequest.mockResolvedValue(mockResponse);

      await client.deleteCustomFieldTranslations({
        channelId: 1,
        locale: 'fr',
        customFields: [
          { customFieldId: '456', fields: ['NAME'] },
          { customFieldId: '789', fields: ['VALUE'] },
        ],
      });

      expect(mockRequest).toHaveBeenCalled();
      const callArgs = mockRequest.mock.calls[0];
      expect(callArgs[1]).toHaveProperty('input');
      expect(callArgs[1].input).toHaveProperty('resources');
      const resources = callArgs[1].input.resources;
      expect(resources).toBeInstanceOf(Array);
      expect(resources.length).toBe(2);
      const resourceIds = resources.map((r: any) => r.resourceId);
      expect(resourceIds).toContain('bc/store/product-custom-field/456');
      expect(resourceIds).toContain('bc/store/product-custom-field/789');
    });
  });

  describe('getChannelLocales', () => {
    it('should fetch channel locales using GraphQL', async () => {
      const mockResponse = {
        data: {
          store: {
            locales: {
              edges: [
                {
                  node: {
                    code: 'en',
                    status: 'active',
                    isDefault: true,
                  },
                },
                {
                  node: {
                    code: 'fr',
                    status: 'active',
                    isDefault: false,
                  },
                },
              ],
            },
          },
        },
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await client.getChannelLocales(1);

      expect(mockRequest).toHaveBeenCalled();
      const callArgs = mockRequest.mock.calls[0];
      expect(callArgs[0]).toHaveProperty('query');
      expect(callArgs[0].query).toContain('query');
      // Variables are passed directly (no 'input' wrapper for this query)
      expect(callArgs[1]).toHaveProperty('channelId', 'bc/store/channel/1');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty('code');
      expect(result[0]).toHaveProperty('status');
      expect(result[0]).toHaveProperty('is_default');
    });

    it('should map isDefault to is_default', async () => {
      const mockResponse = {
        data: {
          store: {
            locales: {
              edges: [
                {
                  node: {
                    code: 'en',
                    status: 'active',
                    isDefault: true,
                  },
                },
              ],
            },
          },
        },
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await client.getChannelLocales(1);

      expect(result[0].is_default).toBe(true);
    });

    it('should throw error when locales data is missing', async () => {
      mockRequest.mockResolvedValue({
        data: {
          store: null,
        },
      });

      await expect(
        client.getChannelLocales(1)
      ).rejects.toThrow();
    });
  });
});

