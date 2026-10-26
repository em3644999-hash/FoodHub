import React, { useState } from 'react';
import {
  ShoppingBag,
  Sparkles,
  MapPin,
  User,
  ShieldCheck,
  LogOut,
  ChevronDown,
  UtensilsCrossed,
  Clock,
  Menu as MenuIcon,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openAIModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, openAIModal }) => {
  const { user, isAdmin, logout, openAuthModal, loginAsDemoCustomer, loginAsDemoAdmin } = useAuth();
  const { itemCount, openCart, total } = useCart();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState({
    name: 'Indiranagar',
    pincode: '560038',
    eta: '25-30m',
  });

  const ZONES = [
    { name: 'Indiranagar', pincode: '560038', eta: '25-30m' },
    { name: 'Koramangala', pincode: '560034', eta: '20-25m' },
    { name: 'HSR Layout', pincode: '560102', eta: '30-35m' },
    { name: 'Whitefield', pincode: '560066', eta: '35-40m' },
    { name: 'Jayanagar', pincode: '560041', eta: '30-35m' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      {/* Top Banner with Demo Switcher */}
      <div className="bg-stone-900 text-stone-300 text-xs py-1.5 px-4 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Delivering fresh across Bengaluru • Free delivery on orders above ₹400</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-stone-400">Quick Test Switcher:</span>
            <button
              onClick={loginAsDemoCustomer}
              className="text-orange-400 hover:text-orange-300 underline font-medium cursor-pointer"
            >
              Customer Demo (Rahul)
            </button>
            <span className="text-stone-600">|</span>
            <button
              onClick={loginAsDemoAdmin}
              className="text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
            >
              Admin Demo (Kitchen Mgr)
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => {
                setCurrentTab('home');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2.5 group cursor-pointer text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-stone-900 font-['Outfit']">
                  Foodie<span className="text-orange-600">Hub</span>
                </span>
                <span className="hidden lg:block text-[10px] uppercase font-bold tracking-widest text-stone-400">
                  Gourmet & Fast Delivery
                </span>
              </div>
            </button>

            {/* Location Selector (Interactive Zone Dropdown) */}
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setLocationDropdownOpen(prev => !prev)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100/90 hover:bg-orange-50 hover:border-orange-300 text-stone-700 text-xs border border-stone-200 transition-colors cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-orange-600" />
                <span className="font-semibold text-stone-900">{selectedZone.name}</span>
                <span className="text-stone-400">•</span>
                <span className="text-stone-500">{selectedZone.pincode}</span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {locationDropdownOpen && (
                <div
                  className="absolute left-0 mt-2 w-64 rounded-2xl bg-white border border-stone-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95"
                  onClick={() => setLocationDropdownOpen(false)}
                >
                  <div className="px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100">
                    Select Delivery Zone
                  </div>
                  {ZONES.map(z => (
                    <button
                      key={z.name}
                      onClick={() => setSelectedZone(z)}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-orange-50 cursor-pointer ${
                        selectedZone.name === z.name ? 'text-orange-600 font-bold bg-orange-50/50' : 'text-stone-700'
                      }`}
                    >
                      <div>
                        <div>{z.name}</div>
                        <div className="text-[10px] text-stone-400">PIN: {z.pincode}</div>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-semibold">
                        {z.eta}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => setCurrentTab('home')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                currentTab === 'home'
                  ? 'text-orange-600 bg-orange-50'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentTab('menu')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                currentTab === 'menu'
                  ? 'text-orange-600 bg-orange-50'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              Browse Menu
            </button>
            <button
              onClick={() => setCurrentTab('orders')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                currentTab === 'orders'
                  ? 'text-orange-600 bg-orange-50'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              My Orders
            </button>

            {/* Foodie AI Trigger Button */}
            <button
              onClick={openAIModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-orange-500/10 via-amber-500/15 to-orange-500/10 text-orange-700 border border-orange-200 hover:border-orange-300 font-semibold text-xs transition-all hover:shadow-xs cursor-pointer group"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-500 group-hover:rotate-12 transition-transform" />
              <span>Foodie AI Assistant</span>
            </button>

            {/* Admin Dashboard Link (if admin) */}
            {isAdmin && (
              <button
                onClick={() => setCurrentTab('admin')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                  currentTab === 'admin'
                    ? 'bg-stone-900 text-amber-400'
                    : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Admin</span>
              </button>
            )}
          </nav>

          {/* Right Action Icons: Cart & Profile */}
          <div className="flex items-center gap-3">
            {/* Cart Trigger */}
            <button
              onClick={openCart}
              className="relative flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm shadow-md shadow-orange-600/25 transition-all hover:scale-102 cursor-pointer active:scale-98"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="font-semibold">{itemCount > 0 ? `₹${total}` : 'Cart'}</span>
              {itemCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-orange-600 text-xs font-black flex items-center justify-center shadow-xs">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Profile Dropdown / Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(prev => !prev)}
                  className="flex items-center gap-2 p-1.5 rounded-xl border border-stone-200 hover:border-stone-300 bg-stone-50 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="w-4 h-4 text-stone-500 hidden sm:block" />
                </button>

                {profileDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-stone-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-stone-100">
                      <div className="font-semibold text-stone-900">{user.name}</div>
                      <div className="text-xs text-stone-500 truncate">{user.email}</div>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-800">
                        {user.role}
                      </span>
                    </div>

                    <button
                      onClick={() => setCurrentTab('profile')}
                      className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2.5 cursor-pointer"
                    >
                      <User className="w-4 h-4" />
                      <span>My Profile & Addresses</span>
                    </button>

                    <button
                      onClick={() => setCurrentTab('orders')}
                      className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2.5 cursor-pointer"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Order History</span>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => setCurrentTab('admin')}
                        className="w-full text-left px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 flex items-center gap-2.5 font-medium cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Admin Dashboard</span>
                      </button>
                    )}

                    <div className="border-t border-stone-100 my-1" />

                    <div className="px-4 py-1 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                      Switch Role
                    </div>
                    <button
                      onClick={loginAsDemoCustomer}
                      className="w-full text-left px-4 py-1.5 text-xs text-stone-600 hover:bg-stone-50 cursor-pointer"
                    >
                      Switch to Customer (Rahul)
                    </button>
                    <button
                      onClick={loginAsDemoAdmin}
                      className="w-full text-left px-4 py-1.5 text-xs text-stone-600 hover:bg-stone-50 cursor-pointer"
                    >
                      Switch to Admin (Kitchen Mgr)
                    </button>

                    <div className="border-t border-stone-100 my-1" />

                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 cursor-pointer font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="px-4 py-2 rounded-xl text-stone-700 hover:text-stone-900 border border-stone-200 hover:border-stone-300 font-semibold text-sm cursor-pointer transition-colors"
              >
                Sign In
              </button>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="md:hidden p-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 py-4 space-y-2">
          <button
            onClick={() => {
              setCurrentTab('home');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg font-semibold text-stone-800 hover:bg-orange-50 hover:text-orange-600"
          >
            Home
          </button>
          <button
            onClick={() => {
              setCurrentTab('menu');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg font-semibold text-stone-800 hover:bg-orange-50 hover:text-orange-600"
          >
            Browse Menu
          </button>
          <button
            onClick={() => {
              setCurrentTab('orders');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg font-semibold text-stone-800 hover:bg-orange-50 hover:text-orange-600"
          >
            My Orders
          </button>
          <button
            onClick={() => {
              openAIModal();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg font-semibold text-orange-600 bg-orange-50 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>Foodie AI Assistant</span>
          </button>
          {isAdmin && (
            <button
              onClick={() => {
                setCurrentTab('admin');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg font-semibold text-amber-700 bg-amber-50"
            >
              Admin Dashboard
            </button>
          )}

          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
            <span className="text-stone-400">Quick Switch:</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  loginAsDemoCustomer();
                  setMobileMenuOpen(false);
                }}
                className="text-orange-600 font-semibold"
              >
                Customer
              </button>
              <button
                onClick={() => {
                  loginAsDemoAdmin();
                  setMobileMenuOpen(false);
                }}
                className="text-amber-600 font-semibold"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
