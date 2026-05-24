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

const DEPARTMENTS = [
  { value: 'sales', label: 'Sales' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'operations', label: 'Operations' },
  { value: 'finance', label: 'Finance' },
  { value: 'human resources', label: 'HR / People' },
  { value: 'legal', label: 'Legal' },
  { value: 'product management', label: 'Product' },
  { value: 'design', label: 'Design' },
  { value: 'customer success', label: 'Customer Success' },
]

export default function Home() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('')
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [department, setDepartment] = useState('')
  const [leadsLoading, setLeadsLoading] = useState(false)
  const [leads, setLeads] = useState(null)
  const [leadsError, setLeadsError] = useState(null)
  const [leadsCost, setLeadsCost] = useState(null)

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
    setLeads(null)
    setLeadsCost(null)
    setDepartment('')
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

  const handleFindPeople = async () => {
    if (!department || !data) return
    setLeadsLoading(true)
    setLeads(null)
    setLeadsError(null)
    let cleanDomain = domain.trim().toLowerCase()
    cleanDomain = cleanDomain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: cleanDomain, jobFunction: department }),
      })
      const result = await res.json()
      if (result.error) setLeadsError(result.error)
      else { setLeads(result.leads); setLeadsCost(result.cost) }
    } catch (err) {
      setLeadsError('Something went wrong.')
    }
    setLeadsLoading(false)
  }

  const totalCost = data ? Object.values(data.costs).reduce((a, b) => a + b, 0).toFixed(3) : null
  const currentStepIndex = steps.findIndex((s) => s.key === step)

  return (
    <div className="min-h-screen bg-white text-black" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* Header */}
      <header style={{ borderBottom: '1px solid #f0f0f0' }} className="px-8 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-black flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6h8M6 2v8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-semibold text-sm">Company Briefing</span>
            <span className="text-sm text-gray-400">by Orthogonal</span>
          </div>
          <a href="https://orthogonal.com" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-black transition-colors">
            orthogonal.com →
          </a>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-8 py-16">

        {/* Hero */}
        {!data && !loading && (
          <div className="mb-14 text-center">
            <p className="text-sm text-gray-400 mb-4">Powered by 6 APIs · 1 Orthogonal key</p>
            <h1 className="text-5xl font-bold tracking-tight mb-5 leading-tight" style={{ letterSpacing: '-0.02em' }}>
              Instant Company Briefing
            </h1>
            <p className="text-gray-500 text-xl max-w-xl leading-relaxed mx-auto">
              Enter any company domain. Get brand, funding, hiring signals, news, and decision-maker contacts in seconds.
            </p>
          </div>
        )}

        {/* Search */}
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-xl mb-14 mx-auto">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="stripe.com"
            style={{ border: '1px solid #e5e5e5' }}
            className="flex-1 rounded-xl px-4 py-3 text-sm text-black placeholder-gray-300 focus:outline-none focus:border-black transition-all bg-white"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !domain.trim()}
            className="bg-black hover:bg-gray-900 disabled:opacity-30 disabled:cursor-not-allowed text-white px-7 py-3 rounded-xl text-sm font-medium transition-colors"
          >
            {loading ? 'Researching...' : 'Research'}
          </button>
        </form>

        {/* Loading */}
        {loading && (
          <div className="max-w-xs mb-14">
            <div className="space-y-4">
              {steps.map((s, i) => {
                const done = i < currentStepIndex
                const active = i === currentStepIndex
                return (
                  <div key={s.key} className={`flex items-center gap-3 text-sm transition-all ${active ? 'text-black' : 'text-gray-300'}`}>
                    <div style={{ width: 18, height: 18, border: active ? '1.5px solid black' : '1.5px solid #e5e5e5', borderRadius: '50%' }} className="flex items-center justify-center flex-shrink-0">
                      {done && <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#d1d5db' }}/>}
                      {active && <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: 'black' }} className="animate-pulse"/>}
                    </div>
                    <span className="flex-1">{s.label}</span>
                    <span className={`text-xs ${active ? 'text-black' : 'text-gray-300'}`}>{s.api}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {error && (
          <div style={{ border: '1px solid #fee2e2', backgroundColor: '#fef2f2' }} className="max-w-xl rounded-xl px-4 py-3 text-sm text-red-500 mb-8">
            {error}
          </div>
        )}

        {data && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Main */}
            <div className="lg:col-span-2 space-y-6">

              {/* Brand card */}
              <div style={{ border: '1px solid #f0f0f0' }} className="rounded-2xl p-7">
                <div className="flex items-start gap-5">
                  {data.brand.logo && (
                    <img src={data.brand.logo} alt={data.brand.name} style={{ border: '1px solid #f0f0f0' }} className="w-16 h-16 rounded-2xl object-cover flex-shrink-0"/>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <h2 className="text-2xl font-bold tracking-tight">{data.brand.name}</h2>
                      {data.brand.industry && (
                        <span style={{ border: '1px solid #e5e5e5', color: '#888' }} className="text-xs px-2.5 py-1 rounded-full">
                          {data.brand.industry}
                        </span>
                      )}
                    </div>
                    {data.brand.slogan && <p className="text-gray-400 text-sm mb-2">{data.brand.slogan}</p>}
                    {data.brand.description && <p className="text-gray-600 text-sm leading-relaxed">{data.brand.description}</p>}
                  </div>
                </div>
                {data.brand.colors?.length > 0 && (
                  <div className="flex items-center gap-2 mt-5 pt-5" style={{ borderTop: '1px solid #f7f7f7' }}>
                    {data.brand.colors.map((hex) => (
                      <div key={hex} style={{ backgroundColor: hex, width: 20, height: 20, borderRadius: '50%', border: '1px solid #f0f0f0' }} title={hex}/>
                    ))}
                    <span className="text-xs text-gray-300 ml-1">brand colors</span>
                  </div>
                )}
              </div>

              {/* Company stats */}
              <div style={{ border: '1px solid #f0f0f0' }} className="rounded-2xl p-7">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">Company</p>
                <div className="grid grid-cols-3 gap-6">
                  {data.company.employeeCount && (
                    <div>
                      <p className="text-2xl font-bold tracking-tight">{formatEmployees(data.company.employeeCount)}</p>
                      <p className="text-xs text-gray-400 mt-1">Employees</p>
                    </div>
                  )}
                  {data.company.founded && (
                    <div>
                      <p className="text-2xl font-bold tracking-tight">{data.company.founded}</p>
                      <p className="text-xs text-gray-400 mt-1">Founded</p>
                    </div>
                  )}
                  {data.company.totalFunding && (
                    <div>
                      <p className="text-2xl font-bold tracking-tight">{formatFunding(data.company.totalFunding)}</p>
                      <p className="text-xs text-gray-400 mt-1">Total Funding</p>
                    </div>
                  )}
                  {data.company.fundingStage && (
                    <div>
                      <p className="text-sm font-semibold">{formatFundingStage(data.company.fundingStage)}</p>
                      <p className="text-xs text-gray-400 mt-1">Stage</p>
                    </div>
                  )}
                  {data.company.type && (
                    <div>
                      <p className="text-sm font-semibold capitalize">{data.company.type}</p>
                      <p className="text-xs text-gray-400 mt-1">Type</p>
                    </div>
                  )}
                  {data.company.location && (
                    <div>
                      <p className="text-sm font-semibold capitalize">{data.company.location}</p>
                      <p className="text-xs text-gray-400 mt-1">HQ</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tech stack */}
              {data.techStack?.length > 0 && (
                <div style={{ border: '1px solid #f0f0f0' }} className="rounded-2xl p-7">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">Focus Areas</p>
                  <div className="flex flex-wrap gap-2">
                    {data.techStack.map((tag, i) => (
                      <span key={i} style={{ border: '1px solid #e5e5e5', color: '#555' }} className="text-xs px-3 py-1.5 rounded-full capitalize bg-white">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Hiring */}
              <div style={{ border: '1px solid #f0f0f0' }} className="rounded-2xl p-7">
                <div className="flex items-center justify-between mb-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Hiring</p>
                  <a href={data.jobsUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-black transition-colors">
                    View all roles →
                  </a>
                </div>
                {data.jobSnippets?.length > 0 ? (
                  <div>
                    {data.jobSnippets.map((job, i) => (
                      <div key={i} style={{ borderBottom: i < data.jobSnippets.length - 1 ? '1px solid #f7f7f7' : 'none' }} className="py-3">
                        <span className="text-sm text-gray-800">{job}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-300">No recent listings found. <a href={data.jobsUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black">Check careers page →</a></p>
                )}
              </div>

              {/* News */}
              {data.news?.length > 0 && (
                <div style={{ border: '1px solid #f0f0f0' }} className="rounded-2xl p-7">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">News</p>
                  <div>
                    {data.news.map((article, i) => (
                      <a key={i} href={article.url} target="_blank" rel="noopener noreferrer" style={{ borderBottom: i < data.news.length - 1 ? '1px solid #f7f7f7' : 'none' }} className="block py-4 group">
                        <p className="text-sm font-medium text-black group-hover:text-gray-500 transition-colors leading-snug">{article.title}</p>
                        <p className="text-xs text-gray-400 mt-1">{article.source} · {article.date}</p>
                        {article.snippet && <p className="text-xs text-gray-400 mt-1.5 leading-relaxed line-clamp-2">{article.snippet}</p>}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Decision makers */}
              <div style={{ border: '1px solid #f0f0f0' }} className="rounded-2xl p-7">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Decision Makers</p>
                <p className="text-xs text-gray-400 mb-5">Select a department to find leaders with contact info.</p>
                <div className="flex gap-2 mb-5">
                  <select
                    value={department}
                    onChange={(e) => { setDepartment(e.target.value); setLeads(null); setLeadsError(null) }}
                    style={{ border: '1px solid #e5e5e5' }}
                    className="flex-1 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-black transition-all bg-white"
                  >
                    <option value="">Select a department...</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleFindPeople}
                    disabled={!department || leadsLoading}
                    className="bg-black hover:bg-gray-900 disabled:opacity-30 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
                  >
                    {leadsLoading ? 'Searching...' : 'Find People'}
                  </button>
                </div>

                {leadsError && (
                  <div style={{ border: '1px solid #fee2e2', backgroundColor: '#fef2f2' }} className="rounded-xl px-4 py-3 text-sm text-red-500 mb-4">
                    {leadsError}
                  </div>
                )}

                {leads && leads.length > 0 && (
                  <div>
                    {leads.map((lead, i) => (
                      <div key={i} style={{ borderBottom: i < leads.length - 1 ? '1px solid #f7f7f7' : 'none' }} className="flex items-center gap-4 py-4">
                        {lead.photo ? (
                          <img src={lead.photo} alt={lead.name} style={{ border: '1px solid #f0f0f0' }} className="w-10 h-10 rounded-full object-cover flex-shrink-0"/>
                        ) : (
                          <div style={{ backgroundColor: '#f5f5f5', width: 40, height: 40, borderRadius: '50%' }} className="flex-shrink-0 flex items-center justify-center text-xs text-gray-400 font-semibold">
                            {lead.name ? lead.name[0] : '?'}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-black">{lead.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{lead.title}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {lead.email && (
                            <span className="text-xs text-gray-500 font-mono hidden sm:block">{lead.email}</span>
                          )}
                          {lead.linkedin && (
                            <a href={lead.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: '#c0c0c0' }} className="hover:text-black transition-colors">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                    {leadsCost && (
                      <p className="text-xs text-gray-300 pt-3">ContactOut · ${Number(leadsCost).toFixed(3)}</p>
                    )}
                  </div>
                )}

                {leads && leads.length === 0 && (
                  <p className="text-sm text-gray-300">No leaders found for this department.</p>
                )}
              </div>

            </div>

            {/* Sidebar */}
            <div className="space-y-6">

              {/* APIs called */}
              <div style={{ border: '1px solid #f0f0f0' }} className="rounded-2xl p-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">APIs Called</p>
                <div className="space-y-3">
                  {Object.entries(data.costs).map(([api, cost]) => (
                    <div key={api} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{api}</span>
                      <span className="text-xs text-gray-400 font-mono">${Number(cost).toFixed(3)}</span>
                    </div>
                  ))}
                  {leadsCost && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">ContactOut</span>
                      <span className="text-xs text-gray-400 font-mono">${Number(leadsCost).toFixed(3)}</span>
                    </div>
                  )}
                </div>
                <div style={{ borderTop: '1px solid #f0f0f0' }} className="mt-5 pt-5 flex items-center justify-between">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-sm font-bold">${(parseFloat(totalCost) + (leadsCost ? parseFloat(leadsCost) : 0)).toFixed(3)}</span>
                </div>
                <p className="mt-4 text-xs text-gray-400 leading-relaxed">Without Orthogonal: 6 accounts, 6 billing dashboards, hours of setup.</p>
                <p className="mt-1 text-xs text-gray-700 font-medium">With Orthogonal: 1 key. 1 balance.</p>
              </div>

              {/* Socials */}
              {data.brand.socials?.length > 0 && (
                <div style={{ border: '1px solid #f0f0f0' }} className="rounded-2xl p-6">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Socials</p>
                  <div>
                    {data.brand.socials.map((s, i) => (
                      <a key={s.type} href={s.url} target="_blank" rel="noopener noreferrer" style={{ borderBottom: i < data.brand.socials.length - 1 ? '1px solid #f7f7f7' : 'none' }} className="flex items-center justify-between text-sm text-gray-600 hover:text-black transition-colors capitalize py-2.5">
                        <span>{s.type}</span>
                        <span className="text-gray-300 text-xs">↗</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Powered by */}
              <div style={{ border: '1px solid #f0f0f0' }} className="rounded-2xl p-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Powered By</p>
                <div className="space-y-2.5">
                  {[
                    ['Brand.dev', 'brand identity'],
                    ['People Data Labs', 'firmographics'],
                    ['Serper', 'jobs + news'],
                    ['Hunter', 'contacts'],
                    ['Apollo', 'contacts fallback'],
                    ['ContactOut', 'people search'],
                  ].map(([name, desc]) => (
                    <div key={name} className="flex justify-between">
                      <span className="text-xs text-gray-600">{name}</span>
                      <span className="text-xs text-gray-300">{desc}</span>
                    </div>
                  ))}
                </div>
                <a href="https://orthogonal.com" target="_blank" rel="noopener noreferrer" style={{ border: '1px solid #e5e5e5' }} className="mt-5 block text-center text-xs text-gray-700 hover:text-black hover:border-black transition-colors rounded-xl py-2.5 font-medium">
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