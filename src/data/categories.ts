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
];
