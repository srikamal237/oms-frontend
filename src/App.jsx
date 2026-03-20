import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'
import Navbar from './components/Navbar'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Home from './pages/customer/Home'
import Cart from './pages/customer/Cart'
import MyOrders from './pages/customer/MyOrders'
import OrderDetail from './pages/customer/OrderDetail'
import ProductDetail from './pages/customer/ProductDetail'
import Profile from './pages/customer/Profile'
import Wishlist from './pages/customer/Wishlist'
import Dashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import AdminOrders from './pages/admin/Orders'
import AdminUsers from './pages/admin/Users'

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
          <Toaster position="top-right" toastOptions={{ className: 'font-medium text-sm' }} />
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Customer */}
            <Route path="/products" element={<ProtectedRoute><Layout><Home /></Layout></ProtectedRoute>} />
            <Route path="/products/:id" element={<ProtectedRoute><Layout><ProductDetail /></Layout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute><Layout><Wishlist /></Layout></ProtectedRoute>} />
            <Route path="/cart" element={<ProtectedRoute><Layout><Cart /></Layout></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Layout><MyOrders /></Layout></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute><Layout><OrderDetail /></Layout></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin/dashboard" element={<AdminRoute><Layout><Dashboard /></Layout></AdminRoute>} />
            <Route path="/admin/products" element={<AdminRoute><Layout><AdminProducts /></Layout></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><Layout><AdminOrders /></Layout></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><Layout><AdminUsers /></Layout></AdminRoute>} />

            {/* Default */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
