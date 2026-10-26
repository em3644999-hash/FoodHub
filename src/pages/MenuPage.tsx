import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  Sparkles,
  Flame,
  ArrowUpDown,
  Check,
} from 'lucide-react';
import { FoodItem, Category, SpiceLevel } from '../types/index.ts';
import { api } from '../services/api.ts';
import { FoodCard } from '../components/FoodCard.tsx';

interface MenuPageProps {
  initialCategoryId?: string;
  onOpenDetails: (food: FoodItem) => void;
}

export const MenuPage: React.FC<MenuPageProps> = ({
  initialCategoryId = 'all',
  onOpenDetails,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryId);
  const [searchQuery, setSearchQuery] = useState('');
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [selectedSpice, setSelectedSpice] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [sortBy, setSortBy] = useState<string>('popularity');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [catRes, foodRes] = await Promise.all([
          api.getCategories(),
          api.getFoods(),
        ]);
        setCategories(catRes.categories || []);
        setFoods(foodRes.foods || []);
      } catch (err) {
        console.error('Failed to load menu items:', err);
      } finally {
        setLoading(false);
      }
      try {
        const favRes = await api.getFavorites();
        setFavorites(favRes.favorites || []);
      } catch {
        // guest
      }
    }
    loadData();
  }, []);

  // Update selected category if initial prop changes
  useEffect(() => {
    if (initialCategoryId) {
      setSelectedCategory(initialCategoryId);
    }
  }, [initialCategoryId]);

  // Compute filtered & sorted items
  const filteredFoods = useMemo(() => {
    let result = [...foods];

    // Category
    if (selectedCategory !== 'all') {
      result = result.filter(f => f.categoryId === selectedCategory);
    }

    // Veg / Non-Veg
    if (vegFilter === 'veg') {
      result = result.filter(f => f.vegetarian);
    } else if (vegFilter === 'non-veg') {
      result = result.filter(f => !f.vegetarian);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        f =>
          f.name.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          (f.ingredients && f.ingredients.some(ing => ing.toLowerCase().includes(q)))
      );
    }

    // Spice
    if (selectedSpice !== 'all') {
      result = result.filter(f => f.spiceLevel === selectedSpice);
    }

    // Max Price
    result = result.filter(f => f.price <= maxPrice);

    // Availability
    if (showOnlyAvailable) {
      result = result.filter(f => f.available);
    }

    // Sorting
    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'prep_time') {
      result.sort((a, b) => a.preparationTime - b.preparationTime);
    } else {
      // popularity
      result.sort((a, b) => b.reviewsCount - a.reviewsCount);
    }

    return result;
  }, [
    foods,
    selectedCategory,
    vegFilter,
    searchQuery,
    selectedSpice,
    maxPrice,
    showOnlyAvailable,
    sortBy,
  ]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setVegFilter('all');
    setSelectedSpice('all');
    setMaxPrice(500);
    setSortBy('popularity');
    setShowOnlyAvailable(false);
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    searchQuery !== '' ||
    vegFilter !== 'all' ||
    selectedSpice !== 'all' ||
    maxPrice < 500 ||
    showOnlyAvailable;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">
            Freshly Prepared Daily
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 font-['Outfit'] mt-1">
            Our Complete Culinary Menu
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Discover {foods.length} handcrafted delicacies across authentic regional and continental cuisines.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search dish or ingredient..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-stone-400 hover:text-stone-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Categories Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-stone-900 text-white shadow-md'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          All Items ({foods.length})
        </button>
        {categories.map(cat => {
          const count = foods.filter(f => f.categoryId === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                  : 'bg-white text-stone-700 hover:bg-orange-50 hover:text-orange-600 border border-stone-200'
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Veg / Non-Veg Toggles */}
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-2xl">
            <button
              onClick={() => setVegFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                vegFilter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setVegFilter('veg')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                vegFilter === 'veg' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Pure Veg
            </button>
            <button
              onClick={() => setVegFilter('non-veg')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                vegFilter === 'non-veg' ? 'bg-rose-700 text-white shadow-xs' : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              Non-Veg
            </button>
          </div>

          {/* Spice Level Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 font-semibold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              Spice:
            </span>
            <select
              value={selectedSpice}
              onChange={e => setSelectedSpice(e.target.value)}
              className="text-xs font-medium px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
            >
              <option value="all">Any Spice</option>
              <option value="Mild">Mild</option>
              <option value="Medium">Medium</option>
              <option value="Hot">Hot</option>
              <option value="Extra Hot">Extra Hot</option>
            </select>
          </div>

          {/* Price Range Slider */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-500 font-semibold whitespace-nowrap">
              Max Price: <strong className="text-stone-900">₹{maxPrice}</strong>
            </span>
            <input
              type="range"
              min="100"
              max="500"
              step="20"
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-28 sm:w-36 accent-orange-600 cursor-pointer"
            />
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 font-semibold flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
              Sort By:
            </span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
            >
              <option value="popularity">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="prep_time">Fastest Preparation</option>
            </select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-stone-500 px-1">
        <span>
          Showing <strong className="text-stone-900">{filteredFoods.length}</strong> matching delicious dishes
        </span>
      </div>

      {/* Dishes Grid or Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-80 rounded-2xl bg-stone-200/60 animate-pulse" />
          ))}
        </div>
      ) : filteredFoods.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white border border-stone-200 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-stone-900">No dishes found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            We couldn't find any dishes matching your current filter criteria. Try adjusting your search or price range.
          </p>
          <button
            onClick={resetFilters}
            className="px-5 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-600/20 cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredFoods.map(food => (
            <FoodCard
              key={food.id}
              food={food}
              onOpenDetails={onOpenDetails}
              isFavorite={favorites.includes(food.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
