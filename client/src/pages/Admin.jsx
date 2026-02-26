import React, { useEffect, useState } from "react";
import {
  fetchPendingItems,
  approveItem,
  fetchClaims,
  updateClaimStatus,
} from "../lib/api.js";
import { ImageWithPreview } from "../components/ImageLightbox.jsx";

export default function Admin() {
  const [pending, setPending] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [loadingClaims, setLoadingClaims] = useState(true);
  const [error, setError] = useState("");

  function loadPending() {
    setLoadingPending(true);
    fetchPendingItems()
      .then(setPending)
      .catch((e) => setError(e?.response?.data?.message || "Failed to load pending."))
      .finally(() => setLoadingPending(false));
  }

  function loadClaims() {
    setLoadingClaims(true);
    fetchClaims()
      .then(setClaims)
      .catch((e) => setError(e?.response?.data?.message || "Failed to load claims."))
      .finally(() => setLoadingClaims(false));
  }

  useEffect(() => {
    loadPending();
    loadClaims();
  }, []);

  async function handleApprove(id) {
    try {
      await approveItem(id);
      loadPending();
    } catch (e) {
      setError(e?.response?.data?.message || "Approve failed.");
    }
  }

  async function handleClaimStatus(claimId, status) {
    try {
      await updateClaimStatus(claimId, status);
      loadClaims();
    } catch (e) {
      setError(e?.response?.data?.message || "Update failed.");
    }
  }

  return (
    <section className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Admin</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Approve pending reports so they appear on the dashboard. Manage claims and connect owners with claimants.
        </p>
      </div>

      {error ? (
        <div
          className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-200"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Pending approval</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Approve items so they are visible to everyone on the dashboard.
        </p>
        {loadingPending ? (
          <p className="mt-4 text-sm text-slate-500">Loading…</p>
        ) : pending.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No pending items.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {pending.map((item) => {
              const hasImage = item.image && item.image.startsWith("data:");
              return (
              <li
                key={item._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center gap-3">
                  {hasImage ? (
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                      <ImageWithPreview
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full cursor-zoom-in"
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-12 shrink-0 rounded-lg bg-slate-200 dark:bg-slate-700" />
                  )}
                  <div>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{item.name}</span>
                  <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">{item.category}</span>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Lost at: {(item.location || "").toLowerCase() === "other" ? (item.locationOtherText || "Other") : (item.location || "-")}
                    {item.locationSupportingText ? ` — ${item.locationSupportingText}` : ""}
                  </p>
                  {item.createdBy?.email && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Reported by: {item.createdBy.email}
                    </p>
                  )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleApprove(item._id)}
                  className="rounded-xl bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Approve
                </button>
              </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Claims</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Contact the owner and claimant to return the item. Update status as you progress.
        </p>
        {loadingClaims ? (
          <p className="mt-4 text-sm text-slate-500">Loading…</p>
        ) : claims.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No claims yet.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {claims.map((c) => (
              <li
                key={c._id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      Item: {c.item?.name} ({c.item?.category})
                    </p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      <strong>Owner (reporter):</strong>{" "}
                      {c.owner?.name} — {c.owner?.email}
                    </p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      <strong>Claimant:</strong> {c.claimedBy?.name} — {c.claimedBy?.email}
                    </p>
                    <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">Message: {c.message}</p>
                    {c.contactInfo && (
                      <p className="mt-1 text-sm text-slate-500">Contact: {c.contactInfo}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["pending", "contacted", "returned", "closed"].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => handleClaimStatus(c._id, status)}
                        className={`rounded-lg px-2 py-1 text-xs font-medium capitalize ${
                          c.status === status
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                            : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
