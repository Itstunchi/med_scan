import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../lib/auth.jsx";
import { supabase } from "../../../lib/supabase.js";

function Icon({ path, className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={path} />
    </svg>
  );
}

const icons = {
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z",
  lock: "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2Z M7 11V7a5 5 0 0 1 10 0v4",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z",
  camera: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  trash: "M3 6h18 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14Z",
  alert: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z M12 9v4 M12 17h.01",
  arrowLeft: "M19 12H5 M12 19l-7-7 7-7",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z",
  check: "M20 6 9 17l-5-5",
};

const avatarOptions = [
  {
    id: "ai_avatar_male",
    url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663542132467/PHwbEaQKThFLMYdU.png",
  },
  {
    id: "ai_avatar_female",
    url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663542132467/YRioBJESWwIhOPvo.png",
  },
  {
    id: "avatar1",
    url: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop",
  },
  {
    id: "avatar2",
    url: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop",
  },
  {
    id: "avatar3",
    url: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop",
  },
  {
    id: "avatar4",
    url: "https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop",
  },
  {
    id: "avatar5",
    url: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop",
  },
  {
    id: "avatar6",
    url: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop",
  },
  {
    id: "avatar7",
    url: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop",
  },
  {
    id: "avatar8",
    url: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop",
  },
  {
    id: "avatar9",
    url: "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop",
  },
  {
    id: "avatar10",
    url: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop",
  },
  {
    id: "avatar11",
    url: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop",
  },
  {
    id: "avatar12",
    url: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop",
  },
];

function Card({ children, className = "" }) {
  return (
    <div className={`bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
        <Icon path={icons[icon]} className="w-[18px] h-[18px]" />
      </div>
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function formatMemberSince(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function Settings() {
  const { user, profile, refreshProfile, signOut } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState("ai_avatar_male");
  const [savingAccount, setSavingAccount] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [accountMessage, setAccountMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    if (profile?.full_name) setFullName(profile.full_name);
    if (profile?.avatar_id) setSelectedAvatar(profile.avatar_id);
    if (user?.email) setEmail(user.email);
    setImgError(false);
  }, [profile, user]);

  const nameUnchanged = fullName === (profile?.full_name || "");
  const avatarUnchanged = selectedAvatar === (profile?.avatar_id || "ai_avatar_male");
  const canSaveAccount = !nameUnchanged || !avatarUnchanged || !!photoPreview;

  const handleChangePhotoClick = () => setShowAvatarPicker(true);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
      setImgError(false);
    }
  };

  const handleSelectAvatar = (id) => {
    setSelectedAvatar(id);
    setPhotoPreview(null);
    setImgError(false);
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      setAccountMessage("Failed to save: You must be signed in.");
      return;
    }

    setAccountMessage("");
    setSavingAccount(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          avatar_id: selectedAvatar,
        })
        .eq("id", user.id);

      if (error) throw error;

      if (refreshProfile) await refreshProfile();
      setAccountMessage("Profile updated successfully.");
      setShowAvatarPicker(false);
    } catch (err) {
      setAccountMessage("Failed to save: " + (err?.message || "Unknown error"));
    } finally {
      setSavingAccount(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage("");

    if (newPassword.length < 8) {
      setPasswordMessage("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage("New password and confirmation don't match.");
      return;
    }

    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPasswordMessage("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordMessage("Failed to update password: " + (err?.message || "Unknown error"));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (signOut) await signOut();
    setShowDeleteConfirm(false);
  };

  const currentAvatar =
    avatarOptions.find((a) => a.id === selectedAvatar) || avatarOptions[0];

  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : email
      ? email[0].toUpperCase()
      : "?";

  const memberSince = formatMemberSince(user?.created_at);
  const role = profile?.role || "patient";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-teal-700 transition-colors mb-6"
      >
        <Icon path={icons.arrowLeft} className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Account settings
          </h1>
          <p className="text-sm text-slate-500 mt-1.5">
            Manage your profile, security, and preferences.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 border border-teal-100 px-3 py-1 text-xs font-semibold capitalize text-teal-700">
            <Icon path={icons.shield} className="w-3.5 h-3.5" />
            {role}
          </span>
          {memberSince && (
            <span className="text-xs text-slate-400">Member since {memberSince}</span>
          )}
        </div>
      </div>

      <div className="space-y-5">
        {/* Profile card */}
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="relative shrink-0">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile"
                  className="w-20 h-20 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm"
                />
              ) : (
                <div className="relative w-20 h-20 rounded-2xl bg-teal-50 ring-2 ring-slate-100 shadow-sm overflow-hidden">
                  {!imgError && currentAvatar?.url ? (
                    <img
                      src={currentAvatar.url}
                      alt="Profile avatar"
                      className="w-full h-full object-cover"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-teal-700">
                      {initials}
                    </div>
                  )}
                </div>
              )}
              <button
                type="button"
                onClick={handleChangePhotoClick}
                className="absolute -bottom-1.5 -right-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-teal-700 text-white shadow-md hover:bg-teal-800 transition"
                aria-label="Change avatar"
              >
                <Icon path={icons.camera} className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold text-slate-900 truncate">
                {fullName || "Your name"}
              </p>
              <p className="text-sm text-slate-500 truncate mt-0.5">{email || "No email"}</p>
              <button
                type="button"
                onClick={handleChangePhotoClick}
                className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-teal-700 hover:text-teal-800 transition"
              >
                <Icon path={icons.camera} className="w-4 h-4" />
                Change avatar
              </button>
            </div>
          </div>

          {showAvatarPicker && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-sm font-medium text-slate-700 mb-1">Choose a professional avatar</p>
              <p className="text-xs text-slate-500 mb-4">Select a portrait or upload your own photo.</p>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {avatarOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectAvatar(opt.id)}
                    className={`relative aspect-square overflow-hidden rounded-xl bg-slate-100 transition-all ${
                      selectedAvatar === opt.id
                        ? "ring-2 ring-offset-2 ring-teal-600 scale-105 shadow-md"
                        : "hover:scale-105 hover:shadow-sm ring-1 ring-slate-200"
                    }`}
                  >
                    <img
                      src={opt.url}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    {selectedAvatar === opt.id && (
                      <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-white shadow">
                        <Icon path={icons.check} className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 underline underline-offset-2"
                >
                  Or upload a custom photo
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(false)}
                  className="ml-auto text-sm font-medium text-slate-500 hover:text-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* Personal information */}
        <Card>
          <CardHeader
            icon="edit"
            title="Personal information"
            subtitle="Update your display name. Email is managed by authentication."
          />

          {accountMessage && (
            <div
              className={`mb-5 rounded-xl px-4 py-3 text-sm font-medium ${
                accountMessage.startsWith("Failed")
                  ? "bg-red-50 text-red-700 border border-red-100"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-100"
              }`}
            >
              {accountMessage}
            </div>
          )}

          <form onSubmit={handleSaveAccount} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
                  Full name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/25 focus:border-teal-600 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                />
                <p className="mt-1.5 text-xs text-slate-400">
                  Contact support to change your email.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingAccount || !canSaveAccount}
              className="inline-flex items-center justify-center rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600/40 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {savingAccount ? "Saving…" : "Save changes"}
            </button>
          </form>
        </Card>

        {/* Password */}
        <Card>
          <CardHeader
            icon="lock"
            title="Password"
            subtitle="Use a strong password with at least 8 characters."
          />

          {passwordMessage && (
            <div
              className={`mb-5 rounded-xl px-4 py-3 text-sm font-medium ${
                passwordMessage.startsWith("Failed") ||
                passwordMessage.includes("match") ||
                passwordMessage.includes("least")
                  ? "bg-red-50 text-red-700 border border-red-100"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-100"
              }`}
            >
              {passwordMessage}
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
                  Current password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600/25 focus:border-teal-600 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
                  New password
                </label>
                <input
                  type="password"
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600/25 focus:border-teal-600 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
                  Confirm password
                </label>
                <input
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600/25 focus:border-teal-600 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="inline-flex items-center justify-center rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600/40 disabled:opacity-60 transition"
            >
              {savingPassword ? "Updating…" : "Update password"}
            </button>
          </form>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader
            icon="settings"
            title="Preferences"
            subtitle="Security and notification options."
          />
          <div className="divide-y divide-slate-100">
            <div className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Two-factor authentication</p>
                <p className="text-xs text-slate-500 mt-0.5">Add an extra layer of security to your account</p>
              </div>
              <button
                type="button"
                className="w-full sm:w-auto rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Enable
              </button>
            </div>
            <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Email notifications</p>
                <p className="text-xs text-slate-500 mt-0.5">Report updates and health tips</p>
              </div>
              <button
                type="button"
                className="w-full sm:w-auto rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Manage
              </button>
            </div>
            <div className="flex flex-col gap-3 py-4 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Download your data</p>
                <p className="text-xs text-slate-500 mt-0.5">Export reports and account information</p>
              </div>
              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                <Icon path={icons.download} className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* Danger zone – always at the bottom */}
      <div className="mt-10 pt-8 border-t border-slate-200">
        <div className="rounded-2xl border border-red-200 bg-red-50/70 p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-700">
              <Icon path={icons.alert} className="w-[18px] h-[18px]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-red-900">Danger zone</h2>
              <p className="text-xs text-red-700/80">Irreversible actions</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-red-900">Delete account</p>
            <p className="text-xs text-red-700/80 mt-1.5 leading-relaxed max-w-lg">
              Permanently remove your account and all associated health data. This action cannot be undone.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-red-200/60">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition"
            >
              <Icon path={icons.trash} className="w-4 h-4" />
              Delete account
            </button>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
              <Icon path={icons.alert} className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Delete your account?</h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              This will permanently delete your account and all associated health data. This action cannot be undone.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition"
              >
                Yes, delete account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}