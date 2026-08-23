import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCategory } from '../types';

const navCategories: { id: ProductCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All Catalog' },
  { id: 'kurtis', label: 'Kurtis' },
  { id: 'three-piece', label: '3-Piece Sets' },
  { id: 'co-ords', label: 'Co-ords' },
  { id: 'ponchos', label: 'Ponchos' },
  { id: 'accessories', label: 'Accessories' },
];

/**
 * Full-screen mobile navigation drawer.
 *
 * This used to be rendered inside <Header>, which is `position: sticky`
 * with its own z-index/backdrop-blur (both of which create a CSS stacking
 * context). Nesting a `position: fixed` full-screen overlay inside a
 * stacking-context-creating ancestor traps its paint order inside that
 * ancestor's context instead of the page root — in practice this let page
 * content (e.g. the home hero banner) render through/over the drawer
 * instead of being fully covered by it.
 *
 * Rendered as a top-level sibling in App.tsx instead (matching the
 * existing CartDrawer/QuickViewModal/FragranceQuizModal pattern), so it's
 * never nested inside another stacking context. z-30 keeps it below the
 * header itself (z-40, so the header's close button stays on top and
 * clickable) while staying above every other page element.
 */
export const MobileMenuDrawer: React.FC = () => {
  const {
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    setIsFragranceQuizOpen,
    wishlist,
    navigateTo,
  } = useShop();

  if (!isMobileMenuOpen) return null;

  return (
    <div className="lg:hidden fixed left-0 right-0 bottom-0 top-18 bg-[#FDF4F1] z-30 overflow-y-auto px-6 py-6 border-t border-[#F0D9DC] shadow-2xl flex flex-col justify-between">
      <div className="space-y-6">
        {/* Quick Scent Finder banner */}
        <div
          onClick={() => {
            setIsFragranceQuizOpen(true);
            setIsMobileMenuOpen(false);
          }}
          className="p-4 rounded-xl bg-[#241A1E] text-[#FDF4F1] flex items-center justify-between cursor-pointer shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#C2607D]/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#C2607D]" />
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wide">Style Finder</h4>
              <p className="text-xs text-[#EFC9CE]">Find your perfect fit in 30 seconds</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#C2607D]" />
        </div>

        {/* Categories */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C2607D] block mb-3">
            Categories
          </span>
          <ul className="space-y-2">
            {navCategories.map(cat => (
              <li key={cat.id}>
                <button
                  onClick={() => navigateTo('shop', { category: cat.id, search: '' })}
                  className="w-full text-left py-2 text-base font-serif font-medium text-[#241A1E] hover:text-[#C2607D] border-b border-[#F0D9DC]/60 flex items-center justify-between cursor-pointer"
                >
                  <span>{cat.label}</span>
                  <ArrowRight className="w-4 h-4 text-[#8C6A72]" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C2607D] block mb-3">
            Client Services
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => navigateTo('order-lookup')}
              className="p-3 bg-white border border-[#F0D9DC] rounded-lg text-left font-medium text-[#241A1E] cursor-pointer"
            >
              📦 Track Order Status
            </button>
            <button
              onClick={() => navigateTo('wishlist')}
              className="col-span-2 p-3 bg-white border border-[#F0D9DC] rounded-lg text-left font-medium text-[#241A1E] cursor-pointer"
            >
              ❤️ Saved Wishlist ({wishlist.length})
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Footer info */}
      <div className="pt-8 border-t border-[#F0D9DC] mt-6 text-xs text-[#8C6A72]">
        <p className="font-serif text-sm font-semibold text-[#241A1E] mb-1">JARRO BANGLADESH</p>
        <p>WhatsApp Us: +880 1823-885515</p>
        <p className="text-[11px] text-[#C79AA3] mt-2">Dhaka · Cash on Delivery Nationwide</p>
      </div>
    </div>
  );
};
