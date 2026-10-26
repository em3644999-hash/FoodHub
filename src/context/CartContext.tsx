import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { CartItem, FoodItem, Coupon } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useToast } from './ToastContext.tsx';

const CART_STORAGE_KEY = 'foodiehub_cart_v1';
const COUPON_STORAGE_KEY = 'foodiehub_coupon_v1';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  appliedCoupon: Coupon | null;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (food: FoodItem, quantity?: number, instructions?: string) => void;
  removeItem: (foodId: string) => void;
  updateQuantity: (foodId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  getItemQuantity: (foodId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { success, error, info } = useToast();
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    try {
      const saved = localStorage.getItem(COUPON_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to save coupon to localStorage', e);
    }
  }, [appliedCoupon]);

  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.foodItem.price * item.quantity, 0);
  }, [items]);

  const deliveryFee = useMemo(() => {
    if (subtotal === 0) return 0;
    return subtotal >= 400 ? 0 : 40;
  }, [subtotal]);

  const discount = useMemo(() => {
    if (!appliedCoupon || subtotal === 0) return 0;
    if (appliedCoupon.minimumOrderValue && subtotal < appliedCoupon.minimumOrderValue) {
      return 0;
    }
    let d = 0;
    if (appliedCoupon.discountType === 'percentage') {
      d = (subtotal * appliedCoupon.discountValue) / 100;
      if (appliedCoupon.maximumDiscount && d > appliedCoupon.maximumDiscount) {
        d = appliedCoupon.maximumDiscount;
      }
    } else {
      d = appliedCoupon.discountValue;
    }
    return Math.min(d, subtotal);
  }, [appliedCoupon, subtotal]);

  const tax = useMemo(() => {
    if (subtotal === 0) return 0;
    const taxable = Math.max(0, subtotal - discount);
    return Math.round(taxable * 0.05 * 100) / 100; // 5% GST
  }, [subtotal, discount]);

  const total = useMemo(() => {
    if (subtotal === 0) return 0;
    return Math.round((subtotal - discount + deliveryFee + tax) * 100) / 100;
  }, [subtotal, discount, deliveryFee, tax]);

  // If subtotal drops below coupon minimum, notify and remove
  useEffect(() => {
    if (appliedCoupon && appliedCoupon.minimumOrderValue && subtotal < appliedCoupon.minimumOrderValue && subtotal > 0) {
      info(
        'Coupon removed',
        `Subtotal fell below ₹${appliedCoupon.minimumOrderValue} required for ${appliedCoupon.code}`
      );
      setAppliedCoupon(null);
    }
  }, [subtotal, appliedCoupon, info]);

  const addItem = useCallback(
    (food: FoodItem, quantity: number = 1, instructions?: string) => {
      if (!food.available) {
        error('Item unavailable', `${food.name} is currently sold out`);
        return;
      }
      setItems(prev => {
        const existingIdx = prev.findIndex(i => i.foodItem.id === food.id);
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: updated[existingIdx].quantity + quantity,
            specialInstructions: instructions || updated[existingIdx].specialInstructions,
          };
          return updated;
        } else {
          return [...prev, { foodItem: food, quantity, specialInstructions: instructions }];
        }
      });
      success('Added to cart', `${food.name} (${quantity}x)`);
    },
    [error, success]
  );

  const updateQuantity = useCallback(
    (foodId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(foodId);
        return;
      }
      setItems(prev =>
        prev.map(item => (item.foodItem.id === foodId ? { ...item, quantity } : item))
      );
    },
    []
  );

  const removeItem = useCallback((foodId: string) => {
    setItems(prev => {
      const removed = prev.find(i => i.foodItem.id === foodId);
      if (removed) {
        info('Item removed', `${removed.foodItem.name} removed from cart`);
      }
      return prev.filter(i => i.foodItem.id !== foodId);
    });
  }, [info]);

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedCoupon(null);
    info('Cart cleared', 'All items have been removed from your cart');
  }, [info]);

  const applyCoupon = useCallback(
    async (code: string): Promise<boolean> => {
      if (subtotal === 0) {
        error('Cart is empty', 'Add some delicious dishes before applying coupon');
        return false;
      }
      try {
        const res = await api.validateCoupon(code, subtotal);
        if (res.valid) {
          setAppliedCoupon(res.coupon);
          success('Coupon applied!', res.message);
          return true;
        } else {
          error('Invalid coupon', res.message);
          return false;
        }
      } catch (err: any) {
        error('Coupon error', err.message || 'Could not validate coupon code');
        return false;
      }
    },
    [subtotal, success, error]
  );

  const removeCoupon = useCallback(() => {
    if (appliedCoupon) {
      info('Coupon removed', `Coupon ${appliedCoupon.code} has been removed`);
      setAppliedCoupon(null);
    }
  }, [appliedCoupon, info]);

  const getItemQuantity = useCallback(
    (foodId: string) => {
      const item = items.find(i => i.foodItem.id === foodId);
      return item ? item.quantity : 0;
    },
    [items]
  );

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        deliveryFee,
        tax,
        discount,
        total,
        appliedCoupon,
        isCartOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
