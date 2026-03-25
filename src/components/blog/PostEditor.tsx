'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPost, updatePost } from '@/app/actions/posts';
import { EmojiPicker } from './EmojiPicker';
import { RichTextEditor } from './RichTextEditor';

interface InitialPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  published: boolean;
  icon: string;
  isPublished?: boolean;
  hasPendingDraft?: boolean;
}

interface PostEditorProps {
  initial?: InitialPost;
}

function slugify(str: string) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function PostEditor({ initial }: PostEditorProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [tags, setTags] = useState(initial?.tags.join(', ') ?? '');
  const [icon, setIcon] = useState(initial?.icon ?? '');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [slugManual, setSlugManual] = useState(!!initial);
  const router = useRouter();

  useEffect(() => {
    if (!slugManual) setSlug(slugify(title));
  }, [title, slugManual]);

  const save = (published: boolean) => {
    setError('');
    const data = {
      slug: slug.trim(),
      title: title.trim(),
      excerpt: excerpt.trim(),
      content,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      published,
      icon: icon.trim(),
    };
    if (!data.slug || !data.title) {
      setError('Title and slug are required.');
      return;
    }
    startTransition(async () => {
      const result = initial
        ? await updatePost(initial.id, data)
        : await createPost(data);
      if (result.error) {
        setError(result.error);
      } else {
        router.push('/');
        router.refresh();
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Meta */}
      <div className="grid gap-4">
        <div className="flex gap-3 items-center">
          <EmojiPicker value={icon} onChange={setIcon} />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title..."
            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-xl font-bold text-gray-900 placeholder-gray-300 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Slug (URL)</label>
            <input
              value={slug}
              onChange={(e) => { setSlugManual(true); setSlug(e.target.value); }}
              placeholder="my-post-slug"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Tags (comma-separated)</label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="code, design, life"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Excerpt</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="A short summary shown on the home page..."
            rows={2}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-none"
          />
        </div>
      </div>

      {/* Banner for published posts */}
      {initial?.isPublished && (
        <div className={`rounded-xl px-4 py-3 text-sm flex items-center gap-2 ${
          initial.hasPendingDraft
            ? 'bg-amber-50 border border-amber-200 text-amber-700'
            : 'bg-green-50 border border-green-200 text-green-700'
        }`}>
          <span>{initial.hasPendingDraft ? '📝' : '✅'}</span>
          <span>
            {initial.hasPendingDraft
              ? 'This post has a pending draft. The live version is unchanged until you publish.'
              : 'This post is published. Save as draft to stage changes without affecting the live version.'}
          </span>
        </div>
      )}

      {/* Rich text editor */}
      <RichTextEditor
        value={content}
        onChange={setContent}
        placeholder="Write your post…"
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pb-8">
        <button
          onClick={() => router.push('/')}
          disabled={isPending}
          className="rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => save(false)}
          disabled={isPending}
          className="rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
        >
          Save Draft
        </button>
        <button
          onClick={() => save(true)}
          disabled={isPending}
          className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors"
        >
          {isPending ? 'Saving…' : initial?.published ? 'Update' : 'Publish'}
        </button>
      </div>
    </div>
  );
}
