'use client'

import { useState } from 'react'

const formatFunding = (amount) => {
  if (!amount) return null
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(0)}M`
  return `$${amount.toLocaleString()}`
}

const formatEmployees = (count) => {
  if (!count) return null
  return count.toLocaleString()
}

const formatFundingStage = (stage) => {
  if (!stage) return null
  return stage.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function Home() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('')
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  const steps = [
    { key: 'brand', label: 'Fetching brand identity', api: 'Brand.dev' },
    { key: 'company', label: 'Pulling company data', api: 'People Data Labs' },
    { key: 'jobs', label: 'Scanning hiring signals', api: 'Serper' },
    { key: 'news', label: 'Finding recent news', api: 'Serper' },
    { key: 'contacts', label: 'Finding decision makers', api: 'Hunter' },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!domain.trim()) return
    setLoading(true)
    setData(null)
    setError(null)
    let cleanDomain = domain.trim().toLowerCase()
    cleanDomain = cleanDomain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
    for (let i = 0; i < steps.length; i++) {
      setStep(steps[i].key)
      await new Promise((r) => setTimeout(r, 600))
    }
    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: cleanDomain }),
      })
      const result = await res.json()
      if (result.error) setError(result.error)
      else setData(result)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
    setStep('')
  }

  const totalCost = data
    ? Object.values(data.costs).reduce((a, b) => a + b, 0).toFixed(3)
    : null

  const currentStepIndex = steps.findIndex((s) => s.key === step)

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <header className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="4.5" stroke="white" strokeWidth="1.5"/>
                <path d="M7 4.5v2.5l1.5 1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-semibold text-sm text-gray-900">Company Briefing</span>
            <span className="text-xs text-gray-400 hidden sm:block">by Orthogonal</span>
          </div>
          <a href="https://orthogonal.com" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
            orthogonal.com →
          </a>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-16">
        {!data && !loading && (
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block"/>
              Powered by 5 APIs · 1 Orthogonal key
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-4 leading-tight">
              Instant Company Briefing
            </h1>
            <p className="text-gray-500 text-lg max-w-lg mx-auto leading-relaxed">
              Enter any company domain. Get brand identity, funding data, hiring signals, news, and executive contacts in seconds.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2 max-w-lg mx-auto mb-12">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="stripe.com"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !domain.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors"
          >
            {loading ? 'Researching...' : 'Research'}
          </button>
        </form>

        {loading && (
          <div className="max-w-xs mx-auto mb-12">
            <div className="space-y-3">
              {steps.map((s, i) => {
                const done = i < currentStepIndex
                const active = i === currentStepIndex
                return (
                  <div key={s.key} className={`flex items-center gap-3 text-sm transition-all duration-300 ${active ? 'text-gray-900' : done ? 'text-gray-300' : 'text-gray-300'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border transition-all ${active ? 'border-indigo-500 bg-indigo-50' : done ? 'border-gray-200 bg-gray-50' : 'border-gray-100 bg-white'}`}>
                      {done && (
                        <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                          <path d="M1.5 4.5l2 2 4-4" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                      {active && <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"/>}
                    </div>
                    <span className="flex-1">{s.label}</span>
                    <span className={`text-xs ${active ? 'text-indigo-500' : 'text-gray-300'}`}>{s.api}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-lg mx-auto bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-500 mb-8">
            {error}
          </div>
        )}

        {data && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">

              <div className="rounded-2xl border border-gray-100 p-6 bg-white">
                <div className="flex items-start gap-4">
                  {data.brand.logo && (
                    <img src={data.brand.logo} alt={data.brand.name} className="w-14 h-14 rounded-xl object-cover border border-gray-100 flex-shrink-0"/>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-bold text-gray-900">{data.brand.name}</h2>
                      {data.brand.industry && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{data.brand.industry}</span>
                      )}
                    </div>
                    {data.brand.slogan && <p className="text-gray-400 text-sm mt-0.5">{data.brand.slogan}</p>}
                    {data.brand.description && <p className="text-gray-500 text-sm mt-2 leading-relaxed">{data.brand.description}</p>}
                  </div>
                </div>
                {data.brand.colors?.length > 0 && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                    {data.brand.colors.map((hex) => (
                      <div key={hex} className="w-5 h-5 rounded-full border border-gray-100" style={{ backgroundColor: hex }} title={hex}/>
                    ))}
                    <span className="text-xs text-gray-300 ml-1 self-center">brand colors</span>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-gray-100 p-6 bg-white">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Company Data</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                  {data.company.employeeCount && <div><div className="text-xs text-gray-400 mb-1">Employees</div><div className="text-sm font-semibold text-gray-900">{formatEmployees(data.company.employeeCount)}</div></div>}
                  {data.company.founded && <div><div className="text-xs text-gray-400 mb-1">Founded</div><div className="text-sm font-semibold text-gray-900">{data.company.founded}</div></div>}
                  {data.company.totalFunding && <div><div className="text-xs text-gray-400 mb-1">Total Funding</div><div className="text-sm font-semibold text-gray-900">{formatFunding(data.company.totalFunding)}</div></div>}
                  {data.company.fundingStage && <div><div className="text-xs text-gray-400 mb-1">Stage</div><div className="text-sm font-semibold text-gray-900">{formatFundingStage(data.company.fundingStage)}</div></div>}
                  {data.company.type && <div><div className="text-xs text-gray-400 mb-1">Type</div><div className="text-sm font-semibold text-gray-900 capitalize">{data.company.type}</div></div>}
                  {data.company.location && <div><div className="text-xs text-gray-400 mb-1">HQ</div><div className="text-sm font-semibold text-gray-900 capitalize">{data.company.location}</div></div>}
                </div>
              </div>

              {data.techStack?.length > 0 && (
                <div className="rounded-2xl border border-gray-100 p-6 bg-white">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Tech Stack & Focus Areas</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.techStack.map((tag, i) => (
                      <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-gray-600 capitalize">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-gray-100 p-6 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Hiring</h3>
                  <a href={data.jobsUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                    View all roles →
                  </a>
                </div>
                {data.jobSnippets?.length > 0 ? (
                  <div className="space-y-1">
                    {data.jobSnippets.map((job, i) => (
                      <div key={i} className="flex items-center py-2.5 border-b border-gray-50 last:border-0">
                        <span className="text-sm text-gray-700">{job}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-300">No recent listings found. <a href={data.jobsUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">Check careers page →</a></p>
                )}
              </div>

              {data.news?.length > 0 && (
                <div className="rounded-2xl border border-gray-100 p-6 bg-white">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Recent News</h3>
                  <div className="space-y-5">
                    {data.news.map((article, i) => (
                      <a key={i} href={article.url} target="_blank" rel="noopener noreferrer" className="block group">
                        <div className="text-sm font-medium text-gray-800 group-hover:text-indigo-600 transition-colors leading-snug">{article.title}</div>
                        <div className="text-xs text-gray-300 mt-1">{article.source} · {article.date}</div>
                        {article.snippet && <div className="text-xs text-gray-400 mt-1 leading-relaxed line-clamp-2">{article.snippet}</div>}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-gray-100 p-6 bg-white">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Decision Makers</h3>
                {data.contacts?.length > 0 ? (
                  <div className="space-y-1">
                    {data.contacts.map((c, i) => (
                      <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 gap-4">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900">{c.name}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{c.title}</div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {c.email && <span className="text-xs text-indigo-600 font-mono">{c.email}</span>}
                          {c.linkedin && (
                            <a href={c.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-indigo-500 transition-colors">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-300">No executive contacts indexed for this domain.</p>
                )}
              </div>

            </div>

            <div className="space-y-5">
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">
                <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-4">APIs Called</h3>
                <div className="space-y-2.5">
                  {Object.entries(data.costs).map(([api, cost]) => (
                    <div key={api} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{api}</span>
                      <span className="text-xs text-gray-400 font-mono">${Number(cost).toFixed(3)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-indigo-100 mt-4 pt-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Total</span>
                  <span className="text-sm font-bold text-indigo-600">${totalCost}</span>
                </div>
                <p className="mt-4 text-xs text-gray-400 leading-relaxed">
                  Without Orthogonal: 5 separate accounts, 5 billing dashboards, hours of setup.
                </p>
                <p className="mt-2 text-xs text-indigo-500 font-medium">With Orthogonal: 1 key. 1 balance.</p>
              </div>

              {data.brand.socials?.length > 0 && (
                <div className="rounded-2xl border border-gray-100 p-5 bg-white">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Socials</h3>
                  <div className="space-y-2">
                    {data.brand.socials.map((s) => (
                      <a key={s.type} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-sm text-gray-500 hover:text-indigo-600 transition-colors capitalize py-1">
                        <span>{s.type}</span>
                        <span className="text-gray-300 text-xs">↗</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-gray-100 p-5 bg-white">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Powered By</h3>
                <div className="space-y-2 text-xs text-gray-400">
                  <div className="flex justify-between"><span>Brand.dev</span><span className="text-gray-300">brand identity</span></div>
                  <div className="flex justify-between"><span>People Data Labs</span><span className="text-gray-300">firmographics</span></div>
                  <div className="flex justify-between"><span>Serper</span><span className="text-gray-300">jobs + news</span></div>
                  <div className="flex justify-between"><span>Hunter</span><span className="text-gray-300">contacts</span></div>
                  <div className="flex justify-between"><span>Apollo</span><span className="text-gray-300">contacts fallback</span></div>
                </div>
                <a href="https://orthogonal.com" target="_blank" rel="noopener noreferrer" className="mt-4 block text-center text-xs text-indigo-600 hover:text-indigo-700 transition-colors border border-indigo-100 rounded-lg py-2 font-medium">
                  Build with Orthogonal →
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}