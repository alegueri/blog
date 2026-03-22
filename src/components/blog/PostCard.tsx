import Link from 'next/link';
import { format } from 'date-fns';
import type { PostMeta } from '@/types';

export function PostCard({ post }: { post: PostMeta }) {
  return (
    <Link href={`/posts/${post.slug}`} className="group block">
      <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
        <div className="flex flex-wrap gap-2 mb-3">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-600"
            >
              {tag}
            </span>
          ))}
        </div>
        <h2 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors leading-snug mb-2">
          {post.title}
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">{post.excerpt}</p>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <time dateTime={post.date}>
            {post.date ? format(new Date(post.date), 'MMM d, yyyy') : ''}
          </time>
          <span>·</span>
          <span>{post.readingTime} min read</span>
        </div>
      </article>
    </Link>
  );
}
