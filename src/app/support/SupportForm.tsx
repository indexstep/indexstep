"use client";

import Link from "next/link";

export default function SupportForm() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--accent)]">
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Leave a Support Ticket</h1>
          <p className="text-[var(--text-secondary)] text-sm">
            Having trouble? Submit a ticket and we&apos;ll get back to you as soon as possible.
          </p>
        </div>

        <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-6">
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Subject</label>
              <select className="w-full px-4 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent">
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="account">Account Issue</option>
                <option value="content">Content / Tutorial Report</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Description</label>
              <textarea
                placeholder="Describe your issue in detail..."
                rows={5}
                className="w-full px-4 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent resize-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[#0f0f14] font-semibold rounded-lg transition-colors"
            >
              Submit Ticket
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[var(--border)] text-center text-sm text-[var(--text-muted)]">
            <p>
              Prefer email?{" "}
              <a href="mailto:support@stephud.com" className="text-[var(--accent)] hover:underline">
                support@stephud.com
              </a>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
