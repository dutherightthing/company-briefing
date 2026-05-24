export async function POST(request) {
    const { domain } = await request.json()
    if (!domain) return Response.json({ error: 'Domain is required' }, { status: 400 })
    const ORTH_KEY = process.env.ORTHOGONAL_API_KEY
  
    async function orthFetch(api, path, params) {
      const body = Object.assign({ api, path }, params || {})
      const res = await fetch('https://api.orth.sh/v1/run', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + ORTH_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      return res.json()
    }
  
    try {
      const [brandResult, pdlResult] = await Promise.all([
        orthFetch('brand-dev', '/v1/brand/retrieve', { query: { domain } }),
        orthFetch('peopledatalabs', '/v5/company/enrich', { query: { website: domain } }),
      ])
  
      const companyName = (brandResult && brandResult.data && brandResult.data.brand && brandResult.data.brand.title) ? brandResult.data.brand.title : domain
  
      const [jobsSearchResult, newsResult, hunterResult, apolloResult] = await Promise.all([
        orthFetch('serper', '/search', { body: { q: companyName + ' jobs site:builtin.com OR site:linkedin.com/company', num: 3 } }),
        orthFetch('serper', '/news', { body: { q: companyName + ' company news', num: 5 } }),
        orthFetch('hunter', '/v2/domain-search', { query: { domain: domain, limit: 5, seniority: 'executive', type: 'personal' } }),
        orthFetch('apollo', '/api/v1/mixed_people/api_search', { body: { per_page: 5, person_seniorities: ['c_suite', 'vp', 'owner', 'founder'], q_keywords: domain } }),
      ])
  
      const jobSnippets = []
      if (jobsSearchResult && jobsSearchResult.data && jobsSearchResult.data.organic) {
        jobsSearchResult.data.organic.forEach(function(result) {
          if (result.snippet && (result.link.includes('builtin.com') || result.link.includes('linkedin.com'))) {
            const parts = result.snippet.replace('Jobs at ' + companyName + ' · ', '').replace('Recently posted jobs · ', '').split(' · ')
            parts.forEach(function(p) {
                const clean = p.trim()
                if (clean.length > 10 && clean.length < 80 && !clean.includes('...') && jobSnippets.indexOf(clean) === -1 && jobSnippets.length < 6) {
                  jobSnippets.push(clean)
                }
              })
          }
        })
      }
  
      const news = ((newsResult && newsResult.data && newsResult.data.news) ? newsResult.data.news : []).slice(0, 5).map(function(a) {
        return { title: a.title, source: a.source, date: a.date, url: a.link, snippet: a.snippet }
      })
  
      const hunterEmails = (hunterResult && hunterResult.data && hunterResult.data.data && hunterResult.data.data.emails) ? hunterResult.data.data.emails : []
      const hunterContacts = hunterEmails.slice(0, 5).map(function(e) {
        return { name: e.first_name + ' ' + e.last_name, title: e.position, email: e.value, linkedin: e.linkedin || null, source: 'hunter' }
      })
  
      const apolloPeople = (apolloResult && apolloResult.data && apolloResult.data.people) ? apolloResult.data.people : []
      const apolloContacts = apolloPeople.slice(0, 5).map(function(p) {
        return { name: p.first_name, title: p.title, email: null, linkedin: null, source: 'apollo' }
      })
  
      const contacts = hunterContacts.length > 0 ? hunterContacts : apolloContacts
  
      const brand = (brandResult && brandResult.data && brandResult.data.brand) ? brandResult.data.brand : {}
      const logos = brand.logos || []
      const iconLogo = logos.find(function(l) { return l.type === 'icon' }) || logos[0] || null
      const company = (pdlResult && pdlResult.data) ? pdlResult.data : {}
      const techStack = (company.tags || []).slice(0, 12)
  
      const costs = {
        'Brand.dev': (brandResult && brandResult.payment) ? brandResult.payment.amountDollars : 0.03,
        'People Data Labs': (pdlResult && pdlResult.payment) ? pdlResult.payment.amountDollars : 0.11,
        'Serper Search': (jobsSearchResult && jobsSearchResult.payment) ? jobsSearchResult.payment.amountDollars : 0.002,
        'Serper News': (newsResult && newsResult.payment) ? newsResult.payment.amountDollars : 0.002,
        'Hunter': (hunterResult && hunterResult.payment) ? hunterResult.payment.amountDollars : 0.01,
      }
  
      return Response.json({
        brand: {
          name: brand.title || domain,
          description: brand.description || null,
          slogan: brand.slogan || null,
          logo: iconLogo ? iconLogo.url : null,
          colors: (brand.colors || []).slice(0, 3).map(function(c) { return c.hex }),
          industry: (brand.industries && brand.industries.eic && brand.industries.eic[0]) ? brand.industries.eic[0].subindustry : null,
          socials: brand.socials || [],
        },
        company: {
          employeeCount: company.employee_count || null,
          founded: company.founded || null,
          fundingStage: company.latest_funding_stage || null,
          totalFunding: company.total_funding_raised || null,
          location: company.location ? company.location.name : null,
          type: company.type || null,
        },
        techStack,
        jobsUrl: 'https://' + domain + '/jobs',
        jobSnippets,
        news,
        contacts,
        costs,
      })
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 })
    }
  }