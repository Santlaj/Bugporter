"use client";

import { Search, Filter, RefreshCw } from "lucide-react";

export function FilterBar({
  filters = {},
  onFilterChange = () => {},
  totalCount = 0,
}) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-xl p-4">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search by title, description, or URL..."
          value={filters.search || ""}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500/80 transition"
        />
      </div>

      {/* Dropdown Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Status Dropdown */}
        <select
          value={filters.status || ""}
          onChange={(e) => onFilterChange({ ...filters, status: e.target.value || undefined })}
          aria-label="Filter reports by status"
          className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 outline-none cursor-pointer hover:border-slate-700"
        >
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="IGNORED">Ignored</option>
          <option value="DUPLICATE">Duplicate</option>
        </select>

        {/* Severity Dropdown */}
        <select
          value={filters.severity || ""}
          onChange={(e) => onFilterChange({ ...filters, severity: e.target.value || undefined })}
          aria-label="Filter reports by severity"
          className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 outline-none cursor-pointer hover:border-slate-700"
        >
          <option value="">All Severities</option>
          <option value="P0">P0 • Blocker</option>
          <option value="P1">P1 • Critical</option>
          <option value="P2">P2 • Normal</option>
          <option value="P3">P3 • Minor</option>
        </select>

        <span className="text-xs text-slate-500 ml-2">
          {totalCount} report{totalCount === 1 ? "" : "s"}
        </span>
      </div>
    </div>
  );
}

export default FilterBar;
