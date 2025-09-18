// src/data/questionsData.ts

export interface Comment {
  id: number;
  text: string;
  author: string;
  timeAgo: string;
  votes: number;
  userVote: 'up' | 'down' | null;
  side: 'pour' | 'contre';
  parentId?: number | null;
}

export interface Discussion {
  id: number;
  text: string;
  author: string;
  timeAgo: string;
  likes: number;
  replies: number;
}

export interface QuestionDetails {
  id: number;
  title: string;
  category: string;
  author: string;
  timeAgo: string;
  pour: number;
  contre: number;
  views: number;
  description: string;
  totalComments: number;
  badges: Array<'trending' | 'controversial' | 'new' | 'top'>;
  comments: Comment[];
  discussions: Discussion[];
}

export const QUESTIONS_DATA: { [key: number]: QuestionDetails } = {
  1: {
    id: 1,
    title: "Should we ban cars in city centers?",
    category: "politics",
    author: "urbanplanner",
    timeAgo: "2h ago",
    pour: 805,
    contre: 429,
    views: 3420,
    description: "With increasing pollution and traffic congestion, many cities are considering banning private vehicles from their centers. This would favor public transport, bikes, and pedestrians.",
    totalComments: 47,
    badges: ['trending', 'controversial'],
    comments: [
      { id: 1, text: "Cities like Amsterdam and Copenhagen have shown this works beautifully.", author: "urbanplanner", timeAgo: "1h ago", votes: 234, userVote: null, side: 'pour' },
      { id: 2, text: "My asthma has gotten so much better since our car-free policy started.", author: "healthadvocate", timeAgo: "45m ago", votes: 189, userVote: null, side: 'pour' },
      { id: 3, text: "Pedestrian-only zones increase local business revenue by 15-30%.", author: "economist101", timeAgo: "2h ago", votes: 156, userVote: null, side: 'pour' },
      { id: 4, text: "Emergency services response times are actually faster with dedicated lanes.", author: "firechiefmike", timeAgo: "1h ago", votes: 123, userVote: null, side: 'pour' },
      { id: 5, text: "What about disabled and elderly people who can't walk or cycle?", author: "accessadvocate", timeAgo: "30m ago", votes: 312, userVote: null, side: 'contre' },
      { id: 6, text: "This would destroy my small delivery business completely.", author: "smallbizowner", timeAgo: "1h ago", votes: 245, userVote: null, side: 'contre' },
      { id: 7, text: "Public transport is unreliable and overcrowded - fix that first!", author: "commuter2024", timeAgo: "2h ago", votes: 198, userVote: null, side: 'contre' },
      { id: 8, text: "Low-income families can't afford to live near city centers without cars.", author: "socialworker", timeAgo: "1h ago", votes: 167, userVote: null, side: 'contre' },
    ],
    discussions: [
      { id: 1, text: "Maybe start with car-free Sundays, then expand gradually?", author: "pragmatist", timeAgo: "1h ago", likes: 89, replies: 12 },
      { id: 2, text: "Copenhagen model: excellent public transport + bike infrastructure first, then restrictions.", author: "urbandesigner", timeAgo: "2h ago", likes: 156, replies: 23 },
      { id: 3, text: "We need to reimagine cities for people, not vehicles. This is the future.", author: "greenurbanist", timeAgo: "3h ago", likes: 67, replies: 8 }
    ]
  },

  2: {
    id: 2,
    title: "Should remote work be a legal right?",
    category: "work",
    author: "techworker",
    timeAgo: "4h ago",
    pour: 696,
    contre: 196,
    views: 2104,
    description: "As remote work becomes more common, some argue it should be a legal right for jobs that can be done remotely, similar to parental leave or vacation time.",
    totalComments: 23,
    badges: ['top'],
    comments: [
      { id: 1, text: "Productivity has increased 25% since we went remote. The data is clear.", author: "dataanalyst", timeAgo: "2h ago", votes: 189, userVote: null, side: 'pour' },
      { id: 2, text: "My quality of life improved dramatically without 3 hours of daily commuting.", author: "remoteworker", timeAgo: "1h ago", votes: 145, userVote: null, side: 'pour' },
      { id: 3, text: "Companies save thousands on office space and utilities per employee.", author: "cfolife", timeAgo: "3h ago", votes: 134, userVote: null, side: 'pour' },
      { id: 4, text: "Some jobs absolutely require in-person collaboration and training.", author: "teammanager", timeAgo: "2h ago", votes: 98, userVote: null, side: 'contre' },
      { id: 5, text: "Junior employees struggle without mentorship and office culture.", author: "seniordeveloper", timeAgo: "1h ago", votes: 87, userVote: null, side: 'contre' },
    ],
    discussions: [
      { id: 1, text: "Hybrid model might be the sweet spot - 2-3 days remote, rest in office.", author: "worklifebalance", timeAgo: "2h ago", likes: 67, replies: 8 },
      { id: 2, text: "Different rules for different industries? Tech vs healthcare vs manufacturing?", author: "policyexpert", timeAgo: "3h ago", likes: 45, replies: 15 }
    ]
  },

  3: {
    id: 3,
    title: "Is artificial intelligence a threat to humanity?",
    category: "technology",
    author: "futuretech",
    timeAgo: "5h ago",
    pour: 432,
    contre: 567,
    views: 5871,
    description: "With rapid advances in AI capabilities, concerns grow about job displacement, privacy, and potentially existential risks to humanity.",
    totalComments: 89,
    badges: ['controversial'],
    comments: [
      { id: 1, text: "AI will displace 40% of jobs in the next 20 years. We need universal basic income now.", author: "economist2024", timeAgo: "3h ago", votes: 156, userVote: null, side: 'pour' },
      { id: 2, text: "Deepfakes and misinformation are already undermining democracy.", author: "infosec", timeAgo: "2h ago", votes: 134, userVote: null, side: 'pour' },
      { id: 3, text: "AI systems are becoming too complex for humans to understand or control.", author: "aisafety", timeAgo: "4h ago", votes: 123, userVote: null, side: 'pour' },
      { id: 4, text: "AI has solved protein folding, accelerated drug discovery, and will cure diseases.", author: "biotech", timeAgo: "2h ago", votes: 198, userVote: null, side: 'contre' },
      { id: 5, text: "Every major technological advance has created more jobs than it destroyed.", author: "techhistorian", timeAgo: "1h ago", votes: 167, userVote: null, side: 'contre' },
      { id: 6, text: "AI is just a tool. The real threat is how humans choose to use it.", author: "philosopher", timeAgo: "3h ago", votes: 145, userVote: null, side: 'contre' },
    ],
    discussions: [
      { id: 1, text: "We need AI governance frameworks before it's too late. Look at social media regulation.", author: "policymaker", timeAgo: "2h ago", likes: 89, replies: 24 },
      { id: 2, text: "The benefits far outweigh the risks if we're careful about implementation.", author: "optimist", timeAgo: "4h ago", likes: 67, replies: 18 }
    ]
  },

  4: {
    id: 4,
    title: "Should social media be banned for under-16s?",
    category: "lifestyle",
    author: "parentadvocate",
    timeAgo: "1h ago",
    pour: 234,
    contre: 156,
    views: 1890,
    description: "Growing concerns about mental health impacts, cyberbullying, and screen addiction among teenagers have led to calls for age restrictions on social media platforms.",
    totalComments: 34,
    badges: ['new', 'trending'],
    comments: [
      { id: 1, text: "Teen suicide rates correlate directly with social media adoption rates.", author: "mentalhealth", timeAgo: "45m ago", votes: 89, userVote: null, side: 'pour' },
      { id: 2, text: "My daughter's self-esteem plummeted after joining Instagram. Clear connection.", author: "worriedmom", timeAgo: "30m ago", votes: 67, userVote: null, side: 'pour' },
      { id: 3, text: "Kids need to learn digital literacy early, not be sheltered from reality.", author: "techteacher", timeAgo: "1h ago", votes: 78, userVote: null, side: 'contre' },
      { id: 4, text: "Social media helps isolated teens find communities and support groups.", author: "teenadvocate", timeAgo: "45m ago", votes: 56, userVote: null, side: 'contre' },
    ],
    discussions: [
      { id: 1, text: "What about education platforms vs entertainment? Blanket ban seems extreme.", author: "nuancedview", timeAgo: "30m ago", likes: 34, replies: 7 }
    ]
  },

  5: {
    id: 5,
    title: "Is nuclear energy the solution to climate change?",
    category: "environment",
    author: "climatescientist",
    timeAgo: "3h ago",
    pour: 567,
    contre: 432,
    views: 4567,
    description: "As renewable energy faces scalability challenges, nuclear power offers carbon-free baseload electricity, but concerns about safety and waste remain.",
    totalComments: 67,
    badges: ['controversial'],
    comments: [
      { id: 1, text: "Nuclear is statistically the safest energy source per TWh generated.", author: "nuclearengineer", timeAgo: "2h ago", votes: 134, userVote: null, side: 'pour' },
      { id: 2, text: "France gets 70% of electricity from nuclear with excellent safety record.", author: "energyanalyst", timeAgo: "1h ago", votes: 98, userVote: null, side: 'pour' },
      { id: 3, text: "Modern reactors are walk-away safe - they shut down automatically.", author: "reactor_designer", timeAgo: "2h ago", votes: 87, userVote: null, side: 'pour' },
      { id: 4, text: "Chernobyl and Fukushima show the catastrophic potential of nuclear accidents.", author: "environmentalist", timeAgo: "1h ago", votes: 123, userVote: null, side: 'contre' },
      { id: 5, text: "Nuclear waste remains dangerous for thousands of years with no solution.", author: "greenenergy", timeAgo: "2h ago", votes: 109, userVote: null, side: 'contre' },
    ],
    discussions: [
      { id: 1, text: "Small modular reactors might be the game-changer we need.", author: "innovator", timeAgo: "1h ago", likes: 45, replies: 12 }
    ]
},

6: {
    id: 6,
    title: "Should companies track employee productivity?",
    category: "work",
    author: "hrexpert",
    timeAgo: "6h ago",
    pour: 345,
    contre: 456,
    views: 2234,
    description: "With remote work increasing, many companies are implementing productivity tracking software. Is this necessary oversight or workplace surveillance?",
    totalComments: 29,
    badges: ['top'],
    comments: [
      { id: 1, text: "Tracking kills creativity and trust. Treat employees like adults.", author: "creativedirector", timeAgo: "4h ago", votes: 89, userVote: null, side: 'contre' },
      { id: 2, text: "Accountability ensures fair workload distribution across teams.", author: "projectmanager", timeAgo: "3h ago", votes: 67, userVote: null, side: 'pour' },
    ],
    discussions: [
      { id: 1, text: "Focus on results, not hours. Output matters more than screen time.", author: "resultsfocused", timeAgo: "2h ago", likes: 45, replies: 8 }
    ]
  },

  7: {
    id: 7,
    title: "Is cryptocurrency the future of money?",
    category: "technology",
    author: "cryptoenthusiast",
    timeAgo: "8h ago",
    pour: 789,
    contre: 234,
    views: 3456,
    description: "As traditional banking faces challenges and digital currencies gain adoption, will crypto replace fiat money or remain a speculative asset?",
    totalComments: 78,
    badges: ['trending'],
    comments: [
      { id: 1, text: "Decentralization breaks central bank control over monetary policy.", author: "libertarian", timeAgo: "6h ago", votes: 134, userVote: null, side: 'pour' },
      { id: 2, text: "Volatility makes crypto unusable as stable store of value.", author: "economist", timeAgo: "5h ago", votes: 98, userVote: null, side: 'contre' },
    ],
    discussions: [
      { id: 1, text: "CBDCs are the real future - government-backed digital currencies.", author: "fintech", timeAgo: "4h ago", likes: 67, replies: 15 }
    ]
  },

  8: {
    id: 8,
    title: "Should university education be free?",
    category: "general",
    author: "student2024",
    timeAgo: "12h ago",
    pour: 892,
    contre: 345,
    views: 5678,
    description: "Countries like Germany and France offer free higher education. Should this be a universal right, or do tuition fees ensure educational quality and commitment?",
    totalComments: 123,
    badges: ['top', 'trending'],
    comments: [
      { id: 1, text: "Education is a human right, not a privilege for the wealthy.", author: "equalityadvocate", timeAgo: "10h ago", votes: 189, userVote: null, side: 'pour' },
      { id: 2, text: "Student debt crisis is destroying an entire generation's future.", author: "debtfree", timeAgo: "8h ago", votes: 156, userVote: null, side: 'pour' },
      { id: 3, text: "Free education devalues degrees and reduces student commitment.", author: "professor", timeAgo: "9h ago", votes: 98, userVote: null, side: 'contre' },
    ],
    discussions: [
      { id: 1, text: "Income-based repayment plans could be a middle ground solution.", author: "policyanalyst", timeAgo: "6h ago", likes: 78, replies: 19 }
    ]
  }
  };

// Helper function to get question data by ID from slug
export function getQuestionById(id: number): QuestionDetails | null {
  return QUESTIONS_DATA[id] || null;
}

// Helper to extract ID from slug (e.g., "123-some-title" -> 123)
export function extractIdFromSlug(slug: string): number {
  const id = parseInt(slug.split('-')[0]);
  return isNaN(id) ? 1 : id;
}

// Generate AI insights specific to each question
export function getAIInsightsForQuestion(questionId: number): {
  summary: string;
  missingAngles: string;
  quality: string;
  related: string;
} {
  const insights: { [key: number]: any } = {
    1: {
      summary: "Environmental gains vs. accessibility concerns dominate discourse",
      missingAngles: "emergency response times, tourism economic impact",
      quality: "3 claims sourced • 2 require citation • High emotional content",
      related: "congestion pricing, low-emission zones, 15-minute cities"
    },
    2: {
      summary: "Productivity data favors remote work, junior training concerns remain",
      missingAngles: "industry-specific requirements, hybrid models, legal frameworks",
      quality: "5 claims sourced • 1 needs citation • Data-driven arguments",
      related: "4-day work week, flexible schedules, digital nomad policies"
    },
    3: {
      summary: "Job displacement fears vs. breakthrough benefits create polarization",
      missingAngles: "regulation frameworks, timeline specificity, industry variation",
      quality: "4 claims sourced • 3 need citation • Speculative elements high",
      related: "AI safety research, universal basic income, automation taxation"
    },
    4: {
      summary: "Mental health evidence vs. digital literacy needs clash",
      missingAngles: "enforcement mechanisms, educational alternatives, parental control",
      quality: "2 claims sourced • 4 need citation • Anecdotal evidence prevalent",
      related: "screen time limits, digital wellbeing, age verification systems"
    },
    5: {
      summary: "Safety statistics vs. waste concerns drive technical debate",
      missingAngles: "storage solutions, small modular reactors, public acceptance",
      quality: "6 claims sourced • Well-documented • Technical accuracy high",
      related: "renewable energy storage, fusion research, carbon pricing"
    },
    6: {
      summary: "Trust vs. accountability tensions in remote work surveillance",
      missingAngles: "legal boundaries, employee rights, productivity metrics validity",
      quality: "1 claim sourced • 3 need citation • Privacy concerns underexplored",
      related: "employee monitoring laws, right to disconnect, workplace privacy"
    },
    7: {
      summary: "Volatility concerns vs. decentralization benefits create divide",
      missingAngles: "regulatory clarity, environmental impact, financial inclusion",
      quality: "2 claims sourced • 2 need citation • Speculation vs. data mixed",
      related: "central bank digital currencies, stablecoins, DeFi regulation"
    },
    8: {
      summary: "Access equity vs. quality funding concerns dominate policy debate",
      missingAngles: "implementation costs, means testing, international comparisons",
      quality: "4 claims sourced • 1 needs citation • Policy analysis solid",
      related: "student debt forgiveness, income-based repayment, skills-based hiring"
    }
  };

  return insights[questionId] || {
    summary: "Limited discussion data available for analysis",
    missingAngles: "comprehensive stakeholder perspectives needed",
    quality: "insufficient data for quality assessment",
    related: "similar policy debates, regulatory frameworks"
  };
}

// === Helpers pour slugs propres ===
export function slugifyTitle(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function getQuestionBySlug(slug: string): QuestionDetails | null {
  const all = Object.values(QUESTIONS_DATA || {});
  const found = all.find(q => slugifyTitle(q.title) === slug);
  return found || null;
}
