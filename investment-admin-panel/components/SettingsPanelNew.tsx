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
import { useChangePasswordMutation } from '../store/api/authApi';
import { Toast, ToastType } from './ui/Toast';
import { Save, Lock, User, FileText, Upload, Trash2, Camera, Loader2 } from 'lucide-react';

export const SettingsPanelNew: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // API hooks
  const { data: profileData, refetch } = useGetMyProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadProfileImageMutation();
  const [deleteImage, { isLoading: isDeleting }] = useDeleteProfileImageMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

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

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Profile image URL from backend
  const profileImageUrl = user?.image
    ? `http://10.10.11.87:8080${user.image}`
    : null;

  // Handle profile form change
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Handle password form change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setToast({ message: 'Please select an image file', type: 'error' });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setToast({ message: 'Image size must be less than 5MB', type: 'error' });
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload immediately
      handleImageUpload(file);
    }
  };

  // Handle image upload
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

  // Handle image delete
  const handleImageDelete = async () => {
    if (!confirm('Are you sure you want to delete your profile image?')) return;

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

  // Handle profile update
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

  // Handle password change
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
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

  // Get initials for avatar placeholder
  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return 'A';
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold text-navy-900">Settings</h2>
        <p className="text-slate-500 text-sm">Manage your profile and security settings</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-gold-500 text-navy-900'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <User size={18} /> Profile
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'security'
                ? 'border-gold-500 text-navy-900'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Lock size={18} /> Security
          </button>
        </div>

        <div className="p-6 lg:p-10">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Profile Image Section */}
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  {previewImage || profileImageUrl ? (
                    <img
                      src={previewImage || profileImageUrl!}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover shadow-xl border-4 border-white"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold-500 to-amber-600 text-white flex items-center justify-center text-3xl font-bold shadow-xl">
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
                    className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Upload size={16} /> Upload Image
                  </button>

                  {profileImageUrl && (
                    <button
                      type="button"
                      onClick={handleImageDelete}
                      disabled={isUploading || isDeleting}
                      className="flex items-center gap-2 bg-rose-100 hover:bg-rose-200 disabled:bg-slate-100 text-rose-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Trash2 size={16} /> Delete Image
                    </button>
                  )}

                  <p className="text-xs text-slate-400">Max 5MB, JPG/PNG</p>
                </div>
              </div>

              {/* Profile Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={profileForm.firstName}
                    onChange={handleProfileChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-gold-500/50 outline-none cursor-text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={profileForm.lastName}
                    onChange={handleProfileChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-gold-500/50 outline-none cursor-text"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    disabled
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                  <input
                    type="text"
                    value={user?.role || 'Admin'}
                    disabled
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex items-center gap-2 bg-navy-900 hover:bg-navy-800 disabled:bg-slate-400 text-white px-6 py-2.5 rounded-lg transition-shadow shadow-md"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordUpdate} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-lg mx-auto">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 text-amber-800 text-sm mb-6">
                <Lock className="flex-shrink-0 mt-0.5" size={18} />
                <p>For your security, make sure to use a strong password with at least 8 characters.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  name="oldPassword"
                  value={passwordForm.oldPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-gold-500/50 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-gold-500/50 outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">Minimum 8 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-gold-500/50 outline-none"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 disabled:bg-slate-400 text-white px-6 py-2.5 rounded-lg transition-shadow shadow-md"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Updating Password...
                    </>
                  ) : (
                    <>
                      <Lock size={18} /> Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
