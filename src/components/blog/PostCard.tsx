import Link from 'next/link';
import { format } from 'date-fns';
import type { PostMeta } from '@/types';
import { deletePost } from '@/app/actions/posts';

interface PostCardProps {
  post: PostMeta & { id?: string };
  isAdmin?: boolean;
  isDraft?: boolean;
}

export function PostCard({ post, isAdmin, isDraft }: PostCardProps) {
  return (
    <article className={`group relative rounded-2xl border bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 flex flex-col ${isDraft ? 'border-amber-200 border-dashed' : 'border-gray-100'}`}>
      <Link href={isDraft ? `/admin/edit/${post.slug}` : `/posts/${post.slug}`} className="flex-1">
        <div className="flex flex-wrap gap-2 mb-3">
          {isDraft && (
            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-600">
              Draft
            </span>
          )}
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
          {post.icon && <span className="mr-2">{post.icon}</span>}{post.title}
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">{post.excerpt}</p>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <time dateTime={post.date}>
            {post.date ? format(new Date(post.date), 'MMM d, yyyy') : ''}
          </time>
          <span>·</span>
          <span>{post.readingTime} min read</span>
        </div>
      </Link>

      {isAdmin && (
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
          <Link
            href={`/admin/edit/${post.slug}`}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
          >
            Edit
          </Link>
          <form action={async () => {
            'use server';
            if (post.id) await deletePost(post.id, post.slug);
          }}>
            <button type="submit" className="text-xs font-medium text-red-400 hover:text-red-500 transition-colors">
              Delete
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
