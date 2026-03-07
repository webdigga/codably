export function slugifyTag(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function displayTag(tag: string): string {
  return tag.charAt(0).toUpperCase() + tag.slice(1);
}
