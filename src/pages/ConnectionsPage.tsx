import { FormEvent, useCallback, useEffect, useState } from 'react';
import { FollowApi } from '../services/api';
import type { FollowRequest, User } from '../types/api';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { useAuth } from '../hooks/useAuth';

export const ConnectionsPage = () => {
  const { user } = useAuth();
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [requests, setRequests] = useState<FollowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usernameToFollow, setUsernameToFollow] = useState('');
  const [submittingFollow, setSubmittingFollow] = useState(false);

  const loadConnections = useCallback(async () => {
    try {
      setLoading(true);
      const [followersData, followingData, requestsData] = await Promise.all([
        FollowApi.followers(),
        FollowApi.following(),
        FollowApi.requests()
      ]);
      setFollowers(followersData);
      setFollowing(followingData);
      setRequests(requestsData);
      setError('');
    } catch (err) {
      setError('Unable to load connections. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadConnections();
  }, [loadConnections]);

  const handleFollow = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!usernameToFollow.trim()) return;
    try {
      setSubmittingFollow(true);
      await FollowApi.follow(usernameToFollow.trim());
      setUsernameToFollow('');
      await loadConnections();
    } catch (err) {
      setError('Unable to send follow request.');
    } finally {
      setSubmittingFollow(false);
    }
  };

  const handleUnfollow = async (username: string) => {
    try {
      await FollowApi.unfollow(username);
      await loadConnections();
    } catch {
      setError('Unable to unfollow this user right now.');
    }
  };

  const handleFollowRequest = async (
    username: string,
    action: 'accept' | 'reject'
  ) => {
    try {
      if (action === 'accept') {
        await FollowApi.accept(username);
      } else {
        await FollowApi.reject(username);
      }
      await loadConnections();
    } catch {
      setError('Unable to update follow request.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="glass-panel p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          Connections
        </p>
        <h1 className="text-3xl font-semibold text-white">
          Manage followers and requests
        </h1>
        <p className="text-sm text-slate-400">
          Send follow requests, review pending invites, and prune your network.
        </p>
        <form
          className="mt-6 flex flex-col gap-3 md:flex-row"
          onSubmit={handleFollow}
        >
          <Input
            name="follow"
            placeholder="Username"
            value={usernameToFollow}
            onChange={(e) => setUsernameToFollow(e.target.value)}
          />
          <Button
            type="submit"
            variant="secondary"
            className="w-full md:w-auto"
            isLoading={submittingFollow}
          >
            Follow user
          </Button>
        </form>
        {error && <p className="mt-4 text-sm text-pink-400">{error}</p>}
      </div>

      {loading ? (
        <EmptyState
          title="Loading connections..."
          description="Fetching followers, following, and requests."
        />
      ) : (
        <div
          className={`grid gap-6 ${
            user?.privateAccount ? 'md:grid-cols-3' : 'md:grid-cols-2'
          }`}
        >
          <section className="glass-panel p-6">
            <h2 className="text-lg font-semibold text-white">Followers</h2>
            {followers.length ? (
              <ul className="mt-4 space-y-3 text-sm text-slate-200">
                {followers.map((person) => (
                  <li
                    key={person.id}
                    className="flex items-center justify-between rounded-xl border border-slate-800 px-3 py-2"
                  >
                    <div>
                      <p className="font-semibold">{person.fullName}</p>
                      <p className="text-xs text-slate-400">@{person.username}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-slate-500">No followers yet.</p>
            )}
          </section>

          <section className="glass-panel p-6">
            <h2 className="text-lg font-semibold text-white">Following</h2>
            {following.length ? (
              <ul className="mt-4 space-y-3 text-sm text-slate-200">
                {following.map((person) => (
                  <li
                    key={person.id}
                    className="flex items-center justify-between rounded-xl border border-slate-800 px-3 py-2"
                  >
                    <div>
                      <p className="font-semibold">{person.fullName}</p>
                      <p className="text-xs text-slate-400">@{person.username}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleUnfollow(person.username)}
                    >
                      Unfollow
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-slate-500">Not following anyone.</p>
            )}
          </section>

          {user?.privateAccount && (
            <section className="glass-panel p-6">
              <h2 className="text-lg font-semibold text-white">
                Follow requests
              </h2>
              {requests.length ? (
                <ul className="mt-4 space-y-3 text-sm text-slate-200">
                  {requests.map((request) => (
                    <li
                      key={`${request.username}-${request.requestedAt}`}
                      className="space-y-2 rounded-xl border border-slate-800 px-3 py-2"
                    >
                      <p className="font-semibold">@{request.username}</p>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          className="flex-1"
                          onClick={() =>
                            handleFollowRequest(request.username, 'accept')
                          }
                        >
                          Accept
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="flex-1"
                          onClick={() =>
                            handleFollowRequest(request.username, 'reject')
                          }
                        >
                          Reject
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  No pending requests right now.
                </p>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
};

