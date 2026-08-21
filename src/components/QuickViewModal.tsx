import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Heart, 
  Check, 
  ShieldCheck, 
  Truck, 
  Sparkles, 
  ArrowRight,
  Plus,
  Minus
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const QuickViewModal: React.FC = () => {
  const { 
    quickViewProduct, 
    setQuickViewProduct, 
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    navigateTo, 
    formatBDT 
  } = useShop();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const isLiked = isInWishlist(product.id);
  const currentVariant = product.variants[selectedVariantIndex] || product.variants[0];
  const activePrice = currentVariant?.price || product.price;
  const activeOldPrice = currentVariant?.oldPrice || product.oldPrice;

  const handleAddToCart = () => {
    addToCart(product, currentVariant, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      setQuickViewProduct(null);
    }, 900);
  };

  const handleFullDetail = () => {
    setQuickViewProduct(null);
    navigateTo('product-detail', { product });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        onClick={() => setQuickViewProduct(null)}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      <div className="min-h-full flex items-center justify-center p-4 sm:p-6">
        <div className="relative bg-[#FDF4F1] w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden border border-[#F0D9DC] animate-in zoom-in-95 duration-200">
          
          {/* Close button */}
          <button
            onClick={() => setQuickViewProduct(null)}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-[#241A1E] shadow-sm transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* Left: Gallery */}
            <div className="bg-[#FBE8E4] p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#F0D9DC]">
              <div className="relative aspect-[4/5] rounded-lg overflow-hidden border border-[#F0D9DC] bg-white">
                <img
                  src={product.images[selectedImageIndex] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`absolute top-3 right-3 p-2 rounded-full transition shadow-sm cursor-pointer ${
                    isLiked ? 'bg-[#241A1E] text-[#E05656]' : 'bg-white/90 text-[#241A1E] hover:text-[#C2607D]'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-14 h-16 rounded border overflow-hidden shrink-0 transition cursor-pointer ${
                        selectedImageIndex === idx ? 'border-[#241A1E] ring-1 ring-[#241A1E]' : 'border-[#EFC9CE] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info & Controls */}
            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#C2607D]">
                    {product.brand}
                  </span>
                  <h2 className="font-serif text-2xl font-semibold text-[#241A1E] mt-1">
                    {product.name}
                  </h2>
                  <p className="text-xs text-[#8C6A72] mt-1">
                    {product.subtitle}
                  </p>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3 py-2 border-y border-[#F0D9DC]">
                  <span className="text-xl font-bold text-[#241A1E]">
                    {formatBDT(activePrice)}
                  </span>
                  {activeOldPrice && activeOldPrice > activePrice && (
                    <span className="text-sm text-[#B98C93] line-through">
                      {formatBDT(activeOldPrice)}
                    </span>
                  )}
                  <span className="text-[11px] font-medium text-[#25633C] ml-auto">
                    {product.stock > 0 ? '✓ In Stock in Dhaka Hub' : 'Out of Stock'}
                  </span>
                </div>

                <p className="text-xs text-[#4A2E36] leading-relaxed line-clamp-3">
                  {product.description}
                </p>

                {/* Variants Selection */}
                {product.variants.length > 1 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C6A72]">
                      Select Size
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((v, i) => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariantIndex(i)}
                          className={`text-xs py-1.5 px-3 rounded border transition cursor-pointer ${
                            selectedVariantIndex === i
                              ? 'bg-[#241A1E] text-white border-[#241A1E]'
                              : 'bg-white text-[#241A1E] border-[#EFC9CE] hover:border-[#241A1E]'
                          }`}
                        >
                          {v.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Highlights for Clothing or Accessories */}
                {product.clothingSpecs && (
                  <div className="bg-[#FBE8E4] p-3 rounded text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[#8C6A72]">Fabric:</span>
                      <span className="font-medium text-[#241A1E]">{product.clothingSpecs.fabric}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8C6A72]">Fit:</span>
                      <span className="font-medium text-[#241A1E]">{product.clothingSpecs.fit}</span>
                    </div>
                  </div>
                )}

                {product.accessorySpecs && (
                  <div className="bg-[#FBE8E4] p-3 rounded text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[#8C6A72]">Material:</span>
                      <span className="font-medium text-[#241A1E]">{product.accessorySpecs.material}</span>
                    </div>
                    {product.accessorySpecs.setPieces && (
                      <div className="flex justify-between">
                        <span className="text-[#8C6A72]">Set Size:</span>
                        <span className="font-medium text-[#241A1E]">{product.accessorySpecs.setPieces} pieces</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Add to Cart Actions */}
              <div className="mt-6 space-y-3 pt-4 border-t border-[#F0D9DC]">
                <div className="flex gap-3">
                  {/* Quantity selector */}
                  <div className="flex items-center border border-[#EFC9CE] rounded bg-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 text-[#8C6A72] hover:text-[#241A1E] cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-[#241A1E]">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 text-[#8C6A72] hover:text-[#241A1E] cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Add button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className="flex-1 py-3 px-4 bg-[#241A1E] hover:bg-[#3D2830] text-white text-xs font-bold tracking-wider uppercase rounded shadow-sm flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
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

                <button
                  onClick={handleFullDetail}
                  className="w-full text-center text-xs text-[#C2607D] hover:text-[#241A1E] font-medium transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>View Full Product Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
