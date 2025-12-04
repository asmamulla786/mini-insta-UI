import { FormEvent, useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Comment, Post } from '../../types/api';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { PostApi, CommentApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { formatDateTime } from '../../utils/format';

type PostCardProps = {
  post: Post;
  onRefresh: () => Promise<void> | void;
};

export const PostCard = ({ post, onRefresh }: PostCardProps) => {
  const { user } = useAuth();
  const [isProcessingLike, setIsProcessingLike] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentError, setCommentError] = useState('');

  const hasLiked = useMemo(() => {
    if (!user) return false;
    return post.likedUsers.includes(user.username);
  }, [post.likedUsers, user]);

  const canDelete = useMemo(
    () => !!user && user.id === post.user.id,
    [user, post.user.id]
  );

  const fetchComments = useCallback(async () => {
    setLoadingComments(true);
    try {
      const data = await CommentApi.listByPost(post.id);
      setComments(data);
    } finally {
      setLoadingComments(false);
    }
  }, [post.id]);

  const toggleComments = async () => {
    const nextState = !commentsOpen;
    setCommentsOpen(nextState);
    if (nextState) {
      await fetchComments();
    }
  };

  const handleLikeToggle = async () => {
    if (isProcessingLike) return;
    setIsProcessingLike(true);
    try {
      if (hasLiked) {
        await PostApi.unlike(post.id);
      } else {
        await PostApi.like(post.id);
      }
      await onRefresh();
    } finally {
      setIsProcessingLike(false);
    }
  };

  const handleDelete = async () => {
    if (!canDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      await PostApi.delete(post.id);
      await onRefresh();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCommentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCommentError('');
    if (!commentInput.trim()) {
      setCommentError('Comment cannot be empty');
      return;
    }
    try {
      await CommentApi.create(post.id, { content: commentInput });
      setCommentInput('');
      await fetchComments();
    } catch (error) {
      setCommentError('Unable to add comment. Please try again.');
    }
  };

  return (
    <article className="glass-panel overflow-hidden shadow-xl">
      <div className="flex items-center justify-between px-6 py-4">
        <Link
          to={`/users/${post.user.username}`}
          className="flex items-center gap-3 hover:bg-slate-900/70 -mx-3 px-3 py-2 rounded-full"
        >
          <Avatar
            name={post.user.username}
            src={post.user.profilePicUrl}
            size="sm"
          />
          <div>
            <p className="text-sm font-semibold text-white">
              {post.user.username}
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>{formatDateTime(post.uploadedAt)}</span>
          {canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-full border border-slate-700 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-300 hover:bg-red-500 hover:text-white hover:border-red-500 disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </div>
      </div>
      <div className="space-y-4">
        <p className="px-6 text-base text-white">{post.caption}</p>
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt={post.caption}
            className="max-h-[520px] w-full object-cover"
          />
        )}
      </div>
      <div className="px-6 py-4">
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <button
            onClick={handleLikeToggle}
            className={`rounded-full border border-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
              hasLiked
                ? 'bg-brand/20 text-brand'
                : 'bg-slate-900 text-slate-300'
            }`}
            disabled={isProcessingLike}
          >
            {hasLiked ? 'Liked' : 'Like'}
          </button>
          <span>{post.likedUsers.length} likes</span>
          <button
            onClick={toggleComments}
            className="text-xs uppercase tracking-wide text-slate-400 hover:text-white"
          >
            {commentsOpen ? 'Hide comments' : 'View comments'}
          </button>
        </div>

        {commentsOpen && (
          <div className="mt-4 space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            {loadingComments ? (
              <p className="text-sm text-slate-400">Loading comments...</p>
            ) : comments.length ? (
              <ul className="space-y-3">
                {comments.map((comment, index) => (
                  <li
                    key={`${comment.username}-${index}-${comment.uploadedAt}`}
                    className="rounded-xl bg-slate-900/80 p-3"
                  >
                    <p className="text-sm font-semibold text-white">
                      @{comment.username}
                    </p>
                    <p className="text-sm text-slate-100">{comment.comment}</p>
                    <p className="text-xs text-slate-500">
                      {formatDateTime(comment.uploadedAt)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No comments yet.</p>
            )}

            <form className="space-y-2" onSubmit={handleCommentSubmit}>
              <input
                type="text"
                placeholder="Add a comment"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
              />
              {commentError && (
                <p className="text-xs text-pink-400">{commentError}</p>
              )}
              <Button type="submit" variant="secondary" className="w-full">
                Post comment
              </Button>
            </form>
          </div>
        )}
      </div>
    </article>
  );
};

