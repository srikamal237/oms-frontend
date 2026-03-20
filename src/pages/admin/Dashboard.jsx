import { useEffect, useState } from 'react'
import { Package, ShoppingBag, Users, IndianRupee, TrendingUp, Clock, Award } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../../api/axios'

const statusColors = {
  CREATED:   'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-yellow-100 text-yellow-700',
  SHIPPED:   'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, revenue: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [daily, setDaily] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/api/products?size=1'),
      api.get('/api/orders?size=1'),
      api.get('/api/admin/users?size=1'),
      api.get('/api/admin/analytics'),
      api.get('/api/orders?size=5'),
    ]).then(([products, orders, users, analytics, recentRes]) => {
      setStats({
        products: products.data.totalElements ?? (products.data.content ?? products.data).length,
        orders: orders.data.totalElements ?? (orders.data.content ?? orders.data).length,
        users: users.data.totalElements ?? (users.data.content ?? users.data).length,
        revenue: analytics.data.totalRevenue,
      })
      setDaily(analytics.data.daily)
      setTopProducts(analytics.data.topProducts)
      setRecentOrders(recentRes.data.content ?? recentRes.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const cards = [
    { label: 'Total Products', value: stats.products, icon: Package, color: 'from-blue-500 to-blue-600' },
    { label: 'Total Orders', value: stats.orders, icon: ShoppingBag, color: 'from-purple-500 to-purple-600' },
    { label: 'Total Users', value: stats.users, icon: Users, color: 'from-pink-500 to-rose-500' },
    { label: 'Total Revenue', value: `₹${Number(stats.revenue).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'from-emerald-500 to-green-600' },
  ]

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your order management system</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-md`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Area Chart */}
        <div className="card lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Revenue — Last 7 Days</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={daily} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={v => `₹${Number(v/1000).toFixed(0)}K`} width={60} />
              <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="card">
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-bold text-gray-900">Top Products</h2>
          </div>
          {topProducts.length === 0 ? (
            <p className="text-gray-400 text-center py-8 text-sm">No sales yet</p>
          ) : (
            <div className="space-y-4">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white ${
                    i === 0 ? 'bg-yellow-400' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-400' : 'bg-sky-300'
                  }`}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.sold} sold</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Orders per Day Bar Chart */}
      <div className="card mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Orders — Last 7 Days</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={daily} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#0ea5e9" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9ca3af' }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
            <Tooltip formatter={(v) => [v, 'Orders']} />
            <Bar dataKey="orders" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-sky-500" />
          <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-semibold">Order ID</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Items</th>
                  <th className="pb-3 font-semibold">Total</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-medium text-gray-900">#{order.orderId}</td>
                    <td className="py-3 text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="py-3 text-gray-600">{order.items?.length}</td>
                    <td className="py-3 font-semibold text-sky-600">₹{Number(order.totalAmount).toLocaleString('en-IN')}</td>
                    <td className="py-3">
                      <span className={`badge ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>{order.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
