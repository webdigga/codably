export interface ArticleInfo {
  slug: string;
  title: string;
  description: string;
  category: string;
  categoryName: string;
  author: string;
  authorName: string;
  authorAvatar: string;
  publishDate: string;
  wordCount: number;
}

export function buildCard(info: ArticleInfo, likes = 0, comments = 0): HTMLElement {
  const readingTime = Math.max(1, Math.ceil(info.wordCount / 230));
  const dateFormatted = new Date(info.publishDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const article = document.createElement('article');
  article.className = 'card article-card';
  article.setAttribute('data-slug', info.slug);

  const avatarHtml = info.authorAvatar
    ? `<img src="${info.authorAvatar}" alt="${info.authorName}" class="article-card-avatar" width="20" height="20" loading="lazy" />`
    : '';

  const readTimeHtml = info.wordCount > 0
    ? `<span class="meta-separator">&middot;</span><span>${readingTime} min read</span>`
    : '';

  const likeSvg = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3l1-2 1 2 1.5 3H14l-3 3 1 4-4-2-4 2 1-4-3-3h3.5z"></path></svg>`;
  const commentSvg = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 3h12v8H5l-3 3V3z"></path></svg>`;

  const likesHtml = likes > 0
    ? `<span class="card-likes">${likeSvg}<span class="card-likes-count">${likes}</span></span>`
    : '';
  const commentsHtml = comments > 0
    ? `<span class="card-comments">${commentSvg}<span class="card-comments-count">${comments}</span></span>`
    : '';
  const engagementHtml = (likes > 0 || comments > 0)
    ? `<span class="card-engagement">${likesHtml}${commentsHtml}</span>`
    : '';

  article.innerHTML =
    `<a href="/${info.category}/${info.slug}" class="article-card-link">` +
      `<div class="article-card-topline">` +
        `<span class="article-card-category">${info.categoryName}</span>` +
        engagementHtml +
      `</div>` +
      `<h3 class="article-card-title">${info.title}</h3>` +
      `<p class="article-card-excerpt">${info.description}</p>` +
      `<div class="article-card-meta">` +
        avatarHtml +
        `<span>${info.authorName}</span>` +
        `<span class="meta-separator">&middot;</span>` +
        `<time datetime="${info.publishDate}">${dateFormatted}</time>` +
        readTimeHtml +
      `</div>` +
    `</a>`;

  return article;
}
