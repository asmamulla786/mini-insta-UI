import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { EmptyState } from '../components/ui/EmptyState';
import type { Post } from '../types/api';
import { PostApi } from '../services/api';
import { PostCard } from '../components/posts/PostCard';
import { Avatar } from '../components/ui/Avatar';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPosts = useCallback(async () => {
    if (!user?.username) return;
    setLoading(true);
    try {
      const data = await PostApi.listByUser(user.username);
      setPosts(data);
      setError('');
    } catch (err) {
      setError('Unable to load your posts.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [user?.username]);

  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="space-y-8">
      <div className="glass-panel p-6">
        <div className="flex items-center gap-6">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-slate-800 text-4xl">
            {user?.profilePicUrl ? (
              <img
                src={user.profilePicUrl}
                alt={user.fullName}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '';
                }}
              />
            ) : (
              <span>👤</span>
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Your profile
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-white">
              {user?.fullName}
            </h1>
            <p className="text-slate-400">
              <Link
                to={`/users/${user?.username ?? ''}`}
                className="underline-offset-2 hover:underline"
              >
                {user?.username}
              </Link>
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {user?.privateAccount ? 'Private account' : 'Public account'}
            </p>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-pink-400">{error}</p>}

      {loading ? (
        <EmptyState
          title="Loading posts..."
          description="Fetching your posts."
        />
      ) : posts.length ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onRefresh={fetchPosts}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No posts to show"
          description="You haven't shared any posts yet."
        />
      )}
    </div>
  );
};

