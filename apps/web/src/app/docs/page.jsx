import Link from "next/link";
import { Bug, ArrowLeft, Shield, Lock, Terminal, Globe, Code2 } from "lucide-react";

export const metadata = {
  title: "Documentation & Integration Guide",
  description:
    "Complete guide on installing the SDK, Content Security Policy (CSP) setup, DOM privacy masking, and API reference.",
  alternates: {
    canonical: "https://bugporter.in/docs",
  },
  openGraph: {
    title: "Documentation & Integration Guide — Bug Porter",
    description:
      "Complete guide on installing the SDK, Content Security Policy (CSP) setup, DOM privacy masking, and API reference.",
    url: "https://bugporter.in/docs",
  },
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-sm tracking-tight">
            <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Bug className="h-4 w-4" />
            </div>
            <span>Bug Porter</span>
          </Link>
          <span className="text-xs text-slate-500">/ Docs</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <Link href="/dashboard/projects" className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition">
            Go to Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Documentation & Integration Guide
          </h1>
          <p className="mt-3 text-slate-400 text-sm leading-relaxed">
            Learn how to install the lightweight Bug Porter SDK, configure Content Security Policies (CSP), enforce client-side privacy masking, and integrate notifications.
          </p>
        </div>

        {/* Section 1: Quick Installation */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-white">
            <Code2 className="h-5 w-5 text-indigo-400" />
            <h2>1. Installation</h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Add the script tag to your website&apos;s HTML. The SDK weighs less than 20 KB and initializes silently without affecting host page runtime or performance.
          </p>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs text-indigo-300 overflow-x-auto">
            <code>&lt;script async src=&quot;https://bugporter.in/widget.js&quot; data-key=&quot;pk_your_project_key&quot;&gt;&lt;/script&gt;</code>
          </div>
        </section>

        {/* Section 2: Content Security Policy */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-white">
            <Shield className="h-5 w-5 text-indigo-400" />
            <h2>2. Content Security Policy (CSP) Requirements</h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            If your website uses strict Content Security Policy headers, whitelist the following origins to allow the SDK to load, send reports, and upload screenshots:
          </p>
          <div className="bg-slate-900 border border-slate-800 rounded-xl divide-y divide-slate-800/80 font-mono text-xs">
            <div className="p-4">
              <span className="text-indigo-400 font-semibold block mb-1">script-src</span>
              <code className="text-slate-300">https://cdn.bugreporter.dev https://cdn.jsdelivr.net</code>
              <p className="text-[11px] text-slate-500 font-sans mt-1">Allows loading the initial widget script and lazy-loaded screenshot modules.</p>
            </div>
            <div className="p-4">
              <span className="text-indigo-400 font-semibold block mb-1">connect-src</span>
              <code className="text-slate-300">https://your-domain.com https://api.cloudinary.com</code>
              <p className="text-[11px] text-slate-500 font-sans mt-1">Permits sending diagnostic payloads and direct signed screenshot uploads.</p>
            </div>
            <div className="p-4">
              <span className="text-indigo-400 font-semibold block mb-1">img-src</span>
              <code className="text-slate-300">blob: data: https://res.cloudinary.com</code>
              <p className="text-[11px] text-slate-500 font-sans mt-1">Enables local canvas WebP generation and Cloudinary delivery.</p>
            </div>
          </div>
        </section>

        {/* Section 3: Privacy & DOM Masking */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-white">
            <Lock className="h-5 w-5 text-indigo-400" />
            <h2>3. Privacy by Design & DOM Masking</h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Sensitive information is stripped <strong>in the browser before transmission</strong>, never after reaching the server.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
              <h4 className="font-semibold text-white">Automatic Protection</h4>
              <ul className="list-disc list-inside text-slate-400 space-y-1">
                <li>All <code className="text-slate-300">input[type=&quot;password&quot;]</code> fields are replaced with solid blocks.</li>
                <li>Credit card and CVV fields are automatically masked.</li>
                <li>Sensitive query parameters (<code className="text-slate-300">token</code>, <code className="text-slate-300">jwt</code>, <code className="text-slate-300">secret</code>, <code className="text-slate-300">key</code>) are redacted to <code className="text-slate-300">[REDACTED]</code> in all URLs.</li>
                <li><strong>No cookies, request/response bodies, or Authorization headers</strong> are ever recorded.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
              <h4 className="font-semibold text-white">Custom Elements Masking</h4>
              <p className="text-slate-400 leading-relaxed">
                Add <code className="text-indigo-300 bg-indigo-950/60 px-1 py-0.5 rounded">data-bug-mask=&quot;true&quot;</code> to any element to completely hide its content in both screenshots and click breadcrumbs:
              </p>
              <div className="bg-slate-950 p-2.5 rounded font-mono text-[11px] text-slate-300">
                <code>&lt;div data-bug-mask=&quot;true&quot;&gt;<br />&nbsp;&nbsp;SSN: 000-12-3456<br />&lt;/div&gt;</code>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Security Architecture */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-white">
            <Globe className="h-5 w-5 text-indigo-400" />
            <h2>4. Security Controls</h2>
          </div>
          <div className="space-y-3 text-xs text-slate-400">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
              <h4 className="font-semibold text-white mb-1">Origin Allowlists</h4>
              <p>Configure authorized domain origins in your Project Settings. Submissions originating from unauthorized hosts or domains are rejected with <code className="text-slate-300">403 Forbidden</code>.</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
              <h4 className="font-semibold text-white mb-1">Rate Limiting</h4>
              <p>Built-in Upstash Redis sliding window enforcement limits traffic to <strong>20 reports per 10 minutes per IP</strong> and <strong>100 reports per hour per project</strong> to prevent denial-of-service and telemetry spam.</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
              <h4 className="font-semibold text-white mb-1">Honeypot Protection</h4>
              <p>Forms feature hidden honeypot fields that trap automated bots and scrapers without affecting genuine user workflows.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
