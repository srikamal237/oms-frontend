import { useEffect, useState } from 'react'
import { Plus, Trash2, Tag, X, Check } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const empty = { code: '', discountType: 'PERCENT', discountValue: '', minOrderAmount: '' }

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  const load = () =>
    api.get('/api/admin/coupons').then(r => { setCoupons(r.data); setLoading(false) })

  useEffect(() => { load() }, [])

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/api/admin/coupons', {
        ...form,
        discountValue: parseFloat(form.discountValue),
        minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : null,
      })
      toast.success('Coupon created!')
      setModal(false)
      setForm(empty)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create coupon')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id, code) => {
    if (!confirm(`Delete coupon "${code}"?`)) return
    try {
      await api.delete(`/api/admin/coupons/${id}`)
      toast.success('Coupon deleted')
      load()
    } catch {
      toast.error('Failed to delete coupon')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coupons</h1>
          <p className="text-gray-500 mt-1">{coupons.length} active coupon{coupons.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Coupon
        </button>
      </div>

      {coupons.length === 0 ? (
        <div className="text-center py-20">
          <Tag className="w-16 h-16 mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400">No coupons yet. Create one to offer discounts.</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-left text-gray-500">
                <th className="px-6 py-4 font-semibold">Code</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Value</th>
                <th className="px-6 py-4 font-semibold">Min Order</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {coupons.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">{c.code}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{c.discountType}</td>
                  <td className="px-6 py-4 font-semibold text-sky-600">
                    {c.discountType === 'PERCENT' ? `${c.discountValue}%` : `₹${Number(c.discountValue).toLocaleString('en-IN')}`}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {c.minOrderAmount ? `₹${Number(c.minOrderAmount).toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${c.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => remove(c.id, c.code)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">New Coupon</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={save} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Code</label>
                <input
                  className="input uppercase"
                  placeholder="e.g. SAVE20"
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Discount Type</label>
                <select className="input" value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value })}>
                  <option value="PERCENT">Percentage (%)</option>
                  <option value="FLAT">Flat Amount (₹)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {form.discountType === 'PERCENT' ? 'Discount %' : 'Discount Amount (₹)'}
                </label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  max={form.discountType === 'PERCENT' ? 100 : undefined}
                  step="0.01"
                  placeholder={form.discountType === 'PERCENT' ? '20' : '500'}
                  value={form.discountValue}
                  onChange={e => setForm({ ...form, discountValue: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Min Order Amount (₹) — optional</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  placeholder="e.g. 1000"
                  value={form.minOrderAmount}
                  onChange={e => setForm({ ...form, minOrderAmount: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 btn-primary flex items-center justify-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Check className="w-4 h-4" /> Create</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
