import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Truck, 
  Lock, 
  ArrowRight, 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { BANGLADESH_DISTRICTS } from '../../data/mockData';
import { CustomerInfo } from '../../types';

export const CheckoutView: React.FC = () => {
  const { 
    cart, 
    cartSubtotal, 
    couponDiscount, 
    couponCode,
    createOrder, 
    navigateTo, 
    formatBDT 
  } = useShop();

  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [thanaArea, setThanaArea] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  
  const [paymentOption, setPaymentOption] = useState<'cod' | 'bkash'>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Calculate delivery fee
  const isInsideDhaka = district === 'Dhaka';
  const deliveryFee = (isInsideDhaka && cartSubtotal >= 5000) ? 0 : (isInsideDhaka ? 80 : 130);
  const finalTotal = Math.max(0, cartSubtotal + deliveryFee - couponDiscount);

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-bold text-[#241A1E]">Your bag is empty</h2>
        <p className="text-xs text-[#8C6A72] mt-2 mb-6">Please add items to your shopping bag before proceeding to checkout.</p>
        <button
          onClick={() => navigateTo('shop', { category: 'all' })}
          className="px-6 py-3 bg-[#241A1E] text-white text-xs font-bold uppercase tracking-wider rounded"
        >
          Browse Catalogue
        </button>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validations
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length < 11) {
      setErrorMessage('Please enter a valid 11-digit Bangladeshi mobile number (e.g. 017XXXXXXXX).');
      return;
    }

    if (!fullAddress.trim()) {
      setErrorMessage('Please provide your complete house/road delivery address.');
      return;
    }

    setIsSubmitting(true);

    const customerInfo: CustomerInfo = {
      fullName: fullName.trim(),
      mobile: mobile.trim(),
      district,
      thanaArea: thanaArea.trim() || district,
      fullAddress: fullAddress.trim(),
      customerNote: customerNote.trim() || undefined
    };

    try {
      // createOrder awaits the database write and only clears the cart /
      // navigates to the success screen once the order is actually saved —
      // so if it throws, nothing has been lost and the cart is still intact
      // for the customer to retry.
      await createOrder(customerInfo, deliveryFee);
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'We could not confirm your order. Please try again, or contact us directly via WhatsApp.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Checkout Breadcrumb / Back */}
      <div className="mb-6">
        <button 
          onClick={() => navigateTo('cart')}
          className="text-xs text-[#8C6A72] hover:text-[#241A1E] flex items-center gap-1 cursor-pointer font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Return to Shopping Bag</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Form: Guest Shipping Information (Optimized for Bangladesh) */}
        <div className="lg:col-span-7 space-y-8">
          
          <div className="border-b border-[#F0D9DC] pb-4">
            <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#C2607D] block">
              Step 1 of 1 • Fast Guest Checkout
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#241A1E] mt-1">
              Delivery Information
            </h1>
            <p className="text-xs text-[#8C6A72] mt-1">
              No account required. Please enter your contact details for doorstep Cash on Delivery.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmitOrder} className="space-y-5">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#241A1E] mb-1.5">
                Full Name <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Tanvir Ahmed"
                className="w-full text-xs p-3 rounded-lg border border-[#EFC9CE] bg-white focus:outline-none focus:border-[#241A1E] text-[#241A1E]"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#241A1E] mb-1.5">
                Mobile Number (Phone Confirmation) <span className="text-rose-600">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs text-[#8C6A72] font-medium border-r border-[#EFC9CE] pr-2">
                  +88
                </span>
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full text-xs p-3 pl-14 rounded-lg border border-[#EFC9CE] bg-white focus:outline-none focus:border-[#241A1E] text-[#241A1E]"
                />
              </div>
              <span className="text-[11px] text-[#A8828A] mt-1 block">
                Our representative will give you a brief confirmation call prior to dispatch.
              </span>
            </div>

            {/* District and Thana/Area in 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#241A1E] mb-1.5">
                  District <span className="text-rose-600">*</span>
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-[#EFC9CE] bg-white focus:outline-none focus:border-[#241A1E] text-[#241A1E] cursor-pointer"
                >
                  {BANGLADESH_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#241A1E] mb-1.5">
                  Thana / Area <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={thanaArea}
                  onChange={(e) => setThanaArea(e.target.value)}
                  placeholder="e.g. Gulshan / Dhanmondi / Agrabad"
                  className="w-full text-xs p-3 rounded-lg border border-[#EFC9CE] bg-white focus:outline-none focus:border-[#241A1E] text-[#241A1E]"
                />
              </div>
            </div>

            {/* Detailed Full Address */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#241A1E] mb-1.5">
                Full Street Address / Landmark <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                placeholder="House number, Road number, Apartment/Floor, Area, Landmark"
                className="w-full text-xs p-3 rounded-lg border border-[#EFC9CE] bg-white focus:outline-none focus:border-[#241A1E] text-[#241A1E]"
              />
            </div>

            {/* Optional Customer Note */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#241A1E] mb-1.5">
                Special Delivery Notes / Instructions (Optional)
              </label>
              <input
                type="text"
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="e.g. Please deliver after 3 PM or gift wrap if possible"
                className="w-full text-xs p-3 rounded-lg border border-[#EFC9CE] bg-white focus:outline-none focus:border-[#241A1E] text-[#241A1E]"
              />
            </div>

            {/* -------------------------------------------------------------
                Payment Method Selection (COD Primary)
               ------------------------------------------------------------- */}
            <div className="pt-6 border-t border-[#F0D9DC] space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#241A1E] block">
                Payment Method
              </span>

              {/* COD Option */}
              <div 
                onClick={() => setPaymentOption('cod')}
                className={`p-4 rounded-xl border transition cursor-pointer flex items-start justify-between ${
                  paymentOption === 'cod' 
                    ? 'border-[#241A1E] bg-white ring-1 ring-[#241A1E] shadow-xs' 
                    : 'border-[#EFC9CE] bg-[#FDF4F1]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-[#241A1E] flex items-center justify-center mt-0.5">
                    {paymentOption === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-[#241A1E]" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#241A1E] block">
                      Cash on Delivery (ক্যাশ অন ডেলিভারি)
                    </span>
                    <span className="text-[11px] text-[#8C6A72] block mt-0.5">
                      Pay cash to the delivery rider once your parcel arrives safely at your doorstep.
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#25633C]/10 text-[#25633C] px-2 py-0.5 rounded">
                  Recommended
                </span>
              </div>

              {/* Advance Option */}
              <div 
                onClick={() => setPaymentOption('bkash')}
                className={`p-4 rounded-xl border transition cursor-pointer flex items-start justify-between ${
                  paymentOption === 'bkash' 
                    ? 'border-[#241A1E] bg-white ring-1 ring-[#241A1E] shadow-xs' 
                    : 'border-[#EFC9CE] bg-[#FDF4F1]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-[#EFC9CE] flex items-center justify-center mt-0.5">
                    {paymentOption === 'bkash' && <div className="w-2.5 h-2.5 rounded-full bg-[#241A1E]" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#241A1E] block">
                      bKash / Nagad / Bank Advance
                    </span>
                    <span className="text-[11px] text-[#8C6A72] block mt-0.5">
                      Our customer service will provide our verified Merchant / Personal wallet number during confirmation.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirm Order Button (Desktop & Mobile) */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 bg-[#241A1E] hover:bg-[#3D2830] text-white text-xs font-bold uppercase tracking-[0.2em] rounded-lg shadow-lg flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span>Securing Order...</span>
                ) : (
                  <>
                    <span>Confirm Order (অর্ডার নিশ্চিত করুন) • {formatBDT(finalTotal)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <span className="text-[11px] text-center text-[#A8828A] block mt-2">
                By confirming, you agree to inspect and pay upon delivery. No hidden charges.
              </span>
            </div>

          </form>

        </div>

        {/* Right Sidebar: Order Items & Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl border border-[#F0D9DC] p-6 shadow-xs space-y-6 sticky top-28">
            
            <h3 className="font-serif text-xl font-bold text-[#241A1E] pb-3 border-b border-[#F0D9DC]">
              Order Summary ({cart.length} Items)
            </h3>

            {/* Mini Items list */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1 divide-y divide-[#F0D9DC]">
              {cart.map((item) => (
                <div key={item.id} className="pt-3 first:pt-0 flex gap-3 items-center">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-14 h-16 object-cover rounded bg-[#FBE8E4] border border-[#F0D9DC] shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 overflow-hidden">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-[#C2607D] block truncate">
                      {item.product.brand}
                    </span>
                    <h4 className="text-xs font-semibold text-[#241A1E] truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-[10px] text-[#8C6A72]">
                      {item.selectedVariant.name} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#241A1E]">
                    {formatBDT(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Breakdown table */}
            <div className="space-y-2 text-xs text-[#8C6A72] pt-4 border-t border-[#F0D9DC]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-[#241A1E] font-semibold">{formatBDT(cartSubtotal)}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-[#25633C] font-semibold">
                  <span>Privilege Voucher ({couponCode})</span>
                  <span>-{formatBDT(couponDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span>
                  Delivery Charge ({isInsideDhaka ? 'Inside Dhaka' : 'Outside Dhaka'})
                </span>
                <span className="text-[#241A1E] font-semibold">
                  {deliveryFee === 0 ? <strong className="text-[#25633C]">FREE</strong> : formatBDT(deliveryFee)}
                </span>
              </div>

              <div className="flex justify-between text-base font-bold text-[#241A1E] pt-3 border-t border-[#F0D9DC]">
                <span>Total Amount Payable</span>
                <span className="text-lg">{formatBDT(finalTotal)}</span>
              </div>
            </div>

            {/* Trust badge */}
            <div className="p-3 bg-[#FDF4F1] rounded-lg border border-[#F0D9DC] text-[11px] text-[#4A2E36] space-y-1.5">
              <div className="flex items-center gap-1.5 text-[#241A1E] font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#C2607D]" />
                <span>Risk-Free Cash on Delivery</span>
              </div>
              <p className="text-[10px] text-[#8C6A72] leading-relaxed">
                Pay only when the package arrives. Inspected before dispatch, every time.
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
