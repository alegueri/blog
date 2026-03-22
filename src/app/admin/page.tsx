import Link from 'next/link';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import { createClient } from '@/lib/supabase/server';
import { deletePost } from '@/app/actions/posts';

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect('/');
  }

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
          <p className="text-sm text-gray-500 mt-0.5">{posts?.length ?? 0} posts total</p>
        </div>
        <Link
          href="/admin/new"
          className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
        >
          + New Post
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {(posts ?? []).map((post) => (
          <div
            key={post.id}
            className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3.5 gap-4"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    post.published
                      ? 'bg-green-50 text-green-600'
                      : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  {post.published ? 'Published' : 'Draft'}
                </span>
                <span className="text-xs text-gray-400">
                  {format(new Date(post.updated_at), 'MMM d, yyyy')}
                </span>
              </div>
              <p className="font-medium text-gray-900 truncate">{post.title || '(Untitled)'}</p>
              <p className="text-xs text-gray-400 font-mono">/posts/{post.slug}</p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {post.published && (
                <Link
                  href={`/posts/${post.slug}`}
                  target="_blank"
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  View
                </Link>
              )}
              <Link
                href={`/admin/edit/${post.slug}`}
                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium transition-colors"
              >
                Edit
              </Link>
              <form
                action={async () => {
                  'use server';
                  await deletePost(post.id, post.slug);
                }}
              >
                <button
                  type="submit"
                  className="text-sm text-red-400 hover:text-red-500 transition-colors"
                >
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}

        {(posts?.length ?? 0) === 0 && (
          <div className="rounded-xl border border-dashed border-gray-200 p-12 text-center">
            <p className="text-gray-400 text-sm">No posts yet. Create your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
