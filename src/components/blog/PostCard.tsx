import Link from 'next/link';
import { format } from 'date-fns';
import type { PostMeta } from '@/types';

interface PostCardProps {
  post: PostMeta & { id?: string };
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/posts/${post.slug}`} className="group block">
      <article className="py-8 border-b border-gray-100 last:border-0">
        <div className="flex gap-5 items-start">
          {post.icon && (
            <span className="text-3xl mt-0.5 shrink-0 select-none">{post.icon}</span>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors leading-snug mb-1.5">
              {post.title}
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-3">
              {post.excerpt}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <time dateTime={post.date}>
                {post.date ? format(new Date(post.date), 'MMM d, yyyy') : ''}
              </time>
              <span>·</span>
              <span>{post.readingTime} min read</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
