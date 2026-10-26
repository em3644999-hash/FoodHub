import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  User,
  Category,
  FoodItem,
  Order,
  Coupon,
  Favorite,
  OrderStatusHistoryItem,
} from '../src/types/index.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'foodiehub.json');

export interface StoredUser extends User {
  passwordHash: string;
}

export interface DatabaseSchema {
  users: StoredUser[];
  categories: Category[];
  foodItems: FoodItem[];
  orders: Order[];
  coupons: Coupon[];
  favorites: Favorite[];
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_foodiehub_salt_2026').digest('hex');
}

const defaultCategories: Category[] = [
  {
    id: 'cat-biryani',
    name: 'Biryani & Rice',
    description: 'Aromatic basmati rice cooked with authentic spices and tender cuts',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    icon: 'Flame',
    active: true,
  },
  {
    id: 'cat-pizza',
    name: 'Pizzas',
    description: 'Fresh dough hand-tossed pizzas topped with rich mozzarella & herbs',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
    icon: 'Pizza',
    active: true,
  },
  {
    id: 'cat-burgers',
    name: 'Burgers & Wraps',
    description: 'Juicy patties, fresh lettuce, melted cheese in toasted brioche buns',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    icon: 'Sandwich',
    active: true,
  },
  {
    id: 'cat-south-indian',
    name: 'South Indian',
    description: 'Crisp fermented crepes, steamed idlis, sambar and coconut chutneys',
    imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80',
    icon: 'Utensils',
    active: true,
  },
  {
    id: 'cat-north-indian',
    name: 'North Indian & Paneer',
    description: 'Rich creamy gravies, tandoori breads, and slow-simmered curries',
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80',
    icon: 'Soup',
    active: true,
  },
  {
    id: 'cat-chinese',
    name: 'Chinese & Noodles',
    description: 'Wok-tossed noodles, spicy schezwan sauces, and crispy starters',
    imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80',
    icon: 'Bowl',
    active: true,
  },
  {
    id: 'cat-desserts',
    name: 'Desserts & Cakes',
    description: 'Indulgent brownies, traditional warm sweets, and rich sundaes',
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
    icon: 'Cake',
    active: true,
  },
  {
    id: 'cat-beverages',
    name: 'Beverages & Coffee',
    description: 'Cold pressed seasonal juices, chilled sodas, and artisan roasts',
    imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80',
    icon: 'Coffee',
    active: true,
  },
];

const defaultFoodItems: FoodItem[] = [
  // Biryani & Rice
  {
    id: 'food-biryani-chicken',
    name: 'Hyderabadi Dum Chicken Biryani',
    description: 'Slow-cooked marinated chicken layered with saffron-infused long grain basmati rice, served with creamy mirchi ka salan and mint raita.',
    categoryId: 'cat-biryani',
    price: 349,
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    vegetarian: false,
    allergens: ['Dairy'],
    ingredients: ['Basmati Rice', 'Chicken', 'Saffron', 'Ghee', 'Mint', 'Yogurt', 'Cardamom', 'Cloves'],
    spiceLevel: 'Hot',
    preparationTime: 25,
    rating: 4.8,
    reviewsCount: 420,
    available: true,
    isBestSeller: true,
    isChefSpecial: true,
    calories: 680,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'food-biryani-veg',
    name: 'Lucknowi Dum Paneer Biryani',
    description: 'Golden spiced paneer cubes, garden vegetables, and fragrant rice cooked in sealed handi with rose water and whole spices.',
    categoryId: 'cat-biryani',
    price: 289,
    imageUrl: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=600&auto=format&fit=crop&q=80',
    vegetarian: true,
    allergens: ['Dairy'],
    ingredients: ['Basmati Rice', 'Paneer', 'Green Peas', 'Carrots', 'Fried Onions', 'Kewra Water'],
    spiceLevel: 'Medium',
    preparationTime: 20,
    rating: 4.6,
    reviewsCount: 285,
    available: true,
    isBestSeller: false,
    isChefSpecial: false,
    calories: 540,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'food-jeera-rice',
    name: 'Royal Jeera Rice with Dal Tadka',
    description: 'Cumin tempered aged basmati rice paired with yellow lentils simmered with garlic, ghee, and roasted whole red chillies.',
    categoryId: 'cat-biryani',
    price: 199,
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
    vegetarian: true,
    allergens: ['Dairy'],
    ingredients: ['Basmati Rice', 'Toor Dal', 'Cumin Seeds', 'Pure Desi Ghee', 'Garlic', 'Coriander'],
    spiceLevel: 'Mild',
    preparationTime: 18,
    rating: 4.5,
    reviewsCount: 160,
    available: true,
    isBestSeller: false,
    isChefSpecial: false,
    calories: 460,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },

  // Pizzas
  {
    id: 'food-pizza-margherita',
    name: 'Classic Margherita Classica',
    description: 'San Marzano tomato coulis, fresh mozzarella bocconcini, fresh basil leaves, and a drizzle of extra virgin olive oil on hand-stretched crust.',
    categoryId: 'cat-pizza',
    price: 299,
    imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80',
    vegetarian: true,
    allergens: ['Gluten', 'Dairy'],
    ingredients: ['Flour Dough', 'San Marzano Sauce', 'Mozzarella', 'Fresh Basil', 'Olive Oil'],
    spiceLevel: 'Mild',
    preparationTime: 20,
    rating: 4.7,
    reviewsCount: 310,
    available: true,
    isBestSeller: true,
    isChefSpecial: false,
    calories: 620,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'food-pizza-peri-paneer',
    name: 'Spicy Peri-Peri Paneer Pizza',
    description: 'Chunky roasted paneer tossed in fiery African peri-peri glaze, crunchy bell peppers, red paprika, and stretchy gouda-mozzarella blend.',
    categoryId: 'cat-pizza',
    price: 369,
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
    vegetarian: true,
    allergens: ['Gluten', 'Dairy'],
    ingredients: ['Pizza Base', 'Peri-Peri Sauce', 'Paneer', 'Bell Peppers', 'Red Paprika', 'Mozzarella'],
    spiceLevel: 'Hot',
    preparationTime: 22,
    rating: 4.7,
    reviewsCount: 275,
    available: true,
    isBestSeller: true,
    isChefSpecial: true,
    calories: 720,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'food-pizza-bbq-chicken',
    name: 'BBQ Smoked Chicken Feast',
    description: 'Hickory-smoked grilled chicken breast strips, caramelized onions, sweet corn, melted mozzarella, and tangy house BBQ drizzle.',
    categoryId: 'cat-pizza',
    price: 419,
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80',
    vegetarian: false,
    allergens: ['Gluten', 'Dairy'],
    ingredients: ['Smoked Chicken', 'BBQ Sauce', 'Red Onions', 'Mozzarella Cheese', 'Sweet Corn'],
    spiceLevel: 'Medium',
    preparationTime: 25,
    rating: 4.8,
    reviewsCount: 380,
    available: true,
    isBestSeller: true,
    isChefSpecial: false,
    calories: 790,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },

  // Burgers & Wraps
  {
    id: 'food-burger-crispy-chicken',
    name: 'Signature Crispy Chicken Burger',
    description: 'Golden buttermilk-fried chicken fillet, crunchy purple cabbage slaw, tangy dill pickles, and chipotle mayo tucked inside toasted brioche bun.',
    categoryId: 'cat-burgers',
    price: 249,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    vegetarian: false,
    allergens: ['Gluten', 'Dairy', 'Egg'],
    ingredients: ['Brioche Bun', 'Chicken Thigh', 'Chipotle Mayo', 'Pickles', 'Coleslaw', 'Cheddar'],
    spiceLevel: 'Medium',
    preparationTime: 18,
    rating: 4.7,
    reviewsCount: 340,
    available: true,
    isBestSeller: true,
    isChefSpecial: true,
    calories: 590,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'food-burger-veggie-crunch',
    name: 'Gourmet Veggie Crunch Burger',
    description: 'Crisp patty made of sweet potato, edamame, and corn, stacked with butterhead lettuce, sliced heirloom tomato, and roasted garlic aioli.',
    categoryId: 'cat-burgers',
    price: 189,
    imageUrl: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=600&auto=format&fit=crop&q=80',
    vegetarian: true,
    allergens: ['Gluten'],
    ingredients: ['Sesame Bun', 'Vegetable Patty', 'Garlic Aioli', 'Tomato', 'Cheddar', 'Lettuce'],
    spiceLevel: 'Mild',
    preparationTime: 15,
    rating: 4.4,
    reviewsCount: 195,
    available: true,
    isBestSeller: false,
    isChefSpecial: false,
    calories: 480,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'food-wrap-paneer-roll',
    name: 'Tandoori Paneer Kathi Roll',
    description: 'Smoky clay-oven paneer cubes tossed in mint-coriander chutney, pickled shallots, wrapped in soft flaky handmade paratha.',
    categoryId: 'cat-burgers',
    price: 179,
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
    vegetarian: true,
    allergens: ['Gluten', 'Dairy'],
    ingredients: ['Whole Wheat Paratha', 'Paneer Tikka', 'Mint Chutney', 'Pickled Onions', 'Chaat Masala'],
    spiceLevel: 'Medium',
    preparationTime: 15,
    rating: 4.6,
    reviewsCount: 220,
    available: true,
    isBestSeller: false,
    isChefSpecial: false,
    calories: 410,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'food-french-fries',
    name: 'Crispy Peri-Peri French Fries',
    description: 'Double-fried hand-cut Idaho potatoes tossed in house aromatic peri-peri seasoning, served with creamy dip.',
    categoryId: 'cat-burgers',
    price: 129,
    imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80',
    vegetarian: true,
    allergens: [],
    ingredients: ['Potatoes', 'Peri-Peri Spice', 'Canola Oil', 'Salt'],
    spiceLevel: 'Medium',
    preparationTime: 12,
    rating: 4.6,
    reviewsCount: 510,
    available: true,
    isBestSeller: true,
    isChefSpecial: false,
    calories: 320,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },

  // South Indian
  {
    id: 'food-masala-dosa',
    name: 'Mysore Masala Dosa',
    description: 'Golden fermented rice-lentil crepe lined with fiery red garlic-chilli paste and stuffed with spiced potato masala, served with 3 chutneys & piping hot sambar.',
    categoryId: 'cat-south-indian',
    price: 159,
    imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80',
    vegetarian: true,
    allergens: ['Mustard'],
    ingredients: ['Fermented Batter', 'Potatoes', 'Red Chilli Chutney', 'Ghee', 'Curry Leaves', 'Mustard Seeds'],
    spiceLevel: 'Medium',
    preparationTime: 15,
    rating: 4.9,
    reviewsCount: 650,
    available: true,
    isBestSeller: true,
    isChefSpecial: true,
    calories: 380,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'food-idli-vada',
    name: 'Steamed Idli & Crispy Medu Vada Combo',
    description: 'Pair of pillowy soft steamed rice cakes and a crispy lentil doughnut, served with spicy drumstick sambar, fresh coconut chutney and tomato thokku.',
    categoryId: 'cat-south-indian',
    price: 139,
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
    vegetarian: true,
    allergens: [],
    ingredients: ['Rice Batter', 'Urad Dal', 'Peppercorns', 'Curry Leaves', 'Coconut', 'Tamarind'],
    spiceLevel: 'Mild',
    preparationTime: 12,
    rating: 4.8,
    reviewsCount: 410,
    available: true,
    isBestSeller: true,
    isChefSpecial: false,
    calories: 320,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'food-south-veg-thali',
    name: 'Traditional South Indian Veg Meal',
    description: 'Complete wholesome platter with steamed rice, ghee, sambar, rasam, kootu, poriyal, curd, appalam, and warm semiya payasam.',
    categoryId: 'cat-south-indian',
    price: 249,
    imageUrl: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600&auto=format&fit=crop&q=80',
    vegetarian: true,
    allergens: ['Dairy'],
    ingredients: ['Sona Masoori Rice', 'Lentils', 'Seasonal Veggies', 'Coconut Milk', 'Ghee', 'Papad'],
    spiceLevel: 'Medium',
    preparationTime: 20,
    rating: 4.7,
    reviewsCount: 180,
    available: true,
    isBestSeller: false,
    isChefSpecial: true,
    calories: 650,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },

  // North Indian & Paneer
  {
    id: 'food-paneer-butter-masala',
    name: 'Paneer Butter Masala',
    description: 'Velvety cottage cheese cubes simmered in a luscious tomato, butter, and cashew gravy infused with crushed kasuri methi and cream.',
    categoryId: 'cat-north-indian',
    price: 299,
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80',
    vegetarian: true,
    allergens: ['Dairy', 'Tree Nuts'],
    ingredients: ['Fresh Malai Paneer', 'Tomatoes', 'Cashew Paste', 'Butter', 'Cream', 'Fenugreek Leaves'],
    spiceLevel: 'Medium',
    preparationTime: 20,
    rating: 4.9,
    reviewsCount: 520,
    available: true,
    isBestSeller: true,
    isChefSpecial: true,
    calories: 520,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'food-dal-makhani',
    name: 'Amritsari Dal Makhani',
    description: 'Whole black lentils and kidney beans slow-simmered overnight over charcoal embers, finished with churned butter and double cream.',
    categoryId: 'cat-north-indian',
    price: 259,
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
    vegetarian: true,
    allergens: ['Dairy'],
    ingredients: ['Urad Sabut', 'Rajma', 'Butter', 'Fresh Cream', 'Ginger-Garlic', 'Kashmiri Mirch'],
    spiceLevel: 'Mild',
    preparationTime: 18,
    rating: 4.7,
    reviewsCount: 310,
    available: true,
    isBestSeller: false,
    isChefSpecial: false,
    calories: 440,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'food-garlic-naan-basket',
    name: 'Butter Garlic Naan Basket (3 pcs)',
    description: 'Tandoor-baked leavened flatbread brushed with garlic butter and garnished with fresh cilantro and nigella seeds.',
    categoryId: 'cat-north-indian',
    price: 139,
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
    vegetarian: true,
    allergens: ['Gluten', 'Dairy'],
    ingredients: ['Refined Flour', 'Fresh Garlic', 'Desi Butter', 'Coriander', 'Kalonji'],
    spiceLevel: 'Mild',
    preparationTime: 12,
    rating: 4.8,
    reviewsCount: 390,
    available: true,
    isBestSeller: true,
    isChefSpecial: false,
    calories: 360,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },

  // Chinese & Noodles
  {
    id: 'food-hakka-noodles',
    name: 'Wok-Tossed Hakka Veg Noodles',
    description: 'Long tender noodles stir-fried in high-flame wok with crisp shredded cabbage, carrots, bell peppers, scallions, and light soy sauce.',
    categoryId: 'cat-chinese',
    price: 199,
    imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80',
    vegetarian: true,
    allergens: ['Gluten', 'Soy'],
    ingredients: ['Wheat Noodles', 'Bell Peppers', 'Cabbage', 'Soy Sauce', 'Spring Onion', 'Sesame Oil'],
    spiceLevel: 'Medium',
    preparationTime: 15,
    rating: 4.6,
    reviewsCount: 290,
    available: true,
    isBestSeller: true,
    isChefSpecial: false,
    calories: 410,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'food-schezwan-chicken-rice',
    name: 'Schezwan Chicken Fried Rice',
    description: 'Fragrant jasmine rice tossed with tender diced chicken, eggs, and fiery Sichuan peppercorn sauce with fresh spring onions.',
    categoryId: 'cat-chinese',
    price: 279,
    imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80',
    vegetarian: false,
    allergens: ['Soy', 'Egg'],
    ingredients: ['Rice', 'Chicken', 'Egg', 'Schezwan Peppers', 'Garlic', 'Scallions'],
    spiceLevel: 'Hot',
    preparationTime: 20,
    rating: 4.7,
    reviewsCount: 240,
    available: true,
    isBestSeller: false,
    isChefSpecial: true,
    calories: 580,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'food-chilli-paneer-dry',
    name: 'Crispy Chilli Paneer Dry',
    description: 'Crisp cornstarch-battered cottage cheese cubes tossed with crunchy bell peppers, onions, crushed garlic, and spicy Indo-Chinese dark sauce.',
    categoryId: 'cat-chinese',
    price: 249,
    imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80',
    vegetarian: true,
    allergens: ['Dairy', 'Soy'],
    ingredients: ['Paneer', 'Green Chillies', 'Capsicum', 'Garlic', 'Dark Soy', 'Vinegar'],
    spiceLevel: 'Hot',
    preparationTime: 16,
    rating: 4.7,
    reviewsCount: 310,
    available: true,
    isBestSeller: true,
    isChefSpecial: false,
    calories: 460,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },

  // Desserts & Cakes
  {
    id: 'food-sizzling-brownie',
    name: 'Sizzling Hot Chocolate Brownie',
    description: 'Warm fudge walnut brownie served on a hot cast iron plate, topped with a generous scoop of vanilla bean ice cream and hot chocolate fudge.',
    categoryId: 'cat-desserts',
    price: 189,
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
    vegetarian: true,
    allergens: ['Gluten', 'Dairy', 'Tree Nuts'],
    ingredients: ['Dark Chocolate', 'Walnuts', 'Flour', 'Vanilla Ice Cream', 'Chocolate Syrup'],
    spiceLevel: 'Mild',
    preparationTime: 12,
    rating: 4.9,
    reviewsCount: 460,
    available: true,
    isBestSeller: true,
    isChefSpecial: true,
    calories: 490,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'food-gulab-jamun-rabdi',
    name: 'Gulab Jamun with Kesar Rabdi (2 pcs)',
    description: 'Deep-fried golden khoya dumplings soaked in rose cardamom sugar syrup, rested upon chilled thickened saffron milk reduction.',
    categoryId: 'cat-desserts',
    price: 149,
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
    vegetarian: true,
    allergens: ['Dairy', 'Tree Nuts'],
    ingredients: ['Mawa / Khoya', 'Sugar Syrup', 'Kashmiri Saffron', 'Cardamom', 'Pistachios'],
    spiceLevel: 'Mild',
    preparationTime: 10,
    rating: 4.8,
    reviewsCount: 380,
    available: true,
    isBestSeller: false,
    isChefSpecial: false,
    calories: 390,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'food-truffle-cake-slice',
    name: 'Belgian Chocolate Truffle Pastry',
    description: 'Triple layer of dark chocolate sponge enveloped with smooth 55% Belgian chocolate ganache and chocolate shavings.',
    categoryId: 'cat-desserts',
    price: 169,
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80',
    vegetarian: true,
    allergens: ['Gluten', 'Dairy'],
    ingredients: ['Belgian Cocoa', 'Whipped Cream', 'Vanilla Extract', 'Cocoa Butter'],
    spiceLevel: 'Mild',
    preparationTime: 8,
    rating: 4.7,
    reviewsCount: 210,
    available: true,
    isBestSeller: false,
    isChefSpecial: false,
    calories: 420,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },

  // Beverages & Coffee
  {
    id: 'food-mango-juice',
    name: 'Fresh Alphonso Mango Pulpy Juice',
    description: '100% pure extracted Ratnagiri Alphonso mango pulp churned cold without added preservatives, served chilled with mint sprig.',
    categoryId: 'cat-beverages',
    price: 139,
    imageUrl: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=600&auto=format&fit=crop&q=80',
    vegetarian: true,
    allergens: [],
    ingredients: ['Alphonso Mango', 'Chilled Mineral Water', 'Pinch of Black Salt'],
    spiceLevel: 'Mild',
    preparationTime: 8,
    rating: 4.8,
    reviewsCount: 310,
    available: true,
    isBestSeller: true,
    isChefSpecial: false,
    calories: 180,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'food-cold-brew',
    name: 'Artisan Cold Brew Iced Coffee',
    description: '16-hour slow steep Arabica coffee served over crystal ice blocks with choice of chilled creamy milk.',
    categoryId: 'cat-beverages',
    price: 159,
    imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80',
    vegetarian: true,
    allergens: ['Dairy'],
    ingredients: ['Coorg Arabica Beans', 'Filtered Water', 'Milk', 'Vanilla Sugar'],
    spiceLevel: 'Mild',
    preparationTime: 5,
    rating: 4.7,
    reviewsCount: 250,
    available: true,
    isBestSeller: false,
    isChefSpecial: true,
    calories: 120,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'food-masala-chai',
    name: 'Ginger Cardamom Cutting Chai Flask (500ml)',
    description: 'Strong Assam CTC tea leaves brewed with crushed fresh ginger, green cardamom pods, and wholesome milk. Serves 3 cups in insulated flask.',
    categoryId: 'cat-beverages',
    price: 119,
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
    vegetarian: true,
    allergens: ['Dairy'],
    ingredients: ['Assam Black Tea', 'Fresh Ginger', 'Cardamom', 'Milk', 'Brown Sugar'],
    spiceLevel: 'Mild',
    preparationTime: 10,
    rating: 4.9,
    reviewsCount: 440,
    available: true,
    isBestSeller: true,
    isChefSpecial: false,
    calories: 140,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
];

const defaultCoupons: Coupon[] = [
  {
    id: 'coup-foodie50',
    code: 'FOODIE50',
    description: '50% OFF up to ₹150 on orders above ₹299',
    discountType: 'percentage',
    discountValue: 50,
    minimumOrderValue: 299,
    maximumDiscount: 150,
    expiryDate: '2027-12-31T23:59:59Z',
    active: true,
    usageLimit: 1000,
    timesUsed: 142,
  },
  {
    id: 'coup-tasty100',
    code: 'TASTY100',
    description: 'Flat ₹100 OFF on delicious treats over ₹400',
    discountType: 'fixed',
    discountValue: 100,
    minimumOrderValue: 400,
    expiryDate: '2027-12-31T23:59:59Z',
    active: true,
    usageLimit: 500,
    timesUsed: 89,
  },
  {
    id: 'coup-welcome20',
    code: 'WELCOME20',
    description: '20% OFF on all meals, minimum order ₹199',
    discountType: 'percentage',
    discountValue: 20,
    minimumOrderValue: 199,
    maximumDiscount: 80,
    expiryDate: '2027-12-31T23:59:59Z',
    active: true,
    usageLimit: 2000,
    timesUsed: 312,
  },
];

const defaultUsers: StoredUser[] = [
  {
    id: 'user-admin-1',
    name: 'FoodieHub Admin',
    email: 'admin@foodiehub.com',
    phone: '+91 99887 76655',
    role: 'admin',
    passwordHash: hashPassword('admin123'),
    savedAddresses: [
      {
        id: 'addr-admin-hq',
        title: 'HQ Office',
        street: 'Suite 404, Tech Park Central',
        city: 'Bengaluru',
        landmark: 'Near Metro Gate 2',
        pincode: '560001',
        isDefault: true,
      },
    ],
    dietaryPreferences: ['All Foods'],
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'user-customer-1',
    name: 'Rahul Sharma',
    email: 'demo@example.com',
    phone: '+91 98765 43210',
    role: 'customer',
    passwordHash: hashPassword('customer123'),
    savedAddresses: [
      {
        id: 'addr-cust-home',
        title: 'Home',
        street: 'Flat 302, Green Valley Apts, Indiranagar 12th Main',
        city: 'Bengaluru',
        landmark: 'Opposite Coffee House',
        pincode: '560038',
        isDefault: true,
      },
      {
        id: 'addr-cust-work',
        title: 'Work',
        street: 'Innovation Hub, 5th Floor, Outer Ring Road',
        city: 'Bengaluru',
        landmark: 'Near EcoWorld Gate 1',
        pincode: '560103',
        isDefault: false,
      },
    ],
    dietaryPreferences: ['Low Calorie', 'Spicy Food Lover'],
    createdAt: '2026-01-15T09:30:00Z',
  },
];

const defaultOrders: Order[] = [
  {
    id: 'ord-10821',
    orderNumber: 'FH-10821',
    userId: 'user-customer-1',
    customerName: 'Rahul Sharma',
    customerEmail: 'demo@example.com',
    customerPhone: '+91 98765 43210',
    deliveryAddress: {
      id: 'addr-cust-home',
      title: 'Home',
      street: 'Flat 302, Green Valley Apts, Indiranagar 12th Main',
      city: 'Bengaluru',
      landmark: 'Opposite Coffee House',
      pincode: '560038',
      isDefault: true,
    },
    items: [
      {
        foodItemId: 'food-biryani-chicken',
        name: 'Hyderabadi Dum Chicken Biryani',
        price: 349,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
        vegetarian: false,
      },
      {
        foodItemId: 'food-mango-juice',
        name: 'Fresh Alphonso Mango Pulpy Juice',
        price: 139,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=600&auto=format&fit=crop&q=80',
        vegetarian: true,
      },
    ],
    subtotal: 488,
    deliveryFee: 0,
    tax: 24.4,
    discount: 100,
    total: 412.4,
    couponCode: 'TASTY100',
    paymentMethod: 'demo_card',
    paymentStatus: 'paid',
    orderStatus: 'delivered',
    customerInstructions: 'Please leave at the door with security if not reachable',
    estimatedDeliveryTime: 'Delivered in 28 mins',
    statusHistory: [
      {
        id: 'hist-1',
        orderId: 'ord-10821',
        status: 'placed',
        changedBy: 'customer',
        timestamp: '2026-10-25T19:00:00Z',
        note: 'Order placed by customer',
      },
      {
        id: 'hist-2',
        orderId: 'ord-10821',
        status: 'confirmed',
        changedBy: 'admin',
        timestamp: '2026-10-25T19:03:00Z',
        note: 'Kitchen confirmed order',
      },
      {
        id: 'hist-3',
        orderId: 'ord-10821',
        status: 'preparing',
        changedBy: 'admin',
        timestamp: '2026-10-25T19:08:00Z',
        note: 'Chef started cooking',
      },
      {
        id: 'hist-4',
        orderId: 'ord-10821',
        status: 'out_for_delivery',
        changedBy: 'admin',
        timestamp: '2026-10-25T19:22:00Z',
        note: 'Assigned to delivery valet Suresh (KA-03-EB-4192)',
      },
      {
        id: 'hist-5',
        orderId: 'ord-10821',
        status: 'delivered',
        changedBy: 'admin',
        timestamp: '2026-10-25T19:35:00Z',
        note: 'Delivered safely to customer',
      },
    ],
    createdAt: '2026-10-25T19:00:00Z',
    updatedAt: '2026-10-25T19:35:00Z',
  },
  {
    id: 'ord-10822',
    orderNumber: 'FH-10822',
    userId: 'user-customer-1',
    customerName: 'Rahul Sharma',
    customerEmail: 'demo@example.com',
    customerPhone: '+91 98765 43210',
    deliveryAddress: {
      id: 'addr-cust-work',
      title: 'Work',
      street: 'Innovation Hub, 5th Floor, Outer Ring Road',
      city: 'Bengaluru',
      landmark: 'Near EcoWorld Gate 1',
      pincode: '560103',
      isDefault: false,
    },
    items: [
      {
        foodItemId: 'food-pizza-margherita',
        name: 'Classic Margherita Classica',
        price: 299,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80',
        vegetarian: true,
      },
      {
        foodItemId: 'food-french-fries',
        name: 'Crispy Peri-Peri French Fries',
        price: 129,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80',
        vegetarian: true,
      },
      {
        foodItemId: 'food-cold-brew',
        name: 'Artisan Cold Brew Iced Coffee',
        price: 159,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80',
        vegetarian: true,
      },
    ],
    subtotal: 587,
    deliveryFee: 0,
    tax: 29.35,
    discount: 150,
    total: 466.35,
    couponCode: 'FOODIE50',
    paymentMethod: 'demo_upi',
    paymentStatus: 'paid',
    orderStatus: 'preparing',
    customerInstructions: 'Call upon arrival',
    estimatedDeliveryTime: '20-25 mins',
    statusHistory: [
      {
        id: 'hist-6',
        orderId: 'ord-10822',
        status: 'placed',
        changedBy: 'customer',
        timestamp: '2026-10-26T11:15:00Z',
        note: 'Order placed by customer',
      },
      {
        id: 'hist-7',
        orderId: 'ord-10822',
        status: 'confirmed',
        changedBy: 'admin',
        timestamp: '2026-10-26T11:17:00Z',
        note: 'Order accepted by kitchen',
      },
      {
        id: 'hist-8',
        orderId: 'ord-10822',
        status: 'preparing',
        changedBy: 'admin',
        timestamp: '2026-10-26T11:20:00Z',
        note: 'Wood-fired oven preheated, pizza being baked',
      },
    ],
    createdAt: '2026-10-26T11:15:00Z',
    updatedAt: '2026-10-26T11:20:00Z',
  },
];

class DatabaseService {
  private db: DatabaseSchema = {
    users: [],
    categories: [],
    foodItems: [],
    orders: [],
    coupons: [],
    favorites: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.db = JSON.parse(raw);
        // Ensure default admin & demo customer exist
        for (const defaultUser of defaultUsers) {
          if (!this.db.users.some(u => u.email === defaultUser.email)) {
            this.db.users.push(defaultUser);
          }
        }
        // Ensure categories exist
        if (!this.db.categories || this.db.categories.length === 0) {
          this.db.categories = defaultCategories;
        }
        // Ensure food items exist
        if (!this.db.foodItems || this.db.foodItems.length === 0) {
          this.db.foodItems = defaultFoodItems;
        }
        // Ensure coupons exist
        if (!this.db.coupons || this.db.coupons.length === 0) {
          this.db.coupons = defaultCoupons;
        }
        // Ensure orders exist
        if (!this.db.orders) {
          this.db.orders = defaultOrders;
        }
        if (!this.db.favorites) {
          this.db.favorites = [];
        }
        this.save();
      } else {
        this.db = {
          users: defaultUsers,
          categories: defaultCategories,
          foodItems: defaultFoodItems,
          orders: defaultOrders,
          coupons: defaultCoupons,
          favorites: [],
        };
        this.save();
      }
    } catch (err) {
      console.error('Error initializing database, using in-memory defaults:', err);
      this.db = {
        users: defaultUsers,
        categories: defaultCategories,
        foodItems: defaultFoodItems,
        orders: defaultOrders,
        coupons: defaultCoupons,
        favorites: [],
      };
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.db, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  // --- Users & Auth ---
  findUserByEmail(email: string): StoredUser | undefined {
    return this.db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string): StoredUser | undefined {
    return this.db.users.find(u => u.id === id);
  }

  createUser(user: StoredUser): StoredUser {
    this.db.users.push(user);
    this.save();
    return user;
  }

  updateUser(id: string, updates: Partial<StoredUser>): StoredUser | undefined {
    const idx = this.db.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    this.db.users[idx] = { ...this.db.users[idx], ...updates };
    this.save();
    return this.db.users[idx];
  }

  getAllUsers(): Omit<StoredUser, 'passwordHash'>[] {
    return this.db.users.map(({ passwordHash, ...rest }) => rest);
  }

  // --- Categories ---
  getCategories(): Category[] {
    return this.db.categories;
  }

  getCategoryById(id: string): Category | undefined {
    return this.db.categories.find(c => c.id === id);
  }

  createCategory(category: Category): Category {
    this.db.categories.push(category);
    this.save();
    return category;
  }

  updateCategory(id: string, updates: Partial<Category>): Category | undefined {
    const idx = this.db.categories.findIndex(c => c.id === id);
    if (idx === -1) return undefined;
    this.db.categories[idx] = { ...this.db.categories[idx], ...updates };
    this.save();
    return this.db.categories[idx];
  }

  deleteCategory(id: string): boolean {
    const initialLen = this.db.categories.length;
    this.db.categories = this.db.categories.filter(c => c.id !== id);
    if (this.db.categories.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Food Items ---
  getFoodItems(): FoodItem[] {
    return this.db.foodItems;
  }

  getFoodItemById(id: string): FoodItem | undefined {
    return this.db.foodItems.find(f => f.id === id);
  }

  createFoodItem(food: FoodItem): FoodItem {
    this.db.foodItems.push(food);
    this.save();
    return food;
  }

  updateFoodItem(id: string, updates: Partial<FoodItem>): FoodItem | undefined {
    const idx = this.db.foodItems.findIndex(f => f.id === id);
    if (idx === -1) return undefined;
    this.db.foodItems[idx] = {
      ...this.db.foodItems[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.db.foodItems[idx];
  }

  deleteFoodItem(id: string): boolean {
    const initialLen = this.db.foodItems.length;
    this.db.foodItems = this.db.foodItems.filter(f => f.id !== id);
    if (this.db.foodItems.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Coupons ---
  getCoupons(): Coupon[] {
    return this.db.coupons;
  }

  getCouponByCode(code: string): Coupon | undefined {
    return this.db.coupons.find(
      c => c.code.toUpperCase() === code.toUpperCase() && c.active
    );
  }

  incrementCouponUsage(code: string) {
    const coupon = this.db.coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (coupon) {
      coupon.timesUsed = (coupon.timesUsed || 0) + 1;
      this.save();
    }
  }

  createCoupon(coupon: Coupon): Coupon {
    this.db.coupons.push(coupon);
    this.save();
    return coupon;
  }

  updateCoupon(id: string, updates: Partial<Coupon>): Coupon | undefined {
    const idx = this.db.coupons.findIndex(c => c.id === id);
    if (idx === -1) return undefined;
    this.db.coupons[idx] = { ...this.db.coupons[idx], ...updates };
    this.save();
    return this.db.coupons[idx];
  }

  deleteCoupon(id: string): boolean {
    const initialLen = this.db.coupons.length;
    this.db.coupons = this.db.coupons.filter(c => c.id !== id);
    if (this.db.coupons.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Orders ---
  getOrders(): Order[] {
    return [...this.db.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getOrdersByUserId(userId: string): Order[] {
    return this.db.orders
      .filter(o => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getOrderById(id: string): Order | undefined {
    return this.db.orders.find(o => o.id === id || o.orderNumber === id);
  }

  createOrder(order: Order): Order {
    this.db.orders.unshift(order);
    this.save();
    return order;
  }

  updateOrderStatus(
    orderId: string,
    newStatus: Order['orderStatus'],
    changedBy: string,
    note?: string
  ): Order | undefined {
    const order = this.db.orders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (!order) return undefined;

    order.orderStatus = newStatus;
    order.updatedAt = new Date().toISOString();

    if (newStatus === 'delivered') {
      order.paymentStatus = 'paid';
    }

    const historyItem: OrderStatusHistoryItem = {
      id: 'hist-' + Date.now(),
      orderId: order.id,
      status: newStatus,
      changedBy,
      timestamp: new Date().toISOString(),
      note: note || `Status updated to ${newStatus}`,
    };

    if (!order.statusHistory) {
      order.statusHistory = [];
    }
    order.statusHistory.push(historyItem);
    this.save();
    return order;
  }

  // --- Favorites ---
  getUserFavorites(userId: string): string[] {
    return this.db.favorites.filter(f => f.userId === userId).map(f => f.foodItemId);
  }

  toggleFavorite(userId: string, foodItemId: string): boolean {
    const idx = this.db.favorites.findIndex(f => f.userId === userId && f.foodItemId === foodItemId);
    let isFav = false;
    if (idx >= 0) {
      this.db.favorites.splice(idx, 1);
      isFav = false;
    } else {
      this.db.favorites.push({
        id: 'fav-' + Date.now(),
        userId,
        foodItemId,
        createdAt: new Date().toISOString(),
      });
      isFav = true;
    }
    this.save();
    return isFav;
  }

  // --- Reset to Defaults ---
  resetToDefaults() {
    this.db = {
      users: defaultUsers,
      categories: defaultCategories,
      foodItems: defaultFoodItems,
      orders: defaultOrders,
      coupons: defaultCoupons,
      favorites: [],
    };
    this.save();
  }
}

export const db = new DatabaseService();
