import { useState, FormEvent } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../hooks/useAuth';

const navLinks = [
  { to: '/', label: 'Feed' },
  { to: '/profile', label: 'Profile' },
  { to: '/connections', label: 'Connections' }
];

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchUsername, setSearchUsername] = useState('');

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = searchUsername.trim();
    if (!value) return;
    setSearchUsername('');
    navigate(`/users/${value}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black text-brand">mini insta</span>
            <nav className="hidden gap-4 md:flex">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `text-sm font-semibold transition hover:text-white ${
                      isActive ? 'text-brand' : 'text-slate-400'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <form
              onSubmit={handleSearchSubmit}
              className="hidden md:block"
            >
              <Input
                name="search"
                placeholder="Search username"
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                className="h-8 w-44 bg-slate-900/80 text-xs"
              />
            </form>
            {user && (
              <div className="text-right text-xs">
                <p className="font-semibold text-white">{user.fullName}</p>
                <p className="text-slate-400">@{user.username}</p>
              </div>
            )}
            <Button variant="ghost" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

