import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { PostEditor } from '@/components/blog/PostEditor';

export default async function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect('/');
  }

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!post) notFound();

  // If there's a pending draft, load that into the editor instead of published content
  const draft = post.draft as Record<string, unknown> | null;
  const editContent = {
    title: (draft?.title ?? post.title) as string,
    excerpt: (draft?.excerpt ?? post.excerpt) as string,
    content: (draft?.content ?? post.content) as string,
    tags: (draft?.tags ?? post.tags) as string[],
    icon: (draft?.icon ?? post.icon ?? '') as string,
    slug: (draft?.slug ?? post.slug) as string,
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← Home
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-900 truncate">{editContent.title || 'Edit Post'}</span>
      </div>
      <PostEditor
        initial={{
          id: post.id,
          slug: editContent.slug,
          title: editContent.title,
          excerpt: editContent.excerpt,
          content: editContent.content,
          tags: editContent.tags,
          icon: editContent.icon,
          published: post.published,
          isPublished: post.published,
          hasPendingDraft: post.published && draft != null,
        }}
      />
    </div>
  );
}
