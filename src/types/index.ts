export interface Post {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  readingTime: number;
  content: string;
  icon?: string;
}

export interface PostMeta {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  readingTime: number;
  icon?: string;
  hasDraft?: boolean; // published post with a pending draft
}

export interface Comment {
  id: string;
  post_slug: string;
  user_id: string;
  user_email: string;
  user_name: string;
  user_avatar: string | null;
  body: string;
  created_at: string;
}

export interface Like {
  id: string;
  post_slug: string;
  user_id: string;
}
