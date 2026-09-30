"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthCard, FormError } from "@/components/auth/AuthCard";
import { PasswordField } from "@/components/auth/PasswordField";
import authApi from "@/lib/api/client/authApi";
import { getApiErrorMessage } from "@/lib/apiErrorMessage";
import {
  buttonGhost,
  buttonPrimary,
  buttonSecondary,
  fieldInput,
  fieldLabel,
} from "@/components/studio/styles";

const USERNAME_PATTERN = /^[a-z0-9._-]{3,30}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IMAGE_TYPES = "image/jpeg,image/png,image/webp";

type Availability = "idle" | "checking" | "available" | "taken" | "invalid";

// object URL for a picked image, revoked when it changes or the component unmounts
function usePreview(file: File | null) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url]
  );
  return url;
}

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading, login } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // the result of the last availability check, for the exact username it was made for
  const [checked, setChecked] = useState<{
    handle: string;
    result: "available" | "taken" | "error";
  } | null>(null);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const avatarPreview = usePreview(avatar);
  const coverPreview = usePreview(cover);

  const handle = userName.trim().toLowerCase();

  useEffect(() => {
    if (!loading && user && !isSubmitting) router.replace("/");
  }, [loading, user, isSubmitting, router]);

  // live availability check, debounced while typing
  useEffect(() => {
    if (!USERNAME_PATTERN.test(handle)) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const { data } = await authApi.checkUserName(handle);
        if (!cancelled)
          setChecked({
            handle,
            result: data.data.available ? "available" : "taken",
          });
      } catch {
        // the server check at submit still catches a clash
        if (!cancelled) setChecked({ handle, result: "error" });
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [handle]);

  const userNameStatus: Availability = !handle
    ? "idle"
    : !USERNAME_PATTERN.test(handle)
      ? "invalid"
      : checked?.handle !== handle
        ? "checking"
        : checked.result === "error"
          ? "idle"
          : checked.result;

  const goToStep2 = (event: React.FormEvent) => {
    event.preventDefault();
    if (!fullName.trim()) return setError("Enter your name.");
    if (userNameStatus === "invalid")
      return setError(
        "Usernames are 3–30 characters: letters, numbers, dots, dashes and underscores."
      );
    if (userNameStatus === "taken")
      return setError("That username is taken. Try another one.");
    if (!EMAIL_PATTERN.test(email.trim()))
      return setError("Enter a valid email address.");
    if (password.length < 8)
      return setError("Use at least 8 characters for your password.");
    setError(null);
    setStep(2);
  };

  const createAccount = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!avatar) return setError("Choose an avatar for your channel.");
    setError(null);
    setIsSubmitting(true);
    const form = new FormData();
    form.append("fullName", fullName.trim());
    form.append("userName", handle);
    form.append("email", email.trim());
    form.append("password", password);
    form.append("avatar", avatar);
    if (cover) form.append("cover", cover);
    try {
      await authApi.register(form);
    } catch (err: unknown) {
      setError(
        getApiErrorMessage(err, "Couldn't create your account. Try again.")
      );
      setIsSubmitting(false);
      return;
    }
    // signed in straight away: no detour through the login form
    try {
      await login(handle, password);
      toast.success("Welcome to VidVerse", {
        description: `We sent a link to ${email.trim()} to confirm your email.`,
      });
      router.replace("/");
    } catch {
      router.replace("/auth/login");
    }
  };

  return (
    <AuthCard
      title="Create your account"
      description={<span aria-live="polite">Step {step} of 2</span>}
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-brand-fg hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      {step === 1 ? (
        <form onSubmit={goToStep2} className="space-y-4" noValidate>
          <div>
            <label htmlFor="fullName" className={fieldLabel}>
              Name
            </label>
            <input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              autoFocus
              maxLength={80}
              className={`${fieldInput} h-10`}
            />
          </div>
          <div>
            <label htmlFor="userName" className={fieldLabel}>
              Username
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-fg-tertiary">
                @
              </span>
              <input
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={30}
                aria-describedby="userName-hint"
                className={`${fieldInput} h-10 pl-7 pr-9`}
              />
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2"
                aria-hidden
              >
                {userNameStatus === "checking" && (
                  <Loader2 className="h-4 w-4 animate-spin text-fg-tertiary" />
                )}
                {userNameStatus === "available" && (
                  <Check className="h-4 w-4 text-success" />
                )}
                {userNameStatus === "taken" && (
                  <X className="h-4 w-4 text-danger" />
                )}
              </span>
            </div>
            <p
              id="userName-hint"
              aria-live="polite"
              className={`mt-1 text-xs ${userNameStatus === "taken" || userNameStatus === "invalid" ? "text-danger" : "text-fg-tertiary"}`}
            >
              {userNameStatus === "taken"
                ? `@${handle} is taken.`
                : userNameStatus === "available"
                  ? `@${handle} is available.`
                  : "Letters, numbers, dots, dashes and underscores (3–30)."}
            </p>
          </div>
          <div>
            <label htmlFor="email" className={fieldLabel}>
              Email
            </label>
            <input
              id="email"
              type="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className={`${fieldInput} h-10`}
            />
          </div>
          <PasswordField
            id="password"
            label="Password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            showStrength
          />
          <FormError message={error} />
          <button type="submit" className={`${buttonPrimary} h-10 w-full`}>
            Continue
          </button>
        </form>
      ) : (
        <form onSubmit={createAccount} className="space-y-5" noValidate>
          <div className="flex items-center gap-4">
            <label
              htmlFor="avatar"
              className="relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-line-strong bg-elevated text-fg-tertiary hover:text-fg"
            >
              {avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element -- local object url preview
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImagePlus className="h-6 w-6" aria-hidden />
              )}
            </label>
            <div className="min-w-0">
              <p className="text-sm font-medium text-fg">Avatar</p>
              <p className="text-xs text-fg-tertiary">
                A square image works best. Required.
              </p>
              <label
                htmlFor="avatar"
                className={`${buttonGhost} mt-1 -ml-2.5 cursor-pointer`}
              >
                {avatar ? "Change" : "Choose image"}
              </label>
              <input
                id="avatar"
                type="file"
                accept={IMAGE_TYPES}
                className="sr-only"
                onChange={(e) => setAvatar(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <p className={fieldLabel}>
                Cover image{" "}
                <span className="font-normal text-fg-tertiary">(optional)</span>
              </p>
              {cover && (
                <button
                  type="button"
                  onClick={() => setCover(null)}
                  className="text-xs font-medium text-fg-secondary hover:text-fg"
                >
                  Remove
                </button>
              )}
            </div>
            <label
              htmlFor="cover"
              className="relative flex aspect-[4/1] cursor-pointer items-center justify-center overflow-hidden rounded-md border border-dashed border-line-strong bg-elevated text-sm text-fg-tertiary hover:text-fg"
            >
              {coverPreview ? (
                // eslint-disable-next-line @next/next/no-img-element -- local object url preview
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                "Add a wide banner. You can do this later in settings."
              )}
            </label>
            <input
              id="cover"
              type="file"
              accept={IMAGE_TYPES}
              className="sr-only"
              onChange={(e) => setCover(e.target.files?.[0] ?? null)}
            />
          </div>

          <FormError message={error} />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setStep(1);
              }}
              disabled={isSubmitting}
              className={buttonSecondary}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`${buttonPrimary} h-9 flex-1`}
            >
              {isSubmitting
                ? "Creating account..."
                : cover
                  ? "Create account"
                  : "Skip cover and create account"}
            </button>
          </div>
        </form>
      )}
    </AuthCard>
  );
}
