'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { marked } from 'marked';
import { createPost, updatePost } from '@/app/actions/posts';
import { createClient } from '@/lib/supabase/client';

interface InitialPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  published: boolean;
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
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [slugManual, setSlugManual] = useState(!!initial);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  // Auto-generate slug from title until user manually edits it
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

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const file = Array.from(e.clipboardData.items)
      .find((item) => item.type.startsWith('image/'))
      ?.getAsFile();
    if (!file) return;
    e.preventDefault();
    await uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}.${ext}`;
    const { data, error: err } = await supabase.storage
      .from('post-images')
      .upload(path, file, { upsert: false });
    if (err || !data) {
      setError('Image upload failed: ' + (err?.message ?? 'unknown error'));
      setUploading(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(data.path);
    const markdown = `![image](${publicUrl})`;
    const ta = textareaRef.current;
    if (ta) {
      const start = ta.selectionStart;
      setContent((c) => c.slice(0, start) + markdown + c.slice(start));
    } else {
      setContent((c) => c + '\n' + markdown);
    }
    setUploading(false);
  };

  const previewHtml = marked.parse(content) as string;

  return (
    <div className="flex flex-col gap-6">
      {/* Meta */}
      <div className="grid gap-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title..."
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-xl font-bold text-gray-900 placeholder-gray-300 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />

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

      {/* Write / Preview tabs */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50">
          <div className="flex">
            <button
              onClick={() => setTab('write')}
              className={`px-5 py-2.5 text-sm font-medium transition-colors ${
                tab === 'write' ? 'bg-white text-gray-900 border-b-2 border-indigo-500 -mb-px' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Write
            </button>
            <button
              onClick={() => setTab('preview')}
              className={`px-5 py-2.5 text-sm font-medium transition-colors ${
                tab === 'preview' ? 'bg-white text-gray-900 border-b-2 border-indigo-500 -mb-px' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Preview
            </button>
          </div>
          <div className="pr-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = ''; }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-40 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
            >
              {uploading ? 'Uploading…' : '📎 Image'}
            </button>
          </div>
        </div>

        {tab === 'write' ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onPaste={handlePaste}
            placeholder="Write your post in Markdown..."
            rows={24}
            className="w-full px-5 py-4 font-mono text-sm text-gray-900 placeholder-gray-400 focus:outline-none resize-y bg-white"
          />
        ) : (
          <div
            className="min-h-[500px] px-6 py-5 prose prose-gray max-w-none"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pb-8">
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
