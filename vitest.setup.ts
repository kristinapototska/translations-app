import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

// Make React available globally for tests
global.React = React;

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

