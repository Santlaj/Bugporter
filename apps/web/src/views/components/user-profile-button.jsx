"use client";

import { signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";

export function UserProfileButton({ user }) {
  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="p-3.5 border-t border-slate-800/80 flex items-center justify-between gap-3 bg-slate-900/50">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="h-8 w-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-xs shrink-0">
          {user?.name ? user.name[0].toUpperCase() : <User className="h-3.5 w-3.5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-white truncate">{user?.name || "Developer"}</p>
          <p className="text-[11px] text-slate-400 truncate">{user?.email || "developer@example.com"}</p>
        </div>
      </div>

      <button
        onClick={handleSignOut}
        title="Sign Out"
        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition shrink-0"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}

export default UserProfileButton;
