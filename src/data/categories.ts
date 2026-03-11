export interface Category {
  slug: string;
  name: string;
  description: string;
}

export const categories: Category[] = [
  {
    slug: 'ai-tools',
    name: 'AI Tools',
    description: 'Practical guides to AI coding assistants, copilots, and automation tools that help you ship faster.',
  },
  {
    slug: 'workflows',
    name: 'Workflows',
    description: 'Optimise your development workflow from commit to deploy with better processes and habits.',
  },
  {
    slug: 'devops',
    name: 'DevOps',
    description: 'CI/CD pipelines, deployment strategies, infrastructure, and everything that keeps your code running.',
  },
  {
    slug: 'code-quality',
    name: 'Code Quality',
    description: 'Write cleaner code with better testing, refactoring, and review practices.',
  },
  {
    slug: 'tools-tech',
    name: 'Tools & Tech',
    description: 'Reviews, comparisons, and deep dives into the tools and technologies developers use every day.',
  },
  {
    slug: 'productivity',
    name: 'Productivity',
    description: 'Work smarter with time management, focus techniques, and systems that help you get more done.',
  },
  {
    slug: 'collaboration',
    name: 'Collaboration',
    description: 'Better code reviews, pair programming, documentation, and team communication practices.',
  },
  {
    slug: 'architecture',
    name: 'Architecture',
    description: 'Software design patterns, system architecture, and making the right technical decisions.',
  },
  {
    slug: 'career',
    name: 'Career',
    description: 'Grow your developer career with advice on skills, interviews, leadership, and professional development.',
  },
  {
    slug: 'frontend',
    name: 'Frontend',
    description: 'Modern frontend development including frameworks, performance, accessibility, and best practices.',
  },
  {
    slug: 'backend',
    name: 'Backend',
    description: 'Server-side development, APIs, databases, and building robust backend systems.',
  },
  {
    slug: 'open-source',
    name: 'Open Source',
    description: 'Contributing to open source, maintaining projects, and building in the open.',
  },
];
