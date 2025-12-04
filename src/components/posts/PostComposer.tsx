import { FormEvent, useState } from 'react';
import { TextArea } from '../ui/TextArea';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { PostApi } from '../../services/api';
import type { Post } from '../../types/api';

type PostComposerProps = {
  onCreated: (post: Post) => void;
};

export const PostComposer = ({ onCreated }: PostComposerProps) => {
  const [form, setForm] = useState({ caption: '', imageUrl: '' });
  const [errors, setErrors] = useState<{ caption?: string; imageUrl?: string }>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGeneralError('');
    const nextErrors: typeof errors = {};
    if (!form.caption.trim()) nextErrors.caption = 'Caption is required';
    if (!/^https?:\/\//.test(form.imageUrl))
      nextErrors.imageUrl = 'Image URL must be valid';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      setIsSubmitting(true);
      const post = await PostApi.create(form);
      onCreated(post);
      setForm({ caption: '', imageUrl: '' });
    } catch (error) {
      setGeneralError('Unable to share post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="glass-panel p-6 shadow-lg" onSubmit={handleSubmit}>
      <h2 className="text-lg font-semibold text-white">Share something new</h2>
      <p className="text-sm text-slate-400">
        Paste an image URL and add a short caption.
      </p>
      <div className="mt-4 space-y-4">
        <TextArea
          label="Caption"
          name="caption"
          placeholder="What&apos;s on your mind?"
          rows={3}
          value={form.caption}
          onChange={(e) => setForm((prev) => ({ ...prev, caption: e.target.value }))}
          error={errors.caption}
        />
        <Input
          label="Image URL"
          name="imageUrl"
          placeholder="https://images.unsplash.com/..."
          value={form.imageUrl}
          onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
          error={errors.imageUrl}
        />
        {generalError && (
          <p className="text-sm text-pink-400">{generalError}</p>
        )}
        <div className="flex items-center justify-end">
          <Button type="submit" isLoading={isSubmitting}>
            Share post
          </Button>
        </div>
      </div>
    </form>
  );
};

