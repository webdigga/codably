export interface Author {
  name: string;
  slug: string;
  role: string;
  bio: string;
  fullBio: string;
  avatar: string;
  linkedin: string;
}

export const authors: Record<string, Author> = {
  'david-white': {
    name: 'David White',
    slug: 'david-white',
    role: 'Editor, Codably',
    bio: 'David is a software engineer and founder with over a decade of experience building products for small businesses. He writes about developer productivity, tooling, and shipping software faster.',
    fullBio: 'David is a software engineer and founder with over a decade of experience building products for small businesses. He has built and shipped multiple SaaS products, giving him first-hand insight into what makes engineering teams productive.\n\nAt Codably, David writes about developer productivity, tooling, and the practical side of shipping software faster. His articles focus on real workflows and tools that make a measurable difference.\n\nWhen he is not writing, David is building software and helping small teams get more done with less.',
    avatar: '/images/authors/david-white.avif',
    linkedin: 'https://www.linkedin.com/in/david-white-96a0878a/',
  },
  'jonny-rowse': {
    name: 'Jonny Rowse',
    slug: 'jonny-rowse',
    role: 'Editor, Codably',
    bio: 'Jonny is a digital strategist who helps development teams streamline their processes. He writes about workflow optimisation, automation, and building better engineering habits.',
    fullBio: 'Jonny is a digital strategist who helps development teams streamline their processes. With years of experience working alongside engineering teams, he understands the challenges of shipping quality software at pace.\n\nAt Codably, Jonny writes about workflow optimisation, automation, and building better engineering habits. He cuts through the hype to deliver actionable advice that developers can put into practice straight away.\n\nJonny specialises in helping teams get more from the tools they already have, whether that means better CI/CD pipelines, smarter automation, or simply removing bottlenecks.',
    avatar: '/images/authors/jonny-rowse.avif',
    linkedin: 'https://www.linkedin.com/in/jonny-rowse-70a09126/',
  },
  'gareth-clubb': {
    name: 'Gareth Clubb',
    slug: 'gareth-clubb',
    role: 'Editor, Codably',
    bio: 'Gareth is an engineering manager and front-end specialist passionate about coaching teams and improving developer experience. He writes about engineering culture, code quality, and team performance.',
    fullBio: 'Gareth is an engineering manager and front-end specialist with a passion for coaching and mentoring others. He brings a leadership perspective to developer productivity, helping teams understand how the right processes and culture can unlock high performance.\n\nAt Codably, Gareth writes about engineering culture, code quality, and team performance. His articles focus on practical ways to improve developer experience, from better code review practices to healthier team dynamics.\n\nWhen he is not writing, Gareth is focused on enabling psychological safety and high performance in the teams he works with.',
    avatar: '/images/authors/gareth-clubb.avif',
    linkedin: 'https://www.linkedin.com/in/garethclubb/',
  },
};
