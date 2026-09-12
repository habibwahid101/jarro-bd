export type ProductCategory =
  | 'kurtis'
  | 'three-piece'
  | 'co-ords'
  | 'ponchos'
  | 'accessories';

export type FitType = 'Regular Fit' | 'Relaxed Fit' | 'Oversized' | 'A-Line' | 'Straight Cut';

export interface ClothingAttributes {
  fabric: string;
  fit: FitType;
  pattern: string;
  sleeveType: string;
  neckline?: string;
  occasion: string;
  washCare: string;
  modelSize?: string;
  piecesIncluded?: string;
}

export interface AccessoryAttributes {
  material: string;
  setPieces?: number;
  adjustable?: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  oldPrice?: number;
  stock: number;
  inStock: boolean;
}

export type HomepageSlot =
  | 'hero'
  | 'editorial'
  | 'new-arrivals'
  | 'best-sellers'
  | 'occasion-everyday'
  | 'occasion-festive'
  | 'occasion-modest'
  | 'occasion-accessories'
  | 'finishing-touches'
  | 'gallery';

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  brand: string;
  category: ProductCategory;
  subtitle: string;
  description: string;
  story: string;
  price: number;
  oldPrice?: number;
  images: string[];
  variants: ProductVariant[];
  stock: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  isLimited?: boolean;
  rating: number;
  reviewCount: number;
  clothingSpecs?: ClothingAttributes;
  accessorySpecs?: AccessoryAttributes;
  tags: string[];
  careInstructions?: string;
  origin?: string;
  placements?: HomepageSlot[];
}

export const HOMEPAGE_SLOTS: { id: HomepageSlot; label: string }[] = [
  { id: 'hero', label: 'Hero banner' },
  { id: 'editorial', label: 'Editorial / special block' },
  { id: 'new-arrivals', label: 'New Arrivals' },
  { id: 'best-sellers', label: 'Best Sellers' },
  { id: 'occasion-everyday', label: 'Occasion: Everyday Wear' },
  { id: 'occasion-festive', label: 'Occasion: Festive' },
  { id: 'occasion-modest', label: 'Occasion: Draped & Modest' },
  { id: 'occasion-accessories', label: 'Occasion: Finishing Touches' },
  { id: 'finishing-touches', label: 'Finishing Touches row' },
  { id: 'gallery', label: 'Styled by JARRO gallery' },
];

export const SITE_SETTINGS_ID = 'jarro-site-settings';

export interface SiteSettings {
  categoryLabels: Record<ProductCategory, string>;
  brandLabels: Record<string, string>;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  categoryLabels: {
    kurtis: 'Kurtis & Tunics',
    'three-piece': '3-Piece Sets',
    'co-ords': 'Co-ord Sets',
    ponchos: 'Ponchos & Capes',
    accessories: 'Bangles & Accessories',
  },
  brandLabels: {
    'JARRO Everyday Prints': 'JARRO Everyday Prints',
    'JARRO Festive Edit': 'JARRO Festive Edit',
    'JARRO Co-ord Studio': 'JARRO Co-ord Studio',
    'JARRO Signature Ponchos': 'JARRO Signature Ponchos',
    'JARRO Bangle House': 'JARRO Bangle House',
  },
  heroEyebrow: 'New Arrivals Every Week',
  heroTitle: 'Real Fits, Real You',
  heroSubtitle:
    'Kurtis, 3-piece sets, co-ords, ponchos, and bangles — comfortable, everyday-priced, and delivered straight to your door across Bangladesh.',
  heroCtaPrimary: 'Shop All Products',
  heroCtaSecondary: 'Shop 3-Piece Sets',
};

export function isSiteSettingsItem(item: { id?: string; sku?: string } | null | undefined): boolean {
  if (!item) return false;
  return item.id === SITE_SETTINGS_ID || item.sku === 'JR-SITE-SETTINGS';
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  selectedVariant: ProductVariant;
  quantity: number;
  unitPrice: number;
}

export type OrderStatus =
  | 'New'
  | 'Contacted'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  brand: string;
  variantName: string;
  image: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CustomerInfo {
  fullName: string;
  mobile: string;
  district: string;
  thanaArea: string;
  fullAddress: string;
  customerNote?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  couponCode?: string;
  total: number;
  paymentMethod: 'Cash on Delivery (COD)';
  status: OrderStatus;
  adminNotes?: string;
}

export interface FilterState {
  category?: ProductCategory | 'all';
  searchQuery: string;
  size?: string;
  minPrice: number;
  maxPrice: number;
  inStockOnly: boolean;
  brand?: string;
  sortBy: 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating';
}
