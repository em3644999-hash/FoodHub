# FoodieHub - Full-Stack Online Food Ordering System with AI

FoodieHub is a production-grade full-stack online food ordering web application designed for real-world operations and academic mini-project demonstrations. It includes complete end-to-end customer ordering workflows, session authentication, persistent JSON database storage with ACID-like atomic writes, an operations administrator dashboard, and a Google Gemini-powered conversational food assistant ("Foodie AI").

---

## 1. Key Features

### Customer Experience
- **Interactive Home Page**: Hero with search, popular categories, dynamic promo banners with coupon codes, chef specials, bestsellers, and customer trust badges.
- **Dynamic Menu & Filtering**:
  - Live full-text search across dish names, descriptions, and ingredients.
  - Multi-criteria filtering by category, Pure Veg vs Non-Veg, spice level (Mild, Medium, Hot, Extra Hot), and price range slider.
  - Dynamic sorting by Popularity, Customer Rating, Price (Low to High / High to Low), and Preparation Time.
  - Dish detail view displaying ingredients, allergen disclosures, preparation times, and calorie estimates.
- **Cart & Server-Recalculated Checkout**:
  - Persistent shopping cart backed by localStorage.
  - Automatic tier-based delivery calculation (Free for orders ₹400+, else ₹40).
  - Validated coupon discount engine (`FOODIE50`, `TASTY100`, `WELCOME20`).
  - Standard 5% GST tax calculation.
  - Critical server-side price recalculation: cart totals submitted by the client are never trusted; the server re-queries each dish from the database to prevent client price tampering.
  - Multiple payment options: Cash on Delivery (COD) and simulated Instant UPI / Card payments.
- **Live 5-Stage Order Tracking**:
  - Real-time visual order status timeline: `Order Placed` &rarr; `Confirmed` &rarr; `Preparing` &rarr; `Out for Delivery` &rarr; `Delivered`.
  - Customer order cancellation engine (active during `placed` and `confirmed` stages).
  - Snapshot order items ensuring historical price accuracy even if menu prices change later.
  - Print-friendly customer receipt generator.
- **Customer Account & AI Preferences**:
  - Profile management, delivery phone verification, and multiple saved addresses with default flags.
  - Foodie AI taste profiling (e.g., Pure Veg Only, Spicy Lover, Low Calorie, Jain Friendly).
  - Reorder previous meals with a single click.
  - Bookmarked favorite dishes.

### Administrator Kitchen & Store Operations
- **Overview Analytics**:
  - Net sales revenue from valid orders, total order count, active in-kitchen orders, completed orders, and customer count.
  - 7-day sales revenue trend bar chart.
  - Top 5 best-selling dishes ranked by order count and gross revenue.
- **Orders Management**:
  - Filterable order list by status (`placed`, `confirmed`, `preparing`, `out_for_delivery`, `delivered`, `cancelled`).
  - Search by order number, customer name, or phone number.
  - Live order status transition dropdown with custom kitchen activity notes.
- **Food Menu CRUD**:
  - Add new dishes with image URL, category, vegetarian flag, spice level, preparation time, and allergens.
  - Instant one-click availability toggle (`Available` vs `Sold Out`).
  - Edit pricing and descriptions.
  - Safe dish deletion.
- **Category Management**:
  - Create and manage food categories with automatic dish counts.
- **Customer Directory**:
  - View registered customers, contact numbers, order frequency, and lifetime spending.
- **One-Click Demo Reset**:
  - Reset seed database back to factory defaults at any time.

### Foodie AI Assistant (Powered by Gemini)
- Server-side integration with Google Gemini (`gemini-3.8-flash`) using `@google/genai`.
- Strict grounding: The model receives the live menu snapshot and is constrained to only recommend available dishes.
- Respects dietary constraints, budget limits (e.g., "under ₹250"), spice preferences, and allergy warnings.
- Structured JSON output with direct dish cards and one-click "Add to Cart" functionality.
- Seamless automatic fallback: If `GEMINI_API_KEY` is not configured, a built-in rule-based culinary intelligence engine handles user queries without downtime.

---

## 2. Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React icons, Canvas Confetti.
- **Backend**: Node.js, Express 4, TypeScript with `tsx`.
- **Database**: File-backed persistent JSON database (`data/foodiehub.json`) with atomic synchronization and seed data.
- **Authentication**: HMAC-SHA256 authenticated session tokens with role-based authorization (Customer vs Admin).
- **AI**: Google Gen AI SDK (`@google/genai`) using `gemini-3.8-flash`.

---

## 3. Demo Credentials

Quick switcher buttons are available in the top bar of the application:

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Customer** | `demo@example.com` | `customer123` | Rahul Sharma (Indiranagar, Bengaluru) |
| **Admin** | `admin@foodiehub.com` | `admin123` | FoodieHub Kitchen & Operations Manager |

New customer accounts can also be registered at any time via the "Sign In" modal.

---

## 4. Active Coupon Codes

| Coupon Code | Discount | Minimum Order | Terms |
| :--- | :--- | :--- | :--- |
| `FOODIE50` | 50% OFF (Up to ₹150) | ₹299 | Applicable on all dishes |
| `TASTY100` | Flat ₹100 OFF | ₹400 | Perfect for feasts & group orders |
| `WELCOME20` | 20% OFF (Up to ₹80) | ₹199 | Welcome discount on all orders |

---

## 5. Environment Variables & Setup

Create a `.env` file in the root directory:

```env
# Gemini API Key for Foodie AI Assistant (Automatically provided in Google AI Studio)
GEMINI_API_KEY="your_gemini_api_key_here"

# Application URL
APP_URL="http://localhost:3000"

# Optional JWT Session Secret
JWT_SECRET="foodiehub_super_secret_jwt_key_2026"
```

### Installation & Local Run
```bash
# Install dependencies
npm install

# Run the full-stack development server (Express backend + Vite frontend on port 3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## 6. Verification & Test Scenarios

1. **Menu Browsing & Search**:
   - Search for "biryani" or "paneer" &rarr; matching dishes appear instantly.
   - Click "Pure Veg" &rarr; non-veg items are hidden.
   - Adjust Max Price slider &rarr; items re-filter dynamically.
2. **Cart & Pricing Recalculation**:
   - Add "Classic Margherita Classica" (₹299) and "Crispy Peri-Peri French Fries" (₹129).
   - Subtotal is ₹428 (&ge; ₹400) &rarr; Delivery Fee becomes `FREE`.
   - Apply coupon `FOODIE50` &rarr; ₹150 discount applied.
   - Taxes calculated at 5% GST on discounted amount.
3. **Checkout & Order Creation**:
   - Click "Checkout" &rarr; confirm delivery address & phone number &rarr; select "Cash on Delivery" or "Demo UPI".
   - Click "Place Order" &rarr; confetti celebration triggers and redirects to live order tracking page with unique order number (e.g. `#FH-49210`).
4. **Order Tracking & Cancellation**:
   - Observe live status stepper on the tracking page.
   - Click "Cancel Order" while in `placed` or `confirmed` stage &rarr; order cancels with note.
5. **Admin Operations**:
   - Switch to Admin via top bar demo switcher.
   - Open Admin Dashboard &rarr; inspect total sales, active orders, and sales chart.
   - Go to "Orders Management" &rarr; change order status from `placed` to `preparing` &rarr; changes reflect in customer tracking in real time.
   - Go to "Food Menu" &rarr; toggle an item's availability to `Sold Out` &rarr; item shows as unavailable across customer menu.
6. **Foodie AI Assistant**:
   - Click "Ask Foodie AI" floating button on bottom left.
   - Ask: *"Suggest a vegetarian dinner under ₹250"* &rarr; Foodie AI returns menu items (e.g. Lucknowi Dum Biryani or Jeera Rice + Dal Tadka) with prices and a 1-click Add to Cart button.
