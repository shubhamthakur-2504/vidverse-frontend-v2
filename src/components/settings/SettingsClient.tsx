"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Camera, ImageIcon, UserRound } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth/AuthProvider";
import { PasswordField } from "@/components/auth/PasswordField";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import authApi from "@/lib/api/client/authApi";
import type { ChangeUserInfo } from "@/lib/types/authType";
import { getApiErrorMessage as getErrorMessage } from "@/lib/apiErrorMessage";
import { DevicesPanel } from "./DevicesPanel";
import { EmailPanel } from "./EmailPanel";

export type SettingsClientUser = {
  avatarUrl?: string;
  userName?: string;
  fullName?: string;
  email?: string;
  coverImageUrl?: string;
  _id?: string;
} | null;

export type SettingsTab = "profile" | "assets" | "security";

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg bg-surface p-5 inset-ring inset-ring-line">
      <h2 className="text-base font-semibold tracking-tight text-fg">
        {title}
      </h2>
      <p className="mt-0.5 text-sm text-fg-secondary">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** A file picker that shows what was chosen, and lets it be undone. */
function ImagePicker({
  label,
  hint,
  aspect,
  preview,
  file,
  onPick,
  icon: Icon,
}: {
  label: string;
  hint: string;
  aspect: string;
  preview: string;
  file: File | null;
  onPick: (file: File | null) => void;
  icon: typeof UserRound;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-fg-secondary">{label}</p>
      <label
        className={`group relative block w-full cursor-pointer overflow-hidden rounded-md border border-dashed border-line-default bg-bg transition-colors duration-120 ease-out hover:border-line-strong ${aspect}`}
      >
        {preview ? (
          <Image
            src={preview}
            alt=""
            fill
            sizes="360px"
            className="object-cover"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-fg-tertiary">
            <Icon className="size-8" strokeWidth={1.75} aria-hidden />
          </span>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-medium text-white opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-within:opacity-100">
          Choose a file
        </span>
        <input
          type="file"
          accept="image/*"
          aria-label={label}
          className="sr-only"
          onChange={(event) => onPick(event.target.files?.[0] ?? null)}
        />
      </label>
      <div className="flex items-center justify-between gap-2 text-xs text-fg-tertiary">
        <span className="truncate">{file ? file.name : hint}</span>
        {file && (
          <button
            type="button"
            onClick={() => onPick(null)}
            className="shrink-0 font-medium text-brand-fg hover:underline"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

export default function SettingsClient({
  user: serverUser,
  tab,
}: {
  user?: SettingsClientUser;
  tab: SettingsTab;
}) {
  const { user: authUser, refreshUser } = useAuth();
  const user = authUser ?? serverUser ?? null;

  const [userName, setUserName] = useState(user?.userName ?? "");
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [savingIdentity, setSavingIdentity] = useState(false);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [avatarObjectUrl, setAvatarObjectUrl] = useState("");
  const [coverObjectUrl, setCoverObjectUrl] = useState("");
  const [savingAssets, setSavingAssets] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // the signed-in user arrives after the first render, so seed the fields then
  useEffect(() => {
    setUserName(user?.userName ?? "");
    setFullName(user?.fullName ?? "");
  }, [user?.userName, user?.fullName]);

  useEffect(() => {
    if (!avatarFile) return setAvatarObjectUrl("");
    const url = URL.createObjectURL(avatarFile);
    setAvatarObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  useEffect(() => {
    if (!coverFile) return setCoverObjectUrl("");
    const url = URL.createObjectURL(coverFile);
    setCoverObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [coverFile]);

  const avatarPreview = avatarObjectUrl || user?.avatarUrl || "";
  const coverPreview = coverObjectUrl || user?.coverImageUrl || "";

  const identityDirty =
    userName.trim() !== (user?.userName ?? "") ||
    fullName.trim() !== (user?.fullName ?? "");
  const assetsDirty = Boolean(avatarFile || coverFile);
  const passwordDirty = Boolean(currentPassword && newPassword);

  const saveIdentity = async () => {
    const updates: ChangeUserInfo[] = [];
    if (userName.trim() && userName.trim() !== user?.userName)
      updates.push({ userName: userName.trim() });
    if (fullName.trim() && fullName.trim() !== user?.fullName)
      updates.push({ fullName: fullName.trim() });
    if (updates.length === 0) return;

    setSavingIdentity(true);
    try {
      for (const payload of updates) await authApi.changeUserInfo(payload);
      await refreshUser();
      toast.success("Profile saved");
    } catch (error: unknown) {
      toast.error("Couldn't save your profile", {
        description: getErrorMessage(error),
      });
    } finally {
      setSavingIdentity(false);
    }
  };

  const saveAssets = async () => {
    if (!assetsDirty) return;
    setSavingAssets(true);
    try {
      if (avatarFile) {
        const form = new FormData();
        form.append("avatar", avatarFile);
        await authApi.changeAvatar(form);
      }
      if (coverFile) {
        const form = new FormData();
        form.append("cover", coverFile);
        await authApi.changeCover(form);
      }
      setAvatarFile(null);
      setCoverFile(null);
      await refreshUser();
      toast.success("Images updated");
    } catch (error: unknown) {
      toast.error("Couldn't update your images", {
        description: getErrorMessage(error),
      });
    } finally {
      setSavingAssets(false);
    }
  };

  const savePassword = async () => {
    if (!passwordDirty) return;
    setSavingPassword(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      toast.success("Password updated");
    } catch (error: unknown) {
      toast.error("Couldn't change your password", {
        description: getErrorMessage(error),
      });
    } finally {
      setSavingPassword(false);
    }
  };

  if (tab === "assets") {
    return (
      <Panel
        title="Channel images"
        description="Your avatar and the banner across the top of your channel."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <ImagePicker
            label="Avatar"
            hint="A square image works best"
            aspect="aspect-square"
            preview={avatarPreview}
            file={avatarFile}
            onPick={setAvatarFile}
            icon={UserRound}
          />
          <ImagePicker
            label="Cover image"
            hint="A wide banner works best"
            aspect="aspect-video"
            preview={coverPreview}
            file={coverFile}
            onPick={setCoverFile}
            icon={ImageIcon}
          />
        </div>
        <div className="mt-5 flex justify-end">
          <Button
            onClick={saveAssets}
            loading={savingAssets}
            disabled={!assetsDirty}
          >
            <Camera strokeWidth={1.75} aria-hidden />
            Save images
          </Button>
        </div>
      </Panel>
    );
  }

  if (tab === "security") {
    return (
      <div className="space-y-6">
        <Panel
          title="Password"
          description="Changing it signs you out everywhere else."
        >
          <div className="max-w-md space-y-4">
            <PasswordField
              label="Current password"
              value={currentPassword}
              onChange={setCurrentPassword}
              autoComplete="current-password"
            />
            <PasswordField
              label="New password"
              value={newPassword}
              onChange={setNewPassword}
              autoComplete="new-password"
              showStrength
            />
            <Button
              onClick={savePassword}
              loading={savingPassword}
              disabled={!passwordDirty}
            >
              Update password
            </Button>
          </div>
        </Panel>
        <EmailPanel />
        <DevicesPanel />
      </div>
    );
  }

  return (
    <Panel
      title="Profile"
      description="How your channel is named across VidVerse."
    >
      <div className="grid max-w-xl gap-4 sm:grid-cols-2">
        <Field label="Username">
          {(props) => (
            <Input
              {...props}
              value={userName}
              onChange={(event) => setUserName(event.target.value)}
              autoComplete="username"
              placeholder="username"
            />
          )}
        </Field>
        <Field label="Display name">
          {(props) => (
            <Input
              {...props}
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              autoComplete="name"
              placeholder="Your name"
            />
          )}
        </Field>
      </div>
      <div className="mt-5 flex justify-end">
        <Button
          onClick={saveIdentity}
          loading={savingIdentity}
          disabled={!identityDirty}
        >
          Save changes
        </Button>
      </div>
    </Panel>
  );
}
