import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, Package, ClipboardList, LayoutDashboard, Users, LogOut, User, Heart } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const { itemCount } = useCart()
  const { wishlistIds } = useWishlist()
  const location = useLocation()

  const isActive = (path) => location.pathname.startsWith(path)

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-sky-600 to-pink-500 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">OrderMS</span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {user && !isAdmin() && (
              <>
                <Link
                  to="/products"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/products') ? 'bg-sky-50 text-sky-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Package className="w-4 h-4" /> Products
                </Link>
                <Link
                  to="/orders"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/orders') ? 'bg-sky-50 text-sky-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" /> My Orders
                </Link>
                <Link
                  to="/wishlist"
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/wishlist') ? 'bg-pink-50 text-pink-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Heart className="w-4 h-4" /> Wishlist
                  {wishlistIds?.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {wishlistIds.length}
                    </span>
                  )}
                </Link>
                <Link
                  to="/cart"
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/cart') ? 'bg-sky-50 text-sky-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" /> Cart
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {itemCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {user && isAdmin() && (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin/dashboard') ? 'bg-sky-50 text-sky-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <Link
                  to="/admin/products"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin/products') ? 'bg-sky-50 text-sky-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Package className="w-4 h-4" /> Products
                </Link>
                <Link
                  to="/admin/orders"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin/orders') ? 'bg-sky-50 text-sky-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" /> Orders
                </Link>
                <Link
                  to="/admin/users"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin/users') ? 'bg-sky-50 text-sky-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Users className="w-4 h-4" /> Users
                </Link>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/profile" className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg hover:bg-sky-50 transition-colors">
                  <div className="w-7 h-7 bg-gradient-to-br from-sky-500 to-pink-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.username}</span>
                  {isAdmin() && (
                    <span className="badge bg-pink-100 text-pink-600 text-xs">Admin</span>
                  )}
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="btn-secondary text-sm py-2 px-4">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
