import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserApi, PostApi, FollowApi } from '../services/api';
import type { Post, User } from '../types/api';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { PostCard } from '../components/posts/PostCard';

type Relationship = {
  iFollow: boolean;
  followsMe: boolean;
};

export const UserDetailPage = () => {
  const { username: usernameParam } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();

  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [relationship, setRelationship] = useState<Relationship>({
    iFollow: false,
    followsMe: false
  });

  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingFollows, setLoadingFollows] = useState(false);
  const [error, setError] = useState('');
  const [followBusy, setFollowBusy] = useState(false);
  const [activeFollowTab, setActiveFollowTab] =
    useState<'followers' | 'following' | null>(null);
  const [avatarError, setAvatarError] = useState(false);

  const username = usernameParam ?? '';

  const isMe = useMemo(
    () => !!currentUser && currentUser.username === username,
    [currentUser, username]
  );

  const loadTargetUser = useCallback(async () => {
    setLoadingUser(true);
    try {
      const users = await UserApi.getAll();
      const target = users.find((u) => u.username === username) ?? null;
      if (!target) {
        setError('User not found');
      }
      setTargetUser(target);
    } catch {
      setError('Unable to load user profile.');
    } finally {
      setLoadingUser(false);
    }
  }, [username]);

  const loadFollows = useCallback(async () => {
    if (!targetUser) return;
    setLoadingFollows(true);
    try {
      const [f, g] = await Promise.all([
        FollowApi.followersOf(targetUser.username),
        FollowApi.followingOf(targetUser.username)
      ]);
      setFollowers(f);
      setFollowing(g);
      if (currentUser) {
        setRelationship({
          iFollow: f.some((u) => u.id === currentUser.id),
          followsMe: g.some((u) => u.id === currentUser.id)
        });
      }
    } catch {
      // For private users that we're not allowed to inspect, keep lists empty.
      setFollowers([]);
      setFollowing([]);
    } finally {
      setLoadingFollows(false);
    }
  }, [currentUser, targetUser]);

  const loadPosts = useCallback(async () => {
    if (!targetUser) return;
    setLoadingPosts(true);
    try {
      const data = await PostApi.listByUser(targetUser.username);
      setPosts(data);
    } catch {
      setError('Unable to load posts for this user.');
    } finally {
      setLoadingPosts(false);
    }
  }, [targetUser]);

  useEffect(() => {
    void loadTargetUser();
  }, [loadTargetUser]);

  useEffect(() => {
    if (!targetUser) return;
    void loadFollows();
    void loadPosts();
  }, [loadFollows, loadPosts, targetUser]);

  const handleFollowToggle = async () => {
    if (!targetUser || followBusy || isMe) return;
    setFollowBusy(true);
    try {
      if (relationship.iFollow) {
        await FollowApi.unfollow(targetUser.username);
      } else {
        await FollowApi.follow(targetUser.username);
      }
      await loadFollows();
    } finally {
      setFollowBusy(false);
    }
  };

  const shouldHidePosts = useMemo(() => {
    if (!targetUser || isMe) return false;
    if (!targetUser.privateAccount) return false;
    return !relationship.iFollow;
  }, [isMe, relationship.iFollow, targetUser]);

  if (loadingUser) {
    return (
      <EmptyState
        title="Loading profile..."
        description="Fetching user information."
      />
    );
  }

  if (!targetUser || error) {
    return (
      <EmptyState
        title="Profile unavailable"
        description={error || 'We could not load this profile.'}
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="glass-panel p-6">
        <div className="flex items-center gap-6">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-slate-800 text-4xl">
            {targetUser.profilePicUrl && !avatarError ? (
              <img
                src={targetUser.profilePicUrl}
                alt={targetUser.fullName}
                className="h-full w-full object-cover"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <span>👤</span>
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              {isMe ? 'Your profile' : 'User profile'}
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-white">
              {targetUser.fullName}
            </h1>
            <p className="text-slate-400">{targetUser.username}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-6 text-sm text-slate-300">
          <button
            type="button"
            className={`rounded-lg px-1 text-left transition ${
              activeFollowTab === 'followers'
                ? 'bg-slate-800 text-white'
                : 'text-slate-300 hover:text-white'
            }`}
            onClick={() =>
              setActiveFollowTab((prev) =>
                prev === 'followers' ? null : 'followers'
              )
            }
          >
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Followers
            </p>
            <p className="font-semibold">{followers.length}</p>
          </button>
          <button
            type="button"
            className={`rounded-lg px-1 text-left transition ${
              activeFollowTab === 'following'
                ? 'bg-slate-800 text-white'
                : 'text-slate-300 hover:text-white'
            }`}
            onClick={() =>
              setActiveFollowTab((prev) =>
                prev === 'following' ? null : 'following'
              )
            }
          >
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Following
            </p>
            <p className="font-semibold">{following.length}</p>
          </button>
        </div>
        {!isMe && (
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-300">
            <Button
              type="button"
              isLoading={followBusy}
              onClick={handleFollowToggle}
            >
              {relationship.iFollow ? 'Unfollow' : 'Follow'}
            </Button>
            {targetUser.privateAccount && !relationship.iFollow && (
              <span className="text-xs text-slate-400">
                This is a private account. Follow to see posts.
              </span>
            )}
            {relationship.followsMe && (
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200">
                Follows you
              </span>
            )}
          </div>
        )}
        {loadingFollows ? (
          <p className="mt-4 text-sm text-slate-400">Loading connections...</p>
        ) : activeFollowTab && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {activeFollowTab === 'followers' && (
              <div>
                <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">
                  Followers list
                </p>
                {followers.length ? (
                  <ul className="space-y-2 text-sm text-slate-200">
                    {followers.map((u) => (
                      <li
                        key={u.id}
                        className="flex items-center justify-between rounded-xl border border-slate-800 px-3 py-2"
                      >
                        <div>
                          <p className="font-semibold">{u.fullName}</p>
                          <p className="text-xs text-slate-400">@{u.username}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">No followers.</p>
                )}
              </div>
            )}
            {activeFollowTab === 'following' && (
              <div>
                <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">
                  Following list
                </p>
                {following.length ? (
                  <ul className="space-y-2 text-sm text-slate-200">
                    {following.map((u) => (
                      <li
                        key={u.id}
                        className="flex items-center justify-between rounded-xl border border-slate-800 px-3 py-2"
                      >
                        <div>
                          <p className="font-semibold">{u.fullName}</p>
                          <p className="text-xs text-slate-400">@{u.username}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">Not following anyone.</p>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {shouldHidePosts ? (
        <EmptyState
          title="Posts are hidden"
          description="You must follow this private account to view their posts."
        />
      ) : loadingPosts ? (
        <EmptyState
          title="Loading posts..."
          description="Fetching this user's posts."
        />
      ) : posts.length ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onRefresh={async () => {
                await loadPosts();
              }}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No posts yet"
          description="This user hasn't shared any posts."
        />
      )}
    </div>
  );
};


