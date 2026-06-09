export const mockMatches: any[] = [
  {
    id: 'match_01',
    customerId: 'cust_01', // Alexander Wright (Male, age 32, NYC)
    proposedMatchId: 'cust_02', // Sophia Chen (Female, age 30, NYC)
    status: 'proposed',
    matchmakerNotes: 'Both work in tech/design in NYC, share creative/analytical overlap and outdoor interests. Great potential!',
    aiReport: {
      score: 91,
      pros: [
        'Shared geographic location (NYC)',
        'Tech and design alignment (Software Engineer + UX Designer)',
        'Shared hobbies: both love hiking and cooking/baking',
        'Compatible age preferences (he wants 28-35, she is 30; she wants 29-37, he is 32)'
      ],
      cons: [
        'Slightly different religious/spiritual beliefs (Non-religious vs Spiritual)',
        'Minor political divergence (Moderate vs Liberal)'
      ],
      summary: 'Alexander and Sophia are an exceptionally strong fit. Their professions complement each other, and they share active, outdoor lifestyles along with creative pursuits. Their relationship timelines (children, marriage views) are highly compatible.',
      generatedAt: '2026-06-01T14:30:00Z'
    },
    createdAt: '2026-06-01T14:00:00Z',
    updatedAt: '2026-06-01T14:30:00Z'
  },
  {
    id: 'match_02',
    customerId: 'cust_03', // Marcus Johnson (Male, age 35, SF)
    proposedMatchId: 'cust_04', // Elena Rostova (Female, age 33, SF)
    status: 'approved',
    matchmakerNotes: 'Marcus is active in SF, Elena is a Product Manager who sails and runs. Both are highly active and educated professionals.',
    aiReport: {
      score: 84,
      pros: [
        'Located in San Francisco',
        'Strong academic background (Ph.D. + MBA)',
        'Active lifestyles (cycling/guitar vs running/sailing)',
        'Both open to children'
      ],
      cons: [
        'Elena has children, Marcus does not have children but is open to them',
        'Elena is divorced, Marcus has never married'
      ],
      summary: 'Marcus and Elena match very well on intellectual capability, geographic location, and general drive. Elena\'s child-rearing status requires open communication, but Marcus\'s openness to children matches well.',
      generatedAt: '2026-06-02T10:15:00Z'
    },
    createdAt: '2026-06-02T10:00:00Z',
    updatedAt: '2026-06-02T10:20:00Z'
  },
  {
    id: 'match_03',
    customerId: 'cust_06', // David Miller (Male, age 41, Chicago)
    proposedMatchId: 'cust_07', // Sarah Goldstein (Female, age 38, Chicago)
    status: 'successful',
    matchmakerNotes: 'Shared Jewish faith and culture in Chicago. High intellectual compatibility (Lawyer & Pediatrician). Successful matchmaking!',
    aiReport: {
      score: 89,
      pros: [
        'Same religion and cultural background (Jewish)',
        'Located in Chicago',
        'Similar life stages and age compatibility (41 and 38)',
        'High-caliber professional alignment (Lawyer + Doctor)'
      ],
      cons: [
        'David has kids and does not want more; Sarah is open to kids, which may need alignment'
      ],
      summary: 'An excellent match on cultural and intellectual parameters. Their mature perspectives on family and demanding careers align exceptionally well, making this a highly durable match.',
      generatedAt: '2026-05-20T11:00:00Z'
    },
    createdAt: '2026-05-15T09:00:00Z',
    updatedAt: '2026-05-25T17:00:00Z'
  }
];
