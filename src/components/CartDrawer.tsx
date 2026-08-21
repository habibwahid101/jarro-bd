import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Tag, 
  Check 
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const CartDrawer: React.FC = () => {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    cart, 
    cartSubtotal, 
    cartItemCount, 
    updateCartQuantity, 
    removeFromCart, 
    navigateTo, 
    couponCode,
    couponDiscount,
    applyCoupon,
    removeCoupon,
    formatBDT 
  } = useShop();

  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isCartOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 5000;
  const progressPercent = Math.min(100, Math.round((cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const remainingForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyCoupon(promoInput);
    if (res.success) {
      setPromoMessage({ text: res.message, isError: false });
      setPromoInput('');
    } else {
      setPromoMessage({ text: res.message, isError: true });
    }
  };

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigateTo('checkout');
  };

  const handleViewCart = () => {
    setIsCartOpen(false);
    navigateTo('cart');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FDF4F1] shadow-2xl flex flex-col justify-between border-l border-[#F0D9DC] animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#F0D9DC] bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#241A1E]" />
              <h3 className="font-serif text-lg font-semibold tracking-wide text-[#241A1E]">
                Your Shopping Bag ({cartItemCount})
              </h3>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full text-[#8C6A72] hover:text-[#241A1E] hover:bg-[#FBE8E4] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="px-6 py-3 bg-[#FBE8E4] border-b border-[#F0D9DC]">
            {cartSubtotal >= FREE_SHIPPING_THRESHOLD ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-[#25633C]">
                <Truck className="w-4 h-4 text-[#25633C]" />
                <span>You've unlocked Complimentary Express Delivery in Dhaka!</span>
              </div>
            ) : (
              <div>
                <div className="flex justify-between text-xs text-[#4A2E36] mb-1.5 font-medium">
                  <span>Add {formatBDT(remainingForFree)} more for Free Dhaka Delivery</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#EFC9CE] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#C2607D] transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[#F0D9DC]">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#FBE8E4] flex items-center justify-center mb-4 text-[#C79AA3]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-serif text-xl font-medium text-[#241A1E] mb-1">
                  Your bag is currently empty
                </h4>
                <p className="text-xs text-[#8C6A72] max-w-xs mb-6">
                  Explore our kurtis, three-piece sets, co-ords, ponchos, and bangles.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigateTo('shop', { category: 'all' });
                  }}
                  className="px-6 py-2.5 bg-[#241A1E] text-[#FDF4F1] text-xs font-medium tracking-wider uppercase rounded-xs hover:bg-[#3D2830] transition cursor-pointer"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="py-4 flex gap-4">
                  {/* Thumbnail */}
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-20 h-24 object-cover rounded bg-[#FBE8E4] border border-[#F0D9DC] shrink-0"
                    referrerPolicy="no-referrer"
                  />

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[#C2607D]">
                          {item.product.brand}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-[#B98C93] hover:text-[#B91C1C] transition cursor-pointer p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <h4 className="text-xs font-medium text-[#241A1E] line-clamp-1 mt-0.5">
                        {item.product.name}
                      </h4>
                      <p className="text-[11px] text-[#8C6A72] mt-0.5">
                        {item.selectedVariant.name}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F0D9DC]/40">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-[#EFC9CE] rounded bg-white">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="p-1 px-2 text-[#8C6A72] hover:text-[#241A1E] hover:bg-[#FBE8E4] transition cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-semibold text-[#241A1E] min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="p-1 px-2 text-[#8C6A72] hover:text-[#241A1E] hover:bg-[#FBE8E4] transition cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line Price */}
                      <div className="text-right">
                        <span className="text-xs font-semibold text-[#241A1E]">
                          {formatBDT(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {cart.length > 0 && (
            <div className="border-t border-[#F0D9DC] bg-white px-6 py-5 space-y-4">
              {/* Promo Code Input */}
              <div>
                {couponCode ? (
                  <div className="flex items-center justify-between p-2 bg-[#FBE8E4] rounded text-xs">
                    <div className="flex items-center gap-1.5 text-[#25633C] font-medium">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Code <strong>{couponCode}</strong> applied (-{formatBDT(couponDiscount)})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs text-[#B98C93] hover:text-[#B91C1C] underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Promo code (e.g. WELCOME10)"
                      className="flex-1 text-xs px-3 py-2 border border-[#EFC9CE] rounded uppercase tracking-wider focus:outline-none focus:border-[#241A1E] bg-[#FDF4F1]"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 bg-[#FBE8E4] hover:bg-[#F0D9DC] text-[#241A1E] text-xs font-semibold rounded cursor-pointer transition"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {promoMessage && !couponCode && (
                  <p className={`text-[11px] mt-1 ${promoMessage.isError ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {promoMessage.text}
                  </p>
                )}
              </div>

              {/* Order Cost Breakdown */}
              <div className="space-y-1.5 text-xs text-[#8C6A72]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[#241A1E] font-medium">{formatBDT(cartSubtotal)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-[#25633C]">
                    <span>Privilege Discount</span>
                    <span>-{formatBDT(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Delivery</span>
                  <span>{cartSubtotal >= FREE_SHIPPING_THRESHOLD ? 'FREE (Inside Dhaka)' : 'Calculated at checkout'}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-[#241A1E] pt-2 border-t border-[#F0D9DC]">
                  <span>Total Amount</span>
                  <span>{formatBDT(Math.max(0, cartSubtotal - couponDiscount))}</span>
                </div>
              </div>

              {/* Checkout Action Button */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleCheckoutClick}
                  className="w-full py-3.5 px-4 bg-[#241A1E] hover:bg-[#3D2830] text-white text-xs font-semibold tracking-wider uppercase rounded-xs shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <span>Proceed to Cash on Delivery</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleViewCart}
                  className="w-full py-2.5 px-4 bg-transparent hover:bg-[#FBE8E4] text-[#241A1E] text-xs font-medium tracking-wider uppercase rounded-xs border border-[#EFC9CE] flex items-center justify-center transition cursor-pointer"
                >
                  View Full Cart & Review
                </button>
              </div>

              {/* Reassurance */}
              <div className="flex items-center justify-center gap-4 text-[10px] text-[#A8828A] pt-1">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C2607D]" />
                  <span>100% Authentic Quality</span>
                </div>
                <div className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[#C2607D]" />
                  <span>Cash on Delivery</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
