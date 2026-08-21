import React, { useState } from 'react';
import { X, Sparkles, ArrowRight, RotateCcw, Check, ShoppingBag } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Product, ProductCategory } from '../types';

// Note: this component is still called FragranceQuizModal (and the
// isFragranceQuizOpen state it reads from ShopContext keeps that name too)
// since it's a straight content swap from the original Valent & Co.
// fragrance quiz — renaming the prop/file would touch several other files
// for no functional benefit. What it shows the visitor is now a JARRO
// "Style Finder" quiz, not a fragrance quiz.
export const FragranceQuizModal: React.FC = () => {
  const {
    isFragranceQuizOpen,
    setIsFragranceQuizOpen,
    products,
    navigateTo,
    addToCart,
    formatBDT
  } = useShop();

  const [step, setStep] = useState(1);
  const [selectedOccasion, setSelectedOccasion] = useState<string>('Everyday');
  const [selectedFit, setSelectedFit] = useState<string>('Relaxed');
  const [selectedColor, setSelectedColor] = useState<string>('Earthy Neutrals');

  if (!isFragranceQuizOpen) return null;

  const handleReset = () => {
    setStep(1);
    setSelectedOccasion('Everyday');
    setSelectedFit('Relaxed');
    setSelectedColor('Earthy Neutrals');
  };

  // Map the quiz answers to a category, then narrow by fit/pattern where possible.
  const occasionCategoryMap: Record<string, ProductCategory[]> = {
    'Everyday': ['kurtis', 'co-ords'],
    'Festive': ['three-piece', 'kurtis'],
    'Draped & Modest': ['ponchos', 'co-ords'],
  };

  const candidateCategories = occasionCategoryMap[selectedOccasion] || ['kurtis'];
  let candidates = products.filter(p => candidateCategories.includes(p.category));

  if (selectedFit && candidates.some(p => p.clothingSpecs?.fit.toLowerCase().includes(selectedFit.toLowerCase()))) {
    candidates = candidates.filter(p => p.clothingSpecs?.fit.toLowerCase().includes(selectedFit.toLowerCase()));
  }

  const colorKeywordMap: Record<string, string[]> = {
    'Earthy Neutrals': ['terracotta', 'ivory', 'grey', 'sky blue'],
    'Bold Florals': ['magenta', 'pink', 'palm'],
    'Soft Pastels': ['powder blue', 'ivory', 'blush'],
  };
  const keywords = colorKeywordMap[selectedColor] || [];
  const colorMatch = candidates.find(p => keywords.some(k => p.name.toLowerCase().includes(k)));

  const matchedProduct: Product = colorMatch || candidates[0] || products[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={() => setIsFragranceQuizOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative bg-[#FDF4F1] w-full max-w-xl rounded-xl shadow-2xl overflow-hidden border border-[#F0D9DC] p-6 sm:p-8 animate-in zoom-in-95 duration-200">

          <button
            onClick={() => setIsFragranceQuizOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full text-[#8C6A72] hover:text-[#241A1E] hover:bg-[#FBE8E4] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#241A1E] text-[#C2607D] mb-2">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-2xl font-semibold text-[#241A1E]">
              Find Your Perfect Fit
            </h3>
            <p className="text-xs text-[#8C6A72] mt-1">
              Answer 3 quick questions and we'll point you to a piece from our catalogue.
            </p>
          </div>

          {/* Step 1: Occasion */}
          {step === 1 && (
            <div className="space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C2607D] block text-center">
                Step 1 of 3: Occasion
              </span>
              <h4 className="text-base font-medium text-center text-[#241A1E]">
                What are you dressing for?
              </h4>

              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  { id: 'Everyday', label: 'Everyday Wear', desc: 'Errands, work, casual outings' },
                  { id: 'Festive', label: 'Festive & Celebrations', desc: 'Eid, weddings, dawats' },
                  { id: 'Draped & Modest', label: 'Draped & Modest', desc: 'Ponchos, layered co-ords' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedOccasion(item.id)}
                    className={`p-4 rounded-lg border text-left flex flex-col justify-between transition cursor-pointer ${
                      selectedOccasion === item.id
                        ? 'border-[#241A1E] bg-white ring-1 ring-[#241A1E] shadow-sm'
                        : 'border-[#EFC9CE] bg-[#FBE8E4]/50 hover:bg-[#FBE8E4]'
                    }`}
                  >
                    <span className="text-xs font-semibold text-[#241A1E]">{item.label}</span>
                    <span className="text-[10px] text-[#8C6A72] mt-2 leading-tight">{item.desc}</span>
                  </button>
                ))}
              </div>

              <div className="pt-6 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 bg-[#241A1E] text-white text-xs font-semibold uppercase tracking-wider rounded flex items-center gap-2 hover:bg-[#3D2830] transition cursor-pointer"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Fit preference */}
          {step === 2 && (
            <div className="space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C2607D] block text-center">
                Step 2 of 3: Fit
              </span>
              <h4 className="text-base font-medium text-center text-[#241A1E]">
                How do you like your fit?
              </h4>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  { id: 'Relaxed', title: 'Relaxed & Easy', desc: 'Room to move, comfortable all day.' },
                  { id: 'A-Line', title: 'A-Line & Structured', desc: 'A defined shape that still flows.' },
                  { id: 'Oversized', title: 'Oversized & Draped', desc: 'Loose, cape-like silhouettes.' },
                  { id: 'Straight', title: 'Straight Cut', desc: 'Clean lines, minimal fuss.' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedFit(item.id)}
                    className={`p-4 rounded-lg border text-left flex flex-col justify-between transition cursor-pointer ${
                      selectedFit === item.id
                        ? 'border-[#241A1E] bg-white ring-1 ring-[#241A1E] shadow-sm'
                        : 'border-[#EFC9CE] bg-[#FBE8E4]/50 hover:bg-[#FBE8E4]'
                    }`}
                  >
                    <span className="text-xs font-semibold text-[#241A1E]">{item.title}</span>
                    <span className="text-[10px] text-[#8C6A72] mt-1.5 leading-normal">{item.desc}</span>
                  </button>
                ))}
              </div>

              <div className="pt-6 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-[#8C6A72] hover:text-[#241A1E] underline cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 bg-[#241A1E] text-white text-xs font-semibold uppercase tracking-wider rounded flex items-center gap-2 hover:bg-[#3D2830] transition cursor-pointer"
                >
                  <span>Final Step</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Color preference */}
          {step === 3 && (
            <div className="space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C2607D] block text-center">
                Step 3 of 3: Colour & Print
              </span>
              <h4 className="text-base font-medium text-center text-[#241A1E]">
                What colours are you drawn to right now?
              </h4>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  { id: 'Earthy Neutrals', title: 'Earthy Neutrals', desc: 'Terracotta, ivory, grey, sky blue.' },
                  { id: 'Bold Florals', title: 'Bold Florals', desc: 'Magenta, pink, palm-leaf prints.' },
                  { id: 'Soft Pastels', title: 'Soft Pastels', desc: 'Powder blue, blush, ivory.' },
                  { id: 'Surprise Me', title: 'Surprise Me', desc: 'Show me a best seller.' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedColor(item.id)}
                    className={`p-4 rounded-lg border text-left flex flex-col justify-between transition cursor-pointer ${
                      selectedColor === item.id
                        ? 'border-[#241A1E] bg-white ring-1 ring-[#241A1E] shadow-sm'
                        : 'border-[#EFC9CE] bg-[#FBE8E4]/50 hover:bg-[#FBE8E4]'
                    }`}
                  >
                    <span className="text-xs font-semibold text-[#241A1E]">{item.title}</span>
                    <span className="text-[10px] text-[#8C6A72] mt-1.5 leading-normal">{item.desc}</span>
                  </button>
                ))}
              </div>

              <div className="pt-6 flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="text-xs text-[#8C6A72] hover:text-[#241A1E] underline cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="px-6 py-2.5 bg-[#C2607D] text-white text-xs font-bold uppercase tracking-wider rounded flex items-center gap-2 hover:bg-[#9E4560] transition cursor-pointer shadow-md"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Reveal My Match</span>
                </button>
              </div>
            </div>
          )}

          {/* Result: Match Reveal */}
          {step === 4 && matchedProduct && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center">
                <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#C2607D] bg-[#C2607D]/10 px-3 py-1 rounded-full inline-block">
                  Your Match
                </span>
                <h4 className="font-serif text-2xl font-semibold text-[#241A1E] mt-2">
                  A Piece For You
                </h4>
              </div>

              <div className="p-4 bg-white rounded-xl border border-[#F0D9DC] flex flex-col sm:flex-row gap-4 items-center">
                <img
                  src={matchedProduct.images[0]}
                  alt={matchedProduct.name}
                  className="w-28 h-36 object-cover rounded-lg bg-[#FBE8E4] shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 space-y-1.5 text-center sm:text-left">
                  <span className="text-[10px] uppercase tracking-wider text-[#C2607D] font-bold block">
                    {matchedProduct.brand}
                  </span>
                  <h5 className="font-serif text-lg font-bold text-[#241A1E]">
                    {matchedProduct.name}
                  </h5>
                  <p className="text-xs text-[#8C6A72] line-clamp-2">
                    {matchedProduct.subtitle}
                  </p>

                  {matchedProduct.clothingSpecs && (
                    <div className="text-[11px] text-[#4A2E36] pt-1">
                      <strong>Fabric:</strong> {matchedProduct.clothingSpecs.fabric} · <strong>Fit:</strong> {matchedProduct.clothingSpecs.fit}
                    </div>
                  )}

                  <div className="text-base font-bold text-[#241A1E] pt-1">
                    {formatBDT(matchedProduct.price)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    addToCart(matchedProduct, matchedProduct.variants[0], 1);
                    setIsFragranceQuizOpen(false);
                  }}
                  className="py-3 bg-[#241A1E] text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-[#3D2830] transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag</span>
                </button>

                <button
                  onClick={() => {
                    setIsFragranceQuizOpen(false);
                    navigateTo('product-detail', { product: matchedProduct });
                  }}
                  className="py-3 bg-white border border-[#EFC9CE] text-[#241A1E] text-xs font-semibold uppercase tracking-wider rounded hover:bg-[#FBE8E4] transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={handleReset}
                  className="text-xs text-[#8C6A72] hover:text-[#241A1E] inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Style Finder</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
