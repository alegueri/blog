import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { PostEditor } from '@/components/blog/PostEditor';

export default async function NewPostPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect('/');
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← Admin
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-900">New Post</span>
      </div>
      <PostEditor />
    </div>
  );
}
