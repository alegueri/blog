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

    // Check if post is currently published
    const { data: current } = await supabase
      .from('posts').select('published').eq('id', id).single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let updatePayload: any;

    if (current?.published && !data.published) {
      // Saving as draft of an already-published post — store in draft column only
      updatePayload = {
        draft: {
          title: data.title,
          excerpt: data.excerpt,
          content: data.content,
          tags: data.tags,
          icon: data.icon,
          slug: data.slug,
        },
      };
    } else if (data.published) {
      // Publishing — write to main columns and clear any pending draft
      updatePayload = { ...data, draft: null };
    } else {
      // Draft of an unpublished post — update normally
      updatePayload = data;
    }

    const { error } = await supabase.from('posts').update(updatePayload).eq('id', id);
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
