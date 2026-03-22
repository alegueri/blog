export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  readingTime: number; // minutes
  content: string;
}

export interface PostMeta {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  readingTime: number;
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
