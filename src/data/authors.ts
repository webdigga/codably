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
    role: 'Editor, CRM Beat',
    bio: 'David has spent over a decade helping small UK businesses get more from their technology. As the founder of Kabooly CRM, he writes about practical CRM strategy grounded in real experience.',
    fullBio: 'David has spent over a decade helping small UK businesses get more from their technology. As the founder of Kabooly CRM, he brings first-hand experience of building and running a CRM platform designed specifically for small teams.\n\nAt CRM Beat, David writes about practical CRM strategy grounded in real-world experience. His articles focus on helping business owners choose the right tools, avoid common pitfalls, and build lasting client relationships without overcomplicating things.\n\nWhen he is not writing, David works on improving Kabooly CRM and advising small businesses on their technology choices.',
    avatar: '/images/authors/david-white.avif',
    linkedin: 'https://www.linkedin.com/in/david-white-96a0878a/',
  },
  'jonny-rowse': {
    name: 'Jonny Rowse',
    slug: 'jonny-rowse',
    role: 'Editor, CRM Beat',
    bio: 'Jonny is a digital strategist with a passion for helping small businesses streamline their operations. He writes about practical CRM tactics that drive real results without the jargon.',
    fullBio: 'Jonny is a digital strategist with a passion for helping small businesses streamline their operations. With years of experience working alongside growing companies, he understands the challenges of managing client relationships at scale.\n\nAt CRM Beat, Jonny writes about practical CRM tactics that drive real results. He cuts through the jargon to deliver actionable advice that business owners can put into practice straight away.\n\nJonny specialises in helping teams get more from the tools they already have, whether that means better workflows, smarter automations, or simply understanding what their data is telling them.',
    avatar: '/images/authors/jonny-rowse.avif',
    linkedin: 'https://www.linkedin.com/in/jonny-rowse-70a09126/',
  },
  'gareth-clubb': {
    name: 'Gareth Clubb',
    slug: 'gareth-clubb',
    role: 'Editor, CRM Beat',
    bio: 'Gareth is an engineering manager and front-end specialist who is passionate about coaching teams and building better CRM workflows. He writes about the technical side of CRM strategy for small businesses.',
    fullBio: 'Gareth is an engineering manager and front-end specialist with a passion for coaching and mentoring others. He brings a technical perspective to CRM strategy, helping small businesses understand how the right tools and processes can enable high-performing teams.\n\nAt CRM Beat, Gareth writes about the intersection of technology and client relationship management. His articles focus on practical ways to get more from your CRM, from smarter workflows to better data practices, all grounded in hands-on engineering experience.\n\nWhen he is not writing, Gareth is focused on enabling psychological safety and high performance in the teams he works with, a philosophy that carries through into his approach to CRM adoption and team buy-in.',
    avatar: '/images/authors/gareth-clubb.avif',
    linkedin: 'https://www.linkedin.com/in/garethclubb/',
  },
};
