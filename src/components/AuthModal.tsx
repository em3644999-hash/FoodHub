import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    setAuthModalMode,
    login,
    register,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    if (authModalMode === 'login') {
      const ok = await login(email, password);
      if (!ok) {
        setFormError('Invalid email or password.');
      }
    } else {
      if (!name.trim()) {
        setFormError('Please enter your full name');
        setIsSubmitting(false);
        return;
      }
      if (password.length < 6) {
        setFormError('Password must be at least 6 characters');
        setIsSubmitting(false);
        return;
      }
      const ok = await register(name, email, phone, password);
      if (!ok) {
        setFormError('Registration could not be completed.');
      }
    }
    setIsSubmitting(false);
  };

  const handleFillCustomer = () => {
    setAuthModalMode('login');
    setEmail('demo@example.com');
    setPassword('customer123');
    setFormError('');
  };

  const handleFillAdmin = () => {
    setAuthModalMode('login');
    setEmail('admin@foodiehub.com');
    setPassword('admin123');
    setFormError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white p-6 pt-7">
          <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white font-bold mb-3 shadow-md shadow-orange-600/30">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold font-['Outfit']">
            {authModalMode === 'login' ? 'Welcome to FoodieHub' : 'Create an Account'}
          </h3>
          <p className="text-xs text-stone-300 mt-1">
            {authModalMode === 'login'
              ? 'Sign in to access your orders, saved addresses, and faster checkout.'
              : 'Join FoodieHub for delicious food delivered in under 30 minutes.'}
          </p>

          {/* Quick Demo Pre-fill Pills */}
          <div className="mt-4 pt-3 border-t border-stone-700/60 flex items-center justify-between text-xs">
            <span className="text-[11px] text-stone-400">Quick Test:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleFillCustomer}
                className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-orange-600/30 text-orange-400 border border-stone-700 text-[11px] font-semibold transition-colors cursor-pointer"
              >
                Demo Customer
              </button>
              <button
                type="button"
                onClick={handleFillAdmin}
                className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-amber-600/30 text-amber-400 border border-stone-700 text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
              >
                <ShieldCheck className="w-3 h-3" />
                Demo Admin
              </button>
            </div>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex border-b border-stone-200">
          <button
            type="button"
            onClick={() => {
              setAuthModalMode('login');
              setFormError('');
            }}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center transition-colors cursor-pointer ${
              authModalMode === 'login'
                ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50/30'
                : 'text-stone-500 hover:text-stone-800 bg-stone-50/50'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthModalMode('register');
              setFormError('');
            }}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center transition-colors cursor-pointer ${
              authModalMode === 'register'
                ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50/30'
                : 'text-stone-500 hover:text-stone-800 bg-stone-50/50'
            }`}
          >
            New Customer Register
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
              {formError}
            </div>
          )}

          {authModalMode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  required
                  placeholder="Rahul Sharma"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {authModalMode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                Phone Number (for Delivery)
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <span>
              {isSubmitting
                ? 'Processing...'
                : authModalMode === 'login'
                ? 'Sign In to FoodieHub'
                : 'Create Account'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
