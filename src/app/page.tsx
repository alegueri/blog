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
    <div className="flex gap-14 items-start">
      {/* Main content */}
      <div className="flex-1 min-w-0">

        {/* Hero */}
        <div className="mb-12">
          <div className="flex items-center gap-5 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-md" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
              AG
            </div>
            <div>
              <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-0.5">Personal Blog</p>
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                Hey, I&apos;m Ale 👋
              </h1>
            </div>
          </div>
          <p className="text-base text-stone-500 leading-relaxed max-w-lg border-l-2 border-indigo-200 pl-4 italic">
            I write about code, design, and things I find interesting.
            Welcome to my corner of the internet.
          </p>
        </div>

        {/* Feed header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full bg-indigo-500" />
            <h2 className="text-sm font-semibold text-gray-700">
              {posts.length} {posts.length === 1 ? 'post' : 'posts'}
            </h2>
          </div>
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
          <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-stone-400">No posts yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>

      {/* Drafts sidebar — admin only */}
      {isAdmin && (
        <aside className="w-48 shrink-0 hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-amber-200 bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-amber-100 bg-amber-50">
              <h2 className="text-xs font-semibold text-amber-600 uppercase tracking-widest" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                Drafts {drafts.length > 0 && `(${drafts.length})`}
              </h2>
            </div>
            {drafts.length === 0 ? (
              <p className="text-xs text-stone-400 px-4 py-3">No drafts.</p>
            ) : (
              <div className="flex flex-col divide-y divide-stone-50">
                {drafts.map((draft) => (
                  <Link
                    key={draft.slug}
                    href={`/admin/edit/${draft.slug}`}
                    className="group flex flex-col gap-0.5 px-4 py-3 hover:bg-amber-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-800 group-hover:text-amber-700 leading-snug line-clamp-2" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                      {draft.icon && <span className="mr-1">{draft.icon}</span>}
                      {draft.title || '(Untitled)'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-stone-400">
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
