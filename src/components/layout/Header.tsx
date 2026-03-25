'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export function Header() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const signIn = () => {
    const supabase = createClient();
    supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: window.location.origin } });
  };
  const signOut = () => {
    const supabase = createClient();
    supabase.auth.signOut();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-[#f5f2ed]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-gray-900" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
          Ale's Blog
        </Link>
        <nav className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {user.user_metadata?.avatar_url && (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="avatar"
                  className="h-7 w-7 rounded-full ring-2 ring-indigo-200"
                />
              )}
              <span className="text-sm text-gray-600 hidden sm:block">
                {user.user_metadata?.full_name ?? user.email}
              </span>
<button
                onClick={signOut}
                className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={signIn}
              className="flex items-center gap-2 rounded-full bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
            >
              Sign in with GitHub
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
