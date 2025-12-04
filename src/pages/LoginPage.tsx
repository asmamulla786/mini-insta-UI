import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';

export const LoginPage = () => {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState<{ username?: string; password?: string }>(
    {}
  );
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGeneralError('');

    const nextErrors: typeof errors = {};
    if (!form.username.trim()) nextErrors.username = 'Username is required';
    if (!form.password.trim()) nextErrors.password = 'Password is required';
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) return;

    try {
      setSubmitting(true);
      await login(form);
    } catch (error) {
      setGeneralError('Invalid credentials. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-slate-800 bg-slate-950/60 p-8 shadow-2xl">
        <header className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
            Welcome back
          </p>
          <h1 className="text-3xl font-black text-white">Mini Instagram</h1>
          <p className="text-sm text-slate-400">
            Sign in to continue to your dashboard
          </p>
        </header>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <Input
            name="username"
            label="Username"
            placeholder="your.username"
            value={form.username}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, username: e.target.value }))
            }
            error={errors.username}
            autoComplete="username"
          />
          <Input
            type="password"
            name="password"
            label="Password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, password: e.target.value }))
            }
            error={errors.password}
            autoComplete="current-password"
          />
          {generalError && (
            <p className="text-sm text-pink-400">{generalError}</p>
          )}
          <Button type="submit" className="w-full" isLoading={submitting}>
            Sign in
          </Button>
        </form>
        <p className="text-center text-sm text-slate-400">
          New here?{' '}
          <Link className="font-semibold text-brand" to="/signup">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

