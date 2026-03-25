import Link from 'next/link';
import { format } from 'date-fns';
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
    <div className="flex gap-16 items-start">
      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Hero */}
        <div className="mb-10 pb-10 border-b border-gray-200">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-4 leading-tight">
            Hey, I&apos;m Ale 👋
          </h1>
          <p className="text-base text-gray-500 leading-relaxed max-w-lg">
            I write about code, design, and things I find interesting. Welcome to my corner of the internet.
          </p>
        </div>

        <div className="flex items-center justify-between mb-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            {posts.length} {posts.length === 1 ? 'Post' : 'Posts'}
          </p>
          {isAdmin && (
            <Link
              href="/admin/new"
              className="rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm"
            >
              + Write
            </Link>
          )}
        </div>

        {posts.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-400">No posts yet.</p>
          </div>
        ) : (
          <div>
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>

      {/* Drafts sidebar — admin only */}
      {isAdmin && (
        <aside className="w-48 shrink-0 hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-amber-100 bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-amber-100 bg-amber-50">
              <h2 className="text-xs font-semibold text-amber-600 uppercase tracking-widest">
                Drafts {drafts.length > 0 && `(${drafts.length})`}
              </h2>
            </div>
            {drafts.length === 0 ? (
              <p className="text-xs text-gray-400 px-4 py-3">No drafts.</p>
            ) : (
              <div className="flex flex-col divide-y divide-gray-50">
                {drafts.map((draft) => (
                  <Link
                    key={draft.slug}
                    href={`/admin/edit/${draft.slug}`}
                    className="group flex flex-col gap-0.5 px-4 py-3 hover:bg-amber-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-800 group-hover:text-amber-700 leading-snug line-clamp-2">
                      {draft.icon && <span className="mr-1">{draft.icon}</span>}
                      {draft.title || '(Untitled)'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-400">
                        {draft.date ? format(new Date(draft.date), 'MMM d') : '—'}
                      </span>
                      {draft.hasDraft && (
                        <span className="text-xs bg-green-100 text-green-600 rounded-full px-1.5 py-0.5 font-medium">live</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}
