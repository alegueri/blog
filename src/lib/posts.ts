import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { Post, PostMeta } from '@/types';

const POSTS_DIR = path.join(process.cwd(), 'src/content/posts');

function wordsPerMinute(content: string): number {
  return Math.ceil(content.split(/\s+/).length / 200);
}

export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
    .map((f) => f.replace(/\.mdx?$/, ''));
}

export function getAllPosts(): PostMeta[] {
  return getAllPostSlugs()
    .map((slug) => getPostMeta(slug))
    .filter(Boolean)
    .sort((a, b) => (a!.date > b!.date ? -1 : 1)) as PostMeta[];
}

export function getPostMeta(slug: string): PostMeta | null {
  const mdxPath = path.join(POSTS_DIR, `${slug}.mdx`);
  const mdPath = path.join(POSTS_DIR, `${slug}.md`);
  const filePath = fs.existsSync(mdxPath) ? mdxPath : mdPath;
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  return {
    slug,
    title: data.title ?? slug,
    excerpt: data.excerpt ?? '',
    date: data.date ?? '',
    tags: data.tags ?? [],
    readingTime: wordsPerMinute(content),
  };
}

export function getPost(slug: string): Post | null {
  const mdxPath = path.join(POSTS_DIR, `${slug}.mdx`);
  const mdPath = path.join(POSTS_DIR, `${slug}.md`);
  const filePath = fs.existsSync(mdxPath) ? mdxPath : mdPath;
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  return {
    slug,
    title: data.title ?? slug,
    excerpt: data.excerpt ?? '',
    date: data.date ?? '',
    tags: data.tags ?? [],
    readingTime: wordsPerMinute(content),
    content,
  };
}
