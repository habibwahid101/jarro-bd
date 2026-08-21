import React, { useState } from 'react';
import { 
  Search, 
  Clock, 
  Package, 
  Phone, 
  Truck, 
  CheckCircle2, 
  MapPin, 
  MessageCircle,
  AlertCircle
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Order, OrderStatus } from '../../types';

export const OrderLookupView: React.FC = () => {
  const { findOrder, formatBDT, navigateTo } = useShop();

  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [foundOrder, setFoundOrder] = useState<Order | undefined>(undefined);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    setLookupError(null);
    try {
      const res = await findOrder(query.trim());
      setFoundOrder(res);
      setSearched(true);
    } catch (err) {
      // Distinguish "we checked and there's no such order" from "we
      // couldn't check" — previously both showed the same "not found"
      // message, which is misleading when the real cause is a dropped
      // connection rather than a wrong order number.
      setSearched(false);
      setFoundOrder(undefined);
      setLookupError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusStep = (status: OrderStatus): number => {
    switch (status) {
      case 'New': return 1;
      case 'Contacted': return 2;
      case 'Confirmed': return 3;
      case 'Processing': return 4;
      case 'Shipped': return 5;
      case 'Delivered': return 6;
      case 'Cancelled': return 0;
      default: return 1;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-3 mb-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#241A1E] text-[#C2607D] mb-2">
          <Clock className="w-6 h-6" />
        </div>
        <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#C2607D] block">
          Self-Service Tracking
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#241A1E]">
          Track Your Delivery
        </h1>
        <p className="text-xs sm:text-sm text-[#8C6A72]">
          Enter your Order Reference (e.g. <strong>JRO-84920</strong>) or your 11-digit mobile number to view real-time fulfillment status.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="max-w-lg mx-auto flex gap-2 mb-12">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Order Number (JRO-XXXXX) or Mobile Number"
          className="flex-1 text-xs sm:text-sm p-3.5 rounded-lg border border-[#EFC9CE] bg-white focus:outline-none focus:border-[#241A1E] text-[#241A1E]"
        />
        <button
          type="submit"
          disabled={isSearching}
          className="px-6 py-3.5 bg-[#241A1E] hover:bg-[#3D2830] disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer flex items-center gap-2 shrink-0"
        >
          <Search className="w-4 h-4" />
          <span>{isSearching ? 'Searching…' : 'Track'}</span>
        </button>
      </form>

      {/* Lookup error (network/server failure — distinct from "not found") */}
      {lookupError && (
        <div className="max-w-lg mx-auto mb-8 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{lookupError}</span>
        </div>
      )}

      {/* Results */}
      {searched && (
        foundOrder ? (
          <div className="bg-white rounded-2xl border border-[#F0D9DC] shadow-xs overflow-hidden animate-in fade-in duration-300">
            
            {/* Status Header Bar */}
            <div className="p-6 bg-[#241A1E] text-white flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#C2607D] font-bold block">
                  Order Status
                </span>
                <h2 className="font-serif text-2xl font-bold text-white mt-0.5">
                  {foundOrder.orderNumber}
                </h2>
                <span className="text-xs text-[#C79AA3]">
                  Placed on {new Date(foundOrder.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}
                </span>
              </div>

              <div className="sm:text-right">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-[#C2607D] text-white">
                  {foundOrder.status}
                </span>
                <span className="text-xs text-[#EFC9CE] block mt-1">
                  Cash on Delivery: <strong>{formatBDT(foundOrder.total)}</strong>
                </span>
              </div>
            </div>

            {/* Status Tracker Bar */}
            {foundOrder.status !== 'Cancelled' ? (
              <div className="p-6 bg-[#FDF4F1] border-b border-[#F0D9DC]">
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  {[
                    { step: 1, label: 'Order Logged', desc: 'Received in system' },
                    { step: 3, label: 'Confirmed', desc: 'Phone verified' },
                    { step: 5, label: 'Dispatched', desc: 'Handed to courier' },
                    { step: 6, label: 'Delivered', desc: 'Cash collected' }
                  ].map((s) => {
                    const isCompleted = getStatusStep(foundOrder.status) >= s.step;
                    const isCurrent = getStatusStep(foundOrder.status) === s.step;
                    return (
                      <div key={s.step} className="space-y-1.5">
                        <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition ${
                          isCompleted ? 'bg-[#241A1E] text-white' : 'bg-[#F0D9DC] text-[#A8828A]'
                        } ${isCurrent ? 'ring-4 ring-[#C2607D]/30' : ''}`}>
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : s.step}
                        </div>
                        <span className={`block font-semibold text-[11px] ${isCompleted ? 'text-[#241A1E]' : 'text-[#A8828A]'}`}>
                          {s.label}
                        </span>
                        <span className="text-[9px] text-[#A8828A] hidden sm:block">
                          {s.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-rose-50 border-b border-rose-100 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>This order was marked as cancelled. Please reach our concierge if this was unexpected.</span>
              </div>
            )}

            {/* Ordered Items & Shipping Details */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Ordered Items */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#241A1E]">
                  Ordered Pieces ({foundOrder.items.length})
                </h4>
                <div className="divide-y divide-[#F0D9DC]">
                  {foundOrder.items.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <img src={item.image} alt="" className="w-10 h-12 object-cover rounded bg-[#FBE8E4]" referrerPolicy="no-referrer" />
                        <div>
                          <strong className="block text-[#241A1E]">{item.productName}</strong>
                          <span className="text-[10px] text-[#8C6A72]">{item.variantName} × {item.quantity}</span>
                        </div>
                      </div>
                      <span className="font-semibold text-[#241A1E]">{formatBDT(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Info */}
              <div className="space-y-3 text-xs bg-[#FBE8E4] p-4 rounded-xl">
                <h4 className="font-bold uppercase tracking-wider text-[#241A1E]">
                  Destination Address
                </h4>
                <div>
                  <span className="text-[#8C6A72] block">Recipient:</span>
                  <span className="font-bold text-[#241A1E]">{foundOrder.customer.fullName}</span>
                </div>
                <div>
                  <span className="text-[#8C6A72] block">Phone:</span>
                  <span className="font-bold text-[#241A1E]">{foundOrder.customer.mobile}</span>
                </div>
                <div>
                  <span className="text-[#8C6A72] block">Address:</span>
                  <span className="text-[#241A1E] leading-relaxed">
                    {foundOrder.customer.fullAddress}, {foundOrder.customer.thanaArea}, {foundOrder.customer.district}
                  </span>
                </div>
                {foundOrder.adminNotes && (
                  <div className="pt-2 border-t border-[#EFC9CE]">
                    <span className="text-[10px] text-[#A8828A] uppercase tracking-wider block font-bold">Dispatch Update:</span>
                    <span className="text-[11px] text-[#C2607D] font-medium">{foundOrder.adminNotes}</span>
                  </div>
                )}
              </div>

            </div>

            {/* Concierge Help Action */}
            <div className="p-4 bg-white border-t border-[#F0D9DC] flex justify-between items-center text-xs">
              <span className="text-[#8C6A72]">Need adjustments or delivery rescheduling?</span>
              {/* TODO: replace with JARRO's real WhatsApp number (currently a placeholder). */}
              <a
                href={`https://wa.me/8801000000000?text=Inquiry%20regarding%20order%20${foundOrder.orderNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1b8a43] font-semibold hover:underline flex items-center gap-1"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Contact Us</span>
              </a>
            </div>

          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-[#F0D9DC] p-8 max-w-lg mx-auto">
            <AlertCircle className="w-10 h-10 text-[#C2607D] mx-auto mb-3" />
            <h3 className="font-serif text-lg font-bold text-[#241A1E]">No Order Record Found</h3>
            <p className="text-xs text-[#8C6A72] mt-1 mb-4">
              We couldn't locate an order matching "{query}". Please verify your order number (e.g. JRO-84920) or phone number.
            </p>
            <span className="text-[11px] text-[#A8828A]">Try sample order: <strong>JRO-84920</strong></span>
          </div>
        )
      )}

    </div>
  );
};
