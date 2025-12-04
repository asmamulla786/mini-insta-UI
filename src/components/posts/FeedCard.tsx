import { FormEvent, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Comment, FeedItem } from '../../types/api';
import { Avatar } from '../ui/Avatar';
import { formatDateTime } from '../../utils/format';
import { Button } from '../ui/Button';
import { CommentApi, PostApi } from '../../services/api';

type FeedCardProps = {
  item: FeedItem;
  onUpdated?: () => Promise<void> | void;
};

export const FeedCard = ({ item, onUpdated }: FeedCardProps) => {
  const [liked, setLiked] = useState(item.likedByYou);
  const [likeCount, setLikeCount] = useState(item.noOfLikes);
  const [isProcessingLike, setIsProcessingLike] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [commentError, setCommentError] = useState('');

  const fetchComments = useCallback(async () => {
    setLoadingComments(true);
    try {
      const data = await CommentApi.listByPost(item.postId);
      setComments(data);
    } finally {
      setLoadingComments(false);
    }
  }, [item.postId]);

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
      if (liked) {
        await PostApi.unlike(item.postId);
        setLiked(false);
        setLikeCount((prev) => Math.max(prev - 1, 0));
      } else {
        await PostApi.like(item.postId);
        setLiked(true);
        setLikeCount((prev) => prev + 1);
      }
      if (onUpdated) {
        await onUpdated();
      }
    } finally {
      setIsProcessingLike(false);
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
      await CommentApi.create(item.postId, { content: commentInput });
      setCommentInput('');
      await fetchComments();
    } catch {
      setCommentError('Unable to add comment. Please try again.');
    }
  };

  return (
    <article className="glass-panel overflow-hidden shadow-xl">
      <Link
        to={`/users/${item.username}`}
        className="flex items-center gap-3 px-6 py-4 hover:bg-slate-900/70"
      >
        <Avatar name={item.username} src={item.profilePicUrl} size="sm" />
        <div>
          <p className="text-sm font-semibold text-white">{item.username}</p>
        </div>
        <span className="ml-auto text-xs text-slate-500">
          {formatDateTime(item.uploadedAt)}
        </span>
      </Link>
      <div className="space-y-4">
        <p className="px-6 text-base text-white">{item.caption}</p>
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt={item.caption}
            className="max-h-[520px] w-full object-cover"
          />
        )}
      </div>
      <div className="px-6 py-4 text-sm text-slate-400">
        <div className="flex items-center gap-3">
          <button
            onClick={handleLikeToggle}
            className={`rounded-full border border-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
              liked
                ? 'bg-brand/20 text-brand'
                : 'bg-slate-900 text-slate-300'
            }`}
            disabled={isProcessingLike}
          >
            {liked ? 'Liked' : 'Like'}
          </button>
          <span>{likeCount} likes</span>
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

