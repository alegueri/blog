import Link from 'next/link';
import { format } from 'date-fns';
import type { PostMeta } from '@/types';

interface PostCardProps {
  post: PostMeta & { id?: string };
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/posts/${post.slug}`} className="group block mb-4">
      <article className="relative bg-white border border-gray-200 rounded-2xl p-6 transition-all duration-200 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5">
        <div className="flex gap-5 items-start">
          {post.icon ? (
            <span className="text-4xl shrink-0 select-none leading-none mt-1">{post.icon}</span>
          ) : (
            <div className="w-10 h-10 shrink-0 rounded-xl bg-gray-100 mt-1" />
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors leading-snug mb-1.5">
              {post.title}
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">
              {post.excerpt}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 shrink-0 ml-4">
                <time dateTime={post.date}>
                  {post.date ? format(new Date(post.date), 'MMM d, yyyy') : ''}
                </time>
                <span>·</span>
                <span>{post.readingTime} min read</span>
                <span className="text-gray-300 group-hover:text-indigo-400 transition-colors ml-1">→</span>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
