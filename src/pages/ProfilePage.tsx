import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  MapPin,
  Phone,
  Mail,
  Plus,
  Trash2,
  Check,
  Heart,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Edit2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { Address, FoodItem } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useCart } from '../context/CartContext.tsx';
import { useToast } from '../context/ToastContext.tsx';

const DIETARY_OPTIONS = [
  'Pure Vegetarian Only',
  'Jain Friendly (No Onion/Garlic)',
  'Spicy Food Lover',
  'Low Calorie / Fitness',
  'Dairy Sensitive',
  'Gluten Sensitive',
  'Non-Veg Specialties',
];

export const ProfilePage: React.FC<{ onNavigateToMenu: () => void }> = ({ onNavigateToMenu }) => {
  const { user, updateProfile, logout, openAuthModal } = useAuth();
  const { addItem, openCart } = useCart();
  const { success, error } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [dietary, setDietary] = useState<string[]>(user?.dietaryPreferences || []);
  const [savingProfile, setSavingProfile] = useState(false);

  // Address Modal State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addrTitle, setAddrTitle] = useState('Home');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('Bengaluru');
  const [addrLandmark, setAddrLandmark] = useState('');
  const [addrPincode, setAddrPincode] = useState('560038');

  // Favorites state
  const [favoriteFoods, setFavoriteFoods] = useState<FoodItem[]>([]);
  const [loadingFavs, setLoadingFavs] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      setDietary(user.dietaryPreferences || []);
    }
  }, [user]);

  useEffect(() => {
    async function loadFavs() {
      if (!user) return;
      setLoadingFavs(true);
      try {
        const res = await api.getFavorites();
        const favIds = res.favorites || [];
        if (favIds.length > 0) {
          const all = await api.getFoods();
          setFavoriteFoods(all.foods.filter(f => favIds.includes(f.id)));
        } else {
          setFavoriteFoods([]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingFavs(false);
      }
    }
    loadFavs();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <UserIcon className="w-16 h-16 text-orange-500 mx-auto" />
        <h3 className="text-xl font-bold text-stone-900 font-['Outfit']">
          Sign In to Access Profile
        </h3>
        <p className="text-xs text-stone-500">
          Sign in or create an account to manage your delivery addresses and dietary preferences.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-600/30 cursor-pointer"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    await updateProfile({
      name,
      phone,
      dietaryPreferences: dietary,
    });
    setSavingProfile(false);
  };

  const toggleDietaryPref = (pref: string) => {
    setDietary(prev =>
      prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
    );
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrStreet.trim() || !addrCity.trim()) {
      error('Incomplete Address', 'Street and City are required');
      return;
    }

    const newAddr: Address = {
      id: 'addr-' + Date.now(),
      title: addrTitle.trim() || 'Home',
      street: addrStreet.trim(),
      city: addrCity.trim(),
      landmark: addrLandmark.trim(),
      pincode: addrPincode.trim(),
      isDefault: (user.savedAddresses || []).length === 0,
    };

    const updated = [...(user.savedAddresses || []), newAddr];
    await updateProfile({ savedAddresses: updated });
    setShowAddressModal(false);
    setAddrStreet('');
    setAddrLandmark('');
    success('Address Added', 'New delivery address saved to your profile');
  };

  const handleDeleteAddress = async (id: string) => {
    const updated = (user.savedAddresses || []).filter(a => a.id !== id);
    await updateProfile({ savedAddresses: updated });
    success('Address Removed', 'Address deleted');
  };

  const handleSetDefaultAddress = async (id: string) => {
    const updated = (user.savedAddresses || []).map(a => ({
      ...a,
      isDefault: a.id === id,
    }));
    await updateProfile({ savedAddresses: updated });
    success('Default Address Updated', 'Default delivery destination set');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">
            Account Management
          </span>
          <h1 className="text-3xl font-black text-stone-900 font-['Outfit'] mt-1">
            My Profile & Preferences
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage your personal contact details, saved addresses, and AI culinary taste profiles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-orange-100 text-orange-800 text-xs font-bold uppercase tracking-wider">
            {user.role} account
          </span>
          <button
            onClick={logout}
            className="px-3.5 py-1.5 rounded-xl border border-stone-200 text-stone-600 hover:text-rose-600 text-xs font-semibold cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Col: Contact Info & AI Preferences (7 cols) */}
        <div className="md:col-span-7 space-y-6">
          {/* Profile Form */}
          <form
            onSubmit={handleSaveProfile}
            className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4"
          >
            <h3 className="text-base font-bold text-stone-900 font-['Outfit'] pb-3 border-b border-stone-100 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-orange-600" />
              <span>Personal Information</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                Email Address (Account ID)
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm bg-stone-50 text-stone-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                Delivery Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Dietary Preferences for AI Assistant */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span>Foodie AI Taste Profile</span>
              </label>
              <p className="text-[11px] text-stone-500 mb-3">
                Select your dietary preferences. Foodie AI will prioritize these when suggesting dishes.
              </p>
              <div className="flex flex-wrap gap-2">
                {DIETARY_OPTIONS.map(opt => {
                  const isSelected = dietary.includes(opt);
                  return (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => toggleDietaryPref(opt)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-orange-600 text-white shadow-xs'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="mt-4 w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md transition-colors cursor-pointer disabled:opacity-50"
            >
              {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>

          {/* Favorite Dishes */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-stone-900 font-['Outfit'] pb-3 border-b border-stone-100 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>Your Favorite Dishes</span>
            </h3>

            {favoriteFoods.length === 0 ? (
              <div className="text-center py-6 text-xs text-stone-500">
                You haven't bookmarked any favorite dishes yet. Click the heart icon on any dish!
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {favoriteFoods.map(food => (
                  <div key={food.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={food.imageUrl}
                        alt={food.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-stone-900 truncate">{food.name}</h4>
                        <div className="font-black text-stone-800 mt-0.5">₹{food.price}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        addItem(food, 1);
                        openCart();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs"
                    >
                      Order
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Saved Delivery Addresses (5 cols) */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900 font-['Outfit'] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-600" />
                <span>Saved Addresses</span>
              </h3>
              <button
                onClick={() => setShowAddressModal(true)}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New</span>
              </button>
            </div>

            {(!user.savedAddresses || user.savedAddresses.length === 0) ? (
              <div className="text-center py-6 text-xs text-stone-500">
                No delivery addresses saved yet. Add your home or office address for faster checkout.
              </div>
            ) : (
              <div className="space-y-3">
                {user.savedAddresses.map(addr => (
                  <div
                    key={addr.id}
                    className={`p-4 rounded-2xl border text-xs space-y-2 transition-all ${
                      addr.isDefault
                        ? 'border-orange-500 bg-orange-50/30'
                        : 'border-stone-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900">{addr.title}</span>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-200/80 text-orange-900">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {!addr.isDefault && (
                          <button
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="text-[11px] text-stone-500 hover:text-stone-900 cursor-pointer underline mr-1"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-stone-400 hover:text-rose-600 cursor-pointer p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-stone-600 leading-relaxed">
                      {addr.street}, {addr.city} - {addr.pincode}
                    </p>
                    {addr.landmark && (
                      <div className="text-[11px] text-stone-400">Landmark: {addr.landmark}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleAddAddress}
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 space-y-4"
          >
            <h3 className="text-lg font-bold text-stone-900 font-['Outfit']">
              Add New Delivery Address
            </h3>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
                Label (e.g. Home, Office, Hostel)
              </label>
              <input
                type="text"
                required
                value={addrTitle}
                onChange={e => setAddrTitle(e.target.value)}
                placeholder="Home"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
                Flat, Building, Street
              </label>
              <input
                type="text"
                required
                value={addrStreet}
                onChange={e => setAddrStreet(e.target.value)}
                placeholder="Flat 102, Shanti Vihar, Indiranagar"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
                  City
                </label>
                <input
                  type="text"
                  required
                  value={addrCity}
                  onChange={e => setAddrCity(e.target.value)}
                  placeholder="Bengaluru"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  required
                  value={addrPincode}
                  onChange={e => setAddrPincode(e.target.value)}
                  placeholder="560038"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
                Landmark (Optional)
              </label>
              <input
                type="text"
                value={addrLandmark}
                onChange={e => setAddrLandmark(e.target.value)}
                placeholder="Behind City Bank"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Save Address
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
