import Link from "next/link";
import { Bug, FolderGit2, Settings, Shield, Bell, ExternalLink, User } from "lucide-react";
import { UserProfileButton } from "../components/user-profile-button";

export function DashboardLayout({ children, currentPath = "/dashboard", user = null }) {
  const navItems = [
    { label: "Projects", href: "/dashboard/projects", icon: FolderGit2 },
    { label: "Integrations", href: "/dashboard/integrations", icon: Shield },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex flex-col">
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80 gap-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Bug className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white block">Bug Porter</span>
            <span className="text-[10px] text-indigo-400 font-medium">Developer Dashboard</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User footer with Sign Out */}
        <UserProfileButton user={user} />
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-800/80 bg-slate-900/30 px-8 flex items-center justify-between backdrop-blur">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/dashboard/projects" className="hover:text-slate-200 transition">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-200 font-medium">Workspace</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
              target="_blank"
            >
              <span>Documentation</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;
