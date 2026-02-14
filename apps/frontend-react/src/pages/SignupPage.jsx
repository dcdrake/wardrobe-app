import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/useAuthStore'

export default function SignupPage() {
  const signup = useAuthStore(s => s.signup)
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    setError('')
    try {
      await signup(email, password)
      navigate('/wardrobe')
    } catch (err) {
      setError(Object.values(err.response?.data || {}).flat().join('. ') || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-serif font-semibold text-espresso-800 text-center mb-8">Create Account</h1>
      <form onSubmit={handleSubmit} className="bg-cream p-8 rounded-xl border border-sand-200/60">
        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}
        <div className="mb-4">
          <label className="block text-xs tracking-wider uppercase text-charcoal-400 mb-2">Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" required className="w-full px-3 py-2 bg-cream border border-sand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:border-transparent" />
        </div>
        <div className="mb-4">
          <label className="block text-xs tracking-wider uppercase text-charcoal-400 mb-2">Password</label>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" required minLength="8" className="w-full px-3 py-2 bg-cream border border-sand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:border-transparent" />
        </div>
        <div className="mb-6">
          <label className="block text-xs tracking-wider uppercase text-charcoal-400 mb-2">Confirm Password</label>
          <input value={confirm} onChange={e => setConfirm(e.target.value)} type="password" required className="w-full px-3 py-2 bg-cream border border-sand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:border-transparent" />
        </div>
        <button disabled={loading} className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-white py-2.5 rounded-lg disabled:opacity-50">
          {loading ? 'Creating...' : 'Sign Up'}
        </button>
        <p className="mt-4 text-center text-charcoal-400">
          Have an account? <Link to="/login" className="text-terracotta-500 hover:text-terracotta-600">Login</Link>
        </p>
      </form>
    </div>
  )
}
