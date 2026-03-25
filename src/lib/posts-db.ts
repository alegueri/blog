import { createPublicClient } from '@/lib/supabase/public';
import type { Post, PostMeta } from '@/types';

function readingTime(content: string) {
  return Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
}

export async function getAllPosts(): Promise<PostMeta[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from('posts')
    .select('id, slug, title, excerpt, tags, created_at, content, icon')
    .eq('published', true)
    .order('created_at', { ascending: false });

  return (data ?? []).map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    date: p.created_at,
    tags: p.tags,
    readingTime: readingTime(p.content),
    icon: p.icon,
  }));
}

export async function getAllDrafts(supabaseClient: ReturnType<typeof createPublicClient>): Promise<PostMeta[]> {
  const { data } = await supabaseClient
    .from('posts')
    .select('id, slug, title, excerpt, tags, created_at, content, icon, published, draft')
    .or('published.eq.false,draft.not.is.null')
    .order('updated_at', { ascending: false });

  return (data ?? []).map((p) => ({
    id: p.id,
    slug: p.slug,
    // Show draft title if available, fallback to published title
    title: p.draft?.title ?? p.title,
    excerpt: p.draft?.excerpt ?? p.excerpt,
    date: p.created_at,
    tags: p.draft?.tags ?? p.tags,
    readingTime: readingTime(p.draft?.content ?? p.content),
    icon: p.draft?.icon ?? p.icon,
    hasDraft: p.published && p.draft != null,
  }));
}

export async function getPost(slug: string): Promise<Post | null> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (!data) return null;
  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt,
    date: data.created_at,
    tags: data.tags,
    readingTime: readingTime(data.content),
    content: data.content,
    icon: data.icon,
  };
}
