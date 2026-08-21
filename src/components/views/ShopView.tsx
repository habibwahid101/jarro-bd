import React, { useState, useMemo } from 'react';
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  Search,
  RotateCcw,
  Sparkles,
  Check,
  Tag
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { ProductCard } from '../ProductCard';
import { ProductCategory, FilterState } from '../../types';
import { CATEGORIES_LIST, BRANDS_LIST } from '../../data/mockData';

const MAX_PRICE = 5000;
const SIZE_OPTIONS = ['S', 'M', 'L', 'XL', 'Free Size'];

export const ShopView: React.FC = () => {
  const {
    products,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    navigateTo,
    formatBDT
  } = useShop();

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Dynamic category meta info
  const categoryMeta: Record<string, { title: string; subtitle: string }> = {
    all: {
      title: 'The Full JARRO Catalogue',
      subtitle: 'Kurtis, 3-piece sets, co-ords, ponchos, and bangles — real fits, real fabric, real you.'
    },
    kurtis: {
      title: 'Kurtis & Tunics',
      subtitle: 'Printed and embroidered cotton, viscose, and georgette kurtis for everyday wear.'
    },
    'three-piece': {
      title: '3-Piece Sets',
      subtitle: 'Tunic, pants, and dupatta sets ready for Eid, weddings, and family gatherings.'
    },
    'co-ords': {
      title: 'Co-ord Sets',
      subtitle: 'Matching 2-piece tunic-and-pants sets, easy to style, easy to layer.'
    },
    ponchos: {
      title: 'Ponchos & Capes',
      subtitle: 'Draped cape silhouettes with matching skirts — one of our most-requested styles.'
    },
    accessories: {
      title: 'Bangles & Accessories',
      subtitle: 'Traditional churi and bangle sets to finish any outfit.'
    }
  };

  const currentMeta = categoryMeta[selectedCategory] || categoryMeta.all;

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Category check
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesBrand = product.brand.toLowerCase().includes(query);
        const matchesCategory = product.category.toLowerCase().includes(query);
        const matchesTags = product.tags.some(t => t.toLowerCase().includes(query));
        const matchesDesc = product.description.toLowerCase().includes(query);
        const matchesFabric = product.clothingSpecs
          ? product.clothingSpecs.fabric.toLowerCase().includes(query) ||
            product.clothingSpecs.pattern.toLowerCase().includes(query)
          : false;

        if (!matchesName && !matchesBrand && !matchesCategory && !matchesTags && !matchesDesc && !matchesFabric) {
          return false;
        }
      }

      // Size filter — matches if any variant name contains the selected size
      if (filters.size) {
        const hasSize = product.variants.some(v => v.name.toLowerCase().includes(filters.size!.toLowerCase()));
        if (!hasSize) return false;
      }

      // Collection filter
      if (filters.brand && product.brand !== filters.brand) {
        return false;
      }

      // Price filter
      if (product.price < filters.minPrice || product.price > filters.maxPrice) {
        return false;
      }

      // Stock check
      if (filters.inStockOnly && product.stock <= 0) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price-asc') return a.price - b.price;
      if (filters.sortBy === 'price-desc') return b.price - a.price;
      if (filters.sortBy === 'rating') return b.rating - a.rating;
      if (filters.sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      // featured default
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [products, selectedCategory, searchQuery, filters]);

  const resetAllFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setFilters({
      category: 'all',
      searchQuery: '',
      size: undefined,
      minPrice: 0,
      maxPrice: MAX_PRICE,
      inStockOnly: false,
      brand: undefined,
      sortBy: 'featured'
    });
  };

  const activeFilterCount = (
    (selectedCategory !== 'all' ? 1 : 0) +
    (searchQuery ? 1 : 0) +
    (filters.size ? 1 : 0) +
    (filters.brand ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.maxPrice < MAX_PRICE ? 1 : 0)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

      {/* -------------------------------------------------------------
          Catalogue Editorial Header
         ------------------------------------------------------------- */}
      <div className="border-b border-[#F0D9DC] pb-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-[#C2607D] mb-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className="hover:underline cursor-pointer"
              >
                JARRO
              </button>
              <span>/</span>
              <span>{selectedCategory === 'all' ? 'All Products' : selectedCategory}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#241A1E]">
              {currentMeta.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#8C6A72] max-w-2xl mt-1.5 leading-relaxed">
              {currentMeta.subtitle}
            </p>
          </div>

          <div className="text-xs text-[#A8828A] shrink-0 font-medium">
            Showing <strong className="text-[#241A1E]">{filteredProducts.length}</strong> pieces
          </div>
        </div>

        {/* Active Search / Filter Banner */}
        {(searchQuery || activeFilterCount > 0) && (
          <div className="mt-4 pt-3 border-t border-[#F0D9DC] flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#8C6A72] font-medium">Active criteria:</span>

            {searchQuery && (
              <span className="inline-flex items-center gap-1 text-xs bg-white border border-[#241A1E] px-2.5 py-1 rounded-full text-[#241A1E]">
                <span>Query: "{searchQuery}"</span>
                <button onClick={() => setSearchQuery('')} className="hover:text-[#B91C1C] cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 text-xs bg-[#FBE8E4] border border-[#EFC9CE] px-2.5 py-1 rounded-full text-[#241A1E]">
                <span>Category: {selectedCategory}</span>
                <button onClick={() => setSelectedCategory('all')} className="hover:text-[#B91C1C] cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.size && (
              <span className="inline-flex items-center gap-1 text-xs bg-[#FBE8E4] border border-[#EFC9CE] px-2.5 py-1 rounded-full text-[#241A1E]">
                <span>Size: {filters.size}</span>
                <button onClick={() => setFilters(prev => ({ ...prev, size: undefined }))} className="hover:text-[#B91C1C] cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.brand && (
              <span className="inline-flex items-center gap-1 text-xs bg-[#FBE8E4] border border-[#EFC9CE] px-2.5 py-1 rounded-full text-[#241A1E]">
                <span>Collection: {filters.brand}</span>
                <button onClick={() => setFilters(prev => ({ ...prev, brand: undefined }))} className="hover:text-[#B91C1C] cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {activeFilterCount > 1 && (
              <button
                onClick={resetAllFilters}
                className="text-xs text-[#C2607D] hover:underline flex items-center gap-1 cursor-pointer font-medium ml-2"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset all filters</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------
          Catalogue Layout: Filter Sidebar + Products Grid
         ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Desktop Filters Sidebar */}
        <aside className="hidden lg:block space-y-8 pr-4">

          {/* Departments */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-[#241A1E] mb-3">
              Departments
            </h4>
            <ul className="space-y-1.5 text-xs text-[#4A2E36]">
              {CATEGORIES_LIST.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => setSelectedCategory(cat.id as ProductCategory | 'all')}
                    className={`w-full text-left py-1 flex items-center justify-between transition cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'font-bold text-[#241A1E] translate-x-1'
                        : 'hover:text-[#241A1E]'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] text-[#C79AA3]">({cat.count})</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Size Filter */}
          <div className="pt-6 border-t border-[#F0D9DC]">
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-[#241A1E] mb-3">
              Size
            </h4>
            <div className="flex flex-wrap gap-2">
              {SIZE_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilters(prev => ({
                    ...prev,
                    size: prev.size === s ? undefined : s
                  }))}
                  className={`text-xs px-3 py-1.5 rounded border transition cursor-pointer ${
                    filters.size === s
                      ? 'bg-[#241A1E] text-white border-[#241A1E]'
                      : 'bg-white text-[#4A2E36] border-[#EFC9CE] hover:border-[#241A1E]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Collection Filter */}
          <div className="pt-6 border-t border-[#F0D9DC]">
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-[#241A1E] mb-3">
              Collection
            </h4>
            <select
              value={filters.brand || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value || undefined }))}
              className="w-full text-xs p-2.5 rounded border border-[#EFC9CE] bg-white text-[#241A1E] focus:outline-none focus:border-[#241A1E]"
            >
              <option value="">All Collections</option>
              {BRANDS_LIST.map(b => (
                <option key={b.name} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Price Max Filter */}
          <div className="pt-6 border-t border-[#F0D9DC]">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-[#241A1E]">
                Max Price
              </h4>
              <span className="text-xs font-semibold text-[#241A1E]">
                {formatBDT(filters.maxPrice)}
              </span>
            </div>
            <input
              type="range"
              min={300}
              max={MAX_PRICE}
              step={50}
              value={filters.maxPrice}
              onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
              className="w-full accent-[#241A1E] cursor-pointer"
            />
          </div>

          {/* In-Stock Toggle */}
          <div className="pt-6 border-t border-[#F0D9DC]">
            <label className="flex items-center gap-2.5 text-xs text-[#241A1E] font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={filters.inStockOnly}
                onChange={(e) => setFilters(prev => ({ ...prev, inStockOnly: e.target.checked }))}
                className="w-4 h-4 rounded border-[#EFC9CE] text-[#241A1E] focus:ring-0 accent-[#241A1E]"
              />
              <span>In-Stock in Dhaka Hub only</span>
            </label>
          </div>

        </aside>

        {/* Products Grid & Controls */}
        <div className="lg:col-span-3 space-y-6">

          {/* Controls Bar (Sort & Mobile Filter Trigger) */}
          <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-[#F0D9DC]">

            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#241A1E] px-3 py-1.5 rounded bg-[#FBE8E4] cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#C2607D]" />
              <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
            </button>

            <span className="hidden lg:inline text-xs text-[#8C6A72]">
              Displaying {filteredProducts.length} pieces
            </span>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-[#8C6A72] hidden sm:inline">Sort by:</span>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as FilterState['sortBy'] }))}
                className="text-xs py-1.5 px-3 rounded border border-[#EFC9CE] bg-[#FDF4F1] text-[#241A1E] font-medium focus:outline-none focus:border-[#241A1E] cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

          </div>

          {/* Product Cards Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-white rounded-xl border border-[#F0D9DC] p-8">
              <div className="w-16 h-16 rounded-full bg-[#FBE8E4] flex items-center justify-center mx-auto mb-4 text-[#C79AA3]">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-medium text-[#241A1E]">
                No matching pieces found
              </h3>
              <p className="text-xs text-[#8C6A72] max-w-sm mx-auto mt-2 mb-6">
                Try widening your price range, clearing specific filters, or searching with broader keywords.
              </p>
              <button
                onClick={resetAllFilters}
                className="px-6 py-2.5 bg-[#241A1E] text-white text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-[#3D2830] transition cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}

        </div>

      </div>

      {/* -------------------------------------------------------------
          Mobile Filter Bottom Sheet / Drawer
         ------------------------------------------------------------- */}
      {isMobileFilterOpen && (
        <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setIsMobileFilterOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xs bg-[#FDF4F1] shadow-2xl flex flex-col justify-between p-6 border-l border-[#F0D9DC]">

              <div className="flex items-center justify-between pb-4 border-b border-[#F0D9DC]">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#C2607D]" />
                  <h3 className="font-serif text-base font-bold text-[#241A1E]">Refine Catalogue</h3>
                </div>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 text-[#8C6A72] hover:text-[#241A1E] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 space-y-6">
                {/* Category Selection */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#241A1E] mb-2">Category</h4>
                  <div className="space-y-1 text-xs">
                    {CATEGORIES_LIST.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id as ProductCategory | 'all')}
                        className={`w-full text-left py-1.5 px-2 rounded ${selectedCategory === cat.id ? 'bg-[#241A1E] text-white font-bold' : 'text-[#4A2E36]'}`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#241A1E] mb-2">Size</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {SIZE_OPTIONS.map(s => (
                      <button
                        key={s}
                        onClick={() => setFilters(prev => ({ ...prev, size: prev.size === s ? undefined : s }))}
                        className={`text-xs px-2.5 py-1 rounded border ${filters.size === s ? 'bg-[#C2607D] text-white border-[#C2607D]' : 'bg-white border-[#EFC9CE]'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Max Price */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold uppercase tracking-wider">Max Price</span>
                    <span>{formatBDT(filters.maxPrice)}</span>
                  </div>
                  <input
                    type="range"
                    min={300}
                    max={MAX_PRICE}
                    step={50}
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                    className="w-full accent-[#241A1E]"
                  />
                </div>

                {/* In Stock */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-[#241A1E]">
                    <input
                      type="checkbox"
                      checked={filters.inStockOnly}
                      onChange={(e) => setFilters(prev => ({ ...prev, inStockOnly: e.target.checked }))}
                      className="w-4 h-4 rounded border-[#EFC9CE] accent-[#241A1E]"
                    />
                    <span>In-Stock only</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-[#F0D9DC] space-y-2">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-3 bg-[#241A1E] text-white text-xs font-bold uppercase tracking-wider rounded"
                >
                  Show {filteredProducts.length} Results
                </button>
                <button
                  onClick={resetAllFilters}
                  className="w-full py-2 bg-transparent text-[#8C6A72] text-xs font-medium underline text-center"
                >
                  Reset all
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
