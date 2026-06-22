"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-4 py-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text)]
            placeholder:text-[var(--text-muted)]
            focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent
            transition-all duration-150
            ${error ? "border-[var(--red)] focus:ring-[var(--red)]" : ""}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-[var(--red)]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
