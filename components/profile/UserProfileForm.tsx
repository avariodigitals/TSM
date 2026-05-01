"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAdminToast } from "@/components/admin/AdminClientHelpers";

type User = {
  id: string;
  fullName: string;
  email: string;
  profilePicture: string | null;
  pendingEmail: string | null;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export default function UserProfileForm({ user }: { user: User }) {
  const router = useRouter();
  const { toast, showToast } = useAdminToast();
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(user.profilePicture || "");

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      showToast("Please enter and confirm your new password.", "error");
      return;
    }

    if (newPassword.length < 8) {
      showToast("Password must be at least 8 characters long.", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        showToast(error.message || "Failed to update password.", "error");
        return;
      }

      showToast("Password updated successfully. Please log in again.", "success");
      setNewPassword("");
      setConfirmPassword("");
      
      // Redirect to login after password change
      setTimeout(() => {
        router.push("/auth/admin-login");
      }, 2000);
    } catch (error) {
      showToast("An error occurred while updating your password.", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEmail) {
      showToast("Please enter a new email address.", "error");
      return;
    }

    if (newEmail === user.email) {
      showToast("This is already your current email address.", "error");
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch("/api/profile/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail }),
      });

      if (!response.ok) {
        const error = await response.json();
        showToast(error.message || "Failed to request email change.", "error");
        return;
      }

      showToast("Email change request submitted. Your administrator will review and approve it.", "success");
      setNewEmail("");
      router.refresh();
    } catch (error) {
      showToast("An error occurred while submitting your email change request.", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProfilePictureUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profilePicture) {
      showToast("Please select a profile picture.", "error");
      return;
    }

    setIsUpdating(true);

    const formData = new FormData();
    formData.append("profilePicture", profilePicture);

    try {
      const response = await fetch("/api/profile/picture", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        showToast(error.message || "Failed to upload profile picture.", "error");
        return;
      }

      showToast("Profile picture updated successfully.", "success");
      setProfilePicture(null);
      router.refresh();
    } catch (error) {
      showToast("An error occurred while uploading your profile picture.", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Profile Picture Section */}
      <div className="border-b border-gray-200 pb-8">
        <h2 className="text-xl font-bold text-[#231F20] mb-4">Profile Picture</h2>
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Profile picture"
                width={128}
                height={128}
                className="w-32 h-32 rounded-full object-cover border-2 border-[#00AEEF]"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                <span className="text-gray-400 text-sm">No picture</span>
              </div>
            )}
          </div>
          <form onSubmit={handleProfilePictureUpload} className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#00AEEF] file:text-white hover:file:bg-[#0089b3]"
            />
            <p className="text-xs text-gray-500 mt-2">JPG, PNG or WebP. Max 5MB.</p>
            {profilePicture && (
              <button
                type="submit"
                disabled={isUpdating}
                className="mt-4 rounded-lg bg-[#00AEEF] text-white px-4 py-2 font-semibold disabled:opacity-50"
              >
                {isUpdating ? "Uploading..." : "Upload Picture"}
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Password Change Section */}
      <div className="border-b border-gray-200 pb-8">
        <h2 className="text-xl font-bold text-[#231F20] mb-4">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              placeholder="Enter new password"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#00AEEF] focus:outline-none focus:ring-1 focus:ring-[#00AEEF]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              placeholder="Confirm new password"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#00AEEF] focus:outline-none focus:ring-1 focus:ring-[#00AEEF]"
            />
          </div>
          <p className="text-xs text-gray-500">Password must be at least 8 characters long.</p>
          <button
            type="submit"
            disabled={isUpdating}
            className="rounded-lg bg-[#00AEEF] text-white px-4 py-2 font-semibold disabled:opacity-50"
          >
            {isUpdating ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* Email Change Section */}
      <div className="pb-8">
        <h2 className="text-xl font-bold text-[#231F20] mb-4">Change Email Address</h2>
        <div className="max-w-sm">
          <p className="text-sm text-gray-600 mb-4">Current email: <span className="font-semibold">{user.email}</span></p>
          {user.pendingEmail && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Pending approval:</span> {user.pendingEmail}
              </p>
              <p className="text-xs text-blue-700 mt-1">Your administrator will review this request.</p>
            </div>
          )}
          <form onSubmit={handleEmailChange} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">New Email Address</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email address"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#00AEEF] focus:outline-none focus:ring-1 focus:ring-[#00AEEF]"
              />
            </div>
            <p className="text-xs text-gray-500">Email changes require administrator approval.</p>
            <button
              type="submit"
              disabled={isUpdating}
              className="rounded-lg bg-[#2E3192] text-white px-4 py-2 font-semibold disabled:opacity-50"
            >
              {isUpdating ? "Submitting..." : "Request Email Change"}
            </button>
          </form>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Account Information</h3>
        <div className="space-y-2 text-sm">
          <p className="text-gray-600">
            <span className="font-semibold">Name:</span> {user.fullName}
          </p>
          <p className="text-gray-600">
            <span className="font-semibold">Role:</span> {user.role}
          </p>
          <p className="text-gray-600">
            <span className="font-semibold">Status:</span> {user.isActive ? "Active" : "Inactive"}
          </p>
          <p className="text-gray-600">
            <span className="font-semibold">Member since:</span> {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
