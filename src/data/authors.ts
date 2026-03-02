export interface Author {
  name: string;
  role: string;
  bio: string;
  avatar: string;
  linkedin: string;
}

export const authors: Record<string, Author> = {
  'david-white': {
    name: 'David White',
    role: 'Editor, CRM Beat',
    bio: 'David has spent over a decade helping small UK businesses get more from their technology. As the founder of Kabooly CRM, he writes about practical CRM strategy grounded in real experience.',
    avatar: '/images/authors/david-white.avif',
    linkedin: 'https://www.linkedin.com/in/david-white-96a0878a/',
  },
};
