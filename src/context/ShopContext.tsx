import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Product,
  CartItem,
  Order,
  OrderStatus,
  ProductCategory,
  ProductVariant,
  CustomerInfo,
  FilterState
} from '../types';
import { INITIAL_PRODUCTS } from '../data/mockData';
import {
  createDocClient,
  awsIsConfigured,
  PRODUCTS_TABLE,
  ORDERS_TABLE,
  ScanCommand,
  PutCommand,
  DeleteCommand,
  UpdateCommand,
  QueryCommand,
} from '../lib/aws';
import {
  adminSignIn,
  adminSignOut,
  loadAdminSession,
  AdminSession,
} from '../lib/adminAuth';
import {
  uploadProductImage as uploadProductImageToS3,
  deleteProductImage as deleteProductImageFromS3,
  imageUploadIsConfigured,
} from '../lib/s3';

export type AppView =
  | 'home'
  | 'shop'
  | 'product-detail'
  | 'cart'
  | 'checkout'
  | 'order-success'
  | 'order-lookup'
  | 'wishlist'
  | 'admin';

interface ShopContextType {
  products: Product[];
  orders: Order[];
  cart: CartItem[];
  wishlist: string[];
  activeView: AppView;
  selectedProduct: Product | null;
  selectedCategory: ProductCategory | 'all';
  searchQuery: string;
  filters: FilterState;
  currentOrder: Order | null;
  quickViewProduct: Product | null;
  isCartOpen: boolean;
  isMobileMenuOpen: boolean;
  isFragranceQuizOpen: boolean;
  couponCode: string;
  couponDiscount: number;

  // AWS / Admin auth
  awsConfigured: boolean;
  adminEmail: string | null;
  adminSignInAction: (email: string, password: string) => Promise<void>;
  adminSignOutAction: () => void;

  // Navigation & UI controls
  navigateTo: (view: AppView, payload?: { product?: Product; category?: ProductCategory | 'all'; search?: string }) => void;
  setSelectedCategory: (cat: ProductCategory | 'all') => void;
  setSearchQuery: (query: string) => void;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  setQuickViewProduct: (product: Product | null) => void;
  setIsCartOpen: (open: boolean) => void;
  setIsMobileMenuOpen: (open: boolean) => void;
  setIsFragranceQuizOpen: (open: boolean) => void;

  // Cart operations
  addToCart: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartItemCount: number;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  // Wishlist
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Checkout & Order
  createOrder: (customerInfo: CustomerInfo, deliveryFee: number) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus, adminNotes?: string) => Promise<void>;
  findOrder: (query: string) => Promise<Order | undefined>;

  // Admin inventory
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateStock: (id: string, stock: number) => Promise<void>;
  resetToDemoData: () => void;

  // Admin product image upload (S3) — requires an active admin session.
  imageUploadConfigured: boolean;
  uploadProductImage: (file: File) => Promise<string>;

  // Helpers
  formatBDT: (amount: number) => string;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CART: 'jarro_cart_v1',
  WISHLIST: 'jarro_wishlist_v1',
};

const DEFAULT_FILTERS: FilterState = {
  category: 'all',
  searchQuery: '',
  size: undefined,
  minPrice: 0,
  maxPrice: 5000,
  inStockOnly: false,
  brand: undefined,
  sortBy: 'featured'
};

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Products & Orders now live in DynamoDB. We seed local state with the
  // bundled demo data so the UI never shows a blank screen, then reconcile
  // with AWS as soon as the initial load resolves.
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);

  // Cart / wishlist stay in the browser — per-visitor, ephemeral.
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CART);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WISHLIST);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  // Admin session (Cognito)
  const [adminSession, setAdminSession] = useState<AdminSession | null>(() => loadAdminSession());

  // App UI State
  // The admin area is intentionally not linked from anywhere on the public
  // storefront (top bar, footer, mobile menu) — a luxury storefront
  // shouldn't advertise a back-office to shoppers. It's still reachable by
  // whoever needs it: opening /admin directly (or bookmarking it) lands
  // here on load. Cognito sign-in (AdminGate) is the actual access control
  // either way; this is purely about not putting "Admin Portal" in front
  // of customers.
  const [activeView, setActiveView] = useState<AppView>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.replace(/\/+$/, '').toLowerCase();
      if (path === '/admin') return 'admin';
    }
    return 'home';
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isFragranceQuizOpen, setIsFragranceQuizOpen] = useState<boolean>(false);

  // Coupon
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponDiscount, setCouponDiscount] = useState<number>(0);

  // DynamoDB clients: guest (read products, create/look up own orders) and
  // admin (full read/write, only present once signed in via Cognito).
  const guestClient = useMemo(() => (awsIsConfigured ? createDocClient() : null), []);
  const adminClient = useMemo(
    () => (awsIsConfigured && adminSession ? createDocClient(adminSession.idToken) : null),
    [adminSession]
  );

  // Sync cart/wishlist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
  }, [wishlist]);

  // Load products from DynamoDB on mount (falls back to bundled demo data
  // if AWS isn't configured for this build, e.g. local dev without env vars).
  useEffect(() => {
    if (!guestClient) return;
    (async () => {
      try {
        const res = await guestClient.send(new ScanCommand({ TableName: PRODUCTS_TABLE }));
        if (res.Items && res.Items.length > 0) {
          setProducts(res.Items as Product[]);
        }
      } catch (err) {
        console.error('Failed to load products from DynamoDB, using bundled demo data.', err);
      }
    })();
  }, [guestClient]);

  // Load the full order list once an admin is signed in (guests can't Scan
  // — they can only create an order or look up their own via findOrder).
  useEffect(() => {
    if (!adminClient) {
      setOrders([]);
      return;
    }
    (async () => {
      try {
        const res = await adminClient.send(new ScanCommand({ TableName: ORDERS_TABLE }));
        setOrders((res.Items as Order[]) || []);
      } catch (err) {
        console.error('Failed to load orders from DynamoDB.', err);
      }
    })();
  }, [adminClient]);

  // Currency helper
  const formatBDT = (amount: number): string => {
    return `৳${Math.round(amount).toLocaleString('en-US')}`;
  };

  // Cart calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Navigation
  const navigateTo = (view: AppView, payload?: { product?: Product; category?: ProductCategory | 'all'; search?: string }) => {
    if (payload?.product) {
      setSelectedProduct(payload.product);
    }
    if (payload?.category !== undefined) {
      setSelectedCategory(payload.category);
      setFilters(prev => ({ ...prev, category: payload.category }));
    }
    if (payload?.search !== undefined) {
      setSearchQuery(payload.search);
      setFilters(prev => ({ ...prev, searchQuery: payload.search || '' }));
    }
    setActiveView(view);
    // Keep the URL in sync with the admin view specifically (replaceState,
    // not pushState — this app doesn't listen for popstate/back-button
    // navigation between views, so adding history entries here would just
    // produce a broken back button). Every other view shares "/", matching
    // existing behavior; only /admin needs its own reachable URL now that
    // it's not linked anywhere in the UI.
    if (typeof window !== 'undefined') {
      const targetPath = view === 'admin' ? '/admin' : '/';
      if (window.location.pathname !== targetPath) {
        window.history.replaceState(null, '', targetPath);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  // --- Admin auth -----------------------------------------------------

  const adminSignInAction = useCallback(async (email: string, password: string) => {
    const session = await adminSignIn(email, password);
    setAdminSession(session);
  }, []);

  const adminSignOutAction = useCallback(() => {
    adminSignOut();
    setAdminSession(null);
  }, []);

  // --- Cart -------------------------------------------------------------

  const addToCart = (product: Product, variant?: ProductVariant, quantity: number = 1) => {
    const selectedVar = variant || product.variants[0] || {
      id: `def-${product.id}`,
      name: 'Standard',
      sku: product.sku,
      price: product.price,
      stock: product.stock,
      inStock: product.stock > 0
    };

    const cartItemId = `${product.id}-${selectedVar.id}`;

    setCart(prev => {
      const existing = prev.find(item => item.id === cartItemId);
      if (existing) {
        return prev.map(item =>
          item.id === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prev, {
          id: cartItemId,
          productId: product.id,
          product,
          selectedVariant: selectedVar,
          quantity,
          unitPrice: selectedVar.price || product.price
        }];
      }
    });

    setIsCartOpen(true);
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    // Cap at the variant's available stock so the cart can never hold more
    // units than are actually in inventory, regardless of which UI control
    // triggered the change.
    setCart(prev => prev.map(item => {
      if (item.id !== cartItemId) return item;
      const maxQty = Math.max(1, item.selectedVariant.stock);
      return { ...item, quantity: Math.min(quantity, maxQty) };
    }));
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
    setCouponCode('');
    setCouponDiscount(0);
  };

  // Coupons
  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'WELCOME10' || cleanCode === 'DHAKAFIRST') {
      const discount = Math.round(cartSubtotal * 0.10);
      setCouponCode(cleanCode);
      setCouponDiscount(discount);
      return { success: true, message: '10% privilege discount applied!' };
    }
    if (cleanCode === 'VIP15') {
      const discount = Math.round(cartSubtotal * 0.15);
      setCouponCode(cleanCode);
      setCouponDiscount(discount);
      return { success: true, message: '15% VIP discount applied!' };
    }
    if (cleanCode === 'EID500') {
      setCouponCode(cleanCode);
      setCouponDiscount(500);
      return { success: true, message: '৳500 celebration voucher applied!' };
    }
    return { success: false, message: 'Invalid or expired promotional code.' };
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
  };

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // --- Orders -------------------------------------------------------------

  const createOrder = async (customerInfo: CustomerInfo, deliveryFee: number): Promise<Order> => {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `JRO-${randomSuffix}`;

    const orderItems = cart.map(item => ({
      productId: item.productId,
      productName: item.product.name,
      brand: item.product.brand,
      variantName: item.selectedVariant.name,
      image: item.product.images[0],
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.unitPrice * item.quantity
    }));

    const finalSubtotal = cartSubtotal;
    const finalTotal = Math.max(0, finalSubtotal + deliveryFee - couponDiscount);

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      customer: customerInfo,
      items: orderItems,
      subtotal: finalSubtotal,
      deliveryFee,
      discount: couponDiscount,
      couponCode: couponCode || undefined,
      total: finalTotal,
      paymentMethod: 'Cash on Delivery (COD)',
      status: 'New',
      adminNotes: 'Order placed via online storefront. Cash on delivery verification pending.'
    };

    // Persist to DynamoDB FIRST (guest role: PutItem on Orders only) and wait
    // for confirmation before touching any local state or navigating to the
    // success screen. Previously this write was fire-and-forget: the customer
    // saw "order confirmed" immediately regardless of whether the database
    // write actually succeeded, so a network blip or a permissions issue
    // could silently lose a real order. Now a failure here throws, the
    // caller (checkout screen) catches it, and the customer sees an error
    // and can retry instead of believing an order went through when it
    // didn't. ConditionExpression additionally guards against overwriting an
    // existing order: the guest IAM role can PutItem but has no
    // Update/Delete, so without this condition a client with valid guest
    // credentials could overwrite another shopper's order by resubmitting
    // the same id.
    if (guestClient) {
      const item = { ...newOrder, customerMobile: customerInfo.mobile };
      try {
        await guestClient.send(new PutCommand({
          TableName: ORDERS_TABLE,
          Item: item,
          ConditionExpression: 'attribute_not_exists(id)',
        }));
      } catch (err) {
        console.error('Failed to save order to DynamoDB.', err);
        throw new Error('We could not confirm your order. Please try again, or contact us directly via WhatsApp.');
      }
    }

    // Only after the order is confirmed persisted (or AWS isn't configured,
    // e.g. local dev) do we touch local state, so the cart is never cleared
    // and the success screen never shown for an order that didn't actually
    // save.
    setProducts(prevProducts =>
      prevProducts.map(p => {
        const matchingCartItems = cart.filter(ci => ci.productId === p.id);
        if (matchingCartItems.length > 0) {
          const totalQty = matchingCartItems.reduce((s, ci) => s + ci.quantity, 0);
          const newStock = Math.max(0, p.stock - totalQty);
          return { ...p, stock: newStock };
        }
        return p;
      })
    );

    setOrders(prev => [newOrder, ...prev]);
    setCurrentOrder(newOrder);
    clearCart();
    setActiveView('order-success');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return newOrder;
  };

  // Persists to DynamoDB first and waits for confirmation before updating
  // local state, matching addProduct/updateProduct: previously this was
  // fire-and-forget, so the admin UI would show the new status immediately
  // even if the DynamoDB write actually failed, silently losing the update.
  const updateOrderStatus = async (orderId: string, status: OrderStatus, adminNotes?: string): Promise<void> => {
    if (adminClient) {
      const values: Record<string, unknown> = adminNotes !== undefined
        ? { ':status': status, ':notes': adminNotes }
        : { ':status': status };
      const expr = adminNotes !== undefined
        ? 'SET #status = :status, adminNotes = :notes'
        : 'SET #status = :status';
      try {
        await adminClient.send(new UpdateCommand({
          TableName: ORDERS_TABLE,
          Key: { id: orderId },
          UpdateExpression: expr,
          ExpressionAttributeNames: { '#status': 'status' },
          ExpressionAttributeValues: values,
        }));
      } catch (err) {
        console.error('Failed to update order status in DynamoDB.', err);
        throw new Error('Could not update this order. Please check your connection and try again.');
      }
    }

    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        return {
          ...ord,
          status,
          adminNotes: adminNotes !== undefined ? adminNotes : ord.adminNotes
        };
      }
      return ord;
    }));
  };

  // Looks up an order by exact order number (e.g. "JRO-84920") or exact
  // mobile number, via the DynamoDB GSIs — works for guests, no sign-in
  // required. Falls back to the locally-known orders if AWS isn't configured.
  const findOrder = async (query: string): Promise<Order | undefined> => {
    const clean = query.trim();
    if (!clean) return undefined;

    if (!guestClient) {
      const cleanLower = clean.toLowerCase();
      return orders.find(ord =>
        ord.orderNumber.toLowerCase() === cleanLower ||
        ord.customer.mobile.replace(/\D/g, '').includes(cleanLower.replace(/\D/g, ''))
      );
    }

    try {
      // Try as an order number first (case-insensitive exact match).
      const byNumber = await guestClient.send(new QueryCommand({
        TableName: ORDERS_TABLE,
        IndexName: 'orderNumber-index',
        KeyConditionExpression: 'orderNumber = :n',
        ExpressionAttributeValues: { ':n': clean.toUpperCase() },
      }));
      if (byNumber.Items && byNumber.Items.length > 0) {
        return byNumber.Items[0] as Order;
      }

      // Fall back to an exact mobile number match.
      const digits = clean.replace(/\D/g, '');
      if (digits.length >= 6) {
        const byMobile = await guestClient.send(new QueryCommand({
          TableName: ORDERS_TABLE,
          IndexName: 'customerMobile-index',
          KeyConditionExpression: 'customerMobile = :m',
          ExpressionAttributeValues: { ':m': digits },
        }));
        if (byMobile.Items && byMobile.Items.length > 0) {
          // Most recent first
          const items = byMobile.Items as Order[];
          items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
          return items[0];
        }
      }
      return undefined;
    } catch (err) {
      // Previously this swallowed the error and returned undefined, which
      // meant a network/permissions failure looked identical in the UI to
      // "no such order exists" — a customer with a real, valid order could
      // be told it wasn't found just because their connection dropped.
      // Throwing here lets the UI (OrderLookupView) distinguish the two.
      console.error('Order lookup failed.', err);
      throw new Error('We could not check that order right now. Please check your connection and try again, or contact us on WhatsApp.');
    }
  };

  // --- Admin Product Actions --------------------------------------------

  // Persists to DynamoDB first and waits for confirmation before updating
  // local state, mirroring the order-creation flow above: previously this
  // was fire-and-forget, so the admin form would close and reset as if the
  // save succeeded even if the DynamoDB write actually failed, silently
  // losing the new product.
  const addProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`
    };

    if (adminClient) {
      try {
        await adminClient.send(new PutCommand({ TableName: PRODUCTS_TABLE, Item: newProduct }));
      } catch (err) {
        console.error('Failed to save product to DynamoDB.', err);
        throw new Error('Could not save this product. Please check your connection and try again.');
      }
    }

    setProducts(prev => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = async (id: string, updatedFields: Partial<Product>): Promise<void> => {
    const current = products.find(p => p.id === id);
    const merged: Product | undefined = current ? { ...current, ...updatedFields } : undefined;

    if (adminClient && merged) {
      try {
        await adminClient.send(new PutCommand({ TableName: PRODUCTS_TABLE, Item: merged }));
      } catch (err) {
        console.error('Failed to update product in DynamoDB.', err);
        throw new Error('Could not save these changes. Please check your connection and try again.');
      }
    }

    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...updatedFields } : p)));
    if (selectedProduct && selectedProduct.id === id) {
      setSelectedProduct(prev => prev ? { ...prev, ...updatedFields } : null);
    }
  };

  const deleteProduct = async (id: string): Promise<void> => {
    const toDelete = products.find(p => p.id === id);

    if (adminClient) {
      try {
        await adminClient.send(new DeleteCommand({ TableName: PRODUCTS_TABLE, Key: { id } }));
      } catch (err) {
        console.error('Failed to delete product in DynamoDB.', err);
        throw new Error('Could not delete this product. Please check your connection and try again.');
      }
    }

    setProducts(prev => prev.filter(p => p.id !== id));
    if (selectedProduct?.id === id) {
      setSelectedProduct(null);
      setActiveView('shop');
    }

    // Best-effort S3 cleanup, after the DynamoDB delete is confirmed. Never
    // blocks or fails the product deletion itself — an orphaned image in
    // the bucket is a minor storage-cost nit, not a data-integrity issue,
    // and deleteProductImage() already no-ops for any URL that isn't one of
    // ours (e.g. a manually-pasted external URL or the bundled placeholder).
    if (adminSession && toDelete) {
      toDelete.images.forEach(url => {
        deleteProductImageFromS3(adminSession.idToken, url).catch(() => {});
      });
    }
  };

  const updateStock = async (id: string, stock: number): Promise<void> => {
    if (adminClient) {
      try {
        await adminClient.send(new UpdateCommand({
          TableName: PRODUCTS_TABLE,
          Key: { id },
          UpdateExpression: 'SET stock = :stock',
          ExpressionAttributeValues: { ':stock': stock },
        }));
      } catch (err) {
        console.error('Failed to update stock in DynamoDB.', err);
        throw new Error('Could not update stock for this product. Please check your connection and try again.');
      }
    }

    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock } : p));
  };

  // Uploads a single image file to S3 (products/ prefix) using the current
  // admin's temporary credentials and returns its public URL. Throws if no
  // admin is signed in — matches every other admin action in this file,
  // which all assume adminSession is present (AdminGate enforces this at
  // the UI layer before any of these can be reached).
  const uploadProductImage = async (file: File): Promise<string> => {
    if (!adminSession) {
      throw new Error('You must be signed in as an admin to upload images.');
    }
    try {
      return await uploadProductImageToS3(adminSession.idToken, file);
    } catch (err) {
      console.error('Failed to upload product image to S3.', err);
      throw err instanceof Error ? err : new Error('Could not upload this image. Please try again.');
    }
  };

  // Re-seeds the Products table from the bundled demo catalogue. Does NOT
  // touch the Orders table — real customer orders are never wiped by this.
  const resetToDemoData = () => {
    setProducts(INITIAL_PRODUCTS);

    if (adminClient) {
      Promise.all(
        INITIAL_PRODUCTS.map(p =>
          adminClient!.send(new PutCommand({ TableName: PRODUCTS_TABLE, Item: p }))
        )
      ).catch(err => console.error('Failed to reset demo products in DynamoDB.', err));
    }
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        orders,
        cart,
        wishlist,
        activeView,
        selectedProduct,
        selectedCategory,
        searchQuery,
        filters,
        currentOrder,
        quickViewProduct,
        isCartOpen,
        isMobileMenuOpen,
        isFragranceQuizOpen,
        couponCode,
        couponDiscount,
        awsConfigured: awsIsConfigured,
        adminEmail: adminSession?.email ?? null,
        adminSignInAction,
        adminSignOutAction,
        navigateTo,
        setSelectedCategory,
        setSearchQuery,
        setFilters,
        setQuickViewProduct,
        setIsCartOpen,
        setIsMobileMenuOpen,
        setIsFragranceQuizOpen,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartSubtotal,
        cartItemCount,
        applyCoupon,
        removeCoupon,
        toggleWishlist,
        isInWishlist,
        createOrder,
        updateOrderStatus,
        findOrder,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStock,
        resetToDemoData,
        imageUploadConfigured: imageUploadIsConfigured,
        uploadProductImage,
        formatBDT
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
