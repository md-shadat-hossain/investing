'use client'

import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { setUser } from '../store/slices/authSlice';
import {
  useGetMyProfileQuery,
  useUpdateProfileMutation,
  useUploadProfileImageMutation,
  useDeleteProfileImageMutation
} from '../store/api/userApi';
import { useChangePasswordMutation, useDeleteAccountMutation } from '../store/api/authApi';
import { Toast, ToastType } from './Toast';
import { Save, Lock, User, Upload, Trash2, Loader2, AlertTriangle } from 'lucide-react';

export default function SettingsNew() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'account'>('profile');
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // API hooks
  const { refetch } = useGetMyProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadProfileImageMutation();
  const [deleteImage, { isLoading: isDeleting }] = useDeleteProfileImageMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [deleteAccount, { isLoading: isDeletingAccount }] = useDeleteAccountMutation();

  // Form states
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [deleteForm, setDeleteForm] = useState({
    password: '',
    confirmation: '',
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Profile image URL from backend
  const profileImageUrl = user?.image
    ? `http://10.10.11.87:8080${user.image}`
    : null;

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setToast({ message: 'Please select an image file', type: 'error' });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setToast({ message: 'Image size must be less than 5MB', type: 'error' });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);

      handleImageUpload(file);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const result = await uploadImage(formData).unwrap();

      // Refetch to get fresh data with updated image
      const { data: updatedProfile } = await refetch();

      // Update user in Redux with fresh data from API
      if (updatedProfile?.data?.attributes?.user) {
        dispatch(setUser(updatedProfile.data.attributes.user));
      } else if (result?.data?.attributes?.user) {
        dispatch(setUser(result.data.attributes.user));
      }

      setToast({ message: 'Profile image updated successfully!', type: 'success' });
      setPreviewImage(null);
      refetch();
    } catch (error: any) {
      setToast({ message: error.data?.message || 'Failed to upload image', type: 'error' });
      setPreviewImage(null);
    }
  };

  const handleImageDelete = async () => {
    if (!confirm('Delete your profile image?')) return;

    try {
      await deleteImage().unwrap();

      // Refetch to get fresh data after deletion
      const { data: updatedProfile } = await refetch();

      // Update user in Redux with fresh data from API
      if (updatedProfile?.data?.attributes?.user) {
        dispatch(setUser(updatedProfile.data.attributes.user));
      }

      setToast({ message: 'Profile image deleted successfully!', type: 'success' });
    } catch (error: any) {
      setToast({ message: error.data?.message || 'Failed to delete image', type: 'error' });
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('firstName', profileForm.firstName);
      formData.append('lastName', profileForm.lastName);

      const result = await updateProfile(formData).unwrap();

      // Refetch profile to get latest data
      const { data: updatedProfile } = await refetch();

      // Update user in Redux with fresh data from API
      if (updatedProfile?.data?.attributes?.user) {
        dispatch(setUser(updatedProfile.data.attributes.user));
      } else if (result?.data?.attributes?.user) {
        dispatch(setUser(result.data.attributes.user));
      }

      setToast({ message: 'Profile updated successfully!', type: 'success' });
    } catch (error: any) {
      setToast({ message: error.data?.message || 'Failed to update profile', type: 'error' });
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setToast({ message: 'New passwords do not match', type: 'error' });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setToast({ message: 'Password must be at least 8 characters', type: 'error' });
      return;
    }

    try {
      await changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      }).unwrap();

      setToast({ message: 'Password changed successfully!', type: 'success' });
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setToast({ message: error.data?.message || 'Failed to change password', type: 'error' });
    }
  };

  const handleAccountDelete = async (e: React.FormEvent) => {
    e.preventDefault();

    if (deleteForm.confirmation !== 'DELETE') {
      setToast({ message: 'Please type DELETE to confirm', type: 'error' });
      return;
    }

    try {
      await deleteAccount({ password: deleteForm.password }).unwrap();
      setToast({ message: 'Account deleted successfully. Goodbye!', type: 'success' });
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error: any) {
      setToast({ message: error.data?.message || 'Failed to delete account', type: 'error' });
    }
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-800">
          {[
            { key: 'profile', label: 'Profile', icon: User },
            { key: 'security', label: 'Security', icon: Lock },
            { key: 'account', label: 'Account', icon: AlertTriangle },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-gold-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  {previewImage || profileImageUrl ? (
                    <img
                      src={previewImage || profileImageUrl!}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-slate-800"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold-500 to-amber-600 text-white flex items-center justify-center text-3xl font-bold">
                      {getInitials()}
                    </div>
                  )}

                  {(isUploading || isDeleting) && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || isDeleting}
                    className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 disabled:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Upload size={16} /> Upload Image
                  </button>

                  {profileImageUrl && (
                    <button
                      type="button"
                      onClick={handleImageDelete}
                      disabled={isUploading || isDeleting}
                      className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 disabled:bg-slate-800 text-rose-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  )}

                  <p className="text-xs text-slate-500">Max 5MB, JPG/PNG</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">First Name</label>
                  <input
                    type="text"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 cursor-text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 cursor-text"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    disabled
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 disabled:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-lg">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500"
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-600 disabled:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {isChangingPassword ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
                {isChangingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6 max-w-lg">
              <div className="bg-rose-500/10 border border-rose-500/50 rounded-lg p-4">
                <h3 className="text-rose-400 font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle size={20} /> Danger Zone
                </h3>
                <p className="text-slate-300 text-sm">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
              </div>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Delete My Account
              </button>

              {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full">
                    <h3 className="text-xl font-bold text-white mb-4">Delete Account</h3>
                    <form onSubmit={handleAccountDelete} className="space-y-4">
                      <div>
                        <label className="block text-sm text-slate-300 mb-2">Enter your password</label>
                        <input
                          type="password"
                          value={deleteForm.password}
                          onChange={(e) => setDeleteForm({ ...deleteForm, password: e.target.value })}
                          className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-300 mb-2">Type DELETE to confirm</label>
                        <input
                          type="text"
                          value={deleteForm.confirmation}
                          onChange={(e) => setDeleteForm({ ...deleteForm, confirmation: e.target.value })}
                          className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-white"
                          required
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setShowDeleteModal(false)}
                          className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isDeletingAccount}
                          className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-600 text-white px-4 py-2 rounded-lg"
                        >
                          {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
