import { describe, expect, it } from 'vitest';

import { API_BASE_URL, assetUrl } from './api';

describe('assetUrl', () => {
  it('resolves backend-relative product images against the API origin', () => {
    expect(assetUrl('/product/image?id=1')).toBe(`${new URL(API_BASE_URL).origin}/product/image?id=1`);
    expect(assetUrl('uploads/latte.png')).toBe(`${new URL(API_BASE_URL).origin}/uploads/latte.png`);
  });

  it('keeps absolute URLs and empty values unchanged', () => {
    expect(assetUrl('https://cdn.example.com/latte.png')).toBe('https://cdn.example.com/latte.png');
    expect(assetUrl(null)).toBeNull();
    expect(assetUrl(undefined)).toBeNull();
  });
});
