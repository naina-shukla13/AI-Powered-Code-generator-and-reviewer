import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api'

const SEV = {
  low:      { color: '#6ee7b7', bg: '#6ee7b712', label: 'Low',      icon: '▽' },
  medium:   { color: '#eab308', bg: '#eab30812', label: 'Medium',   icon: '◈' },
  high:     { color: '#f97316', bg: '#f9731612', label: 'High',     icon: '▲' },
  critical: { color: '#ef4444', bg: '#ef444412', label: 'Critical', icon: '⬆' },
}

const LANG_ICONS  = { javascript:'🟨', python:'🐍', typescript:'🔷', java:'☕', cpp:'⚙️', rust:'🦀', go:'🐹', other:'📄' }
const LANG_COLORS = { javascript:'#f7df1e', python:'#3572A5', typescript:'#3178c6', java:'#b07219', cpp:'#f34b7d', rust:'#dea584', go:'#00ADD8', other:'#888' }

export default function Dashboard() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const navigate = useNavigate()

  useEffect(() => { fetchReviews() }, [])

  const fetchReviews = async () => {
    try { const res = await api.get('/api/reviews'); setReviews(res.data) }
    catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  const deleteReview = async (id, e) => {
    e.stopPropagation()
    try { await api.delete(`/api/reviews/${id}`); setReviews(reviews.filter(r => r._id !== id)); toast.success('Deleted') }
    catch { toast.error('Failed') }
  }

  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login') }

  const totalIssues   = reviews.reduce((a, b) => a + b.issuesFound, 0)
  const criticalCount = reviews.filter(r => r.severity === 'critical').length
  const avgIssues     = reviews.length > 0 ? (totalIssues / reviews.length).toFixed(1) : 0
  const langBreakdown = reviews.reduce((acc, r) => { acc[r.language] = (acc[r.language]||0)+1; return acc }, {})
  const topLangs      = Object.entries(langBreakdown).sort((a,b) => b[1]-a[1]).slice(0,4)
  const sevBreakdown  = reviews.reduce((acc, r) => { acc[r.severity] = (acc[r.severity]||0)+1; return acc }, {})

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="bg-[#0d0d0d] border-b border-[#1a1a1a] px-6 py-3 flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:'linear-gradient(135deg,#6ee7b7,#3b82f6)'}}>
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <span className="text-[14px] font-semibold text-white">CodeReview AI</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/review" className="text-[12px] text-[#555] hover:text-white transition">New Review</Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
              style={{background:'linear-gradient(135deg,#6ee7b7,#3b82f6)'}}>
              {user.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-[12px] text-[#555]">{user.name}</span>
          </div>
          <button onClick={logout} className="text-[11px] text-[#333] hover:text-white transition">Logout</button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Welcome banner */}
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-6 mb-6 flex items-center justify-between overflow-hidden relative">
          <div className="absolute inset-0 opacity-5" style={{backgroundImage:'radial-gradient(circle at 80% 50%, #6ee7b7, transparent 60%), radial-gradient(circle at 20% 50%, #3b82f6, transparent 60%)'}} />
          <div className="relative">
            <p className="text-[#555] text-[12px] mb-1">{greeting} 👋</p>
            <h1 className="text-xl font-semibold text-white mb-1">{user.name}</h1>
            <p className="text-[#333] text-[12px]">
              {reviews.length === 0
                ? 'No reviews yet — paste your first code snippet to get started'
                : `${reviews.length} review${reviews.length>1?'s':''} · ${totalIssues} total issues found`}
            </p>
          </div>
          <Link to="/review"
            className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white hover:opacity-90 transition flex-shrink-0"
            style={{background:'linear-gradient(135deg,#6ee7b7,#3b82f6)'}}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Review
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label:'Total Reviews', value:reviews.length, icon:'◈', color:'#6ee7b7' },
            { label:'Issues Found',  value:totalIssues,    icon:'⚠', color:'#eab308' },
            { label:'Critical',      value:criticalCount,  icon:'🔴', color:'#ef4444' },
            { label:'Avg Issues',    value:avgIssues,      icon:'∑',  color:'#3b82f6' },
          ].map(s => (
            <div key={s.label} className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-4 hover:border-[#222] transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-[#333] uppercase tracking-wider">{s.label}</span>
                <span style={{color:s.color}}>{s.icon}</span>
              </div>
              <p className="text-2xl font-semibold text-white">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Charts — only if data exists */}
        {reviews.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-4">
              <h3 className="text-[10px] text-[#333] uppercase tracking-wider mb-4">Languages Reviewed</h3>
              <div className="space-y-3">
                {topLangs.map(([lang, count]) => (
                  <div key={lang} className="flex items-center gap-3">
                    <span className="text-sm w-5 flex-shrink-0">{LANG_ICONS[lang]}</span>
                    <span className="text-[11px] text-[#555] w-20 capitalize flex-shrink-0">{lang}</span>
                    <div className="flex-1 bg-[#141414] rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all duration-700"
                        style={{width:`${(count/reviews.length)*100}%`, backgroundColor: LANG_COLORS[lang]||'#6ee7b7'}} />
                    </div>
                    <span className="text-[10px] text-[#333] w-4 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-4">
              <h3 className="text-[10px] text-[#333] uppercase tracking-wider mb-4">Severity Distribution</h3>
              <div className="space-y-3">
                {['critical','high','medium','low'].map(sev => {
                  const s = SEV[sev]; const count = sevBreakdown[sev]||0
                  return (
                    <div key={sev} className="flex items-center gap-3">
                      <span className="text-[10px] w-4 text-center flex-shrink-0">{s.icon}</span>
                      <span className="text-[11px] text-[#555] w-14 flex-shrink-0">{s.label}</span>
                      <div className="flex-1 bg-[#141414] rounded-full h-1.5">
                        <div className="h-1.5 rounded-full transition-all duration-700"
                          style={{width:reviews.length?`${(count/reviews.length)*100}%`:'0%', backgroundColor:s.color}} />
                      </div>
                      <span className="text-[10px] text-[#333] w-4 text-right">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* History */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-[13px] font-semibold text-white">Review History</h2>
            <span className="text-[10px] text-[#333] bg-[#111] border border-[#1a1a1a] px-1.5 py-0.5 rounded-full">{reviews.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl h-14 animate-pulse" />)}</div>
        ) : reviews.length === 0 ? (
          <div className="border border-dashed border-[#1a1a1a] rounded-2xl py-20 text-center">
            <div className="w-12 h-12 rounded-2xl mx-auto mb-4 opacity-10 flex items-center justify-center"
              style={{background:'linear-gradient(135deg,#6ee7b7,#3b82f6)'}}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <p className="text-[#2a2a2a] text-[13px] mb-2">No reviews yet</p>
            <Link to="/review" className="text-[#6ee7b7]/50 hover:text-[#6ee7b7] text-[12px] transition">
              Review your first code snippet →
            </Link>
          </div>
        ) : (
          <div className="space-y-1.5">
            {reviews.map(r => {
              const s = SEV[r.severity]
              return (
                <Link to="/review" state={{reviewId:r._id}} key={r._id}
                  className="bg-[#0d0d0d] border border-[#1a1a1a] hover:border-[#222] rounded-xl px-4 py-3 flex items-center gap-4 transition group block">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 bg-[#111] border border-[#1a1a1a]">
                    {LANG_ICONS[r.language]||'📄'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-white truncate">{r.title}</p>
                    <p className="text-[11px] text-[#333] mt-0.5">{r.language} · {r.issuesFound} issue{r.issuesFound!==1?'s':''} · {new Date(r.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{color:s.color, backgroundColor:s.bg}}>
                    {s.icon} {s.label}
                  </span>
                  <button onClick={(e)=>deleteReview(r._id,e)}
                    className="text-[#1a1a1a] hover:text-[#ef4444] opacity-0 group-hover:opacity-100 transition text-lg leading-none w-5 flex-shrink-0">×</button>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}