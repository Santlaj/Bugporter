import Link from "next/link";
import { Bug } from "lucide-react";

export function AuthLayout({ children, title = "Sign in to Bug Reporter", subtitle = "Manage projects, inspect incoming bugs, and track telemetry" }) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="inline-flex h-12 w-12 rounded-xl bg-indigo-600 items-center justify-center text-white shadow-xl shadow-indigo-500/25 mb-4">
          <Bug className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">{title}</h2>
        <p className="mt-2 text-xs text-slate-400 max-w-sm mx-auto">{subtitle}</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/80 border border-slate-800/90 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 backdrop-blur-xl">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
