import { useState, useRef, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api'

const LANGUAGES = ['javascript','typescript','python','java','cpp','rust','go','other']
const LANG_ICONS = { javascript: '🟨', python: '🐍', typescript: '🔷', java: '☕', cpp: '⚙️', rust: '🦀', go: '🐹', other: '📄' }

const EXAMPLE_PROMPTS = [
  'JWT authentication middleware for Express.js',
  'Binary search tree with insert and search',
  'Debounce function with TypeScript types',
  'REST API rate limiter using Redis',
  'React custom hook for infinite scroll',
  'Python decorator for retry with backoff',
]

function LineNumbers({ code }) {
  const lines = (code || '').split('\n').length
  return (
    <div className="select-none text-right pr-3 pt-3 pb-3 font-mono text-[11px] leading-relaxed text-[#2a2a2a] border-r border-[#1a1a1a] min-w-[40px] flex-shrink-0">
      {Array.from({ length: Math.max(lines, 20) }, (_, i) => (
        <div key={i + 1}>{i + 1}</div>
      ))}
    </div>
  )
}

function FormattedReview({ text, streaming }) {
  if (!text) return null
  return (
    <div className="space-y-0.5">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('## ')) return (
          <div key={i} className="mt-5 mb-2 first:mt-0">
            <h2 className="text-[13px] font-semibold text-white pb-1.5 border-b border-[#1f1f1f]">{line.slice(3)}</h2>
          </div>
        )
        const isCrit = line.includes('[SEVERITY: critical]')
        const isHigh = line.includes('[SEVERITY: high]')
        const isMed  = line.includes('[SEVERITY: medium]')
        const isLow  = line.includes('[SEVERITY: low]')
        if (isCrit || isHigh || isMed || isLow) {
          const cfg = isCrit ? ['#ef4444','#ef444415','#ef444430','CRIT'] : isHigh ? ['#f97316','#f9731615','#f9731630','HIGH'] : isMed ? ['#eab308','#eab30815','#eab30830','MED'] : ['#6ee7b7','#6ee7b715','#6ee7b730','LOW']
          return (
            <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg border my-1"
              style={{ backgroundColor: cfg[1], borderColor: cfg[2] }}>
              <span className="text-[10px] font-bold mt-0.5 flex-shrink-0 px-1.5 py-0.5 rounded" style={{ color: cfg[0], backgroundColor: cfg[1] }}>{cfg[3]}</span>
              <p className="text-[12px] leading-relaxed" style={{ color: cfg[0] }}>{line.replace(/\*\*\[SEVERITY:.*?\]\*\*/g,'').replace(/\*\*/g,'').trim()}</p>
            </div>
          )
        }
        if (line.startsWith('- ') || line.startsWith('• ')) return (
          <div key={i} className="flex items-start gap-2 pl-1">
            <span className="text-[#333] mt-1 text-[10px]">▸</span>
            <p className="text-[12px] text-[#999] leading-relaxed">{line.slice(2).replace(/\*\*/g,'')}</p>
          </div>
        )
        if (line.trim() === '') return <div key={i} className="h-1.5" />
        return <p key={i} className="text-[12px] text-[#777] leading-relaxed">{line.replace(/\*\*/g,'')}</p>
      })}
      {streaming && <span className="inline-block w-2 h-3 bg-[#6ee7b7] animate-pulse rounded-sm ml-1" />}
    </div>
  )
}

export default function Reviewer() {
  const [mode, setMode] = useState('review') // 'review' | 'generate'
  const [code, setCode] = useState('')
  const [prompt, setPrompt] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [done, setDone] = useState(false)
  const rightRef = useRef(null)
  const location = useLocation()

  // eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
  if (location.state?.mode === 'generate') setMode('generate')
  if (location.state?.reviewId) loadReview(location.state.reviewId)
}, []) // eslint-disable-line

  useEffect(() => {
    if (rightRef.current) rightRef.current.scrollTop = rightRef.current.scrollHeight
  }, [reviewText, generatedCode])

  const loadReview = async (id) => {
    try {
      const res = await api.get(`/api/reviews/${id}`)
      setCode(res.data.code); setLanguage(res.data.language)
      setTitle(res.data.title); setReviewText(res.data.review); setDone(true)
    } catch { toast.error('Failed to load') }
  }

  const startReview = async () => {
    if (!code.trim()) return toast.error('Paste some code first')
    setLoading(true); setReviewText(''); setDone(false)
    const token = localStorage.getItem('token')
    try {
      const response = await fetch('http://localhost:5001/api/reviews/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ code, language, title: title || `${language} review` })
      })
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done: d, value } = await reader.read()
        if (d) break
        for (const line of decoder.decode(value).split('\n')) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.text) setReviewText(p => p + data.text)
              if (data.done) { setDone(true); setLoading(false) }
              if (data.error) { toast.error(data.error); setLoading(false) }
            } catch {toast.error('Failed')}
          }
        }
      }
    } catch (err) { toast.error('Failed'); setLoading(false) }
  }

  const startGenerate = async () => {
    if (!prompt.trim()) return toast.error('Enter a prompt first')
    setLoading(true); setGeneratedCode(''); setDone(false)
    const token = localStorage.getItem('token')
    try {
      const response = await fetch('http://localhost:5001/api/reviews/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ prompt, language })
      })
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done: d, value } = await reader.read()
        if (d) break
        for (const line of decoder.decode(value).split('\n')) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.text) setGeneratedCode(p => p + data.text)
              if (data.done) { setDone(true); setLoading(false) }
              if (data.error) { toast.error(data.error); setLoading(false) }
            } catch {toast.error('Failed')}
          }
        }
      }
    } catch (err) { toast.error('Failed'); setLoading(false) }
  }

  const sendToReview = () => {
    setCode(generatedCode)
    setGeneratedCode('')
    setDone(false)
    setMode('review')
    toast.success('Code sent to reviewer!')
  }

  const downloadPDF = () => {
    const content = mode === 'review' ? reviewText : generatedCode
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`<!DOCTYPE html><html><head><title>${title || 'CodeReview AI'}</title>
    <style>body{font-family:-apple-system,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;color:#1a1a1a;line-height:1.6}
    h1{font-size:22px;border-bottom:2px solid #eee;padding-bottom:12px}
    h2{font-size:15px;color:#333;margin-top:24px;border-bottom:1px solid #eee;padding-bottom:6px}
    .code{background:#f5f5f5;border:1px solid #e0e0e0;border-radius:8px;padding:16px;font-family:monospace;font-size:12px;white-space:pre-wrap;margin:16px 0}
    .critical{background:#fff0f0;border-left:3px solid #ef4444;color:#dc2626;padding:10px 14px;border-radius:6px;margin:6px 0}
    .high{background:#fff7f0;border-left:3px solid #f97316;color:#ea6a0a;padding:10px 14px;border-radius:6px;margin:6px 0}
    .medium{background:#fffbf0;border-left:3px solid #eab308;color:#ca8a04;padding:10px 14px;border-radius:6px;margin:6px 0}
    .low{background:#f0fdf4;border-left:3px solid #22c55e;color:#16a34a;padding:10px 14px;border-radius:6px;margin:6px 0}
    p{font-size:13px;color:#555}</style></head><body>
    <h1>${mode === 'generate' ? '⚡ Generated Code' : '🔍 Code Review'} — ${title || language}</h1>
    <p style="color:#888;font-size:12px">Language: ${language} · CodeReview AI · ${new Date().toLocaleDateString()}</p>
    ${mode === 'review' ? `<h2>Original Code</h2><div class="code">${code.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div><h2>AI Review</h2>` : '<h2>Generated Code</h2>'}
    ${content.split('\n').map(line => {
      if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`
      if (line.includes('[SEVERITY: critical]')) return `<div class="critical">${line.replace(/\*\*/g,'')}</div>`
      if (line.includes('[SEVERITY: high]')) return `<div class="high">${line.replace(/\*\*/g,'')}</div>`
      if (line.includes('[SEVERITY: medium]')) return `<div class="medium">${line.replace(/\*\*/g,'')}</div>`
      if (line.includes('[SEVERITY: low]')) return `<div class="low">${line.replace(/\*\*/g,'')}</div>`
      if (line.startsWith('- ')) return `<p>• ${line.slice(2).replace(/\*\*/g,'')}</p>`
      if (line.trim() === '') return '<br>'
      return `<p>${line.replace(/\*\*/g,'')}</p>`
    }).join('')}
    </body></html>`)
    printWindow.document.close(); printWindow.print()
  }

  return (
    <div className="h-screen bg-[#0a0a0a] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-[#0d0d0d] border-b border-[#1a1a1a] px-5 py-2.5 flex items-center gap-3 flex-shrink-0">
        <Link to="/dashboard" className="text-[#444] hover:text-white transition text-[12px]">← Dashboard</Link>
        <span className="text-[#1f1f1f]">/</span>

        {/* Mode toggle */}
        <div className="flex items-center bg-[#141414] border border-[#1f1f1f] rounded-lg p-0.5">
          <button onClick={() => { setMode('review'); setDone(false) }}
            className={`px-3 py-1 rounded-md text-[11px] font-medium transition ${mode === 'review' ? 'bg-[#1f1f1f] text-white' : 'text-[#444] hover:text-[#888]'}`}>
            🔍 Review
          </button>
          <button onClick={() => { setMode('generate'); setDone(false) }}
            className={`px-3 py-1 rounded-md text-[11px] font-medium transition ${mode === 'generate' ? 'bg-[#1f1f1f] text-white' : 'text-[#444] hover:text-[#888]'}`}>
            ⚡ Generate
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <select value={language} onChange={e => setLanguage(e.target.value)}
            className="bg-[#141414] border border-[#1f1f1f] rounded-lg px-2.5 py-1.5 text-white text-[12px] focus:outline-none">
            {LANGUAGES.map(l => <option key={l} value={l}>{LANG_ICONS[l]} {l}</option>)}
          </select>

          {mode === 'review' && (
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Review title..."
              className="bg-[#141414] border border-[#1f1f1f] rounded-lg px-2.5 py-1.5 text-white text-[12px] placeholder-[#2a2a2a] focus:outline-none w-40" />
          )}

          <button
            onClick={mode === 'review' ? startReview : startGenerate}
            disabled={loading || (mode === 'review' ? !code.trim() : !prompt.trim())}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold text-white disabled:opacity-40 transition"
            style={{ background: loading ? '#1a1a1a' : 'linear-gradient(135deg, #6ee7b7, #3b82f6)' }}>
            {loading ? (
              <><svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>{mode === 'review' ? 'Reviewing...' : 'Generating...'}</>
            ) : mode === 'review' ? (
              <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> Review Code</>
            ) : (
              <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg> Generate</>
            )}
          </button>
        </div>
      </header>

      {/* Body — side by side */}
      <div className="flex-1 flex overflow-hidden">

        {/* LEFT PANEL */}
        <div className="flex-1 flex flex-col border-r border-[#1a1a1a] min-w-0">
          <div className="flex items-center justify-between px-4 py-2 bg-[#0d0d0d] border-b border-[#1a1a1a] flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#eb5757]/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#f2c94c]/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#6fcf97]/40" />
              </div>
              <span className="text-[11px] text-[#2a2a2a]">
                {mode === 'review'
                  ? `${LANG_ICONS[language]} ${language} · ${code.split('\n').length} lines`
                  : '💬 Prompt'}
              </span>
            </div>
            {mode === 'review' && code && (
              <div className="flex gap-1">
                <button onClick={() => { navigator.clipboard.writeText(code); toast.success('Copied!') }}
                  className="text-[11px] text-[#333] hover:text-white px-2 py-1 rounded hover:bg-[#1a1a1a] transition flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                  Copy
                </button>
                <button onClick={() => setCode('')} className="text-[11px] text-[#333] hover:text-[#888] px-2 py-1 rounded hover:bg-[#1a1a1a] transition">Clear</button>
              </div>
            )}
          </div>

          {mode === 'review' ? (
            <div className="flex-1 flex overflow-auto bg-[#0d0d0d]">
              <LineNumbers code={code} />
              <textarea value={code} onChange={e => setCode(e.target.value)}
                placeholder={`// Paste your ${language} code here...\n// AI will review for bugs, security & best practices`}
                className="flex-1 bg-transparent px-3 py-3 text-[12.5px] text-[#e0e0e0] placeholder-[#1a1a1a] focus:outline-none resize-none font-mono leading-relaxed"
                spellCheck={false} style={{ tabSize: 2 }} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col p-5 bg-[#0d0d0d] overflow-y-auto">
              <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
                placeholder={`Describe what you want to generate in ${language}...\n\nExamples:\n• JWT authentication middleware\n• Binary search tree\n• Rate limiter with Redis`}
                className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl px-4 py-3 text-[13px] text-white placeholder-[#222] focus:outline-none focus:border-[#2a2a2a] resize-none leading-relaxed transition"
                rows={6} />

              <div className="mt-4">
                <p className="text-[10px] text-[#2a2a2a] uppercase tracking-wider mb-2">Quick prompts</p>
                <div className="flex flex-wrap gap-1.5">
                  {EXAMPLE_PROMPTS.map(p => (
                    <button key={p} onClick={() => setPrompt(p)}
                      className="text-[11px] text-[#444] hover:text-white border border-[#1a1a1a] hover:border-[#2a2a2a] px-2.5 py-1 rounded-full transition bg-[#0a0a0a] hover:bg-[#141414]">
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between px-4 py-2 bg-[#0d0d0d] border-b border-[#1a1a1a] flex-shrink-0">
            <span className="text-[11px] text-[#2a2a2a] flex items-center gap-2">
              {mode === 'review' ? '🔍 AI Review' : '⚡ Generated Code'}
              {loading && <span className="w-1.5 h-1.5 rounded-full bg-[#6ee7b7] animate-pulse inline-block" />}
              {done && <span className="text-[#6ee7b7]">· Done</span>}
            </span>
            <div className="flex gap-1">
              {(reviewText || generatedCode) && (
                <button onClick={() => { navigator.clipboard.writeText(mode === 'review' ? reviewText : generatedCode); toast.success('Copied!') }}
                  className="text-[11px] text-[#333] hover:text-white px-2 py-1 rounded hover:bg-[#1a1a1a] transition flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                  Copy
                </button>
              )}
              {done && (
                <button onClick={downloadPDF}
                  className="text-[11px] text-[#333] hover:text-white px-2 py-1 rounded hover:bg-[#1a1a1a] transition flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  PDF
                </button>
              )}
            </div>
          </div>

          <div ref={rightRef} className="flex-1 overflow-y-auto p-5 bg-[#0a0a0a]">
            {mode === 'review' ? (
              !reviewText && !loading ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-xl mx-auto mb-3 opacity-10 flex items-center justify-center"
                    style={{background:'linear-gradient(135deg,#6ee7b7,#3b82f6)'}}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  </div>
                  <p className="text-[#1f1f1f] text-[12px]">Paste code → click Review Code</p>
                </div>
              ) : (
                <div className="max-w-full">
                  <FormattedReview text={reviewText} streaming={loading} />
                  {done && (
                    <div className="mt-5 pt-4 border-t border-[#1a1a1a] flex items-center justify-between">
                      <span className="text-[11px] text-[#222]">✓ Saved to history</span>
                      <div className="flex gap-2">
                        <button onClick={() => { setCode(''); setReviewText(''); setDone(false) }}
                          className="text-[11px] text-[#444] hover:text-white border border-[#1f1f1f] px-3 py-1.5 rounded-lg transition">New Review</button>
                        <button onClick={downloadPDF}
                          className="text-[11px] text-white px-3 py-1.5 rounded-lg transition"
                          style={{background:'linear-gradient(135deg,#6ee7b7,#3b82f6)'}}>↓ PDF</button>
                      </div>
                    </div>
                  )}
                </div>
              )
            ) : (
              !generatedCode && !loading ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-xl mx-auto mb-3 opacity-10 flex items-center justify-center"
                    style={{background:'linear-gradient(135deg,#6ee7b7,#3b82f6)'}}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
                  </div>
                  <p className="text-[#1f1f1f] text-[12px]">Describe what to generate → click Generate</p>
                </div>
              ) : (
                <div>
                  <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-[#1a1a1a]">
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#eb5757]/40" />
                        <div className="w-2 h-2 rounded-full bg-[#f2c94c]/40" />
                        <div className="w-2 h-2 rounded-full bg-[#6fcf97]/40" />
                      </div>
                      <span className="text-[10px] text-[#2a2a2a]">{LANG_ICONS[language]} generated.{language === 'python' ? 'py' : language === 'java' ? 'java' : language === 'typescript' ? 'ts' : 'js'}</span>
                    </div>
                    <pre className="p-4 text-[12px] text-[#e0e0e0] font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
                      {generatedCode}
                      {loading && <span className="inline-block w-2 h-3 bg-[#6ee7b7] animate-pulse rounded-sm ml-1" />}
                    </pre>
                  </div>
                  {done && (
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[11px] text-[#222]">✓ Generation complete</span>
                      <div className="flex gap-2">
                        <button onClick={() => { setGeneratedCode(''); setPrompt(''); setDone(false) }}
                          className="text-[11px] text-[#444] hover:text-white border border-[#1f1f1f] px-3 py-1.5 rounded-lg transition">New</button>
                        <button onClick={sendToReview}
                          className="text-[11px] text-white px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                          style={{background:'linear-gradient(135deg,#6ee7b7,#3b82f6)'}}>
                          🔍 Send to Review
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}