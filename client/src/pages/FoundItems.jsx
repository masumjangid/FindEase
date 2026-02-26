import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, HandHelping, FilePlus2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { ImageWithPreview } from "../components/ImageLightbox.jsx";
import { fetchApprovedLostItems, createClaim } from "../lib/api.js";

const CATEGORY_ORDER = ["All", "Electronics", "ID Cards", "Books", "Clothing", "Accessories", "Other"];

const LOCATION_OPTIONS = [
  "All",
  "Other",
  "Academic block front",
  "Cafegram",
  "PU canteen",
  "Cafe behind canteen",
  "Boys hostel front",
  "Mess front",
  "American football ground",
  "Basketball court",
  "Tennis court",
  "Library",
];

const RESOLUTION_BADGE = {
  returned: {
    label: "Returned",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  },
  contacted: {
    label: "Contacted",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
  },
  closed: {
    label: "Closed",
    className: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
  },
};

function getDisplayLocation(item) {
  if (!item) return "-";
  if ((item.location || "").toLowerCase() === "other") return item.locationOtherText || "Other";
  return item.location || "-";
}

function ClaimModal({ item, onClose, onSuccess }) {
  const [message, setMessage] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!message.trim()) return;
    const contactDigits = (contactInfo || "").replace(/\D/g, "");
    if (contactDigits.length !== 10) {
      setError("Contact number is required and must be exactly 10 digits.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await createClaim(item._id, message.trim(), contactDigits);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit claim.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-950"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Claim: {item?.name}</h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Describe why this item is yours. Admin will use this to connect you with the person who reported it.
        </p>
        {error && (
          <div className="mt-3 rounded-xl bg-rose-50 p-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Message *</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={3}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              placeholder="e.g. I lost this wallet in the canteen last Tuesday…"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Contact number *</span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={10}
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value.replace(/\D/g, "").slice(0, 10))}
              required
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              placeholder="1234567890"
            />
          </label>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-900 disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit claim"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FoundItemCard({ item, onClaim, isLoggedIn }) {
  const hasImage = item.image && item.image.startsWith("data:");
  const resolution = (item.resolutionStatus || "").toLowerCase();
  const resolutionBadge = resolution && RESOLUTION_BADGE[resolution];
  const isResolved = !!resolutionBadge;

  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft dark:border-slate-800 dark:bg-slate-950">
      <div className="relative h-28 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
        {hasImage ? (
          <ImageWithPreview
            src={item.image}
            alt={item.name}
            className="h-full w-full cursor-zoom-in"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-indigo-100 to-sky-100 dark:from-indigo-950 dark:to-slate-800" />
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{item.name}</div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.category}</div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Found at: {getDisplayLocation(item)}
              {item.locationSupportingText ? ` — ${item.locationSupportingText}` : ""}
            </div>
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
              resolutionBadge ? resolutionBadge.className : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
            }`}
          >
            {resolutionBadge ? resolutionBadge.label : "Approved"}
          </span>
        </div>

        <p className="mt-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{item.description}</p>
        <p className="mt-1 text-[11px] text-slate-500 italic dark:text-slate-400">Someone found this.</p>

        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Reported {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-"}
          </span>
          {!isResolved &&
            (isLoggedIn ? (
              <button
                type="button"
                onClick={() => onClaim(item)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                <HandHelping size={14} />
                Claim this item
              </button>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <HandHelping size={14} />
                Log in to claim
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}

export default function FoundItems() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [claimItem, setClaimItem] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    fetchApprovedLostItems()
      .then((data) => {
        if (!mounted) return;
        setItems(data);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e?.response?.data?.message || "Failed to load items.");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const fromData = new Set(items.map((i) => i.category).filter(Boolean));
    const merged = ["All", ...Array.from(fromData)];
    return Array.from(new Set([...CATEGORY_ORDER, ...merged]));
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      const type = (i.reportedAs || "lost").toLowerCase();
      if (type !== "found") return false;
      const matchCategory = category === "All" ? true : (i.category || "").toLowerCase() === category.toLowerCase();
      const locDisplay = getDisplayLocation(i);
      const matchLocation =
        locationFilter === "All" ||
        (locationFilter === "Other" && (i.location || "").toLowerCase() === "other") ||
        (i.location || "").toLowerCase() === locationFilter.toLowerCase() ||
        (locationFilter !== "Other" && locDisplay.toLowerCase() === locationFilter.toLowerCase());
      const matchQuery =
        q.length === 0
          ? true
          : `${i.name || ""} ${i.description || ""} ${i.category || ""} ${locDisplay}`.toLowerCase().includes(q);
      return matchCategory && matchLocation && matchQuery;
    });
  }, [items, query, category, locationFilter]);

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Found Items</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          <span className="font-medium text-slate-700 dark:text-slate-200">I found something</span> — report it so the
          owner can claim it. <span className="font-medium text-slate-700 dark:text-slate-200">I lost something</span> —
          browse the list below and claim yours. All items are approved by admin and visible to campus users.
        </p>
        <div className="mt-4">
          <Link
            to="/report-found"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            <FilePlus2 size={16} />
            Report a found item
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Browse found items</h2>
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, category, or location..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 shadow-sm outline-none ring-slate-200 focus:ring-4 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="mr-1 self-center text-xs font-medium text-slate-500 dark:text-slate-400">Category:</span>
          {categories.slice(0, 8).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                category === c
                  ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="mr-1 self-center text-xs font-medium text-slate-500 dark:text-slate-400">Found at:</span>
          {LOCATION_OPTIONS.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => setLocationFilter(loc)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                locationFilter === loc
                  ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
              }`}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="text-sm text-slate-600 dark:text-slate-300">
        {loading ? "Loading…" : `${filtered.length} item(s) found`}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="h-60 animate-pulse rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No found items match your filters. Report a found item or try different search or filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <FoundItemCard
              key={item._id}
              item={item}
              onClaim={setClaimItem}
              isLoggedIn={!!user}
            />
          ))}
        </div>
      )}

      {claimItem && (
        <ClaimModal
          item={claimItem}
          onClose={() => setClaimItem(null)}
          onSuccess={() => setClaimItem(null)}
        />
      )}
    </section>
  );
}
