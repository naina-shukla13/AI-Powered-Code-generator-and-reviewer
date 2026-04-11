import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/api/auth/register', { name, email, password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data))
      toast.success('Account created!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4" style={{background: 'linear-gradient(135deg, #6ee7b7, #3b82f6)'}}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-white">CodeReview AI</h1>
          <p className="text-[#555] text-sm mt-1">Create your account</p>
        </div>
        <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] text-[#555] uppercase tracking-wider block mb-1.5">Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required
                className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-3 py-2.5 text-white text-[13px] placeholder-[#333] focus:outline-none focus:border-[#6ee7b7]/50 transition"
                placeholder="Your name" />
            </div>
            <div>
              <label className="text-[11px] text-[#555] uppercase tracking-wider block mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-3 py-2.5 text-white text-[13px] placeholder-[#333] focus:outline-none focus:border-[#6ee7b7]/50 transition"
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="text-[11px] text-[#555] uppercase tracking-wider block mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-3 py-2.5 text-white text-[13px] placeholder-[#333] focus:outline-none focus:border-[#6ee7b7]/50 transition"
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-lg text-[13px] font-medium text-white transition disabled:opacity-50"
              style={{background: 'linear-gradient(135deg, #6ee7b7, #3b82f6)'}}>
              {loading ? 'Creating...' : 'Create account'}
            </button>
          </form>
          <p className="text-center text-[#444] text-[12px] mt-4">
            Have an account? <Link to="/login" className="text-[#6ee7b7] hover:text-white transition">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}