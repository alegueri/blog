import { createPublicClient } from '@/lib/supabase/public';
import type { Post, PostMeta } from '@/types';

function readingTime(content: string) {
  return Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
}

export async function getAllPosts(): Promise<PostMeta[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from('posts')
    .select('slug, title, excerpt, tags, created_at, content')
    .eq('published', true)
    .order('created_at', { ascending: false });

  return (data ?? []).map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    date: p.created_at,
    tags: p.tags,
    readingTime: readingTime(p.content),
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
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt,
    date: data.created_at,
    tags: data.tags,
    readingTime: readingTime(data.content),
    content: data.content,
  };
}
