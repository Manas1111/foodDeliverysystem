import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [form, setForm]       = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  // Already logged in → redirect
  if (user) return <>{navigate(from, { replace: true })}</>

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const u = await login(form.email, form.password)
      toast.success(`Welcome back, ${u.name.split(' ')[0]}! 🎉`)
      navigate(u.role === 'admin' ? '/admin' : from, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (type) => {
    if (type === 'customer') setForm({ email: 'customer@demo.com', password: 'demo123' })
    else                     setForm({ email: 'admin@demo.com',    password: 'admin123' })
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-orange-50 via-amber-50/50 to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-tr from-orange-500 to-amber-400 rounded-2xl flex items-center justify-center text-3xl shadow-glow">
            🍔
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome to FoodRush
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Sign in to order gourmet meals with fast delivery
          </p>
        </div>

        {/* Demo credentials box */}
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-bold text-amber-900 mb-2.5 flex items-center gap-1.5">
            <span>🎯</span> Quick Demo Auto-fill:
          </p>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => fillDemo('customer')}
              className="flex-1 text-left bg-white border border-amber-200 rounded-xl p-3 hover:bg-orange-50/60 hover:border-orange-300 transition-all shadow-xs"
            >
              <p className="font-extrabold text-slate-900 text-xs flex items-center gap-1">
                <span>👤</span> Customer
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">customer@demo.com</p>
              <p className="text-[10px] text-orange-600 font-bold">demo123</p>
            </button>

            <button
              type="button"
              onClick={() => fillDemo('admin')}
              className="flex-1 text-left bg-white border border-amber-200 rounded-xl p-3 hover:bg-orange-50/60 hover:border-orange-300 transition-all shadow-xs"
            >
              <p className="font-extrabold text-slate-900 text-xs flex items-center gap-1">
                <span>⚙️</span> Admin
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">admin@demo.com</p>
              <p className="text-[10px] text-orange-600 font-bold">admin123</p>
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="card p-6 sm:p-8 shadow-elevated">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="input-field text-sm"
                placeholder="customer@demo.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="input-field text-sm"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-2 text-sm font-extrabold"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-orange-600 font-bold hover:underline">
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
