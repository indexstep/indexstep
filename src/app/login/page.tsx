"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [banReason, setBanReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      if (err instanceof Error && err.name === "BanError") {
        setError(err.message);
        setBanReason((err as Error & { banReason: string }).banReason);
      } else {
        setError(err instanceof Error ? err.message : "Login failed");
        setBanReason("");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--bg)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <img src="/images/logo.png" alt="stephud" className="w-24 h-24 object-contain" />
            <span className="text-2xl font-bold text-[var(--text)]">stephud</span>
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
          <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Welcome back</h1>
          <p className="text-[var(--text-secondary)] mb-6">Sign in to your account</p>

          {error && (
            <div className="mb-6 p-4 bg-[var(--red)]/10 border border-[var(--red)]/30 rounded-lg flex items-start gap-3 text-[var(--red)]">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">{error}</p>
                {banReason && (
                  <p className="text-sm mt-2 p-3 bg-[var(--red)]/10 border border-[var(--red)]/20 rounded-md text-[var(--red)]/90">
                    <span className="font-medium">Reason: </span>{banReason}
                  </p>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" pattern="^[\w.+-]+@[\w.-]+\.com$" title="Enter a valid email ending in .com" required />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
            <Button type="submit" className="w-full" loading={loading}>Sign In</Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[var(--accent)] hover:text-[var(--accent-hover)]">Sign up</Link>
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
