import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Product,
  CartItem,
  Order,
  OrderStatus,
  ProductCategory,
  ProductVariant,
  CustomerInfo,
  FilterState,
  SiteSettings,
  DEFAULT_SITE_SETTINGS,
} from '../types';
import {
  parseSiteSettingsRow,
  buildSiteSettingsItem,
  categoryLabelOf,
  brandLabelOf,
} from '../lib/storefront';
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

  awsConfigured: boolean;
  adminEmail: string | null;
  adminSignInAction: (email: string, password: string) => Promise<void>;
  adminSignOutAction: () => void;

  navigateTo: (view: AppView, payload?: { product?: Product; category?: ProductCategory | 'all'; search?: string }) => void;
  setSelectedCategory: (cat: ProductCategory | 'all') => void;
  setSearchQuery: (query: string) => void;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  setQuickViewProduct: (product: Product | null) => void;
  setIsCartOpen: (open: boolean) => void;
  setIsMobileMenuOpen: (open: boolean) => void;
  setIsFragranceQuizOpen: (open: boolean) => void;

  addToCart: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartItemCount: number;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  createOrder: (customerInfo: CustomerInfo, deliveryFee: number) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus, adminNotes?: string) => Promise<void>;
  findOrder: (query: string) => Promise<Order | undefined>;

  addProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateStock: (id: string, stock: number) => Promise<void>;
  resetToDemoData: () => void;

  imageUploadConfigured: boolean;
  uploadProductImage: (file: File) => Promise<string>;

  formatBDT: (amount: number) => string;
  siteSettings: SiteSettings;
  saveSiteSettings: (next: SiteSettings) => Promise<void>;
  categoryLabel: (id: ProductCategory | 'all') => string;
  brandLabel: (name: string) => string;
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
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

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

  const [adminSession, setAdminSession] = useState<AdminSession | null>(() => loadAdminSession());

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
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponDiscount, setCouponDiscount] = useState<number>(0);

  const guestClient = useMemo(() => (awsIsConfigured ? createDocClient() : null), []);
  const adminClient = useMemo(
    () => (awsIsConfigured && adminSession ? createDocClient(adminSession.idToken) : null),
    [adminSession]
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    if (!guestClient) return;
    (async () => {
      try {
        const res = await guestClient.send(new ScanCommand({ TableName: PRODUCTS_TABLE }));
        if (res.Items && res.Items.length > 0) {
          const parsed = parseSiteSettingsRow(res.Items);
          setSiteSettings(parsed.settings);
          setProducts(parsed.products);
        }
      } catch (err) {
        console.error('Failed to load products from DynamoDB, using bundled demo data.', err);
      }
    })();
  }, [guestClient]);

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

  const formatBDT = (amount: number): string => {
    return `\u09f3${Math.round(amount).toLocaleString('en-US')}`;
  };

  const cartSubtotal = cart.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navigateTo = (view: AppView, payload?: { product?: Product; category?: ProductCategory | 'all'; search?: string }) => {
    if (payload?.product) setSelectedProduct(payload.product);
    if (payload?.category !== undefined) {
      setSelectedCategory(payload.category);
      setFilters(prev => ({ ...prev, category: payload.category }));
    }
    if (payload?.search !== undefined) {
      setSearchQuery(payload.search);
      setFilters(prev => ({ ...prev, searchQuery: payload.search || '' }));
    }
    setActiveView(view);
    if (typeof window !== 'undefined') {
      const targetPath = view === 'admin' ? '/admin' : '/';
      if (window.location.pathname !== targetPath) {
        window.history.replaceState(null, '', targetPath);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  const adminSignInAction = useCallback(async (email: string, password: string) => {
    const session = await adminSignIn(email, password);
    setAdminSession(session);
  }, []);

  const adminSignOutAction = useCallback(() => {
    adminSignOut();
    setAdminSession(null);
  }, []);

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
        return prev.map(item => item.id === cartItemId ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, {
        id: cartItemId,
        productId: product.id,
        product,
        selectedVariant: selectedVar,
        quantity,
        unitPrice: selectedVar.price || product.price
      }];
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
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
      return { success: true, message: '\u09f3500 celebration voucher applied!' };
    }
    return { success: false, message: 'Invalid or expired promotional code.' };
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

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
    setProducts(prevProducts =>
      prevProducts.map(p => {
        const matchingCartItems = cart.filter(ci => ci.productId === p.id);
        if (matchingCartItems.length > 0) {
          const totalQty = matchingCartItems.reduce((s, ci) => s + ci.quantity, 0);
          return { ...p, stock: Math.max(0, p.stock - totalQty) };
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
        return { ...ord, status, adminNotes: adminNotes !== undefined ? adminNotes : ord.adminNotes };
      }
      return ord;
    }));
  };

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
      const byNumber = await guestClient.send(new QueryCommand({
        TableName: ORDERS_TABLE,
        IndexName: 'orderNumber-index',
        KeyConditionExpression: 'orderNumber = :n',
        ExpressionAttributeValues: { ':n': clean.toUpperCase() },
      }));
      if (byNumber.Items && byNumber.Items.length > 0) return byNumber.Items[0] as Order;
      const digits = clean.replace(/\D/g, '');
      if (digits.length >= 6) {
        const byMobile = await guestClient.send(new QueryCommand({
          TableName: ORDERS_TABLE,
          IndexName: 'customerMobile-index',
          KeyConditionExpression: 'customerMobile = :m',
          ExpressionAttributeValues: { ':m': digits },
        }));
        if (byMobile.Items && byMobile.Items.length > 0) {
          const items = byMobile.Items as Order[];
          items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
          return items[0];
        }
      }
      return undefined;
    } catch (err) {
      console.error('Order lookup failed.', err);
      throw new Error('We could not check that order right now. Please check your connection and try again, or contact us on WhatsApp.');
    }
  };

  const addProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
    const newProduct: Product = { ...productData, id: `prod-${Date.now()}` };
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

  const uploadProductImage = async (file: File): Promise<string> => {
    if (!adminSession) throw new Error('You must be signed in as an admin to upload images.');
    try {
      return await uploadProductImageToS3(adminSession.idToken, file);
    } catch (err) {
      console.error('Failed to upload product image to S3.', err);
      throw err instanceof Error ? err : new Error('Could not upload this image. Please try again.');
    }
  };

  const saveSiteSettings = async (next: SiteSettings): Promise<void> => {
    setSiteSettings(next);
    if (!adminClient) return;
    try {
      await adminClient.send(new PutCommand({ TableName: PRODUCTS_TABLE, Item: buildSiteSettingsItem(next) }));
    } catch (err) {
      console.error('Failed to save storefront settings.', err);
      throw new Error('Could not save storefront settings. Please try again.');
    }
  };

  const categoryLabel = (id: ProductCategory | 'all'): string => categoryLabelOf(siteSettings, id);
  const brandLabel = (name: string): string => brandLabelOf(siteSettings, name);

  const resetToDemoData = () => {
    setProducts(INITIAL_PRODUCTS);
    if (adminClient) {
      Promise.all(
        INITIAL_PRODUCTS.map(p => adminClient!.send(new PutCommand({ TableName: PRODUCTS_TABLE, Item: p })))
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
        formatBDT,
        siteSettings,
        saveSiteSettings,
        categoryLabel,
        brandLabel,
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
