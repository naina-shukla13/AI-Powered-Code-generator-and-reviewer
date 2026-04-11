import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

const FEATURES = [
  { icon: '🔍', title: 'AI Code Review', desc: 'Instant analysis for bugs, security flaws, and performance issues with severity scoring.' },
  { icon: '⚡', title: 'Code Generation', desc: 'Generate production-ready code from plain English. Pick a language, describe it, done.' },
  { icon: '🔒', title: 'Security Scanning', desc: 'Detects SQL injection, hardcoded secrets, XSS, and 20+ other vulnerability patterns.' },
  { icon: '📊', title: 'Review History', desc: 'Every review saved with language breakdown and severity distribution analytics.' },
  { icon: '↓', title: 'PDF Export', desc: 'Download any review as a formatted PDF report to share with your team.' },
  { icon: '🌊', title: 'Streaming Output', desc: 'Real-time streaming responses — see the AI think through your code live.' },
]

const REVIEWS = [
  { lang: 'JS', severity: 'critical', issues: 5, title: 'auth.js — SQL injection detected' },
  { lang: 'PY', severity: 'high',     issues: 3, title: 'api.py — unhandled exceptions' },
  { lang: 'TS', severity: 'low',      issues: 1, title: 'utils.ts — minor style issues' },
]

const SEV_COLORS = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#6ee7b7' }

function AnimatedCode() {
  const lines = [
    { text: 'function getUser(id) {',        color: '#e0e0e0', indent: 0 },
    { text: '  var pwd = "admin123"',         color: '#ef4444', indent: 0, flag: '← hardcoded secret' },
    { text: '  var q = "SELECT * WHERE id="+ id', color: '#f97316', indent: 0, flag: '← SQL injection' },
    { text: '  fetch("/api", { body: q })',   color: '#eab308', indent: 0, flag: '← unhandled promise' },
    { text: '}',                              color: '#e0e0e0', indent: 0 },
  ]
  const [visible, setVisible] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setVisible(v => v < lines.length ? v + 1 : v), 600)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1a1a1a] bg-[#0d0d0d]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ef4444]/50" />
          <div className="w-3 h-3 rounded-full bg-[#f2c94c]/50" />
          <div className="w-3 h-3 rounded-full bg-[#6fcf97]/50" />
        </div>
        <span className="text-[11px] text-[#333] ml-2">🟨 vulnerable.js</span>
      </div>
      <div className="p-5 font-mono text-[12px] space-y-1.5 min-h-[160px]">
        {lines.map((line, i) => (
          <div key={i} className={`flex items-center gap-3 transition-all duration-500 ${i < visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
            <span className="text-[#2a2a2a] w-4 text-right flex-shrink-0">{i + 1}</span>
            <span style={{ color: line.color }}>{line.text}</span>
            {line.flag && i < visible && (
              <span className="text-[10px] px-2 py-0.5 rounded-full animate-pulse flex-shrink-0"
                style={{ color: line.color, backgroundColor: line.color + '15' }}>{line.flag}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  const isLoggedIn = !!localStorage.getItem('token')

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Nav */}
      <nav className="border-b border-[#1a1a1a] px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-sm z-20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:'linear-gradient(135deg,#6ee7b7,#3b82f6)'}}>
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <span className="text-[14px] font-semibold">CodeReview AI</span>
        </div>
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Link to="/dashboard"
              className="px-4 py-1.5 rounded-lg text-[12px] font-semibold text-white"
              style={{background:'linear-gradient(135deg,#6ee7b7,#3b82f6)'}}>
              Dashboard →
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-[12px] text-[#666] hover:text-white transition px-3 py-1.5">Sign in</Link>
              <Link to="/register"
                className="px-4 py-1.5 rounded-lg text-[12px] font-semibold text-white"
                style={{background:'linear-gradient(135deg,#6ee7b7,#3b82f6)'}}>
                Get started free
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        

        <h1 className="text-5xl font-bold leading-tight mb-4 tracking-tight">
          AI that actually
          <span className="block" style={{backgroundImage:'linear-gradient(135deg,#6ee7b7,#3b82f6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>
            understands your code
          </span>
        </h1>

        <p className="text-[#555] text-lg max-w-xl mx-auto mb-8 leading-relaxed">
          Paste any code and get an instant AI review — bugs, security issues, performance problems, and a fixed version. Or generate production-ready code from a prompt.
        </p>

        <div className="flex items-center justify-center gap-3 mb-16">
  <Link to={isLoggedIn ? "/review" : "/register"}
    className="px-6 py-3 rounded-xl text-[14px] font-semibold text-white transition hover:opacity-90"
    style={{background:'linear-gradient(135deg,#6ee7b7,#3b82f6)'}}>
    🔍 Review Code →
  </Link>
  <Link to={isLoggedIn ? "/review" : "/register"} state={{ mode: 'generate' }}
  className="px-6 py-3 rounded-xl text-[14px] font-semibold text-white transition hover:opacity-90 border border-[#6ee7b7]/30 hover:border-[#6ee7b7]/60"
  style={{background:'linear-gradient(135deg,#3b82f620,#6ee7b720)'}}>
  ⚡ Generate Code
</Link>
  <Link to={isLoggedIn ? "/dashboard" : "/login"}
    className="px-6 py-3 rounded-xl text-[14px] text-[#666] hover:text-white border border-[#1f1f1f] hover:border-[#2a2a2a] transition">
    View dashboard
  </Link>
</div>

        {/* Demo */}
        <div className="grid grid-cols-2 gap-4 max-w-3xl mx-auto">
          <div>
            <p className="text-[11px] text-[#333] uppercase tracking-wider mb-2 text-left">Input — buggy code</p>
            <AnimatedCode />
          </div>
          <div>
            <p className="text-[11px] text-[#333] uppercase tracking-wider mb-2 text-left">Output — AI review</p>
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-5 space-y-2.5 min-h-[200px]">
              {REVIEWS.map((r, i) => (
                <div key={i} className="flex items-center gap-3 bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl px-3 py-2.5"
                  style={{animationDelay:`${i*0.3}s`}}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                    style={{backgroundColor: SEV_COLORS[r.severity] + '20', border:`1px solid ${SEV_COLORS[r.severity]}30`, color: SEV_COLORS[r.severity]}}>
                    {r.lang}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-[#888] truncate">{r.title}</p>
                    <p className="text-[10px] text-[#333]">{r.issues} issues found</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                    style={{color: SEV_COLORS[r.severity], backgroundColor: SEV_COLORS[r.severity]+'15'}}>
                    {r.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-[#1a1a1a]">
        <p className="text-[11px] text-[#333] uppercase tracking-wider text-center mb-10">Everything you need</p>
        <div className="grid grid-cols-3 gap-3">
          {FEATURES.map((f, i) => (
            <div key={i} className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-5 hover:border-[#222] transition group">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="text-[13px] font-semibold text-white mb-1.5">{f.title}</h3>
              <p className="text-[12px] text-[#444] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-[#1a1a1a] py-12">
        <div className="max-w-3xl mx-auto px-6 grid grid-cols-3 gap-6 text-center">
          {[
            { value: '8+', label: 'Languages supported' },
            { value: '4', label: 'Severity levels' },
            { value: '<2s', label: 'Average review time' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-white mb-1" style={{backgroundImage:'linear-gradient(135deg,#6ee7b7,#3b82f6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>{s.value}</p>
              <p className="text-[12px] text-[#333]">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[#1a1a1a] py-20 text-center">
        <h2 className="text-3xl font-bold text-white mb-3">Ready to write better code?</h2>
        <p className="text-[#444] text-[14px] mb-6">Free to use. No credit card required.</p>
        <Link to={isLoggedIn ? "/review" : "/register"}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-semibold text-white hover:opacity-90 transition"
          style={{background:'linear-gradient(135deg,#6ee7b7,#3b82f6)'}}>
          Get started free →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded flex items-center justify-center" style={{background:'linear-gradient(135deg,#6ee7b7,#3b82f6)'}}>
            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <span className="text-[12px] text-[#333]">CodeReview AI</span>
        </div>
        <p className="text-[11px] text-[#222]">Built with LangChain · Groq · React · Node.js</p>
      </footer>
    </div>
  )
}