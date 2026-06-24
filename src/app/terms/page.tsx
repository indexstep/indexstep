import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | stephud",
  description: "Terms of Service for stephud — your rights and responsibilities when using our platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2">Terms of Service</h1>
        <p className="text-sm text-[var(--text-muted)] mb-8">Last updated: June 21, 2026</p>

        <div className="space-y-8 text-[var(--text-secondary)] leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mb-3">1. Acceptance of Terms</h2>
            <p>
              By creating an account or using stephud, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mb-3">2. Description of Service</h2>
            <p>
              stephud is a visual tutorial platform that allows users to create, share, and discover step-by-step guides across various categories including DIY, cooking, tech, crafts, and more. Our platform provides tools for authors to publish tutorials with progress tracking, tool lists, and step-by-step instructions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mb-3">3. User Accounts</h2>
            <p className="mb-3">To create tutorials or access certain features, you must create an account. When creating your account, you agree to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide accurate and complete information</li>
              <li>Choose a strong password and keep it confidential</li>
              <li>Be at least 13 years of age (or the minimum age required in your jurisdiction)</li>
              <li>Accept responsibility for all activities that occur under your account</li>
            </ul>
            <p className="mt-3">
              You may not use another user&apos;s account without their permission. You must end .com email addresses only. Accounts using non-.com email domains are not permitted.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mb-3">4. Content Guidelines</h2>
            <p className="mb-3">All content posted on stephud must comply with our <Link href="/guidelines" className="text-[var(--accent)] hover:underline">Content Guidelines</Link>. Content that is prohibited includes but is not limited to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Suicide or self-harm instructions</li>
              <li>Instructions for creating weapons or explosives</li>
              <li>Illegal drug manufacturing or distribution</li>
              <li>Content that promotes violence or terrorism</li>
              <li>Child sexual abuse material (CSAM)</li>
              <li>Hacking or cybercrime instructions</li>
              <li>Harassment, bullying, or hate speech</li>
              <li>Spam or misleading content</li>
            </ul>
            <p className="mt-3">
              Tutorials involving potentially dangerous activities (electrical work, chemistry experiments, extreme sports, etc.) must include appropriate safety warnings and disclaimers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mb-3">5. Tutorial Creation</h2>
            <p className="mb-3">When you create a tutorial on stephud, you:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Retain ownership of your content</li>
              <li>Grant stephud a non-exclusive, royalty-free license to display, distribute, and promote your tutorial</li>
              <li>Confirm that your content does not violate any third-party rights</li>
              <li>Accept responsibility for ensuring your tutorial is accurate, safe, and legal</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mb-3">6. Private and Password-Protected Tutorials</h2>
            <p>
              Authors may choose to make tutorials private or password-protected. Private tutorials are only accessible via direct link. Password-protected tutorials require a password for access. You may not share private tutorial links or passwords without the author&apos;s permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mb-3">7. Purchases and Payments</h2>
            <p className="mb-3">If a tutorial requires payment:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>All prices are listed in US dollars unless otherwise specified</li>
              <li>Payments are processed securely through our payment provider</li>
              <li>You agree to pay the full amount for any tutorial you &quot;purchase&quot;</li>
              <li>Refunds are subject to our refund policy — contact support if you have issues with a purchase</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mb-3">8. Intellectual Property</h2>
            <p>
              The stephud name, logo, and all related trademarks are property of stephud. You may not use our branding without permission. Other users&apos; tutorials are their intellectual property — do not copy, redistribute, or claim them as your own.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mb-3">9. Privacy</h2>
            <p>
              Your privacy is important to us. Please review our <Link href="/privacy" className="text-[var(--accent)] hover:underline">Privacy Policy</Link> to understand how we collect, use, and protect your personal information. By using stephud, you consent to our data practices as described in the Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mb-3">10. Account Suspension and Termination</h2>
            <p className="mb-3">We reserve the right to suspend or terminate your account if you:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Violate these Terms of Service</li>
              <li>Violate our Content Guidelines</li>
              <li>Engage in illegal or harmful activities</li>
              <li>Harass, abuse, or threaten other users</li>
              <li>Attempt to hack, exploit, or damage the platform</li>
              <li>Create multiple accounts to circumvent restrictions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mb-3">11. Disclaimer of Warranties</h2>
            <p>
              stephud is provided &quot;as is&quot; without warranties of any kind. We do not guarantee that the platform will be uninterrupted, secure, or error-free. The information in tutorials is provided by users — we do not endorse or verify the accuracy of any tutorial. Use your own judgment and follow safety guidelines when attempting any tutorial.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mb-3">12. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, stephud and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform, any tutorial, or any purchase made through the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mb-3">13. Modifications to Terms</h2>
            <p>
              We may update these Terms from time to time. We will notify you of significant changes by posting a notice on the platform or sending an email. Continued use of stephud after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mb-3">14. Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--text)] mb-3">15. Contact Us</h2>
            <p className="mb-2">
              If you have any questions about these Terms, please reach out through our{" "}
              <Link href="/support" className="text-[var(--accent)] hover:underline">
                support ticket system
              </Link>
              . This is the fastest way to get help — we typically respond within 24 hours.
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              You can also email us at{" "}
              <a href="mailto:support@stephud.com" className="text-[var(--accent)] hover:underline">
                support@stephud.com
              </a>
              , but tickets are processed more quickly.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
