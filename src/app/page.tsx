import { getAllPosts } from '@/lib/posts-db';
import { PostCard } from '@/components/blog/PostCard';

export const revalidate = 60; // refresh every 60s

export default async function Home() {
  const posts = await getAllPosts();

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-3">
          Hey, I&apos;m Ale 👋
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed max-w-xl">
          I write about code, design, and things I find interesting. Welcome to my corner of the internet.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">No posts yet — head to <code className="bg-gray-100 px-1 rounded">/admin</code> to write one.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
