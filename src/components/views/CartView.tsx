import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Tag, 
  ChevronLeft,
  Lock
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const CartView: React.FC = () => {
  const { 
    cart, 
    cartSubtotal, 
    cartItemCount, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart,
    navigateTo, 
    couponCode,
    couponDiscount,
    applyCoupon,
    removeCoupon,
    formatBDT 
  } = useShop();

  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);

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

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-[#FBE8E4] flex items-center justify-center mx-auto mb-6 text-[#C79AA3]">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#241A1E]">
          Your Shopping Bag is Empty
        </h1>
        <p className="text-xs sm:text-sm text-[#8C6A72] max-w-md mx-auto mt-2 mb-8">
          You have not added any kurtis, three-piece sets, co-ords, or accessories to your bag yet.
        </p>
        <button
          onClick={() => navigateTo('shop', { category: 'all' })}
          className="px-8 py-3.5 bg-[#241A1E] text-white text-xs font-bold uppercase tracking-[0.2em] rounded hover:bg-[#3D2830] transition cursor-pointer"
        >
          Explore Catalogue
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Title */}
      <div className="border-b border-[#F0D9DC] pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <button 
            onClick={() => navigateTo('shop', { category: 'all' })}
            className="text-xs text-[#8C6A72] hover:text-[#241A1E] flex items-center gap-1 mb-2 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </button>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#241A1E]">
            Shopping Bag ({cartItemCount} Items)
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-[#B98C93] hover:text-[#B91C1C] underline cursor-pointer"
        >
          Clear entire bag
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Free Shipping Progress Indicator */}
          <div className="p-4 bg-[#FBE8E4] rounded-lg border border-[#F0D9DC]">
            {cartSubtotal >= FREE_SHIPPING_THRESHOLD ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-[#25633C]">
                <Truck className="w-4 h-4 text-[#25633C]" />
                <span>You've unlocked Complimentary Express Delivery in Dhaka!</span>
              </div>
            ) : (
              <div>
                <div className="flex justify-between text-xs text-[#4A2E36] mb-1.5 font-medium">
                  <span>Add <strong>{formatBDT(remainingForFree)}</strong> more for Free Dhaka Delivery</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-[#EFC9CE] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#C2607D] transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-xl border border-[#F0D9DC] divide-y divide-[#F0D9DC] overflow-hidden">
            {cart.map((item) => (
              <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                
                {/* Product Meta */}
                <div className="flex gap-4 items-center">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-20 h-24 object-cover rounded bg-[#FBE8E4] border border-[#F0D9DC] shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#C2607D]">
                      {item.product.brand}
                    </span>
                    <h3 className="font-serif text-base font-bold text-[#241A1E] leading-tight">
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-[#8C6A72]">
                      {item.selectedVariant.name}
                    </p>
                    <span className="text-xs font-semibold text-[#241A1E] sm:hidden block">
                      {formatBDT(item.unitPrice)} each
                    </span>
                  </div>
                </div>

                {/* Quantity & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#F0D9DC]/60">
                  {/* Quantity */}
                  <div className="flex items-center border border-[#EFC9CE] rounded-lg bg-white">
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      className="p-2 text-[#8C6A72] hover:text-[#241A1E] cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-[#241A1E]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.selectedVariant.stock}
                      className="p-2 text-[#8C6A72] hover:text-[#241A1E] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right min-w-[90px]">
                    <span className="text-sm font-bold text-[#241A1E] block">
                      {formatBDT(item.unitPrice * item.quantity)}
                    </span>
                    {item.quantity > 1 && (
                      <span className="text-[10px] text-[#A8828A] block">
                        ({formatBDT(item.unitPrice)} / unit)
                      </span>
                    )}
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-[#B98C93] hover:text-[#B91C1C] p-1 transition cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>

        {/* Right: Summary Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl border border-[#F0D9DC] p-6 space-y-6 shadow-sm">
            <h3 className="font-serif text-xl font-bold text-[#241A1E] pb-3 border-b border-[#F0D9DC]">
              Order Summary
            </h3>

            {/* Promo code */}
            <div>
              {couponCode ? (
                <div className="flex items-center justify-between p-3 bg-[#FBE8E4] rounded-lg text-xs">
                  <div className="flex items-center gap-2 text-[#25633C] font-medium">
                    <Tag className="w-4 h-4" />
                    <span>Promo <strong>{couponCode}</strong> applied</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-[#B98C93] hover:text-[#B91C1C] underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Promotional code (e.g. WELCOME10)"
                      className="flex-1 text-xs px-3 py-2.5 border border-[#EFC9CE] rounded uppercase tracking-wider focus:outline-none focus:border-[#241A1E] bg-[#FDF4F1]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-[#241A1E] hover:bg-[#3D2830] text-white text-xs font-semibold rounded cursor-pointer transition"
                    >
                      Apply
                    </button>
                  </div>
                  {promoMessage && (
                    <p className={`text-xs ${promoMessage.isError ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {promoMessage.text}
                    </p>
                  )}
                </form>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2.5 text-xs text-[#8C6A72] pt-2 border-t border-[#F0D9DC]">
              <div className="flex justify-between">
                <span>Bag Subtotal</span>
                <span className="text-[#241A1E] font-semibold">{formatBDT(cartSubtotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-[#25633C] font-semibold">
                  <span>Privilege Voucher Discount</span>
                  <span>-{formatBDT(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Delivery</span>
                <span>{cartSubtotal >= FREE_SHIPPING_THRESHOLD ? 'FREE (Inside Dhaka)' : 'From ৳80'}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#241A1E] pt-3 border-t border-[#F0D9DC]">
                <span>Estimated Total</span>
                <span>{formatBDT(Math.max(0, cartSubtotal - couponDiscount))}</span>
              </div>
            </div>

            {/* Proceed to Checkout CTA */}
            <button
              onClick={() => navigateTo('checkout')}
              className="w-full py-4 px-6 bg-[#241A1E] hover:bg-[#3D2830] text-white text-xs font-bold uppercase tracking-[0.2em] rounded-lg shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>Proceed to Cash on Delivery Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Reassurance */}
            <div className="space-y-2 pt-3 border-t border-[#F0D9DC] text-[11px] text-[#8C6A72]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C2607D]" />
                <span>Zero Risk: Pay Cash upon Doorstep Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#C2607D]" />
                <span>Express Courier Dispatch across Bangladesh</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
