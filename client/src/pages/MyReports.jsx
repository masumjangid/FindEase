import React, { useEffect, useMemo, useState } from "react";
import { fetchMyReports } from "../lib/api.js";
import { ImageWithPreview } from "../components/ImageLightbox.jsx";

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}

export default function MyReports() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    fetchMyReports()
      .then((data) => mounted && setItems(data))
      .catch((e) => mounted && setError(e?.response?.data?.message || "Failed to load reports."))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const total = items.length;
    const pendingApproval = items.filter((i) => !i.approved).length;
    const approved = items.filter((i) => i.approved).length;
    return { Total: total, "Pending approval": pendingApproval, Approved: approved };
  }, [items]);

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">My Reports</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Your reported items. Pending items will appear on the dashboard after admin approval.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Object.entries(stats).map(([label, value]) => (
          <StatCard key={label} label={label} value={loading ? "…" : value} />
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Your reports</h2>
        {loading ? (
          <p className="mt-2 text-sm text-slate-500">Loading…</p>
        ) : items.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No reports yet. Use Report Lost Item to add one.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {items.map((i) => {
              const hasImage = i.image && i.image.startsWith("data:");
              return (
              <li
                key={i._id}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
              >
                {hasImage ? (
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                    <ImageWithPreview
                      src={i.image}
                      alt={i.name}
                      className="h-full w-full cursor-zoom-in"
                    />
                  </div>
                ) : (
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-200 dark:bg-slate-700" />
                )}
                <span className="min-w-0 flex-1 font-medium text-slate-900 dark:text-slate-100">{i.name}</span>
                <span
                  className={
                    i.approved
                      ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                      : "rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                  }
                >
                  {i.approved ? "Approved" : "Pending"}
                </span>
              </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
