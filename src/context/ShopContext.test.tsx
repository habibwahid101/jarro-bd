import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { ShopProvider, useShop } from './ShopContext';
import { Product, ProductVariant, CustomerInfo } from '../types';

// These tests run with no VITE_AWS_* env vars set, so `awsIsConfigured` is
// false and ShopContext's guestClient/adminClient are both null. That's
// intentional: it exercises the exact "AWS not configured" fallback path
// the app itself relies on for local dev, and lets us test the local-state
// business logic (stock capping, order totals, coupon math) in complete
// isolation from the network — no mocking of the AWS SDK required.

function makeVariant(overrides: Partial<ProductVariant> = {}): ProductVariant {
  return {
    id: 'var-1',
    name: 'Standard',
    sku: 'TEST-SKU-1',
    price: 1000,
    stock: 3,
    inStock: true,
    ...overrides,
  };
}

function makeProduct(overrides: Partial<Product> = {}): Product {
  const variant = makeVariant();
  return {
    id: 'test-prod-1',
    sku: 'TEST-SKU-1',
    name: 'Test Product',
    slug: 'test-product',
    brand: 'Test Brand',
    category: 'accessories',
    subtitle: 'A subtitle',
    description: 'A description',
    story: 'A story',
    price: 1000,
    images: ['https://example.com/image.jpg'],
    variants: [variant],
    stock: 3,
    rating: 5,
    reviewCount: 1,
    tags: [],
    ...overrides,
  };
}

function makeCustomerInfo(overrides: Partial<CustomerInfo> = {}): CustomerInfo {
  return {
    fullName: 'Test Customer',
    mobile: '01711111111',
    district: 'Dhaka',
    thanaArea: 'Gulshan',
    fullAddress: '123 Test Road',
    ...overrides,
  };
}

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ShopProvider>{children}</ShopProvider>
);

beforeEach(() => {
  localStorage.clear();
});

describe('ShopContext — cart quantity stock capping', () => {
  it('caps quantity at the selected variant stock, never lets the cart exceed inventory', () => {
    const { result } = renderHook(() => useShop(), { wrapper });
    const product = makeProduct({ variants: [makeVariant({ stock: 3 })] });

    act(() => {
      result.current.addToCart(product, product.variants[0], 1);
    });

    const cartItemId = `${product.id}-${product.variants[0].id}`;

    act(() => {
      result.current.updateCartQuantity(cartItemId, 999);
    });

    const item = result.current.cart.find((c) => c.id === cartItemId);
    expect(item?.quantity).toBe(3);
  });

  it('removes the item instead of allowing a zero or negative quantity', () => {
    const { result } = renderHook(() => useShop(), { wrapper });
    const product = makeProduct();

    act(() => {
      result.current.addToCart(product, product.variants[0], 2);
    });
    const cartItemId = `${product.id}-${product.variants[0].id}`;

    act(() => {
      result.current.updateCartQuantity(cartItemId, 0);
    });

    expect(result.current.cart.find((c) => c.id === cartItemId)).toBeUndefined();
  });
});

describe('ShopContext — createOrder', () => {
  it('deducts purchased stock, clears the cart, and records the order after a successful (local) write', async () => {
    const { result } = renderHook(() => useShop(), { wrapper });

    // Add the product through addProduct first so it actually exists in
    // `products` state — createOrder's stock-deduction step only updates
    // products it can find there, matched by cart item productId.
    let addedProduct: Product | undefined;
    await act(async () => {
      addedProduct = await result.current.addProduct(
        makeProduct({ name: 'Stock Test Item', stock: 5, variants: [makeVariant({ id: 'ov-1', stock: 5 })] })
      );
    });

    act(() => {
      result.current.addToCart(addedProduct!, addedProduct!.variants[0], 2);
    });

    let createdOrderTotal = -1;
    await act(async () => {
      const order = await result.current.createOrder(makeCustomerInfo(), 80);
      createdOrderTotal = order.total;
    });

    // subtotal (2 * 1000) + delivery (80) - discount (0)
    expect(createdOrderTotal).toBe(2080);
    expect(result.current.cart).toHaveLength(0);
    expect(result.current.orders[0]?.customer.fullName).toBe('Test Customer');

    const updatedProduct = result.current.products.find((p) => p.id === addedProduct!.id);
    expect(updatedProduct?.stock).toBe(3); // 5 in stock - 2 ordered
  });

  it('applies a valid coupon discount to the final order total', async () => {
    const { result } = renderHook(() => useShop(), { wrapper });
    const product = makeProduct({ variants: [makeVariant({ stock: 5 })] });

    act(() => {
      result.current.addToCart(product, product.variants[0], 1);
    });
    act(() => {
      const res = result.current.applyCoupon('WELCOME10');
      expect(res.success).toBe(true);
    });

    await waitFor(() => expect(result.current.couponDiscount).toBe(100));

    let total = -1;
    await act(async () => {
      const order = await result.current.createOrder(makeCustomerInfo(), 0);
      total = order.total;
    });

    // subtotal 1000 - 10% (100) = 900
    expect(total).toBe(900);
  });

  it('rejects an invalid coupon code without changing the discount', () => {
    const { result } = renderHook(() => useShop(), { wrapper });
    act(() => {
      const res = result.current.applyCoupon('NOT-A-REAL-CODE');
      expect(res.success).toBe(false);
    });
    expect(result.current.couponDiscount).toBe(0);
  });
});

describe('ShopContext — admin product actions (AWS unconfigured, local-state fallback)', () => {
  it('addProduct adds the new product to local state and returns it with a generated id', async () => {
    const { result } = renderHook(() => useShop(), { wrapper });
    const before = result.current.products.length;

    let created: Product | undefined;
    await act(async () => {
      created = await result.current.addProduct(makeProduct({ name: 'Brand New Item' }));
    });

    expect(created?.id).toBeTruthy();
    expect(result.current.products.length).toBe(before + 1);
    expect(result.current.products.some((p) => p.name === 'Brand New Item')).toBe(true);
  });

  it('updateProduct merges the updated fields into the existing product', async () => {
    const { result } = renderHook(() => useShop(), { wrapper });
    const existing = result.current.products[0];

    await act(async () => {
      await result.current.updateProduct(existing.id, { name: 'Renamed Product', price: 12345 });
    });

    const updated = result.current.products.find((p) => p.id === existing.id);
    expect(updated?.name).toBe('Renamed Product');
    expect(updated?.price).toBe(12345);
  });
});

describe('ShopContext — uploadProductImage', () => {
  it('refuses to upload without an active admin session, rather than silently no-op-ing', async () => {
    const { result } = renderHook(() => useShop(), { wrapper });
    const file = new File([new Uint8Array(10)], 'photo.jpg', { type: 'image/jpeg' });

    await expect(result.current.uploadProductImage(file)).rejects.toThrow(/signed in as an admin/i);
  });
});
