import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, Tag, X } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { useState } from 'react'

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart, total } = useCart()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [couponInput, setCouponInput] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [validating, setValidating] = useState(false)

  const finalTotal = coupon ? coupon.finalAmount : total

  const applyCoupon = async () => {
    if (!couponInput.trim()) return
    setValidating(true)
    try {
      const res = await api.post('/api/coupons/validate', {
        code: couponInput.trim(),
        orderAmount: total
      })
      setCoupon(res.data)
      toast.success(`Coupon applied! You save ₹${Number(res.data.discount).toLocaleString('en-IN')}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon')
    } finally {
      setValidating(false)
    }
  }

  const removeCoupon = () => {
    setCoupon(null)
    setCouponInput('')
  }

  const placeOrder = async () => {
    if (cart.length === 0) return
    setLoading(true)
    try {
      const items = cart.map(({ productId, quantity }) => ({ productId, quantity }))
      const res = await api.post('/api/orders', {
        items,
        couponCode: coupon?.code || null
      })
      clearCart()
      toast.success('Order placed successfully!')
      navigate(`/orders/${res.data.orderId}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0) return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <ShoppingCart className="w-24 h-24 mx-auto text-gray-200 mb-6" />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
      <p className="text-gray-500 mb-6">Add some products to get started</p>
      <button onClick={() => navigate('/products')} className="btn-primary">
        Browse Products
      </button>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.productId} className="card flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-sky-50 to-pink-100 rounded-xl flex-shrink-0 overflow-hidden">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingCart className="w-8 h-8 text-sky-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                <p className="text-sky-600 font-bold">₹{Number(item.price).toLocaleString('en-IN')}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-semibold">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="font-bold text-gray-900 w-24 text-right">
                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
              </p>
              <button
                onClick={() => removeFromCart(item.productId)}
                className="text-gray-400 hover:text-red-500 transition-colors ml-2"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="card h-fit sticky top-24">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
          <div className="space-y-3 mb-6">
            {cart.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm text-gray-600">
                <span className="truncate max-w-[140px]">{item.name} x{item.quantity}</span>
                <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          {/* Coupon */}
          <div className="mb-5">
            {coupon ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-bold text-green-700">{coupon.code}</span>
                  <span className="text-xs text-green-600">applied</span>
                </div>
                <button onClick={removeCoupon} className="text-green-500 hover:text-green-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  className="input flex-1 text-sm"
                  placeholder="Coupon code"
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                />
                <button
                  onClick={applyCoupon}
                  disabled={validating || !couponInput.trim()}
                  className="px-3 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-40"
                >
                  {validating ? '...' : 'Apply'}
                </button>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 pt-4 mb-6 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>
            {coupon && (
              <div className="flex justify-between text-sm text-green-600 font-medium">
                <span>Discount ({coupon.code})</span>
                <span>− ₹{Number(coupon.discount).toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t border-gray-100">
              <span>Total</span>
              <span className="text-sky-600">₹{Number(finalTotal).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            onClick={placeOrder}
            disabled={loading}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <> Place Order <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
          <button
            onClick={() => navigate('/products')}
            className="w-full btn-secondary py-2 mt-3 text-sm"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  )
}
