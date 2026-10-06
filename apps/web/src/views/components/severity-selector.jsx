const SEVERITY_CONFIG = {
  P0: { label: "P0 • Blocker", short: "P0", bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30" },
  P1: { label: "P1 • Critical", short: "P1", bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/30" },
  P2: { label: "P2 • Normal", short: "P2", bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30" },
  P3: { label: "P3 • Minor", short: "P3", bg: "bg-slate-500/15", text: "text-slate-400", border: "border-slate-500/30" },
};

export function SeverityBadge({ severity = "P2", interactive = false, onChange = null }) {
  const current = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.P2;

  if (!interactive) {
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${current.bg} ${current.text} ${current.border}`}
      >
        {current.label}
      </span>
    );
  }

  return (
    <select
      value={severity}
      onChange={(e) => onChange && onChange(e.target.value)}
      aria-label="Change report severity"
      className={`text-xs font-semibold rounded px-2.5 py-1 border bg-slate-900 cursor-pointer outline-none transition ${current.text} ${current.border}`}
    >
      {Object.entries(SEVERITY_CONFIG).map(([key, item]) => (
        <option key={key} value={key} className="bg-slate-900 text-slate-100">
          {item.label}
        </option>
      ))}
    </select>
  );
}

export default SeverityBadge;
