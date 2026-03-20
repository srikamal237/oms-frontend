import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Package, X, Check } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Kitchen', 'Beauty', 'Books', 'Sports']
const empty = { name: '', description: '', price: '', stockQuantity: '', imageUrl: '', category: '' }

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () =>
    api.get('/api/products?size=200').then((r) => { setProducts(r.data.content ?? r.data); setLoading(false) })

  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(empty); setEditId(null); setModal(true) }
  const openEdit = (p) => { setForm({ name: p.name, description: p.description, price: p.price, stockQuantity: p.stockQuantity, imageUrl: p.imageUrl || '', category: p.category || '' }); setEditId(p.id); setModal(true) }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, price: parseFloat(form.price), stockQuantity: parseInt(form.stockQuantity) }
      if (editId) await api.put(`/api/products/${editId}`, payload)
      else await api.post('/api/products', payload)
      toast.success(editId ? 'Product updated!' : 'Product created!')
      setModal(false)
      load()
    } catch {
      toast.error('Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return
    try {
      await api.delete(`/api/products/${id}`)
      toast.success('Product deleted')
      load()
    } catch {
      toast.error('Failed to delete product')
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
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">{products.length} products total</p>
        </div>
        <div className="flex items-center gap-3">
          {products.filter(p => p.stockQuantity > 0 && p.stockQuantity < 10).length > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg text-sm font-medium">
              ⚠ {products.filter(p => p.stockQuantity > 0 && p.stockQuantity < 10).length} low stock
            </span>
          )}
          {products.filter(p => p.stockQuantity === 0).length > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium">
              ✕ {products.filter(p => p.stockQuantity === 0).length} out of stock
            </span>
          )}
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" /> Add Product
          </button>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-left text-gray-500">
              <th className="px-6 py-4 font-semibold">Product</th>
              <th className="px-6 py-4 font-semibold">Price</th>
              <th className="px-6 py-4 font-semibold">Stock</th>
              <th className="px-6 py-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-sky-50 to-pink-100 rounded-xl flex-shrink-0 overflow-hidden">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display='none' }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-sky-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{p.name}</p>
                      <p className="text-gray-400 text-xs truncate max-w-xs">{p.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-sky-600">₹{Number(p.price).toLocaleString('en-IN')}</td>
                <td className="px-6 py-4">
                  <span className={`badge ${
                    p.stockQuantity === 0 ? 'bg-red-100 text-red-600' :
                    p.stockQuantity < 10 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {p.stockQuantity === 0 ? 'Out of stock' : `${p.stockQuantity} units`}
                    {p.stockQuantity > 0 && p.stockQuantity < 10 && ' ⚠'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="p-2 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => remove(p.id, p.name)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">{editId ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={save} className="space-y-4">
              {/* Image Preview */}
              {form.imageUrl && (
                <div className="w-full h-36 rounded-xl overflow-hidden bg-gray-50">
                  <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL</label>
                <input className="input" placeholder="https://..." value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea className="input resize-none" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="">— Select category —</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹)</label>
                  <input className="input" type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Stock</label>
                  <input className="input" type="number" min="0" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} required />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 btn-primary flex items-center justify-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Check className="w-4 h-4" /> Save</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
