import { Link } from 'react-router-dom';

export const NotFoundPage = () => (
  <div className="glass-panel mx-auto max-w-lg p-10 text-center">
    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
      404 error
    </p>
    <h1 className="mt-4 text-3xl font-bold text-white">Page not found</h1>
    <p className="mt-2 text-sm text-slate-400">
      The page you are looking for does not exist or has been moved.
    </p>
    <Link
      to="/"
      className="mt-6 inline-flex items-center justify-center rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white"
    >
      Back to dashboard
    </Link>
  </div>
);

