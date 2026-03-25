import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { getPost } from '@/lib/posts-db';
import { LikeButton } from '@/components/blog/LikeButton';
import { Comments } from '@/components/blog/Comments';
import { createClient } from '@/lib/supabase/server';
import { deletePost } from '@/app/actions/posts';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return { title: `${post.title} · Ale's Blog`, description: post.excerpt };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [post, supabase] = await Promise.all([
    getPost(slug),
    createClient(),
  ]);

  if (!post) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = user?.email === process.env.ADMIN_EMAIL;

  return (
    <article className="max-w-2xl mx-auto">
      <div className="mb-10">
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500"
            >
              {tag}
            </span>
          ))}
        </div>
        {post.icon && (
          <div className="text-5xl mb-4">{post.icon}</div>
        )}
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 leading-tight mb-4">
          {post.title}
        </h1>
        <p className="text-lg text-gray-500 mb-6">{post.excerpt}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <time dateTime={post.date}>
              {post.date ? format(new Date(post.date), 'MMMM d, yyyy') : ''}
            </time>
            <span>·</span>
            <span>{post.readingTime} min read</span>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-3">
              <Link
                href={`/admin/edit/${slug}`}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-600 transition-colors"
                title="Edit post"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                  <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                </svg>
                Edit
              </Link>
              <form action={async () => {
                'use server';
                if (post.id) await deletePost(post.id, slug);
              }}>
                <button
                  type="submit"
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete post"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                  </svg>
                  Delete
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      <hr className="border-gray-100 mb-10" />

      <div
        className="prose prose-gray prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:rounded prose-code:px-1 prose-pre:bg-gray-900 prose-img:rounded-xl"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      <hr className="border-gray-100 mt-12 mb-8" />

      <div className="flex items-center gap-4">
        <LikeButton postSlug={slug} />
      </div>

      <Comments postSlug={slug} />
    </article>
  );
}
