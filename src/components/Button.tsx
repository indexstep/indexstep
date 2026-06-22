"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0f0f14] disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary: "bg-[var(--accent)] text-[#0f0f14] hover:bg-[var(--accent-hover)] focus:ring-[var(--accent)] btn-glow",
      secondary: "bg-[var(--bg-highlight)] text-[var(--text)] hover:bg-[#3a3a4d] border border-[var(--border-light)] focus:ring-[var(--accent)]",
      ghost: "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text)] focus:ring-[var(--accent)]",
      danger: "bg-[var(--red)] text-[var(--text)] hover:bg-[#ff8088] focus:ring-[var(--red)]",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
