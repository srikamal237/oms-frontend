# Order Management System — Frontend

The frontend for the Order Management System, built with **React.js**, **Vite**, and **Tailwind CSS**.

## Tech Stack

- React.js 18
- Vite
- Tailwind CSS
- Axios (HTTP client)
- React Router v6
- Lucide React (icons)
- Recharts (dashboard charts)
- React Hot Toast (notifications)

## Features

- JWT authentication with protected routes
- Customer: browse products, cart, wishlist, place orders, apply coupon codes
- Order tracking timeline (Created → Confirmed → Shipped → Delivered)
- Admin dashboard with sales charts and analytics
- Admin: product management, inventory alerts, order status updates, CSV export
- Fully responsive design

## Prerequisites

- Node.js 18+
- npm or yarn
- Backend server running at http://localhost:8080 (see backend repo)

## Setup & Run

### 1. Clone the repo

```bash
git clone https://github.com/srikamal237/oms-frontend.git
cd oms-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure backend URL (optional)

By default the frontend connects to `http://localhost:8080`.

If your backend runs on a different URL, create a `.env.local` file:

```env
VITE_API_URL=http://localhost:8080
```

### 4. Run the development server

```bash
npm run dev
```

App opens at **http://localhost:5173**

> Make sure the backend is running first at http://localhost:8080

## Build for Production

```bash
npm run build
```

Output goes to the `dist/` folder. Deploy to Vercel, Netlify, or any static host.

## Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Customer | `testuser` | `test123` |

Or register a new customer account from the login page.

## Pages

| Route | Access | Description |
|-------|--------|-------------|
| `/login` | Public | Login page |
| `/register` | Public | Register page |
| `/products` | Customer | Browse products |
| `/cart` | Customer | Cart with coupon input |
| `/wishlist` | Customer | Saved products |
| `/orders` | Customer | Order history |
| `/orders/:id` | Customer | Order detail + tracking timeline |
| `/admin/dashboard` | Admin | Charts and stats |
| `/admin/products` | Admin | Product management |
| `/admin/orders` | Admin | All orders + status update |
| `/admin/users` | Admin | User management |

## Backend Repo

👉 https://github.com/srikamal237/order-management-system

## Project Structure

```
src/
├── api/
│   └── axios.js            # Axios instance with JWT interceptors
├── context/
│   ├── CartContext.jsx      # Global cart state
│   └── WishlistContext.jsx  # Global wishlist state
├── pages/
│   ├── admin/              # Dashboard, Products, Orders, Users
│   └── customer/           # Home, Cart, Wishlist, Orders, Profile
├── App.jsx                 # Routes and providers
└── main.jsx
```

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
