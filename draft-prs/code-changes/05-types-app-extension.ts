// File: types/app-extension.ts
// Changes for PR #5 - Update type definitions

export type AppExtensionModel = 
  | 'PRODUCTS'
  | 'CUSTOMERS'
  | 'ORDERS'
  | 'PRODUCT_DESCRIPTION'
  | 'CATEGORIES'; // ADD THIS

export type AppExtensionContext = 'PANEL' | 'LINK';

export interface AppExtensionLabel {
  defaultValue: string;
  locales?: {
    value: string;
    localeCode: string;
  }[];
}

export interface AppExtension {
  id: string;
  context: AppExtensionContext | null;
  model: AppExtensionModel | null;
  url: string;
  label: AppExtensionLabel;
}

export type CreateAppExtension = {
  context: AppExtensionContext;
  model: AppExtensionModel;
  url: string;
  label: AppExtensionLabel;
};

