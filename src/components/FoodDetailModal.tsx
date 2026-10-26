import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  Clock,
  Flame,
  Plus,
  Minus,
  AlertTriangle,
  Sparkles,
  ShoppingBag,
  MessageSquare,
  Send,
} from 'lucide-react';
import { FoodItem } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { api } from '../services/api.ts';

interface FoodDetailModalProps {
  food: FoodItem | null;
  onClose: () => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({ food, onClose }) => {
  const { addItem, getItemQuantity, updateQuantity } = useCart();
  const { user, openAuthModal } = useAuth();
  const { success, error } = useToast();
  const [activeFood, setActiveFood] = useState<FoodItem | null>(food);
  const [instructions, setInstructions] = useState('');
  const [selectedQty, setSelectedQty] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    setActiveFood(food);
  }, [food]);

  if (!activeFood) return null;

  const currentCartQty = getItemQuantity(activeFood.id);

  const handleAdd = () => {
    if (!activeFood.available) return;
    addItem(activeFood, selectedQty, instructions.trim() || undefined);
    onClose();
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await api.addFoodReview(activeFood.id, reviewRating, reviewComment.trim());
      setActiveFood(res.food);
      setReviewComment('');
      success('Review Submitted', 'Thank you for your rating!');
    } catch (err: any) {
      error('Failed to submit review', err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-200 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-stone-900/70 hover:bg-stone-900 text-white flex items-center justify-center transition-colors shadow-md cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          {/* Header Image */}
          <div className="relative aspect-[16/9] w-full bg-stone-100">
            <img
              src={activeFood.imageUrl}
              alt={activeFood.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

            <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  {activeFood.vegetarian ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      100% Pure Veg
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-700 text-white flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      Non-Vegetarian
                    </span>
                  )}
                  {activeFood.isBestSeller && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-stone-950 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 fill-stone-950" />
                      Bestseller
                    </span>
                  )}
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
                  {activeFood.name}
                </h2>
              </div>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-6 space-y-6">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-4 gap-3 py-3 px-4 rounded-2xl bg-stone-50 border border-stone-200 text-center">
              <div>
                <div className="text-[11px] text-stone-400 uppercase font-semibold">Price</div>
                <div className="text-lg font-black text-stone-900">₹{activeFood.price}</div>
              </div>
              <div className="border-l border-stone-200">
                <div className="text-[11px] text-stone-400 uppercase font-semibold">Rating</div>
                <div className="text-sm font-bold text-amber-600 flex items-center justify-center gap-1 mt-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{activeFood.rating.toFixed(1)}</span>
                  <span className="text-[10px] text-stone-400">({activeFood.reviewsCount})</span>
                </div>
              </div>
              <div className="border-l border-stone-200">
                <div className="text-[11px] text-stone-400 uppercase font-semibold">Prep Time</div>
                <div className="text-sm font-bold text-stone-800 flex items-center justify-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-orange-500" />
                  <span>{activeFood.preparationTime}m</span>
                </div>
              </div>
              <div className="border-l border-stone-200">
                <div className="text-[11px] text-stone-400 uppercase font-semibold">Spice</div>
                <div className="text-sm font-bold text-stone-800 flex items-center justify-center gap-1 mt-0.5">
                  <Flame className="w-3.5 h-3.5 text-rose-500" />
                  <span className="truncate">{activeFood.spiceLevel}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                About this dish
              </h4>
              <p className="text-sm text-stone-600 leading-relaxed">
                {activeFood.description}
              </p>
            </div>

            {/* Ingredients */}
            {activeFood.ingredients && activeFood.ingredients.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                  Key Ingredients
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeFood.ingredients.map((ing, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-800 text-xs font-medium border border-orange-200/60"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Allergens warning */}
            {activeFood.allergens && activeFood.allergens.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Contains Allergens: </span>
                  <span>{activeFood.allergens.join(', ')}.</span>
                  <div className="text-[11px] text-amber-700/80 mt-0.5">
                    Our kitchens handle dairy, gluten, and nuts. Contact staff for severe allergies.
                  </div>
                </div>
              </div>
            )}

            {/* Special cooking instructions */}
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                Special Instructions (Optional)
              </label>
              <input
                type="text"
                placeholder="E.g., Less spicy, extra sauce on the side, no onions"
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                maxLength={120}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-stone-50/50"
              />
            </div>

            {/* Customer Reviews Section */}
            <div className="pt-4 border-t border-stone-200 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-orange-600" />
                  <span>Customer Reviews & Ratings ({activeFood.reviewsCount})</span>
                </h4>
              </div>

              {/* Review Submission Form */}
              <form onSubmit={handleReviewSubmit} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-700">Rate this dish:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1 text-stone-300 hover:text-amber-400 cursor-pointer transition-colors"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            reviewRating >= star ? 'text-amber-400 fill-amber-400' : 'text-stone-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Share your taste experience..."
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  />
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3 h-3" />
                    <span>{submittingReview ? 'Posting...' : 'Review'}</span>
                  </button>
                </div>
              </form>

              {/* Existing Reviews List */}
              {activeFood.reviews && activeFood.reviews.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {activeFood.reviews.map(r => (
                    <div key={r.id} className="p-3 rounded-xl bg-white border border-stone-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900">{r.userName}</span>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-stone-600">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="p-5 border-t border-stone-200 bg-stone-50 flex items-center justify-between gap-4">
          {/* Quantity Selector */}
          <div className="flex items-center gap-3 bg-white border border-stone-200 rounded-2xl px-3 py-1.5 shadow-xs">
            <span className="text-xs text-stone-500 font-medium">Qty:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}
                className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-sm font-bold w-5 text-center text-stone-900">
                {selectedQty}
              </span>
              <button
                onClick={() => setSelectedQty(selectedQty + 1)}
                className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Add to Cart button */}
          <button
            onClick={handleAdd}
            disabled={!activeFood.available}
            className={`flex-1 py-3 px-6 rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeFood.available
                ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/30 active:scale-98'
                : 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>
              {activeFood.available
                ? `Add ${selectedQty} to Cart • ₹${activeFood.price * selectedQty}`
                : 'Currently Unavailable'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
