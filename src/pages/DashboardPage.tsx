import { useCallback, useEffect, useState } from 'react';
import type { Post } from '../types/api';
import { PostApi } from '../services/api';
import { PostComposer } from '../components/posts/PostComposer';
import { PostCard } from '../components/posts/PostCard';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';

export const DashboardPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await PostApi.listMine();
      setPosts(data);
      setError('');
    } catch (err) {
      setError('Unable to load posts. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const handlePostCreated = (post: Post) => {
    setPosts((prev) => [post, ...prev]);
  };

  const handleDeleteAll = async () => {
    if (!posts.length) return;
    setIsDeleting(true);
    try {
      await PostApi.deleteAllMine();
      setPosts([]);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            My posts
          </p>
          <h1 className="text-3xl font-semibold text-white">
            Share moments with followers
          </h1>
          <p className="text-sm text-slate-400">
            Create posts, view your feed, and keep up with friends.
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={handleDeleteAll}
          disabled={!posts.length}
          isLoading={isDeleting}
        >
          Delete all my posts
        </Button>
      </div>

      <PostComposer onCreated={handlePostCreated} />

      {error && <p className="text-sm text-pink-400">{error}</p>}

      {loading ? (
        <EmptyState
          title="Loading feed..."
          description="Fetching your latest posts."
        />
      ) : posts.length ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onRefresh={loadPosts} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No posts yet"
          description="Share your first update to start building your feed."
        />
      )}
    </div>
  );
};

