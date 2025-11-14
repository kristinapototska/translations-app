// File: app/AppExtensions/services/app-extension.service.ts
// Changes for PR #2 - Model Registry Update

const SUPPORTED_MODELS = {
  PRODUCTS: {
    entityType: 'product',
    idField: 'id',
    supportedContexts: ['PANEL', 'LINK'],
  },
  CUSTOMERS: {
    entityType: 'customer',
    idField: 'id',
    supportedContexts: ['PANEL', 'LINK'],
  },
  ORDERS: {
    entityType: 'order',
    idField: 'id',
    supportedContexts: ['PANEL', 'LINK'],
  },
  PRODUCT_DESCRIPTION: {
    entityType: 'product',
    idField: 'id',
    supportedContexts: ['PANEL', 'LINK'],
  },
  CATEGORIES: {  // NEW
    entityType: 'category',
    idField: 'id',
    supportedContexts: ['PANEL', 'LINK'],
  },
} as const;

