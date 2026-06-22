"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ShoppingBag, ArrowRight } from "lucide-react";
import Button from "@/components/Button";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const tutorialId = searchParams.get("tutorialId");
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId || !tutorialId) {
      setStatus("error");
      setLoading(false);
      return;
    }

    // Verify the checkout session and create purchase
    fetch(`/api/tutorials/checkout?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      })
      .catch(() => {
        setStatus("error");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [sessionId, tutorialId]);

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {loading || status === "verifying" ? (
          <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-8">
            <div className="w-16 h-16 rounded-full bg-[var(--accent)]/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <ShoppingBag className="w-8 h-8 text-[var(--accent)]" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Verifying payment...</h1>
            <p className="text-[var(--text-secondary)]">Please wait while we confirm your purchase.</p>
          </div>
        ) : status === "success" ? (
          <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--accent)]/30 p-8">
            <div className="w-16 h-16 rounded-full bg-[#aad94c]/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-[#aad94c]" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Payment successful!</h1>
            <p className="text-[var(--text-secondary)] mb-6">Your guide has been unlocked. Enjoy!</p>
            {tutorialId && (
              <Link href={`/tutorial/${tutorialId}`}>
                <Button className="w-full flex items-center justify-center gap-2">
                  Go to Guide <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            )}
            <div className="mt-4">
              <Link href="/" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
                ← Back to home
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--red)]/30 p-8">
            <div className="w-16 h-16 rounded-full bg-[var(--red)]/20 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-[var(--red)]" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Something went wrong</h1>
            <p className="text-[var(--text-secondary)] mb-6">
              We couldn&apos;t verify your payment. If you were charged, please contact support.
            </p>
            {tutorialId && (
              <Link href={`/tutorial/${tutorialId}`}>
                <Button variant="secondary" className="w-full">Try again</Button>
              </Link>
            )}
            <div className="mt-4">
              <Link href="/" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
                ← Back to home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <p className="text-[var(--text-secondary)]">Loading...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
