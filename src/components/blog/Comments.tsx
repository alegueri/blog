'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import type { Comment } from '@/types';
import type { User } from '@supabase/supabase-js';

interface Props {
  postSlug: string;
}

export function Comments({ postSlug }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    loadComments();

    const listener = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.data.subscription.unsubscribe();
  }, [postSlug]);

  async function loadComments() {
    const supabase = createClient();
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('post_slug', postSlug)
      .order('created_at', { ascending: true });
    setComments(data ?? []);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !body.trim()) return;
    setSubmitting(true);
    setError('');
    const supabase = createClient();
    const { error: err } = await supabase.from('comments').insert({
      post_slug: postSlug,
      user_id: user.id,
      user_email: user.email!,
      user_name: user.user_metadata?.full_name ?? user.email,
      user_avatar: user.user_metadata?.avatar_url ?? null,
      body: body.trim(),
    });
    if (err) {
      setError('Failed to post comment. Try again.');
    } else {
      setBody('');
      await loadComments();
    }
    setSubmitting(false);
  }

  async function deleteComment(id: string) {
    const supabase = createClient();
    await supabase.from('comments').delete().eq('id', id);
    setComments((prev) => prev.filter((c) => c.id !== id));
  }

  const signIn = () => {
    const supabase = createClient();
    supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: window.location.origin },
    });
  };

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
      </h2>

      {/* Comment form */}
      {user ? (
        <form onSubmit={submit} className="mb-8">
          <div className="flex gap-3">
            {user.user_metadata?.avatar_url && (
              <img
                src={user.user_metadata.avatar_url}
                alt=""
                className="h-9 w-9 rounded-full flex-shrink-0 mt-1"
              />
            )}
            <div className="flex-1">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write a comment..."
                maxLength={1000}
                rows={3}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-none"
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-gray-400">{body.length}/1000</span>
                <button
                  type="submit"
                  disabled={submitting || !body.trim()}
                  className="rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors"
                >
                  {submitting ? 'Posting…' : 'Post'}
                </button>
              </div>
              {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 rounded-xl border border-dashed border-gray-200 p-5 text-center">
          <p className="text-sm text-gray-500 mb-3">Sign in to leave a comment</p>
          <button
            onClick={signIn}
            className="rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
          >
            Sign in with GitHub
          </button>
        </div>
      )}

      {/* Comment list */}
      <div className="flex flex-col gap-5">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            {comment.user_avatar ? (
              <img
                src={comment.user_avatar}
                alt=""
                className="h-9 w-9 rounded-full flex-shrink-0"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
                {comment.user_name[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-gray-900">{comment.user_name}</span>
                <span className="text-xs text-gray-400">
                  {format(new Date(comment.created_at), 'MMM d, yyyy')}
                </span>
                {user?.id === comment.user_id && (
                  <button
                    onClick={() => deleteComment(comment.id)}
                    className="ml-auto text-xs text-gray-400 hover:text-red-400 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{comment.body}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">
            No comments yet. Be the first!
          </p>
        )}
      </div>
    </section>
  );
}
