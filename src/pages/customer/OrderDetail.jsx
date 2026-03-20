import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Package, CheckCircle, Truck, XCircle, Clock, RotateCcw, Ban } from 'lucide-react'
import api from '../../api/axios'
import { useCart } from '../../context/CartContext'
import toast from 'react-hot-toast'

const steps = [
  { key: 'CREATED',   label: 'Order Placed', timestampKey: 'createdAt'   },
  { key: 'CONFIRMED', label: 'Confirmed',     timestampKey: 'confirmedAt' },
  { key: 'SHIPPED',   label: 'Shipped',       timestampKey: 'shippedAt'   },
  { key: 'DELIVERED', label: 'Delivered',     timestampKey: 'deliveredAt' },
]

const statusColors = {
  CREATED:   'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-yellow-100 text-yellow-700',
  SHIPPED:   'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

function fmt(ts) {
  if (!ts) return null
  return new Date(ts).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const StatusIcon = ({ status }) => {
  if (status === 'DELIVERED') return <CheckCircle className="w-6 h-6 text-green-500" />
  if (status === 'SHIPPED')   return <Truck className="w-6 h-6 text-purple-500" />
  if (status === 'CANCELLED') return <XCircle className="w-6 h-6 text-red-500" />
  return <Clock className="w-6 h-6 text-blue-500" />
}

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    api.get(`/api/orders/${id}`).then((res) => {
      setOrder(res.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  const handleCancel = async () => {
    if (!confirm('Cancel this order?')) return
    setCancelling(true)
    try {
      const res = await api.put(`/api/orders/${id}/status`, { status: 'CANCELLED' })
      setOrder(res.data)
      toast.success('Order cancelled successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order')
    } finally {
      setCancelling(false)
    }
  }

  const handleReorder = () => {
    order.items?.forEach(item => {
      addToCart({
        id: item.productId,
        name: item.productName,
        price: item.price,
        imageUrl: null,
      }, item.quantity)
    })
    toast.success('Items added to cart!')
    navigate('/cart')
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!order) return (
    <div className="text-center py-20 text-gray-400">Order not found</div>
  )

  const currentStep = order.status === 'CANCELLED' ? -1 : steps.findIndex(s => s.key === order.status)
  const canCancel = order.status === 'CREATED'

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/orders')}
        className="flex items-center gap-2 text-gray-500 hover:text-sky-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </button>

      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order #{order.orderId}</h1>
          <p className="text-gray-500 mt-1">Placed on {fmt(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`badge text-sm px-4 py-2 ${statusColors[order.status]}`}>
            <StatusIcon status={order.status} />
            <span className="ml-2">{order.status}</span>
          </span>
          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <Ban className="w-4 h-4" />
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>
      </div>

      {/* Progress Tracker */}
      {order.status !== 'CANCELLED' ? (
        <div className="card mb-6">
          <h2 className="font-semibold text-gray-900 mb-8">Order Progress</h2>
          <div className="relative">
            <div className="absolute top-5 left-[12.5%] right-[12.5%] h-0.5 bg-gray-100" />
            <div
              className="absolute top-5 left-[12.5%] h-0.5 bg-gradient-to-r from-sky-600 to-pink-500 transition-all duration-700"
              style={{ width: currentStep <= 0 ? '0%' : `${(currentStep / (steps.length - 1)) * 75}%` }}
            />
            <div className="flex justify-between relative">
              {steps.map((step, i) => {
                const done = i <= currentStep
                const ts = fmt(order[step.timestampKey])
                return (
                  <div key={step.key} className="flex flex-col items-center" style={{ width: '25%' }}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm z-10 transition-all ${
                      done ? 'bg-gradient-to-br from-sky-600 to-pink-500 text-white shadow-md' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {i < currentStep ? '✓' : i + 1}
                    </div>
                    <p className={`text-xs mt-2 font-semibold text-center ${done ? 'text-sky-600' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                    {ts && (
                      <p className="text-xs text-gray-400 text-center mt-0.5 leading-tight px-1">{ts}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="card mb-6 border border-red-100 bg-red-50">
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-700">Order Cancelled</p>
              {order.cancelledAt && (
                <p className="text-sm text-red-500">{fmt(order.cancelledAt)}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="card mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Items Ordered</h2>
        <div className="space-y-3">
          {order.items?.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-sky-50 to-pink-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{item.productName}</p>
                  <p className="text-sm text-gray-500">
                    Qty: {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
              <p className="font-bold text-gray-900">₹{Number(item.subtotal).toLocaleString('en-IN')}</p>
            </div>
          ))}
        </div>

        {order.discountAmount > 0 && (
          <div className="flex justify-between items-center pt-3 mt-2 border-t border-gray-100 text-green-600">
            <span className="text-sm font-medium">
              Coupon {order.couponCode && <span className="font-bold">({order.couponCode})</span>}
            </span>
            <span className="font-semibold">− ₹{Number(order.discountAmount).toLocaleString('en-IN')}</span>
          </div>
        )}
        <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-100">
          <span className="font-bold text-gray-900 text-lg">Total</span>
          <span className="font-bold text-sky-600 text-2xl">₹{Number(order.totalAmount).toLocaleString('en-IN')}</span>
        </div>
      </div>

      <button
        onClick={handleReorder}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-sky-200 text-sky-600 font-semibold rounded-2xl hover:bg-sky-50 transition-colors"
      >
        <RotateCcw className="w-5 h-5" /> Reorder All Items
      </button>
    </div>
  )
}
