'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  postSlug: string;
}

export function LikeButton({ postSlug }: Props) {
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const { data: likesData } = await supabase
        .from('likes')
        .select('id, user_id')
        .eq('post_slug', postSlug);

      setCount(likesData?.length ?? 0);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        setLiked(!!likesData?.find((l) => l.user_id === user.id));
      }
    }
    load();
  }, [postSlug]);

  const toggle = async () => {
    const supabase = createClient();
    if (!userId) {
      await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo: window.location.origin },
      });
      return;
    }
    setLoading(true);
    if (liked) {
      await supabase.from('likes').delete().eq('post_slug', postSlug).eq('user_id', userId);
      setCount((c) => c - 1);
      setLiked(false);
    } else {
      await supabase.from('likes').insert({ post_slug: postSlug, user_id: userId });
      setCount((c) => c + 1);
      setLiked(true);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
        liked
          ? 'bg-rose-50 text-rose-500 ring-1 ring-rose-200'
          : 'bg-gray-50 text-gray-500 ring-1 ring-gray-200 hover:bg-rose-50 hover:text-rose-500'
      }`}
    >
      <span className="text-base">{liked ? '❤️' : '🤍'}</span>
      <span>{count} {count === 1 ? 'like' : 'likes'}</span>
    </button>
  );
}
