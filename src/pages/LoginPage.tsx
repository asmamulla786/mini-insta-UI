import { FormEvent, useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState<{ username?: string; password?: string }>(
    {}
  );
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [showAccountNotFoundModal, setShowAccountNotFoundModal] = useState(false);
  const shouldShowModalRef = useRef(false);

  useEffect(() => {
    console.log('Modal state updated:', showAccountNotFoundModal);
    // If ref says we should show modal but state is false, update it
    if (shouldShowModalRef.current && !showAccountNotFoundModal) {
      console.log('Ref says show modal, but state is false. Setting to true...');
      setShowAccountNotFoundModal(true);
    }
  }, [showAccountNotFoundModal]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGeneralError('');
    // Don't reset modal here - only reset when we actually need to

    const nextErrors: typeof errors = {};
    if (!form.username.trim()) nextErrors.username = 'Username is required';
    if (!form.password.trim()) nextErrors.password = 'Password is required';
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) return;

    try {
      setSubmitting(true);
      await login(form);
    } catch (error: unknown) {
      setSubmitting(false);
      
      // Check for 403 or 404 status code (user/account not found)
      let status: number | undefined;
      
      if (axios.isAxiosError(error)) {
        status = error.response?.status;
        console.log('Error status:', status, 'Error:', error);
      } else if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { status?: number }; status?: number };
        status = err.response?.status || err.status;
        console.log('Non-axios error status:', status);
      }
      
      console.log('Checking status:', status, 'Should show modal:', status === 403 || status === 404);
      
      // Show modal for 403 (Forbidden) or 404 (Not Found) - both indicate account doesn't exist
      if (status === 403 || status === 404) {
        console.log('Setting modal to true');
        shouldShowModalRef.current = true;
        // Use flushSync to force immediate state update
        flushSync(() => {
          setShowAccountNotFoundModal(true);
        });
        console.log('After flushSync - modal should be true');
        // Also set it again in next tick as backup
        setTimeout(() => {
          if (shouldShowModalRef.current) {
            setShowAccountNotFoundModal(true);
          }
        }, 10);
      } else {
        console.log('Setting general error instead');
        shouldShowModalRef.current = false;
        setGeneralError('Invalid credentials. Please try again.');
        setShowAccountNotFoundModal(false);
      }
    }
  };

  return (
    <>
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

      <Modal
        open={showAccountNotFoundModal || shouldShowModalRef.current}
        title="Account Not Found"
        onClose={() => {
          console.log('Closing modal');
          shouldShowModalRef.current = false;
          setShowAccountNotFoundModal(false);
        }}
      >
        <div className="space-y-4">
          <p className="text-slate-300">
            The account you're trying to access does not exist. Would you like to
            create a new account?
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => {
                setShowAccountNotFoundModal(false);
                navigate('/signup');
              }}
              className="flex-1"
            >
              Create Account
            </Button>
            <Button
              onClick={() => setShowAccountNotFoundModal(false)}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

