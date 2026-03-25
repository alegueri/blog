import Link from 'next/link';
import { format } from 'date-fns';
import type { PostMeta } from '@/types';

interface PostCardProps {
  post: PostMeta & { id?: string };
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/posts/${post.slug}`} className="group block">
      <article className="relative bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-indigo-200">
        {/* Accent top strip — visible on hover */}
        <div className="h-0.5 bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="p-6">
          <div className="flex gap-5 items-start">
            {/* Icon or fallback */}
            {post.icon ? (
              <span className="text-4xl shrink-0 select-none leading-none mt-0.5">{post.icon}</span>
            ) : (
              <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-100 border border-indigo-100 mt-0.5 flex items-center justify-center text-indigo-300 text-lg font-bold">
                ✦
              </div>
            )}

            <div className="flex-1 min-w-0">
              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <h2 className="text-xl font-bold text-gray-900 group-hover:text-indigo-700 transition-colors leading-snug mb-2">
                {post.title}
              </h2>

              {/* Excerpt */}
              <p className="text-stone-500 text-sm leading-relaxed line-clamp-2 mb-4">
                {post.excerpt}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-stone-400">
                  <time dateTime={post.date}>
                    {post.date ? format(new Date(post.date), 'MMM d, yyyy') : ''}
                  </time>
                  <span>·</span>
                  <span>{post.readingTime} min read</span>
                </div>
                <span className="text-xs font-medium text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  Read <span>→</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
