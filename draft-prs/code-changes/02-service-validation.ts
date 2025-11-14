// File: app/AppExtensions/validators/app-extension.validator.ts
// Changes for PR #2 - Validation Update

const VALID_MODELS = [
  'PRODUCTS',
  'CUSTOMERS',
  'ORDERS',
  'PRODUCT_DESCRIPTION',
  'CATEGORIES',  // NEW
] as const;

export type AppExtensionModel = typeof VALID_MODELS[number];

export const validateAppExtensionModel = (model: string): model is AppExtensionModel => {
  return VALID_MODELS.includes(model as AppExtensionModel);
};

