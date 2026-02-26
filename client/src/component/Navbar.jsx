import React from "react";
import { Link } from "react-router-dom";
import { Moon, Sun, LogOut, User } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAdmin } = useAuth();

  const isDark = theme === "dark";
  const logoSrc = isDark ? "/fe-logo-dark.png" : "/fe-logo-light.png";

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <img
            src={logoSrc}
            alt="FindEase logo"
            className="h-8 w-8 shrink-0 object-contain sm:h-9 sm:w-9 md:h-10 md:w-10"
          />
          <div className="leading-tight">
            <div className="text-sm font-semibold">FindEase</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Lost &amp; Found</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {user ? (
            <>
              <span className="hidden max-w-[140px] truncate text-sm text-slate-600 sm:inline dark:text-slate-300" title={user.email}>
                {user.email}
              </span>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="rounded-xl border border-slate-200 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-800 sm:px-3 sm:py-2 sm:text-sm dark:border-slate-800 dark:bg-amber-950/40 dark:text-amber-200"
                >
                  Admin
                </Link>
              )}
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 sm:px-3 sm:py-2 sm:text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                aria-label="Logout"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 sm:px-3 sm:py-2 sm:text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <User size={16} />
                <span className="hidden sm:inline">Log in</span>
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center rounded-xl bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800 sm:px-3 sm:py-2 sm:text-sm dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                Sign up
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 sm:px-3 sm:py-2 sm:text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            <span className="hidden sm:inline">{theme === "dark" ? "Light" : "Dark"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
