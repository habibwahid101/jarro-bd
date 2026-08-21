import React, { useState, useRef, useEffect } from 'react';
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  Menu, 
  X, 
  SlidersHorizontal,
  Sparkles,
  ShieldCheck,
  Truck,
  Phone,
  Clock
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCategory } from '../types';

export const Header: React.FC = () => {
  const { 
    activeView, 
    navigateTo, 
    cartItemCount, 
    wishlist, 
    setIsCartOpen, 
    isMobileMenuOpen, 
    setIsMobileMenuOpen,
    setIsFragranceQuizOpen,
    searchQuery,
    setSearchQuery,
    products,
    formatBDT
  } = useShop();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const navCategories: { id: ProductCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All Catalog' },
    { id: 'kurtis', label: 'Kurtis' },
    { id: 'three-piece', label: '3-Piece Sets' },
    { id: 'co-ords', label: 'Co-ords' },
    { id: 'ponchos', label: 'Ponchos' },
    { id: 'accessories', label: 'Accessories' },
  ];

  const searchResults = localSearch.trim()
    ? products.filter(p => 
        p.name.toLowerCase().includes(localSearch.toLowerCase()) ||
        p.brand.toLowerCase().includes(localSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(localSearch.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(localSearch.toLowerCase()))
      ).slice(0, 4)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      navigateTo('shop', { search: localSearch.trim(), category: 'all' });
      setIsSearchOpen(false);
      setLocalSearch('');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FDF4F1]/95 backdrop-blur-md border-b border-[#F0D9DC] transition-all">
      {/* Top Announcement Bar */}
      <div className="bg-[#241A1E] text-[#FDF4F1] text-[11px] sm:text-xs tracking-wider uppercase py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C2607D] animate-pulse"></span>
            <span className="font-medium text-[#EFC9CE]">
              Complimentary Express Delivery in Dhaka over ৳5,000 | Cash on Delivery Nationwide
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-[#C79AA3] text-[11px]">
            <button
              onClick={() => navigateTo('order-lookup')}
              className="hover:text-white transition flex items-center gap-1 cursor-pointer"
            >
              <Clock className="w-3 h-3" />
              Track Order
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          
          {/* Left: Mobile Menu Trigger & Fragrance Quiz CTA */}
          <div className="flex items-center gap-3 shrink-0 lg:w-1/4">
            <button 
              id="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 -ml-2 text-[#241A1E] hover:text-[#C2607D] transition cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <button
              onClick={() => setIsFragranceQuizOpen(true)}
              className="hidden lg:inline-flex items-center gap-2 text-xs font-medium tracking-wide uppercase px-3 py-1.5 rounded-full border border-[#EFC9CE] hover:border-[#241A1E] text-[#241A1E] hover:bg-[#241A1E] hover:text-[#FDF4F1] transition duration-200 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C2607D]" />
              <span>Style Finder</span>
            </button>
          </div>

          {/* Center: Brand Logo */}
          <div className="flex-1 min-w-0 text-center lg:flex-none lg:w-2/4">
            <button
              onClick={() => navigateTo('home')}
              className="inline-block max-w-full text-center cursor-pointer group"
            >
              <span className="block font-serif text-lg sm:text-2xl lg:text-3xl tracking-[0.1em] sm:tracking-[0.15em] lg:tracking-[0.2em] font-semibold uppercase text-[#241A1E] group-hover:text-[#C2607D] transition duration-300 whitespace-nowrap truncate">
                JARRO
              </span>
              <span className="block text-[8px] sm:text-[9px] tracking-[0.08em] sm:tracking-[0.35em] text-[#8C6A72] uppercase -mt-0.5 whitespace-nowrap truncate">
                Real Fits, Real You
              </span>
            </button>
          </div>

          {/* Right: Actions (Search, Wishlist, Cart) */}
          <div className="flex items-center justify-end gap-2 sm:gap-4 shrink-0 lg:w-1/4">
            {/* Search Trigger */}
            <button
              id="search-open-btn"
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-[#241A1E] hover:text-[#C2607D] transition cursor-pointer"
              aria-label="Open search bar"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Button */}
            <button
              id="wishlist-btn"
              onClick={() => navigateTo('wishlist')}
              className="p-2 text-[#241A1E] hover:text-[#C2607D] transition relative cursor-pointer"
              aria-label="View saved wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#C2607D] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              id="cart-drawer-btn"
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 py-2 px-3 bg-[#241A1E] text-[#FDF4F1] hover:bg-[#3D2830] transition rounded-full text-xs font-medium cursor-pointer shadow-sm"
              aria-label="Open shopping cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline tracking-wider uppercase text-[11px]">Cart</span>
              <span className="w-5 h-5 bg-[#C2607D] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartItemCount}
              </span>
            </button>
          </div>
        </div>

        {/* Desktop Category Navigation */}
        <nav className="hidden lg:flex items-center justify-center gap-8 py-2.5 border-t border-[#F0D9DC]/80 text-xs uppercase tracking-[0.15em] font-medium text-[#4A2E36]">
          {navCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => navigateTo('shop', { category: cat.id, search: '' })}
              className={`py-1 hover:text-[#241A1E] transition relative cursor-pointer ${
                activeView === 'shop' && (cat.id === 'all' ? false : true) // dynamic active indicator handled inside shop
                  ? 'hover:text-[#241A1E]'
                  : ''
              }`}
            >
              {cat.label}
            </button>
          ))}
          <button
            onClick={() => navigateTo('shop', { category: 'all', search: 'limited' })}
            className="text-[#C2607D] font-semibold hover:text-[#9E4560] transition cursor-pointer"
          >
            Editorial Picks
          </button>
        </nav>
      </div>

      {/* Global Search Overlay Modal */}
      {isSearchOpen && (
        <div className="absolute inset-0 bg-[#FDF4F1] z-50 px-4 sm:px-8 border-b border-[#F0D9DC] shadow-xl animate-in fade-in duration-200">
          <div className="max-w-4xl mx-auto py-4">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="w-6 h-6 text-[#C2607D] mr-3" />
              <input
                ref={searchInputRef}
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search kurtis, 3-piece sets, co-ords, ponchos, bangles..."
                className="w-full bg-transparent text-lg sm:text-xl font-serif text-[#241A1E] placeholder:text-[#B98C93] focus:outline-none border-b border-[#241A1E] pb-2"
              />
              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(false);
                  setLocalSearch('');
                }}
                className="p-2 text-[#8C6A72] hover:text-[#241A1E] ml-2 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </form>

            {/* Instant Suggestions Dropdown */}
            {localSearch.trim() && (
              <div className="mt-4 pb-4">
                <div className="text-[11px] uppercase tracking-wider text-[#8C6A72] mb-3">
                  Matching Products ({searchResults.length})
                </div>
                {searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {searchResults.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          navigateTo('product-detail', { product: p });
                          setIsSearchOpen(false);
                          setLocalSearch('');
                        }}
                        className="flex items-center gap-3 p-2 rounded-lg bg-white border border-[#F0D9DC] hover:border-[#241A1E] transition cursor-pointer"
                      >
                        <img 
                          src={p.images[0]} 
                          alt={p.name} 
                          className="w-12 h-12 object-cover rounded bg-[#FBE8E4]"
                          referrerPolicy="no-referrer"
                        />
                        <div className="overflow-hidden">
                          <span className="text-[10px] uppercase tracking-wider text-[#C2607D] font-semibold block truncate">
                            {p.brand}
                          </span>
                          <span className="text-xs font-medium text-[#241A1E] block truncate">
                            {p.name}
                          </span>
                          <span className="text-xs font-semibold text-[#241A1E]">
                            {formatBDT(p.price)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-[#8C6A72] py-2">
                    No exact match found for "{localSearch}". Press Enter to browse all results.
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#F0D9DC]">
                  <span className="text-xs text-[#8C6A72]">Quick suggestions:</span>
                  <div className="flex gap-2">
                    {['Kurti', 'Floral', '3-Piece', 'Poncho', 'Bangles'].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setLocalSearch(tag)}
                        className="text-xs px-2.5 py-1 bg-[#FBE8E4] hover:bg-[#F0D9DC] rounded text-[#241A1E] cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile navigation drawer now renders as a top-level sibling in
          App.tsx (<MobileMenuDrawer />), not nested here — see that
          component for why. */}
    </header>
  );
};
