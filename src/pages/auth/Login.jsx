import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, ShoppingBag, Package, Truck, Star } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const floatingItems = [
  { icon: ShoppingBag, top: '12%', left: '8%', delay: '0s', size: 'w-10 h-10' },
  { icon: Package, top: '60%', left: '5%', delay: '0.6s', size: 'w-8 h-8' },
  { icon: Truck, top: '30%', left: '88%', delay: '1.2s', size: 'w-10 h-10' },
  { icon: Star, top: '75%', left: '85%', delay: '0.3s', size: 'w-7 h-7' },
  { icon: ShoppingBag, top: '85%', left: '40%', delay: '0.9s', size: 'w-6 h-6' },
  { icon: Star, top: '10%', left: '60%', delay: '1.5s', size: 'w-5 h-5' },
]

export default function Login() {
  const { login } = useAuth()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.username, form.password)
      toast.success('Welcome back!')
    } catch {
      toast.error('Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
        {/* Animated grid */}
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500 rounded-full opacity-20 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500 rounded-full opacity-15 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Floating icons */}
        {floatingItems.map((item, i) => (
          <div
            key={i}
            className="absolute opacity-20"
            style={{ top: item.top, left: item.left, animation: `bounce 3s ease-in-out infinite`, animationDelay: item.delay }}
          >
            <item.icon className={`${item.size} text-purple-300`} />
          </div>
        ))}

        {/* Center content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-white">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-8 border border-white/20">
            <Package className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-black mb-4 text-center leading-tight">
            Order<span className="text-purple-400">MS</span>
          </h1>
          <p className="text-white/60 text-center text-lg max-w-xs leading-relaxed">
            Manage orders, track shipments, and grow your business — all in one place.
          </p>

          {/* Stats row */}
          <div className="flex gap-8 mt-12">
            {[['500+', 'Orders'], ['99%', 'Uptime'], ['24/7', 'Support']].map(([val, label]) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-black text-purple-400">{val}</p>
                <p className="text-white/50 text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 lg:max-w-md xl:max-w-lg flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-sky-500 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black text-gray-900">OrderMS</span>
          </div>

          <div className="mb-10">
            <p className="text-purple-600 font-semibold text-sm mb-2 tracking-widest uppercase">Welcome back</p>
            <h2 className="text-4xl font-black text-gray-900 leading-tight">Sign in to<br />your account</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 tracking-widest uppercase">Username</label>
              <div className={`relative transition-all duration-200 ${focused === 'username' ? 'transform scale-[1.01]' : ''}`}>
                <input
                  className="w-full px-4 py-4 bg-gray-50 border-2 rounded-2xl text-gray-900 placeholder-gray-300 outline-none transition-all duration-200 focus:bg-white text-sm font-medium"
                  style={{ borderColor: focused === 'username' ? '#7c3aed' : '#f3f4f6' }}
                  placeholder="Enter your username"
                  value={form.username}
                  onFocus={() => setFocused('username')}
                  onBlur={() => setFocused(null)}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 tracking-widest uppercase">Password</label>
              <div className={`relative transition-all duration-200 ${focused === 'password' ? 'transform scale-[1.01]' : ''}`}>
                <input
                  className="w-full px-4 py-4 pr-12 bg-gray-50 border-2 rounded-2xl text-gray-900 placeholder-gray-300 outline-none transition-all duration-200 focus:bg-white text-sm font-medium"
                  style={{ borderColor: focused === 'password' ? '#7c3aed' : '#f3f4f6' }}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-3 transition-all duration-200 hover:opacity-90 hover:shadow-xl active:scale-95 mt-2 disabled:opacity-70"
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)' }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-purple-600 font-bold hover:text-purple-700 transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
