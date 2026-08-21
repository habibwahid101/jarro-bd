import React from 'react';
import { Heart, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { ProductCard } from '../ProductCard';

export const WishlistView: React.FC = () => {
  const { wishlist, products, navigateTo, toggleWishlist } = useShop();

  const savedProducts = products.filter(p => wishlist.includes(p.id));

  if (savedProducts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-[#FBE8E4] flex items-center justify-center mx-auto mb-4 text-[#C79AA3]">
          <Heart className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#241A1E]">
          Your Saved Wishlist is Empty
        </h1>
        <p className="text-xs sm:text-sm text-[#8C6A72] max-w-md mx-auto mt-2 mb-8">
          Save your favorite kurtis, three-piece sets, co-ords, and accessories to review or order later.
        </p>
        <button
          onClick={() => navigateTo('shop', { category: 'all' })}
          className="px-8 py-3.5 bg-[#241A1E] text-white text-xs font-bold uppercase tracking-[0.2em] rounded hover:bg-[#3D2830] transition cursor-pointer"
        >
          Explore Boutique
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="border-b border-[#F0D9DC] pb-6 mb-8 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#C2607D] block">
            Client Curation
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#241A1E] mt-1">
            Saved Pieces ({savedProducts.length})
          </h1>
        </div>
        <button
          onClick={() => navigateTo('shop', { category: 'all' })}
          className="text-xs font-semibold uppercase tracking-wider text-[#241A1E] hover:text-[#C2607D] transition flex items-center gap-1 cursor-pointer"
        >
          <span>Continue Browsing</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {savedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};
