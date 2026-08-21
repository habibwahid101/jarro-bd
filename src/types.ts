export type ProductCategory =
  | 'kurtis'
  | 'three-piece'
  | 'co-ords'
  | 'ponchos'
  | 'accessories';

export type FitType = 'Regular Fit' | 'Relaxed Fit' | 'Oversized' | 'A-Line' | 'Straight Cut';

export interface ClothingAttributes {
  fabric: string; // e.g. "Premium Muslin Cotton", "Georgette", "Viscose"
  fit: FitType;
  pattern: string; // e.g. "Floral Print", "Tie-Dye", "Solid"
  sleeveType: string; // e.g. "Full Sleeve", "Three-Quarter Sleeve", "Sleeveless"
  neckline?: string; // e.g. "Round Neck", "V-Neck", "Boat Neck"
  occasion: string; // e.g. "Casual Daywear", "Festive", "Office Wear"
  washCare: string; // e.g. "Hand wash cold, line dry in shade"
  modelSize?: string; // e.g. "Model wears size M, height 5'5\""
  piecesIncluded?: string; // e.g. "Tunic + Pants + Dupatta" for three-piece sets
}

export interface AccessoryAttributes {
  material: string; // e.g. "Lac Bangles with Kundan Stonework"
  setPieces?: number; // e.g. 12 (bangles in a set)
  adjustable?: boolean;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Size M", "Size L", "Free Size", "2.4 inch"
  sku: string;
  price: number;
  oldPrice?: number;
  stock: number;
  inStock: boolean;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  brand: string; // Collection name within JARRO (e.g. "JARRO Signature Prints")
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

  // Category specific specs
  clothingSpecs?: ClothingAttributes;
  accessorySpecs?: AccessoryAttributes;

  tags: string[];
  careInstructions?: string;
  origin?: string;
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
  orderNumber: string; // e.g. "JRO-84920"
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
