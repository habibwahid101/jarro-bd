import React from 'react';
import {
  ShieldCheck,
  Truck,
  RefreshCw,
  Phone,
  MessageCircle,
  Clock,
  MapPin,
  Mail
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const Footer: React.FC = () => {
  const { navigateTo } = useShop();

  return (
    <footer className="bg-[#251821] text-[#FDF4F1] border-t border-[#3D2830]">
      {/* Brand Trust Strip */}
      <div className="border-b border-[#3D2830] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#35232A] border border-[#4A323A] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#C2607D]" />
            </div>
            <div>
              <h4 className="font-serif text-base font-semibold tracking-wide text-white">
                Authenticity & Craft
              </h4>
              <p className="text-xs text-[#C79AA3] mt-1 leading-relaxed">
                Every kurti, 3-piece set, and co-ord is checked by hand before it ships — real fits, real fabric, real you.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#35232A] border border-[#4A323A] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-[#C2607D]" />
            </div>
            <div>
              <h4 className="font-serif text-base font-semibold tracking-wide text-white">
                Express Nationwide Delivery
              </h4>
              <p className="text-xs text-[#C79AA3] mt-1 leading-relaxed">
                24-48 hour delivery inside Dhaka; 2-3 days across all 64 districts with secure courier handling.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#35232A] border border-[#4A323A] flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5 text-[#C2607D]" />
            </div>
            <div>
              <h4 className="font-serif text-base font-semibold tracking-wide text-white">
                Cash on Delivery (COD)
              </h4>
              <p className="text-xs text-[#C79AA3] mt-1 leading-relaxed">
                Pay with complete peace of mind at your doorstep upon receiving your luxury package.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#35232A] border border-[#4A323A] flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-[#C2607D]" />
            </div>
            <div>
              <h4 className="font-serif text-base font-semibold tracking-wide text-white">
                Direct WhatsApp Concierge
              </h4>
              <p className="text-xs text-[#C79AA3] mt-1 leading-relaxed">
                Sizing questions, fit advice, or styling help — message us directly on WhatsApp.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto py-14 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <span className="font-serif text-2xl tracking-[0.2em] font-semibold text-white block uppercase">
              JARRO
            </span>
            <p className="text-xs text-[#C79AA3] leading-relaxed max-w-sm">
              Real fits, real you. A Dhaka-based women's clothing label — kurtis, 3-piece sets, co-ords, ponchos and bangles, priced for everyday wear.
            </p>

            <div className="pt-2 space-y-2 text-xs text-[#EFC9CE]">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C2607D]" />
                <span>Dhaka, Bangladesh</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C2607D]" />
                <span>+880 1823-885515 (WhatsApp & Phone)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C2607D]" />
                <span>hello@jarrobd.com</span>
              </div>
            </div>
          </div>

          {/* Col 2: The Collections */}
          <div>
            <h5 className="font-serif text-sm font-semibold tracking-wider text-white uppercase mb-4">
              Collections
            </h5>
            <ul className="space-y-2.5 text-xs text-[#C79AA3]">
              <li>
                <button
                  onClick={() => navigateTo('shop', { category: 'kurtis' })}
                  className="hover:text-white transition cursor-pointer"
                >
                  Kurtis & Tunics
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('shop', { category: 'three-piece' })}
                  className="hover:text-white transition cursor-pointer"
                >
                  3-Piece Sets
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('shop', { category: 'co-ords' })}
                  className="hover:text-white transition cursor-pointer"
                >
                  Co-ord Sets
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('shop', { category: 'ponchos' })}
                  className="hover:text-white transition cursor-pointer"
                >
                  Ponchos & Capes
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('shop', { category: 'accessories' })}
                  className="hover:text-white transition cursor-pointer"
                >
                  Bangles & Accessories
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Client Experience */}
          <div>
            <h5 className="font-serif text-sm font-semibold tracking-wider text-white uppercase mb-4">
              Client Service
            </h5>
            <ul className="space-y-2.5 text-xs text-[#C79AA3]">
              <li>
                <button 
                  onClick={() => navigateTo('order-lookup')} 
                  className="hover:text-white transition cursor-pointer flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5 text-[#C2607D]" />
                  <span>Track Your Order</span>
                </button>
              </li>
              <li>
                <span className="text-[#C79AA3]">Cash on Delivery Coverage</span>
              </li>
              <li>
                <span className="text-[#C79AA3]">Gift Packaging & Cards</span>
              </li>
              <li>
                <span className="text-[#C79AA3]">Care & Maintenance Guides</span>
              </li>
              <li>
                <span className="text-[#C79AA3]">Authenticity Guarantee</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Quick Admin & Direct WhatsApp */}
          <div>
            <h5 className="font-serif text-sm font-semibold tracking-wider text-white uppercase mb-4">
              Direct Contact
            </h5>
            <p className="text-xs text-[#C79AA3] mb-4 leading-relaxed">
              Need help placing an order or picking a size? Message us directly on WhatsApp.
            </p>
            <a
              href="https://wa.me/8801823885515?text=Hello%20JARRO%2C%20I%20would%20like%20to%20inquire%20about%20a%20product."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] px-3.5 py-2 rounded-lg text-xs font-medium hover:bg-[#25D366]/30 transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Us</span>
            </a>
          </div>

        </div>

        {/* Bottom Legal bar */}
        <div className="mt-12 pt-6 border-t border-[#3D2830] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#8A6E74]">
          <p>© {new Date().getFullYear()} JARRO. All rights reserved. Dhaka, Bangladesh.</p>
          <div className="flex items-center gap-6 mt-3 sm:mt-0">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>COD Delivery Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
