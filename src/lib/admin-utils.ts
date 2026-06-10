import type { Post } from './types';

/** Detect AI-generated drafts (slug prefix ai- or daily-curated- legacy). */
export function isAiGeneratedPost(post: Pick<Post, 'slug' | 'title'>): boolean {
  if (post.slug.startsWith('ai-') || post.slug.startsWith('daily-curated-')) {
    return true;
  }
  return /^รายการคัดสรร|^daily curated/i.test(post.title);
}
