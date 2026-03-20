import { useState } from 'react'
import { User, Lock, Eye, EyeOff, Check } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) return toast.error('New passwords do not match')
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters')
    setSaving(true)
    try {
      await api.put('/api/users/me/password', { currentPassword, newPassword })
      toast.success('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  const isAdmin = user?.roles?.includes('ROLE_ADMIN')

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

      {/* Profile Card */}
      <div className="card mb-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-500 to-pink-500 flex items-center justify-center shadow-lg flex-shrink-0">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user?.username}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`badge text-xs px-3 py-1 ${isAdmin ? 'bg-pink-100 text-pink-700' : 'bg-sky-100 text-sky-700'}`}>
                {isAdmin ? 'Admin' : 'Customer'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Username</p>
            <p className="font-semibold text-gray-900">{user?.username}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Role</p>
            <p className="font-semibold text-gray-900">{isAdmin ? 'Administrator' : 'Customer'}</p>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                className="input pr-12"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                className="input pr-12"
                placeholder="Min. 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
            <input
              type="password"
              className={`input ${confirmPassword && confirmPassword !== newPassword ? 'border-red-300 focus:ring-red-400' : ''}`}
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={saving || !currentPassword || !newPassword || newPassword !== confirmPassword}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {saving
              ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <><Check className="w-5 h-5" /> Update Password</>
            }
          </button>
        </form>
      </div>
    </div>
  )
}
