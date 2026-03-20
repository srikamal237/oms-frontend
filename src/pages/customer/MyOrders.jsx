import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, ChevronRight } from 'lucide-react'
import api from '../../api/axios'

const statusColors = {
  CREATED:   'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-yellow-100 text-yellow-700',
  SHIPPED:   'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

export default function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/api/orders').then((res) => {
      setOrders(res.data.content ?? res.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <ClipboardList className="w-20 h-20 mx-auto text-gray-200 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No orders yet</h2>
          <p className="text-gray-400 mb-6">Place your first order to see it here</p>
          <button onClick={() => navigate('/products')} className="btn-primary">
            Shop Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.orderId}
              onClick={() => navigate(`/orders/${order.orderId}`)}
              className="card hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-50 to-pink-100 rounded-xl flex items-center justify-center">
                    <ClipboardList className="w-6 h-6 text-sky-500" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Order #{order.orderId}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-sky-600 text-lg">${order.totalAmount?.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">{order.items?.length} item(s)</p>
                  </div>
                  <span className={`badge ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {order.status}
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-sky-500 transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
