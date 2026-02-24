import React from "react";

const placeholder = [
  { id: 1, name: "Water Bottle", location: "Library", date: "Today" },
  { id: 2, name: "Umbrella", location: "Cafeteria", date: "Yesterday" },
  { id: 3, name: "USB Drive", location: "Lab Block", date: "2 days ago" },
  { id: 4, name: "Calculator", location: "Classroom A-12", date: "3 days ago" },
  { id: 5, name: "Watch", location: "Sports Ground", date: "Last week" },
  { id: 6, name: "Notebook", location: "Auditorium", date: "Last week" }
];

function FoundCard({ item }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft dark:border-slate-800 dark:bg-slate-950">
      <div className="h-28 bg-gradient-to-br from-indigo-100 to-sky-100 dark:from-indigo-950 dark:to-slate-900" />
      <div className="p-4">
        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.name}</div>
        <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Location:</span> {item.location}
          </div>
          <div className="mt-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Found:</span> {item.date}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FoundItems() {
  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Found Items</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Demo-only page showing a placeholder list of found items.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {placeholder.map((item) => (
          <FoundCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

