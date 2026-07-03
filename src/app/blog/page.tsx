'use client';

import Script from 'next/script';

export default function BlogPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Blog</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Guides, tips, and step-by-step tutorials from the stephud team.
          </p>
        </div>
      </div>

      {/* Trysora Blog - full width below header */}
      <div id="soro-blog"></div>

      {/* Load Trysora embed after page is interactive */}
      <Script
        src="https://app.trysoro.com/api/embed/e032356d-d466-44d0-ae71-708c0d90746d"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Trysora blog loaded');
        }}
      />
    </div>
  );
}
