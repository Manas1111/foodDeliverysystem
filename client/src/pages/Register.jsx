import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const { register, user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  if (user) return <>{navigate('/', { replace: true })}</>

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return }
    if (form.password.length < 6)       { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      toast.success('Welcome to CraveKart! 🎉', {
        style: { background: '#1e1e1e', color: '#fff', border: '1px solid rgba(255,107,0,0.3)' },
      })
      navigate('/', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-dark-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glows */}
      <div className="glow-orb w-80 h-80 bg-crave-600/15 -top-20 right-0" />
      <div className="glow-orb w-64 h-64 bg-amber-500/10 bottom-0 -left-20" />

      <div className="relative z-10 w-full max-w-md animate-slide-up space-y-5">

        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-crave-500 to-amber-400 rounded-2xl flex items-center justify-center text-3xl shadow-glow-orange">
            🛺
          </div>
          <h1 className="text-3xl font-black text-white">
            Join <span className="gradient-text">CraveKart</span>
          </h1>
          <p className="text-white/40 text-sm mt-1">Create your free account to start ordering</p>
        </div>

        {/* Perks */}
        <div className="glass-card px-5 py-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: '⚡', label: '25-min delivery' },
              { icon: '🏷️', label: 'Exclusive deals' },
              { icon: '📍', label: 'Live tracking' },
            ].map(p => (
              <div key={p.label} className="text-center">
                <span className="text-2xl block mb-1">{p.icon}</span>
                <p className="text-[11px] text-white/40 font-medium">{p.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="glass-card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Full Name',        name: 'name',     type: 'text',     placeholder: 'John Doe' },
              { label: 'Email Address',    name: 'email',    type: 'email',    placeholder: 'you@example.com' },
              { label: 'Password',         name: 'password', type: 'password', placeholder: 'Min 6 characters' },
              { label: 'Confirm Password', name: 'confirm',  type: 'password', placeholder: 'Repeat password' },
            ].map(field => (
              <div key={field.name}>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  className="input-field text-sm"
                  placeholder={field.placeholder}
                  required
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 mt-2 text-sm font-black shadow-glow-orange"
            >
              {loading ? 'Creating Account...' : '🚀 Create Free Account'}
            </button>
          </form>

          <p className="text-center text-xs text-white/30 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-crave-400 font-bold hover:text-crave-300 transition-colors">
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
