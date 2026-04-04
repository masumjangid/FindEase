import React from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Settings() {
  const { user, logout } = useAuth();

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Settings</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Account and preferences.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Account</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {user?.email} {user?.role === "admin" ? "(Admin)" : ""}
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Logout
          </button>
        </div>
      </div>
    </section>
  );
}

