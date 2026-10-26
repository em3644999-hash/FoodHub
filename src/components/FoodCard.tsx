import React, { useState } from 'react';
import { Star, Clock, Flame, Plus, Minus, Heart, Sparkles } from 'lucide-react';
import { FoodItem } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { useToast } from '../context/ToastContext.tsx';

interface FoodCardProps {
  food: FoodItem;
  onOpenDetails: (food: FoodItem) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (foodId: string) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({
  food,
  onOpenDetails,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const { addItem, updateQuantity, getItemQuantity } = useCart();
  const { user, openAuthModal } = useAuth();
  const { error } = useToast();
  const [favoriteLocal, setFavoriteLocal] = useState(isFavorite);
  const [imgLoaded, setImgLoaded] = useState(false);

  const quantity = getItemQuantity(food.id);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      openAuthModal('login');
      return;
    }
    try {
      const next = !favoriteLocal;
      setFavoriteLocal(next);
      await api.toggleFavorite(food.id);
      if (onToggleFavorite) onToggleFavorite(food.id);
    } catch (err: any) {
      setFavoriteLocal(!favoriteLocal);
      error('Could not update favorites', err.message);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!food.available) return;
    addItem(food, 1);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(food.id, quantity + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(food.id, quantity - 1);
  };

  return (
    <div
      onClick={() => onOpenDetails(food)}
      className="group bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-xs hover:shadow-xl hover:border-orange-200 transition-all duration-300 flex flex-col cursor-pointer relative"
    >
      {/* Top Media Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
        {!imgLoaded && (
          <div className="absolute inset-0 bg-stone-200 animate-pulse" />
        )}
        <img
          src={food.imageUrl}
          alt={food.name}
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
        />

        {/* Gradient Overlay for badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent opacity-60" />

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-stone-700 hover:text-rose-500 shadow-md transition-transform hover:scale-110 cursor-pointer z-10"
          aria-label="Add to favorites"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              favoriteLocal ? 'text-rose-500 fill-rose-500' : ''
            }`}
          />
        </button>

        {/* Badges: Best Seller & Chef Special */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {food.isBestSeller && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-stone-950 uppercase tracking-wider shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3 fill-stone-950" />
              Bestseller
            </span>
          )}
          {food.isChefSpecial && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-600 text-white uppercase tracking-wider shadow-sm">
              Chef's Special
            </span>
          )}
        </div>

        {/* Sold out overlay */}
        {!food.available && (
          <div className="absolute inset-0 bg-stone-900/75 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="px-3.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-md">
              Sold Out for Today
            </span>
          </div>
        )}

        {/* Prep Time & Rating Badges */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-white font-medium z-10">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-900/80 backdrop-blur-xs">
            <Clock className="w-3 h-3 text-orange-400" />
            <span>{food.preparationTime} mins</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-900/80 backdrop-blur-xs">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="font-semibold">{food.rating.toFixed(1)}</span>
            <span className="text-stone-300 text-[10px]">({food.reviewsCount})</span>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Veg / Non-Veg Indicator and Spice Level */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5">
              {food.vegetarian ? (
                <span className="w-4 h-4 rounded-sm border border-emerald-600 flex items-center justify-center p-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                </span>
              ) : (
                <span className="w-4 h-4 rounded-sm border border-rose-700 flex items-center justify-center p-0.5">
                  <span className="w-2 h-2 rounded-full bg-rose-700" />
                </span>
              )}
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                {food.vegetarian ? 'Pure Veg' : 'Non-Veg'}
              </span>
            </div>

            {/* Spice indicator */}
            <div className="flex items-center gap-0.5 text-[11px] text-stone-500">
              <Flame
                className={`w-3.5 h-3.5 ${
                  food.spiceLevel === 'Hot' || food.spiceLevel === 'Extra Hot'
                    ? 'text-rose-500 fill-rose-500'
                    : food.spiceLevel === 'Medium'
                    ? 'text-amber-500 fill-amber-500'
                    : 'text-stone-300'
                }`}
              />
              <span className="capitalize">{food.spiceLevel}</span>
            </div>
          </div>

          {/* Dish Name */}
          <h3 className="text-base font-bold text-stone-900 group-hover:text-orange-600 transition-colors line-clamp-1 font-['Outfit']">
            {food.name}
          </h3>

          {/* Description */}
          <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
            {food.description}
          </p>
        </div>

        {/* Pricing and Cart Actions */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400">Price</span>
            <div className="text-lg font-black text-stone-900 leading-tight">
              ₹{food.price}
            </div>
          </div>

          {/* Add / Stepper Button */}
          {quantity > 0 ? (
            <div
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-2 bg-orange-600 text-white rounded-xl px-2 py-1 shadow-md shadow-orange-600/20"
            >
              <button
                onClick={handleDecrement}
                className="w-6 h-6 rounded-lg bg-orange-700 hover:bg-orange-800 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-bold w-4 text-center">{quantity}</span>
              <button
                onClick={handleIncrement}
                className="w-6 h-6 rounded-lg bg-orange-700 hover:bg-orange-800 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={!food.available}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                food.available
                  ? 'bg-orange-50 hover:bg-orange-600 text-orange-600 hover:text-white border border-orange-200 hover:border-orange-600 hover:shadow-md'
                  : 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
