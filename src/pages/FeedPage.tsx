import { useCallback, useEffect, useState } from 'react';
import { FeedApi } from '../services/api';
import type { FeedItem, Post } from '../types/api';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { FeedCard } from '../components/posts/FeedCard';
import { Modal } from '../components/ui/Modal';
import { PostComposer } from '../components/posts/PostComposer';

export const FeedPage = () => {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [composerOpen, setComposerOpen] = useState(false);

  const loadFeed = useCallback(async () => {
    try {
      setLoading(true);
      const data = await FeedApi.list();
      setItems(data);
      setError('');
    } catch {
      setError('Unable to load your feed. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFeed();
  }, [loadFeed]);

  const handlePostCreated = async (_post: Post) => {
    // PostComposer already created the post via API; just close and refresh feed.
    setComposerOpen(false);
    await loadFeed();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Home
          </p>
          <h1 className="text-3xl font-semibold text-white">
            Feed from people you follow
          </h1>
          <p className="text-sm text-slate-400">
            See the latest posts from accounts you&apos;re following.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setComposerOpen(true)}
        >
          Add post
        </Button>
      </div>

      {error && <p className="text-sm text-pink-400">{error}</p>}

      {loading ? (
        <EmptyState
          title="Loading feed..."
          description="Fetching posts from people you follow."
        />
      ) : items.length ? (
        <div className="space-y-6">
          {items.map((item) => (
            <FeedCard key={item.postId} item={item} onUpdated={loadFeed} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Your feed is empty"
          description="Follow some people or create a post to get started."
        />
      )}

      <Modal
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        title="Create new post"
      >
        <PostComposer
          onCreated={(post) => {
            void handlePostCreated(post);
          }}
        />
      </Modal>
    </div>
  );
};


