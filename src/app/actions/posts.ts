'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    throw new Error('Unauthorized');
  }
  return { supabase, user };
}

interface PostData {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  published: boolean;
  icon: string;
}

export async function createPost(data: PostData): Promise<{ error?: string }> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from('posts').insert(data);
    if (error) return { error: error.message };
    revalidatePath('/');
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function updatePost(id: string, data: PostData): Promise<{ error?: string }> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from('posts').update(data).eq('id', id);
    if (error) return { error: error.message };
    revalidatePath('/');
    revalidatePath(`/posts/${data.slug}`);
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function deletePost(id: string, slug: string): Promise<void> {
  const { supabase } = await requireAdmin();
  await supabase.from('posts').delete().eq('id', id);
  revalidatePath('/');
  revalidatePath(`/posts/${slug}`);
}
