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

  if (user) return <>{navigate(from, { replace: true })}</>

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const u = await login(form.email, form.password)
      toast.success(`Welcome back, ${u.name.split(' ')[0]}! 🎉`, {
        style: { background: '#1e1e1e', color: '#fff', border: '1px solid rgba(255,107,0,0.3)' },
      })
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
    <div className="min-h-[calc(100vh-64px)] bg-dark-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glows */}
      <div className="glow-orb w-96 h-96 bg-crave-600/15 -top-32 -left-32" />
      <div className="glow-orb w-64 h-64 bg-amber-500/10 -bottom-20 right-0" />

      <div className="relative z-10 w-full max-w-md animate-slide-up space-y-5">

        {/* Logo header */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-crave-500 to-amber-400 rounded-2xl flex items-center justify-center text-3xl shadow-glow-orange">
            🛺
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Welcome to <span className="gradient-text">CraveKart</span>
          </h1>
          <p className="text-white/40 text-sm mt-1">Sign in to order your favorite meals</p>
        </div>

        {/* Demo cards */}
        <div className="glass-card p-4">
          <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            🎯 Quick Demo Auto-fill
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { type: 'customer', icon: '👤', role: 'Customer', email: 'customer@demo.com', pass: 'demo123' },
              { type: 'admin',    icon: '⚙️', role: 'Admin',    email: 'admin@demo.com',    pass: 'admin123' },
            ].map(d => (
              <button
                key={d.type}
                onClick={() => fillDemo(d.type)}
                className="text-left bg-dark-800/60 border border-white/[0.07] hover:border-crave-500/40 hover:bg-dark-700/80 rounded-xl p-3 transition-all group"
              >
                <p className="font-bold text-white text-xs flex items-center gap-1 mb-1 group-hover:text-crave-400 transition-colors">
                  {d.icon} {d.role}
                </p>
                <p className="text-[11px] text-white/30">{d.email}</p>
                <p className="text-[11px] text-crave-500 font-bold">{d.pass}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Login form */}
        <div className="glass-card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="input-field text-sm"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5">
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
              className="btn-primary w-full py-3.5 mt-2 text-sm font-black shadow-glow-orange"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                '🚀 Sign In to CraveKart'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-white/30 mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-crave-400 font-bold hover:text-crave-300 transition-colors">
              Create one free →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
