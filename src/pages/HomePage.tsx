import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Flame,
  Search,
  Star,
  Clock,
  ShieldCheck,
  Award,
  ChevronRight,
  Tag,
  Copy,
  Check,
} from 'lucide-react';
import { FoodItem, Category } from '../types/index.ts';
import { api } from '../services/api.ts';
import { FoodCard } from '../components/FoodCard.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { useCart } from '../context/CartContext.tsx';

interface HomePageProps {
  onNavigateToMenu: (categoryId?: string) => void;
  onOpenDetails: (food: FoodItem) => void;
  onOpenAI: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigateToMenu,
  onOpenDetails,
  onOpenAI,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const { applyCoupon, openCart } = useCart();
  const { success } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const [catRes, foodRes] = await Promise.all([
          api.getCategories(),
          api.getFoods({ availableOnly: false }),
        ]);
        setCategories(catRes.categories || []);
        setFoods(foodRes.foods || []);
      } catch (e) {
        console.error('Failed to load home data', e);
      }
      try {
        const favRes = await api.getFavorites();
        setFavorites(favRes.favorites || []);
      } catch {
        // guest
      }
    }
    load();
  }, []);

  const chefSpecials = foods.filter(f => f.isChefSpecial).slice(0, 4);
  const bestSellers = foods.filter(f => f.isBestSeller).slice(0, 4);

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    success('Coupon Copied!', `Use code ${code} at checkout for special discount.`);
    setTimeout(() => setCopiedCoupon(null), 3000);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigateToMenu();
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-4 p-8 sm:p-14 lg:p-18 shadow-2xl border border-stone-800">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            <span>Fast Express Food Delivery in 30 Mins</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-['Outfit'] leading-[1.08]">
            Savor Hot & Authentic Dishes Delivered Fast.
          </h1>

          <p className="text-base sm:text-lg text-stone-300 max-w-2xl leading-relaxed">
            From fragrant Dum Biryanis and wood-fired pizzas to crispy dosas and rich desserts. Powered by our culinary AI to discover meals tailored to your taste and budget.
          </p>

          {/* Quick Search & Actions */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-stone-400" />
              <input
                type="text"
                placeholder="Search biryani, pizza, dosa, burger..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onNavigateToMenu()}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-stone-800/80 border border-stone-700 text-sm text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500 backdrop-blur-md"
              />
            </div>
            <button
              onClick={() => onNavigateToMenu()}
              className="px-6 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition-all hover:scale-102 cursor-pointer"
            >
              <span>Explore Menu</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* AI Assistant Callout Pill */}
          <div className="pt-3">
            <button
              onClick={onOpenAI}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-stone-800/70 hover:bg-stone-800 border border-stone-700 text-xs text-stone-200 transition-all cursor-pointer group"
            >
              <Sparkles className="w-4 h-4 text-orange-400 group-hover:rotate-12 transition-transform" />
              <span>Not sure what to eat? Ask <strong className="text-orange-400">Foodie AI</strong> for smart recommendations</span>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            </button>
          </div>
        </div>
      </section>

      {/* Food Categories Carousel / Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-xs font-bold text-orange-600 uppercase tracking-widest">
              What are you craving today?
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-['Outfit'] mt-1">
              Popular Food Categories
            </h2>
          </div>
          <button
            onClick={() => onNavigateToMenu()}
            className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
          >
            <span>See All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => onNavigateToMenu(cat.id)}
              className="group p-3 rounded-2xl bg-white border border-stone-200/80 hover:border-orange-300 shadow-xs hover:shadow-md transition-all duration-200 text-center flex flex-col items-center cursor-pointer"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden mb-2.5 bg-stone-100 group-hover:scale-105 transition-transform duration-300">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-bold text-stone-800 group-hover:text-orange-600 transition-colors line-clamp-1">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Promotional Banners & Coupons */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-orange-600 to-amber-600 text-white relative overflow-hidden shadow-lg shadow-orange-600/20">
            <div className="relative z-10 space-y-3">
              <span className="px-2.5 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
                Flat 50% OFF
              </span>
              <h3 className="text-xl font-black font-['Outfit']">Save Big on Feasts</h3>
              <p className="text-xs text-orange-100">
                Get 50% off up to ₹150 on orders above ₹299.
              </p>
              <div className="pt-2 flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-white text-orange-600 font-mono font-bold text-xs tracking-wider">
                  FOODIE50
                </span>
                <button
                  onClick={() => handleCopyCoupon('FOODIE50')}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white cursor-pointer"
                  title="Copy coupon"
                >
                  {copiedCoupon === 'FOODIE50' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-br from-stone-900 to-stone-800 text-white relative overflow-hidden shadow-lg">
            <div className="relative z-10 space-y-3">
              <span className="px-2.5 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider text-amber-300">
                Weekend Treat
              </span>
              <h3 className="text-xl font-black font-['Outfit']">Flat ₹100 Discount</h3>
              <p className="text-xs text-stone-300">
                Flat ₹100 off on all delicious orders above ₹400.
              </p>
              <div className="pt-2 flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-amber-400 text-stone-900 font-mono font-bold text-xs tracking-wider">
                  TASTY100
                </span>
                <button
                  onClick={() => handleCopyCoupon('TASTY100')}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                  title="Copy coupon"
                >
                  {copiedCoupon === 'TASTY100' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-800 to-teal-900 text-white relative overflow-hidden shadow-lg">
            <div className="relative z-10 space-y-3">
              <span className="px-2.5 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
                New User Offer
              </span>
              <h3 className="text-xl font-black font-['Outfit']">20% Welcome Gift</h3>
              <p className="text-xs text-emerald-100">
                20% off on your first orders over ₹199.
              </p>
              <div className="pt-2 flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-white text-emerald-800 font-mono font-bold text-xs tracking-wider">
                  WELCOME20
                </span>
                <button
                  onClick={() => handleCopyCoupon('WELCOME20')}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white cursor-pointer"
                  title="Copy coupon"
                >
                  {copiedCoupon === 'WELCOME20' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chef Specials Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-xs font-bold text-orange-600 uppercase tracking-widest">
              Signature Kitchen Creations
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-['Outfit'] mt-1">
              Chef's Special Recommendations
            </h2>
          </div>
          <button
            onClick={() => onNavigateToMenu()}
            className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View Full Menu</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {chefSpecials.map(food => (
            <FoodCard
              key={food.id}
              food={food}
              onOpenDetails={onOpenDetails}
              isFavorite={favorites.includes(food.id)}
            />
          ))}
        </div>
      </section>

      {/* Interactive AI Recommendation Highlight Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-stone-900 text-white relative overflow-hidden border border-stone-800">
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Powered by Google Gemini</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-extrabold font-['Outfit']">
                Meet Foodie AI: Your Smart Menu Concierge
              </h3>
              <p className="text-stone-300 text-sm leading-relaxed">
                Whether you need a quick spicy dinner under ₹250, meals for 3 friends, or strictly pure vegetarian high-protein options, Foodie AI matches the exact dishes from our kitchen in seconds.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 rounded-lg bg-stone-800 text-xs text-stone-300 border border-stone-700">
                  "Dinner under ₹250"
                </span>
                <span className="px-3 py-1 rounded-lg bg-stone-800 text-xs text-stone-300 border border-stone-700">
                  "Extra spicy biryani"
                </span>
                <span className="px-3 py-1 rounded-lg bg-stone-800 text-xs text-stone-300 border border-stone-700">
                  "Desserts for 2 people"
                </span>
              </div>
            </div>

            <div className="shrink-0">
              <button
                onClick={onOpenAI}
                className="px-8 py-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black text-sm shadow-xl shadow-orange-600/30 flex items-center gap-3 transition-transform hover:scale-105 cursor-pointer"
              >
                <Sparkles className="w-5 h-5" />
                <span>Launch Foodie AI Assistant</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-xs font-bold text-orange-600 uppercase tracking-widest">
              Customer Favorites
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-['Outfit'] mt-1">
              Today's Most Ordered Dishes
            </h2>
          </div>
          <button
            onClick={() => onNavigateToMenu()}
            className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
          >
            <span>See All Bestsellers</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map(food => (
            <FoodCard
              key={food.id}
              food={food}
              onOpenDetails={onOpenDetails}
              isFavorite={favorites.includes(food.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
