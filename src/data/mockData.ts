import { Product, Order } from '../types';

// -------------------------------------------------------------------------
// PRODUCT PHOTOGRAPHY
// -------------------------------------------------------------------------
// Real JARRO product photos (sourced from facebook.com/Jarrobd), matched to
// each product by category/print and cleaned up (cropped to a consistent
// portrait frame, colour/contrast enhanced) for a polished storefront look.
// acc-01/acc-02 share one real bangle-set photo, colour-graded for each
// listed colourway (red&gold / emerald&gold) — a standard technique for
// showing a colourway variant from a single physical product shoot.
// -------------------------------------------------------------------------
import kur01a from '../assets/products/kur-01-a.jpg';
import kur01b from '../assets/products/kur-01-b.jpg';
import kur02a from '../assets/products/kur-02-a.jpg';
import kur02b from '../assets/products/kur-02-b.jpg';
import kur03a from '../assets/products/kur-03-a.jpg';
import kur03b from '../assets/products/kur-03-b.jpg';
import tpc01a from '../assets/products/tpc-01-a.jpg';
import tpc01b from '../assets/products/tpc-01-b.jpg';
import tpc02a from '../assets/products/tpc-02-a.jpg';
import tpc02b from '../assets/products/tpc-02-b.jpg';
import cor01a from '../assets/products/cor-01-a.jpg';
import cor01b from '../assets/products/cor-01-b.jpg';
import pon01a from '../assets/products/pon-01-a.jpg';
import pon01b from '../assets/products/pon-01-b.jpg';
import pon02a from '../assets/products/pon-02-a.jpg';
import pon02b from '../assets/products/pon-02-b.jpg';
import acc01a from '../assets/products/acc-01-a.jpg';
import acc01b from '../assets/products/acc-01-b.jpg';
import acc02a from '../assets/products/acc-02-a.jpg';
import acc02b from '../assets/products/acc-02-b.jpg';

export const INITIAL_PRODUCTS: Product[] = [
  // -------------------------------------------------------------
  // KURTIS
  // -------------------------------------------------------------
  {
    id: 'kur-01',
    sku: 'JR-KUR-001',
    name: 'Emerald Palm Print Cotton Kurti',
    slug: 'emerald-palm-print-cotton-kurti',
    brand: 'JARRO Everyday Prints',
    category: 'kurtis',
    subtitle: 'Palm Leaf Print, Relaxed-Fit Cotton Tunic',
    description: 'A breezy relaxed-fit tunic in a rich emerald palm-leaf print, cut from soft breathable cotton for everyday comfort without giving up on print-forward style.',
    story: 'Real fits, real you — designed for how you actually move through your day, from errands to evening tea with friends.',
    price: 1290,
    oldPrice: 1550,
    stock: 22,
    isNew: true,
    isBestSeller: true,
    isFeatured: true,
    rating: 4.8,
    reviewCount: 19,
    images: [kur01a, kur01b],
    variants: [
      { id: 'v-kur-01-s', name: 'Size S', sku: 'JR-KUR-001-S', price: 1290, oldPrice: 1550, stock: 4, inStock: true },
      { id: 'v-kur-01-m', name: 'Size M', sku: 'JR-KUR-001-M', price: 1290, oldPrice: 1550, stock: 7, inStock: true },
      { id: 'v-kur-01-l', name: 'Size L', sku: 'JR-KUR-001-L', price: 1290, oldPrice: 1550, stock: 7, inStock: true },
      { id: 'v-kur-01-xl', name: 'Size XL', sku: 'JR-KUR-001-XL', price: 1290, oldPrice: 1550, stock: 4, inStock: true },
    ],
    clothingSpecs: {
      fabric: 'Premium Cotton',
      fit: 'Relaxed Fit',
      pattern: 'Palm Leaf Print',
      sleeveType: 'Three-Quarter Sleeve',
      neckline: 'Round Neck',
      occasion: 'Casual Daywear',
      washCare: 'Hand wash cold, line dry in shade, do not bleach.',
      modelSize: 'Model wears size M, height 5\'5"',
    },
    tags: ['Best Seller', 'Cotton', 'Everyday'],
    careInstructions: 'Hand wash cold with mild detergent. Line dry in shade to preserve print vibrancy.',
    origin: 'Stitched in Dhaka, Bangladesh',
  },
  {
    id: 'kur-02',
    sku: 'JR-KUR-002',
    name: 'Sky Blue Abstract Print Tunic',
    slug: 'sky-blue-abstract-print-tunic',
    brand: 'JARRO Everyday Prints',
    category: 'kurtis',
    subtitle: 'Abstract Print, Flowy Georgette Tunic',
    description: 'A flowy georgette tunic in a soft blue-grey abstract print, light enough for humid Dhaka afternoons and easy to dress up or down.',
    story: 'Inspired by the everyday woman who wants to feel put-together without overthinking the outfit.',
    price: 1150,
    stock: 18,
    isNew: true,
    rating: 4.7,
    reviewCount: 12,
    images: [kur02a, kur02b],
    variants: [
      { id: 'v-kur-02-s', name: 'Size S', sku: 'JR-KUR-002-S', price: 1150, stock: 5, inStock: true },
      { id: 'v-kur-02-m', name: 'Size M', sku: 'JR-KUR-002-M', price: 1150, stock: 6, inStock: true },
      { id: 'v-kur-02-l', name: 'Size L', sku: 'JR-KUR-002-L', price: 1150, stock: 5, inStock: true },
      { id: 'v-kur-02-xl', name: 'Size XL', sku: 'JR-KUR-002-XL', price: 1150, stock: 2, inStock: true },
    ],
    clothingSpecs: {
      fabric: 'Georgette',
      fit: 'Regular Fit',
      pattern: 'Abstract Print',
      sleeveType: 'Full Sleeve',
      neckline: 'Round Neck',
      occasion: 'Casual Daywear',
      washCare: 'Hand wash cold, do not wring, dry flat in shade.',
      modelSize: 'Model wears size M, height 5\'4"',
    },
    tags: ['New Arrival', 'Georgette', 'Everyday'],
    careInstructions: 'Hand wash cold. Do not wring — dry flat in shade.',
    origin: 'Stitched in Dhaka, Bangladesh',
  },
  {
    id: 'kur-03',
    sku: 'JR-KUR-003',
    name: 'Blush Pink Floral Embroidered Kurti',
    slug: 'blush-pink-floral-embroidered-kurti',
    brand: 'JARRO Festive Edit',
    category: 'kurtis',
    subtitle: 'Floral Print with Hand-Finished Embroidery Trim',
    description: 'A vivid pink-and-gold floral kurti finished with delicate hand embroidery along the neckline — festive enough for gatherings, comfortable enough for everyday.',
    story: 'The dress that customers keep coming back for — soft fabric, a print that photographs beautifully, and embroidery detailing you can feel.',
    price: 1650,
    oldPrice: 1900,
    stock: 14,
    isBestSeller: true,
    isFeatured: true,
    rating: 5.0,
    reviewCount: 27,
    images: [kur03a, kur03b],
    variants: [
      { id: 'v-kur-03-s', name: 'Size S', sku: 'JR-KUR-003-S', price: 1650, oldPrice: 1900, stock: 3, inStock: true },
      { id: 'v-kur-03-m', name: 'Size M', sku: 'JR-KUR-003-M', price: 1650, oldPrice: 1900, stock: 5, inStock: true },
      { id: 'v-kur-03-l', name: 'Size L', sku: 'JR-KUR-003-L', price: 1650, oldPrice: 1900, stock: 4, inStock: true },
      { id: 'v-kur-03-xl', name: 'Size XL', sku: 'JR-KUR-003-XL', price: 1650, oldPrice: 1900, stock: 2, inStock: true },
    ],
    clothingSpecs: {
      fabric: 'Premium Lawn Cotton',
      fit: 'Straight Cut',
      pattern: 'Floral Print with Embroidery',
      sleeveType: 'Three-Quarter Sleeve',
      neckline: 'V-Neck with Embroidered Trim',
      occasion: 'Festive / Gatherings',
      washCare: 'Hand wash cold separately, do not soak embroidery.',
      modelSize: 'Model wears size M, height 5\'5"',
    },
    tags: ['Best Seller', 'Embroidered', 'Festive'],
    careInstructions: 'Hand wash cold and separately for the first few washes. Iron on reverse.',
    origin: 'Stitched in Dhaka, Bangladesh',
  },

  // -------------------------------------------------------------
  // THREE-PIECE SETS
  // -------------------------------------------------------------
  {
    id: 'tpc-01',
    sku: 'JR-TPC-001',
    name: 'Powder Blue Floral 3-Piece Set',
    slug: 'powder-blue-floral-3-piece-set',
    brand: 'JARRO Festive Edit',
    category: 'three-piece',
    subtitle: 'Tunic, Pants & Dupatta in Powder Blue Floral Print',
    description: 'A complete 3-piece set — flowing floral tunic, matching straight-cut pants, and a soft chiffon dupatta — ready to wear for family visits, dawats, or Eid.',
    story: 'One of our most-loved sets: customers tell us it photographs even better in person than online.',
    price: 2450,
    oldPrice: 2800,
    stock: 11,
    isBestSeller: true,
    isFeatured: true,
    rating: 4.9,
    reviewCount: 34,
    images: [tpc01a, tpc01b],
    variants: [
      { id: 'v-tpc-01-s', name: 'Size S', sku: 'JR-TPC-001-S', price: 2450, oldPrice: 2800, stock: 2, inStock: true },
      { id: 'v-tpc-01-m', name: 'Size M', sku: 'JR-TPC-001-M', price: 2450, oldPrice: 2800, stock: 4, inStock: true },
      { id: 'v-tpc-01-l', name: 'Size L', sku: 'JR-TPC-001-L', price: 2450, oldPrice: 2800, stock: 3, inStock: true },
      { id: 'v-tpc-01-xl', name: 'Size XL', sku: 'JR-TPC-001-XL', price: 2450, oldPrice: 2800, stock: 2, inStock: true },
    ],
    clothingSpecs: {
      fabric: 'Cotton Voile with Chiffon Dupatta',
      fit: 'A-Line',
      pattern: 'Floral Print',
      sleeveType: 'Full Sleeve',
      neckline: 'Round Neck',
      occasion: 'Festive / Family Gatherings',
      washCare: 'Hand wash cold, wash dupatta separately.',
      modelSize: 'Model wears size M, height 5\'5"',
      piecesIncluded: 'Tunic + Pants + Dupatta',
    },
    tags: ['Best Seller', '3-Piece', 'Festive'],
    careInstructions: 'Hand wash cold. Wash the chiffon dupatta separately in a mesh bag.',
    origin: 'Stitched in Dhaka, Bangladesh',
  },
  {
    id: 'tpc-02',
    sku: 'JR-TPC-002',
    name: 'Magenta Gold Floral 3-Piece Set',
    slug: 'magenta-gold-floral-3-piece-set',
    brand: 'JARRO Festive Edit',
    category: 'three-piece',
    subtitle: 'Bold Magenta & Gold Floral Print, Festive 3-Piece',
    description: 'A statement set in bold magenta and gold florals — this one is for the days you want to be the best-dressed in the room.',
    story: 'Bright, bold, and unapologetically feminine — a customer favorite for wedding season.',
    price: 2650,
    stock: 9,
    isNew: true,
    isFeatured: true,
    rating: 4.8,
    reviewCount: 15,
    images: [tpc02a, tpc02b],
    variants: [
      { id: 'v-tpc-02-s', name: 'Size S', sku: 'JR-TPC-002-S', price: 2650, stock: 2, inStock: true },
      { id: 'v-tpc-02-m', name: 'Size M', sku: 'JR-TPC-002-M', price: 2650, stock: 3, inStock: true },
      { id: 'v-tpc-02-l', name: 'Size L', sku: 'JR-TPC-002-L', price: 2650, stock: 3, inStock: true },
      { id: 'v-tpc-02-xl', name: 'Size XL', sku: 'JR-TPC-002-XL', price: 2650, stock: 1, inStock: true },
    ],
    clothingSpecs: {
      fabric: 'Premium Lawn with Net Dupatta',
      fit: 'A-Line',
      pattern: 'Floral Print',
      sleeveType: 'Full Sleeve',
      neckline: 'Boat Neck',
      occasion: 'Wedding / Festive',
      washCare: 'Dry clean recommended for first wash, hand wash cold after.',
      modelSize: 'Model wears size M, height 5\'6"',
      piecesIncluded: 'Tunic + Pants + Dupatta',
    },
    tags: ['New Arrival', '3-Piece', 'Wedding Season'],
    careInstructions: 'Dry clean recommended. Hand wash cold for subsequent washes.',
    origin: 'Stitched in Dhaka, Bangladesh',
  },

  // -------------------------------------------------------------
  // CO-ORDS
  // -------------------------------------------------------------
  {
    id: 'cor-01',
    sku: 'JR-COR-001',
    name: 'Rustic Terracotta Co-ord Set',
    slug: 'rustic-terracotta-co-ord-set',
    brand: 'JARRO Co-ord Studio',
    category: 'co-ords',
    subtitle: 'Matching Tunic & Pants in Rustic Terracotta',
    description: 'A clean, modest co-ord set in a warm terracotta tone — matching tunic and wide-leg pants that layer easily with a scarf or hijab for a polished, modern look.',
    story: 'Designed for the days you want an effortless matching set that still feels intentional.',
    price: 2150,
    oldPrice: 2450,
    stock: 13,
    isBestSeller: true,
    rating: 4.9,
    reviewCount: 21,
    images: [cor01a, cor01b],
    variants: [
      { id: 'v-cor-01-s', name: 'Size S', sku: 'JR-COR-001-S', price: 2150, oldPrice: 2450, stock: 3, inStock: true },
      { id: 'v-cor-01-m', name: 'Size M', sku: 'JR-COR-001-M', price: 2150, oldPrice: 2450, stock: 5, inStock: true },
      { id: 'v-cor-01-l', name: 'Size L', sku: 'JR-COR-001-L', price: 2150, oldPrice: 2450, stock: 4, inStock: true },
      { id: 'v-cor-01-xl', name: 'Size XL', sku: 'JR-COR-001-XL', price: 2150, oldPrice: 2450, stock: 1, inStock: true },
    ],
    clothingSpecs: {
      fabric: 'Brushed Viscose',
      fit: 'Relaxed Fit',
      pattern: 'Solid',
      sleeveType: 'Full Sleeve',
      neckline: 'Round Neck',
      occasion: 'Modest Everyday Wear',
      washCare: 'Hand wash cold, hang dry.',
      modelSize: 'Model wears size M, height 5\'5"',
      piecesIncluded: 'Tunic + Pants',
    },
    tags: ['Best Seller', 'Co-ord', 'Modest Wear'],
    careInstructions: 'Hand wash cold, hang dry away from direct sun to prevent fading.',
    origin: 'Stitched in Dhaka, Bangladesh',
  },

  // -------------------------------------------------------------
  // PONCHOS
  // -------------------------------------------------------------
  {
    id: 'pon-01',
    sku: 'JR-PON-001',
    name: 'Cloud Grey Poncho Cape Set',
    slug: 'cloud-grey-poncho-cape-set',
    brand: 'JARRO Signature Ponchos',
    category: 'ponchos',
    subtitle: 'Draped Cape Poncho with Matching Skirt',
    description: 'An elegant draped poncho cape paired with a flowing matching skirt — one of the most-requested silhouettes on our page, easy to wear and endlessly flattering.',
    story: 'The poncho set that started it all — soft, draped, and effortless.',
    price: 1550,
    stock: 16,
    isNew: true,
    isFeatured: true,
    rating: 4.8,
    reviewCount: 23,
    images: [pon01a, pon01b],
    variants: [
      { id: 'v-pon-01-free', name: 'Free Size', sku: 'JR-PON-001-FS', price: 1550, stock: 16, inStock: true },
    ],
    clothingSpecs: {
      fabric: 'Soft Viscose Jersey',
      fit: 'Oversized',
      pattern: 'Solid',
      sleeveType: 'Draped Cape Sleeve',
      neckline: 'Round Neck',
      occasion: 'Casual Daywear',
      washCare: 'Hand wash cold, do not wring, hang dry.',
      modelSize: 'One free size, fits most',
      piecesIncluded: 'Poncho Cape + Skirt',
    },
    tags: ['New Arrival', 'Poncho', 'Free Size'],
    careInstructions: 'Hand wash cold. Do not wring — hang dry to keep the drape.',
    origin: 'Stitched in Dhaka, Bangladesh',
  },
  {
    id: 'pon-02',
    sku: 'JR-PON-002',
    name: 'Ivory White Poncho Set',
    slug: 'ivory-white-poncho-set',
    brand: 'JARRO Signature Ponchos',
    category: 'ponchos',
    subtitle: 'Clean Ivory Poncho with Matching Skirt',
    description: 'A crisp ivory poncho set for a fresh, minimal look — pairs beautifully with gold jewelry or one of our bangle sets for a finished outfit.',
    story: 'Simple, versatile, and easy to restyle for different occasions.',
    price: 1450,
    oldPrice: 1650,
    stock: 10,
    rating: 4.7,
    reviewCount: 9,
    images: [pon02a, pon02b],
    variants: [
      { id: 'v-pon-02-free', name: 'Free Size', sku: 'JR-PON-002-FS', price: 1450, oldPrice: 1650, stock: 10, inStock: true },
    ],
    clothingSpecs: {
      fabric: 'Soft Viscose Jersey',
      fit: 'Oversized',
      pattern: 'Solid',
      sleeveType: 'Draped Cape Sleeve',
      neckline: 'Round Neck',
      occasion: 'Casual Daywear',
      washCare: 'Hand wash cold, do not wring, hang dry.',
      modelSize: 'One free size, fits most',
      piecesIncluded: 'Poncho Cape + Skirt',
    },
    tags: ['Poncho', 'Free Size', 'Minimal'],
    careInstructions: 'Hand wash cold. Do not wring — hang dry to keep the drape.',
    origin: 'Stitched in Dhaka, Bangladesh',
  },

  // -------------------------------------------------------------
  // ACCESSORIES
  // -------------------------------------------------------------
  {
    id: 'acc-01',
    sku: 'JR-ACC-001',
    name: 'Royal Red & Gold Bangle Set',
    slug: 'royal-red-gold-bangle-set',
    brand: 'JARRO Bangle House',
    category: 'accessories',
    subtitle: '12-Piece Traditional Bangle Set in Red & Gold',
    description: 'A festive 12-piece bangle set in rich red and gold with kundan-style stonework — the perfect finishing touch for any of our 3-piece sets.',
    story: 'Handpicked to pair with our festive collection, one set at a time.',
    price: 450,
    stock: 25,
    isBestSeller: true,
    rating: 4.9,
    reviewCount: 31,
    images: [acc01a, acc01b],
    variants: [
      { id: 'v-acc-01-24', name: '2.4 inch', sku: 'JR-ACC-001-24', price: 450, stock: 10, inStock: true },
      { id: 'v-acc-01-26', name: '2.6 inch', sku: 'JR-ACC-001-26', price: 450, stock: 8, inStock: true },
      { id: 'v-acc-01-28', name: '2.8 inch', sku: 'JR-ACC-001-28', price: 450, stock: 7, inStock: true },
    ],
    accessorySpecs: {
      material: 'Lac Bangles with Kundan Stonework',
      setPieces: 12,
      adjustable: false,
    },
    tags: ['Best Seller', 'Bangles', 'Festive'],
    careInstructions: 'Keep away from water and perfume to preserve the stonework.',
    origin: 'Sourced in Dhaka, Bangladesh',
  },
  {
    id: 'acc-02',
    sku: 'JR-ACC-002',
    name: 'Emerald Green Festive Bangle Set',
    slug: 'emerald-green-festive-bangle-set',
    brand: 'JARRO Bangle House',
    category: 'accessories',
    subtitle: '12-Piece Traditional Bangle Set in Green & Gold',
    description: 'A vivid green-and-gold bangle set that pairs beautifully with our emerald and terracotta pieces, or stands out on its own.',
    story: 'A customer favorite for Eid and wedding season gifting.',
    price: 450,
    oldPrice: 550,
    stock: 20,
    isNew: true,
    rating: 4.8,
    reviewCount: 14,
    images: [acc02a, acc02b],
    variants: [
      { id: 'v-acc-02-24', name: '2.4 inch', sku: 'JR-ACC-002-24', price: 450, oldPrice: 550, stock: 7, inStock: true },
      { id: 'v-acc-02-26', name: '2.6 inch', sku: 'JR-ACC-002-26', price: 450, oldPrice: 550, stock: 7, inStock: true },
      { id: 'v-acc-02-28', name: '2.8 inch', sku: 'JR-ACC-002-28', price: 450, oldPrice: 550, stock: 6, inStock: true },
    ],
    accessorySpecs: {
      material: 'Lac Bangles with Kundan Stonework',
      setPieces: 12,
      adjustable: false,
    },
    tags: ['New Arrival', 'Bangles', 'Festive'],
    careInstructions: 'Keep away from water and perfume to preserve the stonework.',
    origin: 'Sourced in Dhaka, Bangladesh',
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'JRO-84920',
    createdAt: '2026-08-15T09:30:00Z',
    customer: {
      fullName: 'Tahmina Rahman',
      mobile: '01711293847',
      district: 'Dhaka',
      thanaArea: 'Gulshan 2',
      fullAddress: 'House 14, Road 53, Apt 4B, Gulshan-2, Dhaka 1212',
      customerNote: 'Please deliver after 2 PM if possible.'
    },
    items: [
      {
        productId: 'tpc-01',
        productName: 'Powder Blue Floral 3-Piece Set',
        brand: 'JARRO Festive Edit',
        variantName: 'Size M',
        image: tpc01a,
        quantity: 1,
        unitPrice: 2450,
        totalPrice: 2450
      },
      {
        productId: 'acc-01',
        productName: 'Royal Red & Gold Bangle Set',
        brand: 'JARRO Bangle House',
        variantName: '2.6 inch',
        image: acc01a,
        quantity: 1,
        unitPrice: 450,
        totalPrice: 450
      }
    ],
    subtotal: 2900,
    deliveryFee: 0,
    discount: 290,
    couponCode: 'WELCOME10',
    total: 2610,
    paymentMethod: 'Cash on Delivery (COD)',
    status: 'Confirmed',
    adminNotes: 'Customer verified via phone call.'
  },
  {
    id: 'ord-102',
    orderNumber: 'JRO-84921',
    createdAt: '2026-08-15T11:15:00Z',
    customer: {
      fullName: 'Nafisa Chowdhury',
      mobile: '01819384756',
      district: 'Chittagong (Chattogram)',
      thanaArea: 'Khulshi R/A',
      fullAddress: 'Road 3, House 22, South Khulshi, Chattogram',
      customerNote: 'Call before arriving.'
    },
    items: [
      {
        productId: 'kur-03',
        productName: 'Blush Pink Floral Embroidered Kurti',
        brand: 'JARRO Festive Edit',
        variantName: 'Size L',
        image: kur03a,
        quantity: 1,
        unitPrice: 1650,
        totalPrice: 1650
      }
    ],
    subtotal: 1650,
    deliveryFee: 130,
    discount: 0,
    total: 1780,
    paymentMethod: 'Cash on Delivery (COD)',
    status: 'Processing',
    adminNotes: 'Gift-wrapped on request.'
  },
  {
    id: 'ord-103',
    orderNumber: 'JRO-84922',
    createdAt: '2026-08-15T12:00:00Z',
    customer: {
      fullName: 'Farzana Akter',
      mobile: '01977654321',
      district: 'Sylhet',
      thanaArea: 'Shahjalal Upashahar',
      fullAddress: 'Block D, Road 4, House 18, Upashahar, Sylhet',
      customerNote: ''
    },
    items: [
      {
        productId: 'cor-01',
        productName: 'Rustic Terracotta Co-ord Set',
        brand: 'JARRO Co-ord Studio',
        variantName: 'Size M',
        image: cor01a,
        quantity: 1,
        unitPrice: 2150,
        totalPrice: 2150
      }
    ],
    subtotal: 2150,
    deliveryFee: 0,
    discount: 0,
    total: 2150,
    paymentMethod: 'Cash on Delivery (COD)',
    status: 'New',
    adminNotes: 'Awaiting phone confirmation from customer.'
  }
];

export const BANGLADESH_DISTRICTS = [
  'Dhaka',
  'Chittagong (Chattogram)',
  'Sylhet',
  'Rajshahi',
  'Khulna',
  'Barishal',
  'Rangpur',
  'Mymensingh',
  'Cumilla',
  'Gazipur',
  'Narayanganj',
  'Cox\'s Bazar',
  'Bogura',
  'Jashore',
  'Tangail',
  'Dinajpur',
  'Faridpur',
  'Kushtia',
  'Pabna',
  'Noakhali',
  'Brahmanbaria',
  'Feni',
  'Jamalpur',
  'Netrokona',
  'Sunamganj',
  'Habiganj',
  'Moulvibazar'
];

export const CATEGORIES_LIST = [
  { id: 'all', name: 'All Products', count: 10, image: tpc02a },
  { id: 'kurtis', name: 'Kurtis & Tunics', count: 3, tag: 'Everyday Prints', image: kur03a },
  { id: 'three-piece', name: '3-Piece Sets', count: 2, tag: 'Festive Edit', image: tpc01a },
  { id: 'co-ords', name: 'Co-ord Sets', count: 1, tag: 'Matching Sets', image: cor01a },
  { id: 'ponchos', name: 'Ponchos & Capes', count: 2, tag: 'Signature Drape', image: pon02a },
  { id: 'accessories', name: 'Bangles & Accessories', count: 2, tag: 'Festive Finish', image: acc01a }
];

export const BRANDS_LIST = [
  { name: 'JARRO Everyday Prints', origin: 'Dhaka, Bangladesh', focus: 'Printed cotton & georgette kurtis for daily wear' },
  { name: 'JARRO Festive Edit', origin: 'Dhaka, Bangladesh', focus: '3-piece sets & embroidered kurtis for celebrations' },
  { name: 'JARRO Co-ord Studio', origin: 'Dhaka, Bangladesh', focus: 'Matching 2-piece modest sets' },
  { name: 'JARRO Signature Ponchos', origin: 'Dhaka, Bangladesh', focus: 'Draped cape & poncho silhouettes' },
  { name: 'JARRO Bangle House', origin: 'Dhaka, Bangladesh', focus: 'Traditional churi & bangle sets' }
];
