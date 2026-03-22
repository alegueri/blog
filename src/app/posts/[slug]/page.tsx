import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getPost } from '@/lib/posts-db';
import { LikeButton } from '@/components/blog/LikeButton';
import { Comments } from '@/components/blog/Comments';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return { title: `${post.title} · Ale's Blog`, description: post.excerpt };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <article>
      <div className="mb-10">
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-600"
            >
              {tag}
            </span>
          ))}
        </div>
        {post.icon && (
          <div className="text-5xl mb-4">{post.icon}</div>
        )}
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 leading-tight mb-4">
          {post.title}
        </h1>
        <p className="text-lg text-gray-500 mb-6">{post.excerpt}</p>
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <time dateTime={post.date}>
            {post.date ? format(new Date(post.date), 'MMMM d, yyyy') : ''}
          </time>
          <span>·</span>
          <span>{post.readingTime} min read</span>
        </div>
      </div>

      <hr className="border-gray-100 mb-10" />

      <div className="prose prose-gray prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:rounded prose-code:px-1 prose-pre:bg-gray-900">
        <MDXRemote source={post.content} />
      </div>

      <hr className="border-gray-100 mt-12 mb-8" />

      <div className="flex items-center gap-4">
        <LikeButton postSlug={slug} />
      </div>

      <Comments postSlug={slug} />
    </article>
  );
}
