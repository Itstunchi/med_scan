import { useState, useRef, useEffect } from "react";
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
};

function Card({ children, className = "" }) {
  return <div className={`bg-white border border-gray-200 rounded-xl p-6 ${className}`}>{children}</div>;
}

function CardHeader({ icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <span className="text-teal-700"><Icon path={icons[icon]} className="w-[18px] h-[18px]" /></span>
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
    </div>
  );
}

export default function Settings() {
  const { user, profile, refreshProfile, signOut } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [accountMessage, setAccountMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const fileInputRef = useRef(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    if (profile?.full_name) setFullName(profile.full_name);
    if (user?.email) setEmail(user.email);
  }, [profile, user]);

  const handleChangePhotoClick = () => {
    fileInputRef.current.click();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
      // TODO: upload file to Supabase Storage and save avatar_url to profiles table
    }
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    setAccountMessage("");
    setSavingAccount(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: user.id, full_name: fullName, email });
      if (error) throw error;
      await refreshProfile();
      setAccountMessage("Profile updated successfully.");
    } catch (err) {
      setAccountMessage("Failed to save: " + err.message);
    } finally {
      setSavingAccount(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage("");
    if (!newPassword || newPassword !== confirmPassword) {
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
      setPasswordMessage("Failed to update password: " + err.message);
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    // Note: full account deletion needs a server-side admin call (service role key)
    // which can't run safely in the browser. For now this signs the user out.
    // TODO: wire this to a Supabase Edge Function using the service role key.
    await signOut();
    setShowDeleteConfirm(false);
  };

  const initials = fullName
    ? fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : (email ? email[0].toUpperCase() : "?");

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Account settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your profile, security, and account preferences.</p>
      </div>

      <div className="space-y-5">
        <Card className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {photoPreview ? (
              <img src={photoPreview} alt="Profile" className="w-14 h-14 rounded-full object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-semibold text-base">
                {initials}
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900">{fullName || "Your name"}</p>
              <p className="text-sm text-gray-500">{email}</p>
            </div>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" style={{ display: "none" }} />
          <button onClick={handleChangePhotoClick} className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition">
            <Icon path={icons.camera} className="w-4 h-4" />
            Change photo
          </button>
        </Card>

        <Card>
          <CardHeader icon="edit" title="Edit account" />
          {accountMessage && (
            <div className={`mb-4 rounded-lg px-4 py-2.5 text-sm ${accountMessage.startsWith("Failed") ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
              {accountMessage}
            </div>
          )}
          <form onSubmit={handleSaveAccount} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Full name</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Email address</label>
                <input type="email" value={email} disabled className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-500 cursor-not-allowed" />
                <p className="mt-1 text-xs text-gray-400">Email changes require verification — contact support to update.</p>
              </div>
            </div>
            <button type="submit" disabled={savingAccount} className="bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition disabled:opacity-60">
              {savingAccount ? "Saving..." : "Save changes"}
            </button>
          </form>
        </Card>

        <Card>
          <CardHeader icon="lock" title="Edit password" />
          {passwordMessage && (
            <div className={`mb-4 rounded-lg px-4 py-2.5 text-sm ${passwordMessage.startsWith("Failed") || passwordMessage.includes("match") ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
              {passwordMessage}
            </div>
          )}
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Current password</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">New password</label>
                <input type="password" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Confirm password</label>
                <input type="password" placeholder="Repeat new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600" />
              </div>
            </div>
            <button type="submit" disabled={savingPassword} className="bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition disabled:opacity-60">
              {savingPassword ? "Updating..." : "Update password"}
            </button>
          </form>
        </Card>

        <Card>
          <CardHeader icon="settings" title="Manage account" />
          <div className="divide-y divide-gray-100">
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm text-gray-900">Two-factor authentication</p>
                <p className="text-xs text-gray-500 mt-0.5">Add an extra layer of security</p>
              </div>
              <button className="text-sm px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition">Enable</button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm text-gray-900">Email notifications</p>
                <p className="text-xs text-gray-500 mt-0.5">Report updates and health tips</p>
              </div>
              <button className="text-sm px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition">Manage</button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm text-gray-900">Download your data</p>
                <p className="text-xs text-gray-500 mt-0.5">Export reports and account info</p>
              </div>
              <button className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition">
                <Icon path={icons.download} className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </Card>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-red-700"><Icon path={icons.alert} className="w-[18px] h-[18px]" /></span>
            <h2 className="text-base font-semibold text-red-800">Danger zone</h2>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm font-semibold text-red-800">Delete account</p>
              <p className="text-xs text-red-700/80 mt-0.5">Permanently remove your account and all health data. This can't be undone.</p>
            </div>
            <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition">
              <Icon path={icons.trash} className="w-4 h-4" />
              Delete account
            </button>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete your account?</h3>
            <p className="text-sm text-gray-500 mb-6">This will permanently delete your account and all associated health data. This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="text-sm px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleDeleteAccount} className="text-sm px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition">Yes, delete account</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}