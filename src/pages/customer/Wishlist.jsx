import { useEffect, useState } from 'react'
import { Heart, Package, ShoppingCart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import toast from 'react-hot-toast'

const CATEGORY_COLORS = {
  'Electronics':    'bg-blue-50 text-blue-700 border-blue-200',
  'Fashion':        'bg-pink-50 text-pink-700 border-pink-200',
  'Home & Kitchen': 'bg-orange-50 text-orange-700 border-orange-200',
  'Beauty':         'bg-purple-50 text-purple-700 border-purple-200',
  'Books':          'bg-green-50 text-green-700 border-green-200',
  'Sports':         'bg-red-50 text-red-700 border-red-200',
}

export default function Wishlist() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()
  const { isWishlisted, toggle } = useWishlist()
  const navigate = useNavigate()

  const load = () => {
    setLoading(true)
    api.get('/api/wishlist')
      .then(res => { setProducts(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleToggle = async (product) => {
    await toggle(product)
    setProducts(prev => prev.filter(p => p.id !== product.id))
  }

  const handleAdd = (product) => {
    addToCart(product)
    toast.success(`${product.name} added to cart!`)
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-red-400 rounded-xl flex items-center justify-center">
          <Heart className="w-5 h-5 text-white fill-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-500 mt-0.5">{products.length} saved item{products.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-24">
          <Heart className="w-16 h-16 mx-auto mb-4 text-gray-200" />
          <p className="text-xl font-semibold text-gray-400 mb-2">Your wishlist is empty</p>
          <p className="text-gray-400 mb-6">Save products you love by tapping the heart icon</p>
          <button onClick={() => navigate('/products')} className="btn-primary px-6">
            Browse Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => navigate(`/products/${product.id}`)}
              className="card hover:shadow-md transition-all duration-200 group flex flex-col p-0 overflow-hidden cursor-pointer"
            >
              <div className="w-full h-52 bg-gradient-to-br from-sky-50 to-pink-100 overflow-hidden relative">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-sky-300" />
                  </div>
                )}
                {product.category && (
                  <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold border ${CATEGORY_COLORS[product.category] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {product.category}
                  </span>
                )}
                {/* Heart button */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleToggle(product) }}
                  className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                </button>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <p className="text-xl font-bold text-sky-600">₹{Number(product.price).toLocaleString('en-IN')}</p>
                    <p className={`text-xs font-medium ${product.stockQuantity > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleAdd(product) }}
                    disabled={product.stockQuantity === 0}
                    className="flex items-center gap-2 bg-gradient-to-r from-sky-600 to-pink-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="w-4 h-4" /> Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
