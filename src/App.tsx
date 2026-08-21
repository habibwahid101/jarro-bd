/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, Suspense, lazy } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { QuickViewModal } from './components/QuickViewModal';
import { FragranceQuizModal } from './components/FragranceQuizModal';
import { MobileMenuDrawer } from './components/MobileMenuDrawer';

// Views
// Home/Shop are eager (the first thing almost every visitor sees).
// Everything else is route-split via React.lazy so its code — and, for
// AdminView, the Cognito sign-in SDK it pulls in — is only downloaded by
// visitors who actually navigate there, instead of shipping in everyone's
// initial bundle.
import { HomeView } from './components/views/HomeView';
import { ShopView } from './components/views/ShopView';
import { AdminGate } from './components/AdminGate';

const ProductDetailView = lazy(() =>
  import('./components/views/ProductDetailView').then((m) => ({ default: m.ProductDetailView }))
);
const CartView = lazy(() =>
  import('./components/views/CartView').then((m) => ({ default: m.CartView }))
);
const CheckoutView = lazy(() =>
  import('./components/views/CheckoutView').then((m) => ({ default: m.CheckoutView }))
);
const OrderSuccessView = lazy(() =>
  import('./components/views/OrderSuccessView').then((m) => ({ default: m.OrderSuccessView }))
);
const OrderLookupView = lazy(() =>
  import('./components/views/OrderLookupView').then((m) => ({ default: m.OrderLookupView }))
);
const WishlistView = lazy(() =>
  import('./components/views/WishlistView').then((m) => ({ default: m.WishlistView }))
);
const AdminView = lazy(() =>
  import('./components/views/AdminView').then((m) => ({ default: m.AdminView }))
);

const ViewLoadingFallback: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-[#F0D9DC] border-t-[#241A1E] rounded-full animate-spin" />
  </div>
);

// Floating WhatsApp concierge
import { MessageCircle } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeView } = useShop();

  // Scroll to top when activeView changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeView]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF4F1] text-[#241A1E] selection:bg-[#C2607D] selection:text-white">
      
      {/* Header (Hidden when inside Admin portal for dedicated back-office screen) */}
      {activeView !== 'admin' && <Header />}

      {/* Main View Switcher */}
      <main className="flex-1">
        {activeView === 'home' && <HomeView />}
        {activeView === 'shop' && <ShopView />}
        <Suspense fallback={<ViewLoadingFallback />}>
          {activeView === 'product-detail' && <ProductDetailView />}
          {activeView === 'cart' && <CartView />}
          {activeView === 'checkout' && <CheckoutView />}
          {activeView === 'order-success' && <OrderSuccessView />}
          {activeView === 'order-lookup' && <OrderLookupView />}
          {activeView === 'wishlist' && <WishlistView />}
          {activeView === 'admin' && <AdminGate><AdminView /></AdminGate>}
        </Suspense>
      </main>

      {/* Footer (Hidden inside Admin view) */}
      {activeView !== 'admin' && <Footer />}

      {/* Slide-over Drawers & Interactive Overlays */}
      {activeView !== 'admin' && <MobileMenuDrawer />}
      <CartDrawer />
      <QuickViewModal />
      <FragranceQuizModal />

      {/* Floating WhatsApp Concierge Button */}
      {activeView !== 'admin' && (
        <aside
          aria-label="Direct WhatsApp Chat"
          className="fixed bottom-6 right-6 z-40"
        >
          <a
            id="whatsapp-concierge-float"
            // TODO: replace with JARRO's real WhatsApp number (currently a placeholder).
            href="https://wa.me/8801000000000?text=Hello%20JARRO%2C%20I%20would%20like%20assistance%20with%20an%20order."
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2.5 bg-[#25D366] hover:bg-[#1fb857] text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            title="Chat with JARRO on WhatsApp"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline whitespace-nowrap">
              WhatsApp Us
            </span>
          </a>
        </aside>
      )}

    </div>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <MainLayout />
    </ShopProvider>
  );
}
