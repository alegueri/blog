'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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
}

export async function createPost(data: PostData) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('posts').insert(data);
  if (error) throw new Error(error.message);
  revalidatePath('/');
  revalidatePath('/admin');
  redirect('/admin');
}

export async function updatePost(id: string, data: PostData) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('posts').update(data).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/');
  revalidatePath(`/posts/${data.slug}`);
  revalidatePath('/admin');
  redirect('/admin');
}

export async function deletePost(id: string, slug: string) {
  const { supabase } = await requireAdmin();
  await supabase.from('posts').delete().eq('id', id);
  revalidatePath('/');
  revalidatePath(`/posts/${slug}`);
  revalidatePath('/admin');
}
