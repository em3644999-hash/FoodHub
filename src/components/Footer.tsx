import React from 'react';
import { UtensilsCrossed, Heart, ShieldCheck, Clock, Award, Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC<{ setCurrentTab: (tab: string) => void }> = ({ setCurrentTab }) => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Props Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-stone-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-orange-950/80 border border-orange-800/40 text-orange-400 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">30 Mins Express</div>
              <div className="text-xs text-stone-400">Piping hot delivery to your door</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-800/40 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">100% Hygienic</div>
              <div className="text-xs text-stone-400">FSSAI certified commercial kitchens</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-800/40 text-amber-400 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">Master Chefs</div>
              <div className="text-xs text-stone-400">Authentic regional recipes</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-800/40 text-purple-400 flex items-center justify-center shrink-0">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">Live Order Tracking</div>
              <div className="text-xs text-stone-400">Real-time status updates</div>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white font-['Outfit']">
                Foodie<span className="text-orange-500">Hub</span>
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              FoodieHub brings signature Indian delicacies, stone-baked pizzas, juicy burgers, and artisan desserts straight from our kitchens to your table. Powered by modern AI culinary guidance.
            </p>
            <div className="flex items-center gap-2 text-xs text-stone-400 pt-1">
              <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
              <span>Indiranagar 100ft Road, Bengaluru, Karnataka</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase text-[11px]">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <button
                  onClick={() => setCurrentTab('menu')}
                  className="hover:text-orange-400 transition-colors cursor-pointer"
                >
                  All Food Items & Specials
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('menu')}
                  className="hover:text-orange-400 transition-colors cursor-pointer"
                >
                  Pure Vegetarian Delights
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('menu')}
                  className="hover:text-orange-400 transition-colors cursor-pointer"
                >
                  Authentic Biryani & Rice
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('orders')}
                  className="hover:text-orange-400 transition-colors cursor-pointer"
                >
                  Track Recent Order
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase text-[11px]">
              Support & Help
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-orange-400" />
                <span>+91 (080) 4123-9000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-orange-400" />
                <span>support@foodiehub.local</span>
              </li>
              <li>Operating Hours: 08:00 AM – 11:30 PM</li>
              <li>College Mini Project Demo Specification</li>
            </ul>
          </div>

          {/* Demonstration Notice */}
          <div className="bg-stone-800/60 p-4 rounded-2xl border border-stone-800">
            <h4 className="text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
              Academic & Live Demo
            </h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              This system features full end-to-end ordering, server-side price recalculation, order state machine tracking, admin order management, and Gemini-powered recommendations.
            </p>
            <div className="mt-3 text-[11px] text-stone-400">
              Admin: <code className="bg-stone-900 px-1 py-0.5 rounded text-amber-300">admin@foodiehub.com</code> / <code className="bg-stone-900 px-1 py-0.5 rounded text-amber-300">admin123</code>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <div>
            &copy; {new Date().getFullYear()} FoodieHub Technologies Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-1 text-stone-400">
            Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for delicious food experiences
          </div>
        </div>
      </div>
    </footer>
  );
};
