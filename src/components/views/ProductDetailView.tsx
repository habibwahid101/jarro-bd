import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  ShoppingBag, 
  Check, 
  ShieldCheck, 
  Truck, 
  Clock, 
  Sparkles, 
  ArrowRight,
  Plus, 
  Minus, 
  ChevronDown, 
  ChevronUp, 
  Share2, 
  MessageCircle,
  Award,
  Layers,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Product, ProductVariant } from '../../types';
import { ProductCard } from '../ProductCard';

export const ProductDetailView: React.FC = () => {
  const { 
    selectedProduct, 
    products, 
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    navigateTo, 
    formatBDT 
  } = useShop();

  // If no product selected, fallback to first product
  const product: Product = selectedProduct || products[0];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0] || {
    id: `def-${product.id}`,
    name: 'Standard',
    sku: product.sku,
    price: product.price,
    stock: product.stock,
    inStock: product.stock > 0
  });
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Accordion open states
  const [openAccordion, setOpenAccordion] = useState<string>('specs');

  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    }
    setActiveImageIndex(0);
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product]);

  const isLiked = isInWishlist(product.id);
  const activePrice = selectedVariant.price || product.price;
  const activeOldPrice = selectedVariant.oldPrice || product.oldPrice;

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleDirectBuy = () => {
    addToCart(product, selectedVariant, quantity);
    navigateTo('checkout');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Related products from same category
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // If not enough related in same category, pad with featured
  const crossSellProducts = relatedProducts.length >= 2 
    ? relatedProducts 
    : [...relatedProducts, ...products.filter(p => p.id !== product.id).slice(0, 4 - relatedProducts.length)];

  return (
    <div className="pb-24">
      {/* -------------------------------------------------------------
          Breadcrumb Navigation
         ------------------------------------------------------------- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b border-[#F0D9DC] text-xs text-[#8C6A72]">
        <div className="flex items-center gap-2">
          <button onClick={() => navigateTo('home')} className="hover:text-[#241A1E] cursor-pointer">Home</button>
          <span>/</span>
          <button onClick={() => navigateTo('shop', { category: product.category })} className="hover:text-[#241A1E] capitalize cursor-pointer">
            {product.category}
          </button>
          <span>/</span>
          <span className="text-[#241A1E] font-medium truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          
          {/* -------------------------------------------------------------
              Left: Image Gallery (MR PORTER Style)
             ------------------------------------------------------------- */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Stage Image */}
            <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-[#FBE8E4] border border-[#F0D9DC] group">
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-transform duration-700"
                referrerPolicy="no-referrer"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                {product.isNew && (
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold px-2.5 py-1 bg-[#241A1E] text-white rounded-xs shadow-sm">
                    New Arrival
                  </span>
                )}
                {product.isBestSeller && !product.isNew && (
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold px-2.5 py-1 bg-[#C2607D] text-white rounded-xs shadow-sm">
                    Best Seller
                  </span>
                )}
              </div>

              {/* Wishlist button */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition shadow-sm z-10 cursor-pointer ${
                  isLiked ? 'bg-[#241A1E] text-[#E05656]' : 'bg-white/90 text-[#241A1E] hover:bg-white hover:text-[#C2607D]'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Gallery Thumbnails */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition cursor-pointer bg-[#FBE8E4] ${
                      activeImageIndex === idx
                        ? 'border-[#241A1E] ring-1 ring-[#241A1E]'
                        : 'border-[#F0D9DC] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}

            {/* Direct WhatsApp Stylist Banner */}
            <div className="p-4 rounded-xl bg-white border border-[#F0D9DC] flex items-center justify-between mt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366]">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#241A1E]">Questions Before You Order?</h4>
                  <p className="text-[11px] text-[#8C6A72]">Ask about sizing, fabric, or Dhaka delivery on WhatsApp.</p>
                </div>
              </div>
              <a
                href={`https://wa.me/8801823885515?text=Hello%20JARRO%2C%20I%20am%20inquiring%20about%20${encodeURIComponent(product.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#1b8a43] text-xs font-semibold transition"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* -------------------------------------------------------------
              Right: Product Commercial Core
             ------------------------------------------------------------- */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            
            {/* Header / Brand / Title */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#C2607D]">
                  {product.brand}
                </span>
                <button 
                  onClick={handleShare}
                  className="text-xs text-[#8C6A72] hover:text-[#241A1E] flex items-center gap-1 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
                </button>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#241A1E] mt-1">
                {product.name}
              </h1>

              <p className="text-xs sm:text-sm text-[#8C6A72] mt-1.5 font-normal">
                {product.subtitle}
              </p>

              {/* Ratings */}
              <div className="flex items-center gap-2 mt-3 text-xs">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <span className="font-bold text-[#241A1E]">{product.rating}</span>
                <span className="text-[#A8828A]">({product.reviewCount} verified client reviews)</span>
              </div>
            </div>

            {/* Pricing Strip in BDT */}
            <div className="p-4 rounded-lg bg-[#FBE8E4] border border-[#F0D9DC] flex items-baseline justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#8C6A72] block">
                  Cash on Delivery Price
                </span>
                <div className="flex items-baseline gap-3 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-bold text-[#241A1E]">
                    {formatBDT(activePrice)}
                  </span>
                  {activeOldPrice && activeOldPrice > activePrice && (
                    <span className="text-sm text-[#B98C93] line-through">
                      {formatBDT(activeOldPrice)}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-semibold text-[#25633C] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>In Stock (Hub Dhaka)</span>
                </span>
                <span className="text-[10px] text-[#A8828A] block mt-0.5">
                  Ships within 24h
                </span>
              </div>
            </div>

            {/* Short Editorial Description */}
            <p className="text-xs sm:text-sm text-[#4A2E36] leading-relaxed">
              {product.description}
            </p>

            {/* Variant Selector */}
            {product.variants && product.variants.length > 1 && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold uppercase tracking-wider text-[#241A1E]">
                    Select Size:
                  </span>
                  <span className="text-[#C2607D] font-semibold">{selectedVariant.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                        selectedVariant.id === v.id
                          ? 'border-[#241A1E] bg-white ring-1 ring-[#241A1E] shadow-xs'
                          : 'border-[#EFC9CE] bg-[#FDF4F1] hover:bg-white'
                      }`}
                    >
                      <span className="text-xs font-semibold text-[#241A1E] block">{v.name}</span>
                      <span className="text-[11px] text-[#8C6A72] mt-0.5 block">{formatBDT(v.price)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                Buying Controls (Quantity + Add to Cart + Cash on Delivery Buy)
               ------------------------------------------------------------- */}
            <div className="space-y-3 pt-4 border-t border-[#F0D9DC]">
              <div className="flex gap-3">
                {/* Quantity */}
                <div className="flex items-center border border-[#EFC9CE] rounded-lg bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 text-[#8C6A72] hover:text-[#241A1E] transition cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-3 text-sm font-bold text-[#241A1E]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => Math.min(selectedVariant.stock, q + 1))}
                    disabled={quantity >= selectedVariant.stock}
                    className="p-3 text-[#8C6A72] hover:text-[#241A1E] transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Main Add to Cart */}
                <button
                  id="add-to-cart-cta"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0 || quantity > selectedVariant.stock}
                  className="flex-1 py-3.5 px-6 bg-[#241A1E] hover:bg-[#3D2830] text-white text-xs font-bold uppercase tracking-[0.18em] rounded-lg shadow-md flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Bag • {formatBDT(activePrice * quantity)}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Direct Cash on Delivery Instant Order */}
              <button
                onClick={handleDirectBuy}
                disabled={product.stock <= 0 || quantity > selectedVariant.stock}
                className="w-full py-3.5 px-4 bg-[#C2607D] hover:bg-[#9E4560] text-white text-xs font-bold uppercase tracking-[0.18em] rounded-lg shadow-sm flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Order Now with Cash on Delivery</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Reassurance Grid */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#F0D9DC] text-[11px] text-[#4A2E36]">
              <div className="flex items-start gap-2 p-2.5 rounded bg-white border border-[#F0D9DC]">
                <Truck className="w-4 h-4 text-[#C2607D] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#241A1E] block">Dhaka 24h Express</strong>
                  <span>Free delivery over ৳5,000</span>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2.5 rounded bg-white border border-[#F0D9DC]">
                <ShieldCheck className="w-4 h-4 text-[#C2607D] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#241A1E] block">Checked Before Dispatch</strong>
                  <span>Stitched & inspected in Dhaka</span>
                </div>
              </div>
            </div>

            {/* -------------------------------------------------------------
                Storytelling & Detailed Accordions
               ------------------------------------------------------------- */}
            <div className="pt-4 border-t border-[#F0D9DC] divide-y divide-[#F0D9DC]">

              {/* Accordion 1: Fabric & Fit Specs */}
              <div className="py-3">
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'specs' ? '' : 'specs')}
                  className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#241A1E] py-1 cursor-pointer"
                >
                  <span>Fabric & Fit Details</span>
                  {openAccordion === 'specs' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {openAccordion === 'specs' && (
                  <div className="pt-3 text-xs text-[#4A2E36] space-y-3 animate-in fade-in duration-200">
                    {/* Clothing Specs Sheet */}
                    {product.clothingSpecs && (
                      <div className="space-y-2 bg-[#FBE8E4] p-4 rounded-lg">
                        <div className="flex justify-between border-b border-[#EFC9CE] pb-1.5">
                          <span className="font-semibold text-[#241A1E]">Fabric:</span>
                          <span>{product.clothingSpecs.fabric}</span>
                        </div>
                        <div className="flex justify-between border-b border-[#EFC9CE] pb-1.5">
                          <span className="font-semibold text-[#241A1E]">Fit:</span>
                          <span>{product.clothingSpecs.fit}</span>
                        </div>
                        <div className="flex justify-between border-b border-[#EFC9CE] pb-1.5">
                          <span className="font-semibold text-[#241A1E]">Pattern:</span>
                          <span>{product.clothingSpecs.pattern}</span>
                        </div>
                        <div className="flex justify-between border-b border-[#EFC9CE] pb-1.5">
                          <span className="font-semibold text-[#241A1E]">Sleeve:</span>
                          <span>{product.clothingSpecs.sleeveType}</span>
                        </div>
                        {product.clothingSpecs.neckline && (
                          <div className="flex justify-between border-b border-[#EFC9CE] pb-1.5">
                            <span className="font-semibold text-[#241A1E]">Neckline:</span>
                            <span>{product.clothingSpecs.neckline}</span>
                          </div>
                        )}
                        {product.clothingSpecs.piecesIncluded && (
                          <div className="flex justify-between border-b border-[#EFC9CE] pb-1.5">
                            <span className="font-semibold text-[#241A1E]">Includes:</span>
                            <span>{product.clothingSpecs.piecesIncluded}</span>
                          </div>
                        )}
                        <div className="flex justify-between border-b border-[#EFC9CE] pb-1.5">
                          <span className="font-semibold text-[#241A1E]">Occasion:</span>
                          <span>{product.clothingSpecs.occasion}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-[#241A1E] block mb-1">Wash Care:</span>
                          <span className="text-[#8C6A72]">{product.clothingSpecs.washCare}</span>
                        </div>
                        {product.clothingSpecs.modelSize && (
                          <div className="text-[11px] text-[#A8828A] pt-1">{product.clothingSpecs.modelSize}</div>
                        )}
                      </div>
                    )}

                    {/* Accessory Specs Sheet */}
                    {product.accessorySpecs && (
                      <div className="space-y-2 bg-[#FBE8E4] p-4 rounded-lg">
                        <div className="flex justify-between border-b border-[#EFC9CE] pb-1.5">
                          <span className="font-semibold text-[#241A1E]">Material:</span>
                          <span>{product.accessorySpecs.material}</span>
                        </div>
                        {product.accessorySpecs.setPieces && (
                          <div className="flex justify-between border-b border-[#EFC9CE] pb-1.5">
                            <span className="font-semibold text-[#241A1E]">Set Size:</span>
                            <span>{product.accessorySpecs.setPieces} pieces</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="font-semibold text-[#241A1E]">Adjustable:</span>
                          <span>{product.accessorySpecs.adjustable ? 'Yes' : 'No — sized to fit'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Accordion 2: The JARRO Story */}
              <div className="py-3">
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'story' ? '' : 'story')}
                  className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#241A1E] py-1 cursor-pointer"
                >
                  <span>The JARRO Story</span>
                  {openAccordion === 'story' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {openAccordion === 'story' && (
                  <div className="pt-3 text-xs text-[#4A2E36] leading-relaxed space-y-2 animate-in fade-in duration-200">
                    <p>{product.story}</p>
                    <p className="text-[11px] text-[#A8828A]">Origin: {product.origin || 'Dhaka, Bangladesh'}</p>
                  </div>
                )}
              </div>

              {/* Accordion 3: Delivery in Bangladesh */}
              <div className="py-3">
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'shipping' ? '' : 'shipping')}
                  className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#241A1E] py-1 cursor-pointer"
                >
                  <span>Delivery & Cash on Delivery Policy</span>
                  {openAccordion === 'shipping' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {openAccordion === 'shipping' && (
                  <div className="pt-3 text-xs text-[#4A2E36] leading-relaxed space-y-2 animate-in fade-in duration-200">
                    <p>
                      <strong>Inside Dhaka:</strong> Delivery fee is ৳80 (Complimentary over ৳5,000). Delivered within 24 to 48 hours via our dedicated executive courier.
                    </p>
                    <p>
                      <strong>Outside Dhaka (All 64 Districts):</strong> Delivery fee is ৳130. Delivered within 48 to 72 hours with Pathao / Steadfast Courier with tracking.
                    </p>
                    <p className="text-[#25633C] font-semibold">
                      Payment is made strictly upon doorstep delivery after inspecting the sealed exterior package.
                    </p>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* -------------------------------------------------------------
            Cross-Selling: You May Also Like / Complete the Look
           ------------------------------------------------------------- */}
        <div className="mt-20 pt-12 border-t border-[#F0D9DC]">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#C2607D] block">
                Curated Suggestions
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#241A1E] mt-1">
                You May Also Like
              </h2>
            </div>
            <button
              onClick={() => navigateTo('shop', { category: product.category })}
              className="text-xs uppercase tracking-wider font-semibold text-[#241A1E] hover:text-[#C2607D] transition flex items-center gap-1 cursor-pointer"
            >
              <span>Explore Category</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {crossSellProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>

      </div>

      {/* -------------------------------------------------------------
          Sticky Mobile Add to Cart Bar
         ------------------------------------------------------------- */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#F0D9DC] p-3 z-30 shadow-2xl flex items-center justify-between gap-3">
        <div className="overflow-hidden">
          <span className="text-xs font-semibold text-[#241A1E] block truncate">
            {product.name}
          </span>
          <span className="text-xs font-bold text-[#C2607D]">
            {formatBDT(activePrice * quantity)}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.stock <= 0 || quantity > selectedVariant.stock}
          className="py-2.5 px-5 bg-[#241A1E] hover:bg-[#3D2830] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
        >
          {isAdded ? <Check className="w-4 h-4 text-emerald-400" /> : <ShoppingBag className="w-4 h-4" />}
          <span>{isAdded ? 'Added' : 'Add to Bag'}</span>
        </button>
      </div>

    </div>
  );
};
