import React, { useState } from 'react';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Truck,
  Clock,
  ChevronRight,
  Eye,
  ShoppingBag,
  Star,
  CheckCircle2,
  Award
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { ProductCard } from '../ProductCard';
import { BRANDS_LIST } from '../../data/mockData';
import { ProductCategory } from '../../types';
import heroThreePieceImg from '../../assets/products/tpc-01-a.jpg';
import editorialTunicImg from '../../assets/products/kur-02-a.jpg';
import galleryKurtiImg from '../../assets/products/kur-01-a.jpg';
import galleryThreePieceImg from '../../assets/products/tpc-01-b.jpg';
import galleryCoOrdImg from '../../assets/products/cor-01-a.jpg';
import galleryPonchoImg from '../../assets/products/pon-01-b.jpg';

const OCCASION_TABS: { id: string; label: string; categories: ProductCategory[] }[] = [
  { id: 'Everyday', label: '👚 Everyday Wear', categories: ['kurtis', 'co-ords'] },
  { id: 'Festive', label: '✨ Festive & Celebrations', categories: ['three-piece'] },
  { id: 'Draped', label: '🧣 Draped & Modest', categories: ['ponchos'] },
  { id: 'Finishing', label: '💍 Finishing Touches', categories: ['accessories'] },
];

export const HomeView: React.FC = () => {
  const {
    products,
    navigateTo,
    setIsFragranceQuizOpen,
    formatBDT
  } = useShop();

  const [selectedOccasion, setSelectedOccasion] = useState<string>('Everyday');

  // Filter subsets
  const newArrivals = products.filter(p => p.isNew || p.isFeatured).slice(0, 4);
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 4);
  const accessoryProducts = products.filter(p => p.category === 'accessories').slice(0, 4);

  const activeOccasionTab = OCCASION_TABS.find(t => t.id === selectedOccasion) || OCCASION_TABS[0];
  const occasionProducts = products.filter(p => activeOccasionTab.categories.includes(p.category));

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">

      {/* -------------------------------------------------------------
          1. HERO CAMPAIGN
         ------------------------------------------------------------- */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-[#241820] text-[#FDF4F1]">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroThreePieceImg}
            alt="JARRO women's clothing — kurtis, 3-piece sets, co-ords, ponchos and bangles"
            className="w-full h-full object-cover object-center opacity-40 scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#241820] via-[#241820]/60 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center py-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[#EFC9CE] text-[11px] uppercase tracking-[0.25em] font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C2607D] animate-ping" />
            <span>New Arrivals Every Week</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.1] mb-6 whitespace-nowrap">
            Real Fits, <span className="italic font-normal text-[#F0D9DC]">Real You</span>
          </h1>

          <p className="max-w-xl mx-auto text-sm sm:text-base text-[#E8B9C1] font-normal leading-relaxed mb-8">
            Kurtis, 3-piece sets, co-ords, ponchos, and bangles — comfortable, everyday-priced, and delivered straight to your door across Bangladesh.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigateTo('shop', { category: 'all' })}
              className="w-full sm:w-auto px-8 py-4 bg-[#FDF4F1] text-[#241A1E] text-xs font-bold uppercase tracking-[0.2em] rounded-xs hover:bg-white hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Shop All Products</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigateTo('shop', { category: 'three-piece' })}
              className="w-full sm:w-auto px-8 py-4 bg-transparent border border-white/30 text-white text-xs font-semibold uppercase tracking-[0.2em] rounded-xs hover:bg-white/10 transition cursor-pointer"
            >
              <span>Shop 3-Piece Sets</span>
            </button>
          </div>

          {/* Key highlights bar below buttons */}
          <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-3 gap-4 text-[11px] text-[#C79AA3]">
            <div>
              <span className="font-semibold text-white block">Cash on Delivery</span>
              <span>All 64 Districts</span>
            </div>
            <div>
              <span className="font-semibold text-white block">Checked Before Dispatch</span>
              <span>Stitched in Dhaka</span>
            </div>
            <div>
              <span className="font-semibold text-white block">24-48h Delivery</span>
              <span>Inside Dhaka Hub</span>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          2. NEW ARRIVALS
         ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-[#F0D9DC]">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#C2607D] block">
              Just Arrived
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#241A1E] mt-1">
              New Arrivals
            </h2>
          </div>
          <button
            onClick={() => navigateTo('shop', { category: 'all', search: 'new' })}
            className="text-xs uppercase tracking-wider font-semibold text-[#241A1E] hover:text-[#C2607D] transition flex items-center gap-1 mt-2 sm:mt-0 cursor-pointer"
          >
            <span>Explore All New Pieces</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------------
          4. EDITORIAL CAMPAIGN
         ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-xl overflow-hidden bg-[#2E1E24] text-white border border-[#4A323A]">
          <div className="grid grid-cols-1 lg:grid-cols-2">

            <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center space-y-6">
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#C2607D]">
                Not Sure Where to Start?
              </span>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                Real Fits, Real You
              </h2>

              <p className="text-xs sm:text-sm text-[#E8B9C1] leading-relaxed">
                Every piece is checked by hand before it ships — soft, breathable fabric, prints that hold their colour, and fits made for how you actually move through your day.
              </p>

              <div className="pt-2 flex flex-wrap gap-4">
                <button
                  onClick={() => navigateTo('shop', { category: 'all' })}
                  className="px-6 py-3 bg-white text-[#241A1E] text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#FBE8E4] transition cursor-pointer"
                >
                  Shop the Collection
                </button>
                <button
                  onClick={() => setIsFragranceQuizOpen(true)}
                  className="px-6 py-3 bg-transparent border border-white/30 text-white text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-white/10 transition cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C2607D]" />
                  <span>Take the Style Finder</span>
                </button>
              </div>
            </div>

            <div className="relative min-h-[320px] lg:min-h-full">
              <img
                src={editorialTunicImg}
                alt="JARRO clothing"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          5. BEST SELLERS
         ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-[#F0D9DC]">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#C2607D] block">
              Loved Across Bangladesh
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#241A1E] mt-1">
              Best Sellers
            </h2>
          </div>
          <button
            onClick={() => navigateTo('shop', { category: 'all', search: 'bestseller' })}
            className="text-xs uppercase tracking-wider font-semibold text-[#241A1E] hover:text-[#C2607D] transition flex items-center gap-1 mt-2 sm:mt-0 cursor-pointer"
          >
            <span>View All Best Sellers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------------
          6. SHOP BY OCCASION
         ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FBE8E4] rounded-2xl p-6 sm:p-10 border border-[#F0D9DC]">

          <div className="max-w-2xl mb-8">
            <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#C2607D] block">
              Dress For The Moment
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-semibold text-[#241A1E] mt-1">
              Shop by Occasion
            </h2>
            <p className="text-xs text-[#8C6A72] mt-2">
              From everyday errands to Eid celebrations — find the right piece for what's on your calendar.
            </p>
          </div>

          {/* Occasion Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 pb-4 border-b border-[#EFC9CE]">
            {OCCASION_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedOccasion(tab.id)}
                className={`text-xs font-semibold py-2 px-4 rounded-full transition cursor-pointer ${
                  selectedOccasion === tab.id
                    ? 'bg-[#241A1E] text-white shadow-sm'
                    : 'bg-white text-[#241A1E] border border-[#EFC9CE] hover:border-[#241A1E]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(occasionProducts.length > 0 ? occasionProducts : products.slice(0, 3)).map((item) => (
              <div
                key={item.id}
                onClick={() => navigateTo('product-detail', { product: item })}
                className="bg-white rounded-xl p-5 border border-[#F0D9DC] hover:border-[#241A1E] transition duration-300 flex flex-col justify-between cursor-pointer group shadow-xs hover:shadow-md"
              >
                <div>
                  <div className="aspect-square rounded-lg overflow-hidden bg-[#FDF4F1] mb-4 relative">
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    {item.clothingSpecs && (
                      <span className="absolute top-2.5 left-2.5 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#241A1E] text-white rounded-xs">
                        {item.clothingSpecs.fabric}
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#C2607D] block">
                    {item.brand}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-[#241A1E] mt-0.5 group-hover:text-[#C2607D] transition">
                    {item.name}
                  </h3>
                  <p className="text-xs text-[#8C6A72] line-clamp-2 mt-1">
                    {item.subtitle}
                  </p>

                  {item.clothingSpecs && (
                    <div className="mt-4 pt-3 border-t border-[#F0D9DC]/80 text-[11px] space-y-1">
                      <div className="flex gap-1.5">
                        <span className="text-[#A8828A] w-14 shrink-0">Fit:</span>
                        <span className="text-[#241A1E] font-medium">{item.clothingSpecs.fit}</span>
                      </div>
                      <div className="flex gap-1.5">
                        <span className="text-[#A8828A] w-14 shrink-0">Pattern:</span>
                        <span className="text-[#241A1E] font-medium">{item.clothingSpecs.pattern}</span>
                      </div>
                      <div className="flex gap-1.5">
                        <span className="text-[#A8828A] w-14 shrink-0">Occasion:</span>
                        <span className="text-[#241A1E] font-medium">{item.clothingSpecs.occasion}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#F0D9DC] flex items-center justify-between">
                  <span className="text-sm font-bold text-[#241A1E]">
                    {formatBDT(item.price)}
                  </span>
                  <span className="text-xs font-medium text-[#C2607D] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* -------------------------------------------------------------
          7. FINISHING TOUCHES (Accessories cross-sell)
         ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-[#F0D9DC]">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#C2607D] block">
              Complete the Look
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#241A1E] mt-1">
              Finishing Touches
            </h2>
          </div>
          <button
            onClick={() => navigateTo('shop', { category: 'accessories' })}
            className="text-xs uppercase tracking-wider font-semibold text-[#241A1E] hover:text-[#C2607D] transition flex items-center gap-1 mt-2 sm:mt-0 cursor-pointer"
          >
            <span>Shop All Accessories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {accessoryProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------------
          8. COLLECTIONS SHOWCASE
         ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#C2607D] block">
            Shop by Collection
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#241A1E] mt-1">
            Our Collections
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {BRANDS_LIST.map((brand) => (
            <div
              key={brand.name}
              onClick={() => navigateTo('shop', { search: brand.name })}
              className="p-5 bg-white rounded-lg border border-[#F0D9DC] hover:border-[#241A1E] transition text-center cursor-pointer flex flex-col justify-center items-center shadow-2xs hover:shadow-xs"
            >
              <h4 className="font-serif text-base font-bold text-[#241A1E]">
                {brand.name}
              </h4>
              <span className="text-[10px] uppercase tracking-wider text-[#C2607D] mt-1">
                {brand.origin}
              </span>
              <p className="text-[10px] text-[#8C6A72] mt-2 line-clamp-1">
                {brand.focus}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------------
          9. STYLED BY JARRO (Visual Gallery)
         ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-md mx-auto mb-8">
          <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#C2607D] block">
            @jarro_bd
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#241A1E] mt-1">
            Styled by JARRO
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { img: galleryKurtiImg, caption: 'Emerald Palm Print Kurti' },
            { img: galleryThreePieceImg, caption: 'Powder Blue Floral 3-Piece' },
            { img: galleryCoOrdImg, caption: 'Rustic Terracotta Co-ord' },
            { img: galleryPonchoImg, caption: 'Cloud Grey Poncho Set' }
          ].map((item, idx) => (
            <div key={idx} className="group relative aspect-square rounded-lg overflow-hidden bg-[#FBE8E4] border border-[#F0D9DC]">
              <img
                src={item.img}
                alt={item.caption}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-[#241A1E]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3 text-center">
                <span className="text-xs font-serif text-white font-medium">
                  {item.caption}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
