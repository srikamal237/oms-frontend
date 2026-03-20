import { useEffect, useState } from 'react'
import { Trash2, User, Shield } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const { user: currentUser } = useAuth()

  const load = () =>
    api.get('/api/admin/users').then((r) => { setUsers(r.data); setLoading(false) })

  useEffect(() => { load() }, [])

  const remove = async (id, username) => {
    if (username === currentUser.username) return toast.error("You can't delete yourself!")
    if (!confirm(`Delete user "${username}"?`)) return
    try {
      await api.delete(`/api/admin/users/${id}`)
      toast.success(`User "${username}" deleted`)
      load()
    } catch {
      toast.error('Failed to delete user')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-500 mt-1">{users.length} registered users</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u) => {
          const isAdmin = u.roles?.some((r) => r === 'ROLE_ADMIN' || r?.name === 'ROLE_ADMIN')
          const isSelf = u.username === currentUser.username
          return (
            <div key={u.id} className="card hover:shadow-md transition-all flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isAdmin ? 'bg-gradient-to-br from-pink-400 to-pink-600' : 'bg-gradient-to-br from-sky-400 to-sky-600'}`}>
                {isAdmin ? <Shield className="w-6 h-6 text-white" /> : <User className="w-6 h-6 text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 truncate">{u.username}</p>
                  {isSelf && <span className="badge bg-sky-100 text-sky-600 text-xs">You</span>}
                </div>
                <span className={`badge text-xs mt-1 ${isAdmin ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-500'}`}>
                  {isAdmin ? 'Admin' : 'Customer'}
                </span>
              </div>
              {!isSelf && (
                <button
                  onClick={() => remove(u.id, u.username)}
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
