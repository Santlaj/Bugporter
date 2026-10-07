import Link from "next/link";
import { Bug, ArrowRight, ShieldCheck, Terminal, Laptop, Cpu, Github, Send, EyeOff, Sparkles, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Bug Porter — Developer-ready bug reports in one click",
  description:
    "A lightweight browser SDK for small engineering teams that turns user bug reports into ready-to-fix GitHub issues with screenshots, logs, and breadcrumbs.",
  alternates: {
    canonical: "https://bugporter.in",
  },
};

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How does Bug Porter protect sensitive customer data?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Privacy masking happens client-side before any data leaves the user's browser. All password inputs and elements marked with data-bug-mask are replaced with placeholders, and auth tokens or cookies are never captured.",
      },
    },
    {
      "@type": "Question",
      name: "Will the SDK impact my website load speed?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. The initial script footprint is under 20 KB gzipped, loads asynchronously, and runs completely inside a Shadow DOM tree. Heavy modules like the screenshot engine are lazy-loaded only when the user opens the report dialog.",
      },
    },
    {
      "@type": "Question",
      name: "How does duplicate bug grouping work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Bug Porter computes a deterministic SHA-256 fingerprint from the normalized error message, top stack trace frame, and route path, grouping repeated failures automatically so your backlog stays clean.",
      },
    },
  ],
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Bug className="h-5 w-5" />
          </div>
          <span className="font-bold text-base tracking-tight text-white">Bug Porter</span>
        </div>

        <nav className="flex items-center gap-4 text-xs font-medium">
          <Link href="/docs" className="text-slate-400 hover:text-slate-200 transition">
            Documentation
          </Link>
          <Link href="/login" className="text-slate-300 hover:text-white px-3 py-1.5 transition">
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/25 transition"
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
            <span>A lightweight browser SDK for small engineering teams</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Turn <span className="text-slate-400 line-through decoration-red-500/70 decoration-2">&ldquo;It&apos;s broken&rdquo;</span> into a{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200 bg-clip-text text-transparent">
              ready-to-fix issue
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed">
            One script tag. When your users or QA click report, Bug Porter captures a masked viewport screenshot, recent click breadcrumbs, console errors, and network telemetry automatically.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard/projects"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition"
            >
              <span>Open Developer Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/docs"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-sm font-semibold border border-slate-800 transition"
            >
              Read Integration Docs
            </Link>
          </div>
        </section>

        {/* Before / After Comparison */}
        <section className="max-w-5xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Without Bug Porter */}
            <div className="rounded-2xl border border-red-900/30 bg-red-950/10 p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-red-400 uppercase tracking-wider">
                <span>Standard User Feedback</span>
              </div>
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-900 font-mono text-xs text-slate-300">
                &ldquo;Checkout doesn&apos;t work.&rdquo;
              </div>
              <div className="text-xs text-slate-400 space-y-1.5 leading-relaxed">
                <p className="text-red-400/90 font-medium">Developer has to ask:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-500">
                  <li>Which page and browser?</li>
                  <li>What did you click before?</li>
                  <li>Were there any console errors?</li>
                  <li>Can you send a screenshot?</li>
                </ul>
              </div>
            </div>

            {/* With Bug Porter */}
            <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-6 space-y-4 relative overflow-hidden shadow-xl shadow-indigo-950/40">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                <span>With Bug Porter</span>
              </div>
              <div className="bg-slate-950/90 p-4 rounded-xl border border-indigo-500/20 font-mono text-xs text-indigo-200">
                &ldquo;Checkout doesn&apos;t work.&rdquo; + Complete Diagnostic Context
              </div>
              <div className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
                <p className="text-indigo-300 font-semibold">Instantly captured in memory:</p>
                <ul className="space-y-1 text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Masked WebP Viewport Screenshot</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Last 40 user click & navigation breadcrumbs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Intercepted console errors & stack traces</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Failed network calls (status 404/500 + duration)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="max-w-5xl mx-auto px-6 py-16 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Engineered for performance and privacy
            </h2>
            <p className="text-xs text-slate-400">No heavy dependencies. No host page disruptions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">&lt;20 KB Initial Bundle</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ultra-lightweight vanilla JS. Heavy screenshot modules are lazy-loaded only when the user submits a report.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <EyeOff className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">Browser-First Privacy</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                DOM elements with <code className="text-slate-300">data-bug-mask</code> and passwords are masked directly in memory before transmission. No tokens, cookies, or auth headers ever leave the client.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Github className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">GitHub & Telegram Sync</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Turns incoming bugs into ready-to-solve GitHub issues with markdown checklists and sends real-time alerts to your team chat.
              </p>
            </div>
          </div>
        </section>

        {/* Code Snippet Walkthrough */}
        <section className="max-w-4xl mx-auto px-6 py-12 text-center space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Ready in under 60 seconds
          </h2>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-left font-mono text-xs text-indigo-300 shadow-2xl overflow-x-auto">
            <p className="text-slate-500 mb-2">// 1. Paste into your HTML</p>
            <code>&lt;script async src=&quot;https://bugporter.in/widget.js&quot; data-key=&quot;pk_abc123&quot;&gt;&lt;/script&gt;</code>
            <p className="text-slate-500 mt-4 mb-2">// 2. That&apos;s it! The widget isolates inside Shadow DOM automatically.</p>
          </div>
        </section>

        {/* FAQ Section with SEO Rich Snippet markup */}
        <section className="max-w-4xl mx-auto px-6 py-16 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-400">Everything you need to know about the Bug Porter SDK and platform.</p>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
              <h3 className="text-sm font-semibold text-white">How does Bug Porter protect sensitive customer data?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Privacy masking happens client-side before any data leaves the user&apos;s browser. All password inputs and elements marked with <code className="text-slate-300">data-bug-mask</code> are replaced with placeholders, and auth tokens or cookies are never captured.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
              <h3 className="text-sm font-semibold text-white">Will the SDK impact my website load speed?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                No. The initial script footprint is under 20 KB gzipped, loads asynchronously, and runs completely inside a Shadow DOM tree. Heavy modules like the screenshot engine are lazy-loaded only when the user opens the report dialog.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
              <h3 className="text-sm font-semibold text-white">How does duplicate bug grouping work?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Bug Porter computes a deterministic SHA-256 fingerprint from the normalized error message, top stack trace frame, and route path, grouping repeated failures automatically so your backlog stays clean.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 px-6 py-8 text-center text-xs text-slate-500">
        <p>Bug Porter • Developer-ready bug reports in one click.</p>
      </footer>
    </div>
  );
}
