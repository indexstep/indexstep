"use client";

import { useEffect, useState } from "react";

interface LoadingScreenProps {
  onComplete?: () => void;
  minDuration?: number;
}

export default function LoadingScreen({ onComplete, minDuration = 1500 }: LoadingScreenProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        onComplete?.();
      }, 400); // fade-out duration
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration, onComplete]);

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes logoBounce {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes dotBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .logo-bounce {
          animation: logoBounce 1.2s ease-in-out infinite;
        }
        .dot-bounce {
          animation: dotBounce 0.8s ease-in-out infinite;
        }
      `}</style>

      <div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
        style={{ backgroundColor: "var(--bg)" }}
      >
        <img
          src="/images/logo.png"
          alt="stephud"
          className="w-24 h-24 object-contain logo-bounce mb-8"
        />

        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full dot-bounce"
            style={{ backgroundColor: "var(--accent)", animationDelay: "0ms" }}
          />
          <div
            className="w-2 h-2 rounded-full dot-bounce"
            style={{ backgroundColor: "var(--accent)", animationDelay: "150ms" }}
          />
          <div
            className="w-2 h-2 rounded-full dot-bounce"
            style={{ backgroundColor: "var(--accent)", animationDelay: "300ms" }}
          />
        </div>
      </div>
    </>
  );
}
