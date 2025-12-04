import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Toggle } from '../components/ui/Toggle';
import { useAuth } from '../hooks/useAuth';

export const SignupPage = () => {
  const { signup } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    password: '',
    profilePicUrl: '',
    privateAccount: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGeneralError('');
    const nextErrors: Record<string, string> = {};
    if (!form.fullName.trim()) nextErrors.fullName = 'Full name is required';
    if (!form.username.trim()) nextErrors.username = 'Username is required';
    if (form.password.length < 6)
      nextErrors.password = 'Password must be at least 6 characters';
    if (form.profilePicUrl && !/^https?:\/\//.test(form.profilePicUrl)) {
      nextErrors.profilePicUrl = 'Profile picture must be a valid URL';
    }
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) return;

    try {
      setSubmitting(true);
      await signup(form);
    } catch (error) {
      setGeneralError('Unable to create account. Please try again.');
      setSubmitting(false);
    }
  };

  const updateForm = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-950/60 p-8 shadow-2xl">
        <header className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
            Join the community
          </p>
          <h1 className="text-3xl font-black text-white">Create account</h1>
          <p className="text-sm text-slate-400">
            Share posts, follow friends, and control your privacy preferences.
          </p>
        </header>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Full name"
              name="fullName"
              placeholder="Alex Doe"
              value={form.fullName}
              onChange={(e) => updateForm('fullName', e.target.value)}
              error={errors.fullName}
            />
            <Input
              label="Username"
              name="username"
              placeholder="alex.doe"
              value={form.username}
              onChange={(e) => updateForm('username', e.target.value)}
              error={errors.username}
            />
          </div>
          <Input
            label="Profile picture URL"
            name="profilePicUrl"
            placeholder="https://images.unsplash.com/..."
            value={form.profilePicUrl}
            onChange={(e) => updateForm('profilePicUrl', e.target.value)}
            error={errors.profilePicUrl}
          />
          <Input
            type="password"
            label="Password"
            name="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => updateForm('password', e.target.value)}
            error={errors.password}
          />
          <Toggle
            label="Make my account private"
            checked={form.privateAccount}
            onChange={(checked) => updateForm('privateAccount', checked)}
          />
          {generalError && (
            <p className="text-sm text-pink-400">{generalError}</p>
          )}
          <Button type="submit" className="w-full" isLoading={submitting}>
            Create account
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link className="font-semibold text-brand" to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

