import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Header() {
  const location = useLocation();
  const { user, loading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-neutral-950/70 border-b border-white/10">
      <nav className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/images/swiftbank-logo.svg"
            className="w-24 h-24 object-contain"
            alt="SwiftBank Logo"
          />
        </Link>
        
        <div className="flex items-center gap-4 text-sm">
          {loading ? (
            <div className="w-20 h-8 bg-white/5 rounded-xl animate-pulse" />
          ) : user ? (
            <>
              <Link
                to="/dashboard"
                className={
                  location.pathname === "/dashboard"
                    ? "text-accent font-medium"
                    : "text-ui-subtle hover:text-white transition"
                }
              >
                Dashboard
              </Link>
              <span className="text-ui-subtle hidden sm:inline">
                {user.name} {user.surname}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 font-semibold hover:bg-red-500/20 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={
                  location.pathname === "/login"
                    ? "text-accent font-medium"
                    : "text-ui-subtle hover:text-white transition"
                }
              >
                Sign in
              </Link>
              <Link
                to="/login?tab=register"
                className="px-4 py-2 rounded-xl bg-ui-surface font-semibold hover:opacity-90 transition"
              >
                Open account
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}