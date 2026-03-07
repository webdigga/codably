export interface Category {
  slug: string;
  name: string;
  description: string;
}

export const categories: Category[] = [
  {
    slug: 'getting-started',
    name: 'Getting Started',
    description: 'Everything you need to know to choose, set up, and start using a CRM for your small business.',
  },
  {
    slug: 'sales-pipeline',
    name: 'Sales Pipeline',
    description: 'Build and manage a sales pipeline that turns enquiries into paying clients.',
  },
  {
    slug: 'client-retention',
    name: 'Client Retention',
    description: 'Keep your existing clients happy, engaged, and coming back for more.',
  },
  {
    slug: 'marketing-automation',
    name: 'Marketing Automation',
    description: 'Automate your marketing to save time and stay in front of your audience.',
  },
  {
    slug: 'business-growth',
    name: 'Business Growth',
    description: 'Scale your business without losing the personal touch that won you clients in the first place.',
  },
  {
    slug: 'industry-tips',
    name: 'Industry Tips',
    description: 'CRM advice tailored to specific trades, professions, and service industries.',
  },
  {
    slug: 'data-reporting',
    name: 'Data & Reporting',
    description: 'Make sense of your CRM data with reports that drive better decisions.',
  },
  {
    slug: 'team-people',
    name: 'Team & People',
    description: 'Get your team on board with CRM, build better habits, and create a culture that puts clients first.',
  },
  {
    slug: 'tools-tech',
    name: 'Tools & Tech',
    description: 'Compare CRM tools, set up integrations, and make the most of the technology behind your business.',
  },
  {
    slug: 'productivity',
    name: 'Productivity',
    description: 'Work smarter with better workflows, time management, and systems that keep your business running smoothly.',
  },
  {
    slug: 'communication',
    name: 'Communication',
    description: 'Improve how you communicate with clients, from proposals and follow-ups to everyday conversations.',
  },
  {
    slug: 'strategy',
    name: 'Strategy',
    description: 'Plan ahead with practical advice on pricing, positioning, and long-term business decisions.',
  },
];
