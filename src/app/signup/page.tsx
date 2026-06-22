"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { AlertCircle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!agreedToTerms) {
      setError("You must agree to the Terms of Service to create an account.");
      return;
    }
    setLoading(true);
    try {
      await signup(email, password, name, agreedToTerms);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--bg)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <img src="/images/logo.png" alt="indexstep" className="w-24 h-24 object-contain" />
            <span className="text-2xl font-bold text-[var(--text)]">indexstep</span>
          </Link>
          <div className="mt-3">
            <span 
              className="inline-block rounded font-bold uppercase"
              style={{ 
                fontFamily: "'Press Start 2P', monospace",
                backgroundColor: "var(--orange)",
                color: "#0f0f14",
                fontSize: "8px",
                padding: "3px 8px",
                letterSpacing: "0.5px",
                lineHeight: "1",
              }}
            >
              BETA
            </span>
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-8">
          <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Create account</h1>
          <p className="text-[var(--text-secondary)] mb-6">Start creating guides today</p>

          {error && (
            <div className="mb-6 p-4 bg-[var(--red)]/10 border border-[var(--red)]/30 rounded-lg flex items-center gap-3 text-[var(--red)]">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" pattern="^[\w.+-]+@[\w.-]+\.com$" title="Enter a valid email ending in .com" required />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" minLength={6} required />

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--accent)] focus:ring-[var(--accent)] focus:ring-offset-[#0f0f14]"
              />
              <span className="text-sm text-[var(--text-secondary)] leading-relaxed">
                I agree to the{" "}
                <Link href="/terms" className="text-[var(--accent)] hover:underline" target="_blank">Terms of Service</Link>
                {", "}<Link href="/privacy" className="text-[var(--accent)] hover:underline" target="_blank">Privacy Policy</Link>
                , and the{" "}
                <Link href="/guidelines" className="text-[var(--accent)] hover:underline" target="_blank">Content Guidelines</Link>
                . I understand that all content I post must be safe, legal, and respectful.
              </span>
            </label>

            <Button type="submit" className="w-full" loading={loading} disabled={!agreedToTerms}>Create Account</Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            Already have an account?{" "}
            <Link href="/login" className="text-[var(--accent)] hover:text-[var(--accent-hover)]">Sign in</Link>
          </p>

          <div className="mt-6 pt-6 border-t border-[var(--border)] text-center text-xs text-[var(--text-muted)] space-x-4">
            <Link href="/support" className="hover:text-[var(--text-secondary)] transition-colors">Support</Link>
            <Link href="/terms" className="hover:text-[var(--text-secondary)] transition-colors">Terms</Link>
            <Link href="/guidelines" className="hover:text-[var(--text-secondary)] transition-colors">Guidelines</Link>
            <Link href="/privacy" className="hover:text-[var(--text-secondary)] transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
