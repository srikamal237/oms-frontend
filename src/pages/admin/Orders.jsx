import { useEffect, useState } from 'react'
import { ChevronDown, Download } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const statusColors = {
  CREATED:   'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-yellow-100 text-yellow-700',
  SHIPPED:   'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

const nextStatuses = {
  CREATED:   ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPED'],
  SHIPPED:   ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [exporting, setExporting] = useState(false)

  const load = () =>
    api.get('/api/admin/orders').then((r) => {
      setOrders(r.data.content ?? r.data)
      setLoading(false)
    })

  useEffect(() => { load() }, [])

  const updateStatus = async (orderId, status) => {
    setUpdating(orderId)
    try {
      await api.put(`/api/admin/orders/${orderId}/status`, { status })
      toast.success(`Order #${orderId} → ${status}`)
      load()
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await api.get('/api/admin/orders/export', { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = 'orders.csv'
      a.click()
      URL.revokeObjectURL(url)
      toast.success('CSV downloaded!')
    } catch {
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 mt-1">{orders.length} orders total</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm font-semibold hover:bg-green-100 transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-left text-gray-500">
              <th className="px-6 py-4 font-semibold">Order ID</th>
              <th className="px-6 py-4 font-semibold">Date</th>
              <th className="px-6 py-4 font-semibold">Items</th>
              <th className="px-6 py-4 font-semibold">Total</th>
              <th className="px-6 py-4 font-semibold">Coupon</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map((order) => {
              const next = nextStatuses[order.status] || []
              return (
                <tr key={order.orderId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">#{order.orderId}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{order.items?.length} item(s)</td>
                  <td className="px-6 py-4 font-bold text-sky-600">₹{Number(order.totalAmount).toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4">
                    {order.couponCode
                      ? <span className="badge bg-green-100 text-green-700 text-xs">{order.couponCode}</span>
                      : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {next.length > 0 ? (
                      <div className="relative inline-block">
                        <select
                          disabled={updating === order.orderId}
                          onChange={(e) => e.target.value && updateStatus(order.orderId, e.target.value)}
                          defaultValue=""
                          className="appearance-none bg-sky-50 text-sky-700 font-semibold text-sm px-3 py-2 pr-8 rounded-lg border border-sky-100 cursor-pointer hover:bg-sky-100 transition-colors focus:outline-none"
                        >
                          <option value="" disabled>Change status</option>
                          {next.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-500 pointer-events-none" />
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">Final</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
