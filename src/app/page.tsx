import Link from 'next/link';
import { getAllPosts, getAllDrafts } from '@/lib/posts-db';
import { PostCard } from '@/components/blog/PostCard';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = user?.email === process.env.ADMIN_EMAIL;

  const [posts, drafts] = await Promise.all([
    getAllPosts(),
    isAdmin ? getAllDrafts(supabase as any) : Promise.resolve([]),
  ]);

  return (
    <div>
      {/* Hero */}
      <div className="mb-14">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-4">
          Hey, I&apos;m Ale 👋
        </h1>
        <p className="text-xl text-gray-500 leading-relaxed max-w-2xl">
          I write about code, design, and things I find interesting. Welcome to my corner of the internet.
        </p>
      </div>

      {/* Drafts — admin only */}
      {isAdmin && drafts.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-semibold text-amber-600 uppercase tracking-widest mb-4">
            Drafts ({drafts.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drafts.map((post) => (
              <PostCard key={post.slug} post={post} isAdmin={isAdmin} isDraft />
            ))}
          </div>
        </div>
      )}

      {/* Published posts */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
          {posts.length} {posts.length === 1 ? 'Post' : 'Posts'}
        </h2>
        {isAdmin && (
          <Link
            href="/admin/new"
            className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
          >
            + Write a post
          </Link>
        )}
      </div>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 p-16 text-center">
          <p className="text-gray-400">No posts yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} isAdmin={isAdmin} />
          ))}
        </div>
      )}
    </div>
  );
}
