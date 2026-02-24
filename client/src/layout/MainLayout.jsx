import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Search, FilePlus2, ListChecks, Settings, ShieldCheck } from "lucide-react";
import Navbar from "../component/Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/report-lost", label: "Report Lost Item", icon: FilePlus2 },
  { to: "/found-items", label: "Found Items", icon: Search },
  { to: "/my-reports", label: "My Reports", icon: ListChecks },
  { to: "/settings", label: "Settings", icon: Settings },
];
const adminNavItem = { to: "/admin", label: "Admin", icon: ShieldCheck };

function SidebarLink({ to, label, Icon }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
          isActive
            ? "bg-slate-900 text-white shadow-soft dark:bg-white dark:text-slate-900"
            : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
        ].join(" ")
      }
    >
      <Icon size={16} />
      <span>{label}</span>
    </NavLink>
  );
}

export default function MainLayout() {
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-3 px-2 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <SidebarLink key={item.to} to={item.to} label={item.label} Icon={item.icon} />
            ))}
            {isAdmin && (
              <SidebarLink key={adminNavItem.to} to={adminNavItem.to} label={adminNavItem.label} Icon={adminNavItem.icon} />
            )}
          </nav>

          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300">
            Tip: Use the Dashboard search to quickly filter reports.
          </div>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

