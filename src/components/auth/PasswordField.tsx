"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

// rough strength from length and character variety; a hint for the user, not a rule (the API only needs 8+)
export function passwordStrength(password: string): {
  score: 0 | 1 | 2 | 3;
  label: string;
} {
  if (password.length < 8) return { score: 0, label: "At least 8 characters" };
  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((pattern) =>
    pattern.test(password)
  ).length;
  if (password.length >= 12 && variety >= 3)
    return { score: 3, label: "Strong" };
  if (password.length >= 10 || variety >= 3) return { score: 2, label: "Good" };
  return { score: 1, label: "Weak: add length, numbers or symbols" };
}

const BAR_COLOURS = [
  "bg-line-strong",
  "bg-danger",
  "bg-warning",
  "bg-success",
] as const;

export function PasswordField({
  id: idProp,
  label,
  value,
  onChange,
  autoComplete,
  showStrength = false,
  labelAction,
  autoFocus,
}: {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  showStrength?: boolean;
  // e.g. a "Forgot password?" link, aligned right on the label row
  labelAction?: React.ReactNode;
  autoFocus?: boolean;
}) {
  const fallbackId = useId();
  const id = idProp ?? fallbackId;
  const [visible, setVisible] = useState(false);
  const strength = passwordStrength(value);

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-medium text-fg-secondary">
          {label}
        </label>
        {labelAction}
      </div>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className="pr-10"
          aria-describedby={showStrength ? `${id}-strength` : undefined}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="press absolute top-1 right-1 inline-flex size-8 items-center justify-center rounded-full text-fg-tertiary hover:bg-hover hover:text-fg"
        >
          {visible ? (
            <EyeOff className="size-4" strokeWidth={1.75} aria-hidden />
          ) : (
            <Eye className="size-4" strokeWidth={1.75} aria-hidden />
          )}
        </button>
      </div>
      {showStrength && value && (
        <div id={`${id}-strength`} className="mt-2">
          <div className="flex gap-1" aria-hidden>
            {[1, 2, 3].map((step) => (
              <span
                key={step}
                className={`h-1 flex-1 rounded-full ${strength.score >= step ? BAR_COLOURS[strength.score] : "bg-line-default"}`}
              />
            ))}
          </div>
          <p className="mt-1 text-xs text-fg-tertiary">{strength.label}</p>
        </div>
      )}
    </div>
  );
}
