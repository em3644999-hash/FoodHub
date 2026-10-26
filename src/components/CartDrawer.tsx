import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Tag,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';

interface CartDrawerProps {
  onNavigateToCheckout: () => void;
  onNavigateToMenu: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onNavigateToCheckout,
  onNavigateToMenu,
}) => {
  const {
    items,
    itemCount,
    subtotal,
    deliveryFee,
    tax,
    discount,
    total,
    appliedCoupon,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    await applyCoupon(code);
    setCouponLoading(false);
    setCouponInput('');
  };

  const handleProceed = () => {
    closeCart();
    onNavigateToCheckout();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-stone-900 text-lg font-['Outfit']">
                  Your Order
                </h3>
                <span className="text-xs text-stone-500">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'} in cart
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="p-2 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                  title="Clear entire cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={closeCart}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Clear Cart Confirmation Dialog */}
          {showClearConfirm && (
            <div className="p-4 bg-rose-50 border-b border-rose-200 flex items-center justify-between text-xs">
              <span className="text-rose-900 font-medium">Remove all items from your cart?</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    clearCart();
                    setShowClearConfirm(false);
                  }}
                  className="px-2.5 py-1 bg-rose-600 text-white rounded-md font-semibold cursor-pointer"
                >
                  Yes, Clear
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-2.5 py-1 bg-white border border-stone-300 text-stone-700 rounded-md cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Cart Items List or Empty State */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-full bg-orange-50 text-orange-400 flex items-center justify-center">
                  <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-stone-800">Your cart is hungry!</h4>
                  <p className="text-xs text-stone-500 max-w-xs mt-1">
                    Good food is always just a few clicks away. Explore our chef specials and mouth-watering meals.
                  </p>
                </div>
                <button
                  onClick={() => {
                    closeCart();
                    onNavigateToMenu();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs shadow-md shadow-orange-600/20 cursor-pointer"
                >
                  Explore Delicious Menu
                </button>
              </div>
            ) : (
              <>
                {/* Items */}
                <div className="space-y-3">
                  {items.map(item => (
                    <div
                      key={item.foodItem.id}
                      className="flex items-center gap-3 p-3 rounded-2xl border border-stone-200/80 bg-stone-50/50 hover:bg-white transition-colors"
                    >
                      <img
                        src={item.foodItem.imageUrl}
                        alt={item.foodItem.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {item.foodItem.vegetarian ? (
                            <span className="w-3 h-3 rounded-xs border border-emerald-600 flex items-center justify-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            </span>
                          ) : (
                            <span className="w-3 h-3 rounded-xs border border-rose-700 flex items-center justify-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-700" />
                            </span>
                          )}
                          <h4 className="text-xs font-bold text-stone-900 truncate">
                            {item.foodItem.name}
                          </h4>
                        </div>
                        <div className="text-xs font-black text-stone-900 mt-1">
                          ₹{item.foodItem.price * item.quantity}
                          {item.quantity > 1 && (
                            <span className="text-[10px] text-stone-400 font-normal ml-1">
                              (₹{item.foodItem.price} each)
                            </span>
                          )}
                        </div>
                        {item.specialInstructions && (
                          <div className="text-[10px] text-stone-400 italic truncate mt-0.5">
                            Note: {item.specialInstructions}
                          </div>
                        )}
                      </div>

                      {/* Stepper */}
                      <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-xl px-2 py-1 shadow-xs">
                        <button
                          onClick={() => updateQuantity(item.foodItem.id, item.quantity - 1)}
                          className="w-5 h-5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center text-xs cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.foodItem.id, item.quantity + 1)}
                          className="w-5 h-5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center text-xs cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Free Delivery Goal Bar */}
                <div className="p-3 rounded-xl bg-orange-50 border border-orange-200/60 text-xs">
                  {subtotal >= 400 ? (
                    <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Congratulations! You unlocked FREE Delivery!</span>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between text-stone-700 font-medium mb-1">
                        <span>Add ₹{400 - subtotal} more for FREE delivery</span>
                        <span>{Math.round((subtotal / 400) * 100)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-orange-200/80 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-600 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (subtotal / 400) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Coupon Code Section */}
                <div className="space-y-2 pt-2 border-t border-stone-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-orange-600" />
                      Coupons & Offers
                    </span>
                  </div>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                      <div>
                        <div className="font-bold text-emerald-900 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{appliedCoupon.code} Applied</span>
                        </div>
                        <div className="text-[11px] text-emerald-700">
                          {appliedCoupon.description}
                        </div>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponInput}
                        onChange={e => setCouponInput(e.target.value.toUpperCase())}
                        className="flex-1 px-3 py-2 rounded-xl border border-stone-200 text-xs uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <button
                        onClick={() => handleApplyCoupon()}
                        disabled={couponLoading || !couponInput.trim()}
                        className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 disabled:opacity-50 cursor-pointer"
                      >
                        {couponLoading ? 'Checking...' : 'Apply'}
                      </button>
                    </div>
                  )}

                  {/* Quick Coupon Chips */}
                  {!appliedCoupon && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <button
                        onClick={() => handleApplyCoupon('FOODIE50')}
                        className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-orange-50 hover:border-orange-200 border border-stone-200 text-[11px] font-semibold text-stone-700 hover:text-orange-600 cursor-pointer"
                      >
                        ⚡ FOODIE50 (50% off)
                      </button>
                      <button
                        onClick={() => handleApplyCoupon('TASTY100')}
                        className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-orange-50 hover:border-orange-200 border border-stone-200 text-[11px] font-semibold text-stone-700 hover:text-orange-600 cursor-pointer"
                      >
                        🔥 TASTY100 (₹100 off)
                      </button>
                      <button
                        onClick={() => handleApplyCoupon('WELCOME20')}
                        className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-orange-50 hover:border-orange-200 border border-stone-200 text-[11px] font-semibold text-stone-700 hover:text-orange-600 cursor-pointer"
                      >
                        🎉 WELCOME20 (20% off)
                      </button>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 pt-3 border-t border-stone-100 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount ({appliedCoupon?.code})</span>
                      <span>-₹{discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-stone-600">
                    <span>Delivery Fee</span>
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-600 font-semibold uppercase text-[11px]">
                        FREE
                      </span>
                    ) : (
                      <span>₹{deliveryFee.toFixed(2)}</span>
                    )}
                  </div>

                  <div className="flex justify-between text-stone-600">
                    <span>Govt Taxes & Packaging (5% GST)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>

                  <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline font-bold text-base text-stone-900">
                    <span>To Pay</span>
                    <span className="text-xl font-black text-orange-600">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer CTA */}
          {items.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-stone-50">
              <button
                onClick={handleProceed}
                className="w-full py-3.5 px-6 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm shadow-lg shadow-orange-600/30 flex items-center justify-between transition-all cursor-pointer hover:scale-101 active:scale-99"
              >
                <div className="text-left">
                  <div className="text-[11px] uppercase tracking-wider text-orange-100 font-medium">
                    Total Payable
                  </div>
                  <div className="text-base font-black">₹{total.toFixed(2)}</div>
                </div>
                <div className="flex items-center gap-1.5 font-bold">
                  <span>Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
