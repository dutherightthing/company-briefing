export async function POST(request) {
    const { domain, jobFunction } = await request.json()
    if (!domain || !jobFunction) return Response.json({ error: 'Domain and job function required' }, { status: 400 })
    const ORTH_KEY = process.env.ORTHOGONAL_API_KEY
  
    try {
      const res = await fetch('https://api.orth.sh/v1/run', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + ORTH_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api: 'contactout',
          path: '/v1/people/search',
          body: {
            domain: [domain],
            job_function: [jobFunction],
            seniority: ['VP', 'Director', 'Head', 'Manager'],
            page: 1,
            reveal_info: true,
          }
        }),
      })
      const data = await res.json()
  
      if (!data.success) return Response.json({ error: data.error || 'Search failed' }, { status: 500 })
  
      const profilesDict = data.data && data.data.profiles ? data.data.profiles : {}
      const profiles = Object.values(profilesDict)
  
      const leads = profiles.slice(0, 8).map(function(p) {
        const ci = p.contact_info || {}
        const emails = ci.work_emails && ci.work_emails.length > 0 ? ci.work_emails : (ci.personal_emails || ci.emails || [])
        return {
          name: p.full_name || null,
          title: p.title || null,
          linkedin: p.li_vanity ? 'https://linkedin.com/in/' + p.li_vanity : null,
          email: emails[0] || null,
          photo: p.profile_picture_url || null,
        }
      }).filter(function(p) { return p.name })
  
      return Response.json({
        leads,
        cost: data.payment ? data.payment.amountDollars : 0.05,
      })
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 })
    }
  }