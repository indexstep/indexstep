"use client";

import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", label, error, id, options, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={`
            w-full px-4 py-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text)]
            focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent
            transition-all duration-150 cursor-pointer
            ${error ? "border-[var(--red)] focus:ring-[var(--red)]" : ""}
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1.5 text-sm text-[var(--red)]">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
