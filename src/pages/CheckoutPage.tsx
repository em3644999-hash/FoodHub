import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  MapPin,
  Phone,
  User,
  CreditCard,
  Banknote,
  ShieldCheck,
  ArrowRight,
  Clock,
  Sparkles,
  AlertCircle,
  Plus,
  Check,
  Tag,
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { Address, PaymentMethod } from '../types/index.ts';
import { api } from '../services/api.ts';

interface CheckoutPageProps {
  onOrderSuccess: (orderId: string) => void;
  onNavigateToMenu: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  onOrderSuccess,
  onNavigateToMenu,
}) => {
  const {
    items,
    subtotal,
    deliveryFee,
    tax,
    discount,
    total,
    appliedCoupon,
    clearCart,
  } = useCart();
  const { user, openAuthModal } = useAuth();
  const { error, success } = useToast();

  // Form State
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [customStreet, setCustomStreet] = useState('');
  const [customCity, setCustomCity] = useState('Bengaluru');
  const [customLandmark, setCustomLandmark] = useState('');
  const [customPincode, setCustomPincode] = useState('560038');
  const [instructions, setInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Pre-fill user data
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name);
      if (!customerPhone && user.phone) setCustomerPhone(user.phone);
      if (user.savedAddresses && user.savedAddresses.length > 0) {
        const defaultAddr = user.savedAddresses.find(a => a.isDefault) || user.savedAddresses[0];
        setSelectedAddressId(defaultAddr.id);
        setCustomStreet(defaultAddr.street);
        setCustomCity(defaultAddr.city);
        setCustomLandmark(defaultAddr.landmark || '');
        setCustomPincode(defaultAddr.pincode);
      }
    }
  }, [user]);

  const handleSelectSavedAddress = (addr: Address) => {
    setSelectedAddressId(addr.id);
    setCustomStreet(addr.street);
    setCustomCity(addr.city);
    setCustomLandmark(addr.landmark || '');
    setCustomPincode(addr.pincode);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (items.length === 0) {
      setFormError('Your cart is empty. Please add items before checking out.');
      return;
    }

    if (!user) {
      openAuthModal('login');
      return;
    }

    if (!customerName.trim()) {
      setFormError('Customer name is required.');
      return;
    }

    // Phone format validation (simple 10-digit check or basic phone regex)
    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setFormError('Please enter a valid 10-digit phone number for delivery contact.');
      return;
    }

    if (!customStreet.trim() || !customCity.trim()) {
      setFormError('Complete delivery address (street & city) is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        items: items.map(item => ({
          foodItemId: item.foodItem.id,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions,
        })),
        deliveryAddress: {
          id: selectedAddressId || 'addr-' + Date.now(),
          title: selectedAddressId ? 'Saved Address' : 'Delivery Address',
          street: customStreet.trim(),
          city: customCity.trim(),
          landmark: customLandmark.trim(),
          pincode: customPincode.trim(),
        },
        customerPhone: customerPhone.trim(),
        couponCode: appliedCoupon?.code,
        paymentMethod,
        customerInstructions: instructions.trim(),
      };

      const res = await api.createOrder(orderPayload);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }

      success('Order Placed Successfully!', `Order #${res.order.orderNumber} is now with the kitchen.`);
      clearCart();
      onOrderSuccess(res.order.id);
    } catch (err: any) {
      setFormError(err.message || 'Failed to place order. Please try again.');
      error('Checkout failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
          <Banknote className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900 font-['Outfit']">Your Cart is Empty</h2>
        <p className="text-sm text-stone-500">
          You don't have any items to checkout yet. Browse our delicious menu and add your favorite dishes!
        </p>
        <button
          onClick={onNavigateToMenu}
          className="px-6 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-600/30 cursor-pointer"
        >
          Explore FoodieHub Menu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="mb-8">
        <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">
          Final Step
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 font-['Outfit'] mt-1">
          Complete Your Order
        </h1>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Delivery & Payment Details (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {formError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-sm text-rose-800 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* 1. Customer Information */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="text-lg font-bold text-stone-900 font-['Outfit']">
                Contact Information
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                  Phone Number (For Delivery Valet)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Delivery Address */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="text-lg font-bold text-stone-900 font-['Outfit']">
                Delivery Address
              </h3>
            </div>

            {/* Saved Addresses Quick Selector (if user has saved addresses) */}
            {user?.savedAddresses && user.savedAddresses.length > 0 && (
              <div>
                <span className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                  Choose from saved addresses
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {user.savedAddresses.map(addr => (
                    <button
                      type="button"
                      key={addr.id}
                      onClick={() => handleSelectSavedAddress(addr)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        selectedAddressId === addr.id
                          ? 'border-orange-500 bg-orange-50/50 shadow-xs ring-1 ring-orange-500'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-stone-900">{addr.title}</span>
                        {selectedAddressId === addr.id && (
                          <Check className="w-4 h-4 text-orange-600" />
                        )}
                      </div>
                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {addr.street}, {addr.city} - {addr.pincode}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Address Input Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                  Flat, House No., Building, Street
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    placeholder="E.g., Flat 302, Green Valley Apts, Indiranagar 12th Main"
                    value={customStreet}
                    onChange={e => {
                      setCustomStreet(e.target.value);
                      setSelectedAddressId('');
                    }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                    Landmark
                  </label>
                  <input
                    type="text"
                    placeholder="Near Metro Gate 2"
                    value={customLandmark}
                    onChange={e => setCustomLandmark(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Bengaluru"
                    value={customCity}
                    onChange={e => setCustomCity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    placeholder="560038"
                    value={customPincode}
                    onChange={e => setCustomPincode(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                  Delivery Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="E.g., Ring bell once, leave at doorstep with security"
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="text-lg font-bold text-stone-900 font-['Outfit']">
                Payment Method
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Cash on delivery */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  paymentMethod === 'cod'
                    ? 'border-orange-500 bg-orange-50/50 shadow-xs ring-1 ring-orange-500'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Banknote className="w-6 h-6 text-emerald-600" />
                  {paymentMethod === 'cod' && <Check className="w-4 h-4 text-orange-600" />}
                </div>
                <div className="font-bold text-xs text-stone-900">Cash on Delivery</div>
                <div className="text-[11px] text-stone-500 mt-0.5">Pay in cash or UPI upon delivery</div>
              </button>

              {/* Demo UPI */}
              <button
                type="button"
                onClick={() => setPaymentMethod('demo_upi')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  paymentMethod === 'demo_upi'
                    ? 'border-orange-500 bg-orange-50/50 shadow-xs ring-1 ring-orange-500'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  {paymentMethod === 'demo_upi' && <Check className="w-4 h-4 text-orange-600" />}
                </div>
                <div className="font-bold text-xs text-stone-900">Demo Instant UPI</div>
                <div className="text-[11px] text-stone-500 mt-0.5">Instant simulated payment (GPAY / PhonePe)</div>
              </button>

              {/* Demo Card */}
              <button
                type="button"
                onClick={() => setPaymentMethod('demo_card')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  paymentMethod === 'demo_card'
                    ? 'border-orange-500 bg-orange-50/50 shadow-xs ring-1 ring-orange-500'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                  {paymentMethod === 'demo_card' && <Check className="w-4 h-4 text-orange-600" />}
                </div>
                <div className="font-bold text-xs text-stone-900">Demo Card Payment</div>
                <div className="text-[11px] text-stone-500 mt-0.5">Simulated Visa / MasterCard</div>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Demo mode enabled: Simulated digital payments complete immediately without charging real cards.
              </span>
            </div>
          </div>
        </div>

        {/* Right Col: Order Summary & Confirmation (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-5 sticky top-24">
            <h3 className="text-lg font-bold text-stone-900 font-['Outfit'] pb-3 border-b border-stone-100">
              Order Summary
            </h3>

            {/* Items list snapshot */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map(item => (
                <div key={item.foodItem.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="w-5 h-5 rounded-md bg-stone-100 font-bold text-stone-700 flex items-center justify-center shrink-0">
                      {item.quantity}x
                    </span>
                    <span className="font-medium text-stone-800 truncate">
                      {item.foodItem.name}
                    </span>
                  </div>
                  <span className="font-black text-stone-900 shrink-0">
                    ₹{item.foodItem.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Pricing Calculation Breakdown */}
            <div className="space-y-2 pt-4 border-t border-stone-100 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Coupon ({appliedCoupon?.code})</span>
                  </span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-600">
                <span>Delivery Fee</span>
                {deliveryFee === 0 ? (
                  <span className="text-emerald-600 font-bold">FREE</span>
                ) : (
                  <span>₹{deliveryFee.toFixed(2)}</span>
                )}
              </div>

              <div className="flex justify-between text-stone-600">
                <span>Govt Taxes & Packaging (5% GST)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline font-bold text-stone-900">
                <span className="text-sm">Total Amount</span>
                <span className="text-2xl font-black text-orange-600">
                  ₹{total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Place Order CTA Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm shadow-xl shadow-orange-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-101 active:scale-99 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Placing Order...' : `Place Order • ₹${total.toFixed(2)}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center text-[11px] text-stone-400">
              Safe & Contactless Delivery • Live Kitchen Updates
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
