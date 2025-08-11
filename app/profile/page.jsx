'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthContext } from '@/contexts/AuthContext';
import { db, auth } from '@/firebase/config';
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import {
  sendEmailVerification,
  deleteUser,
} from 'firebase/auth';
import { toast } from 'react-hot-toast';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  MapPinIcon,
  PencilSquareIcon,
  CheckIcon,
  ArrowPathIcon,
  TrashIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Lakshadweep', 'Puducherry'
].sort();

function ProfileSection({ title, children }) {
  return (
    <section className="rounded-xl shadow bg-white mb-8 px-6 py-5">
      <h3 className="text-xl font-bold mb-3 text-gray-900 tracking-tight">{title}</h3>
      {children}
    </section>
  );
}

function LabeledField({ icon: Icon, label, value, children }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <Icon className="h-5 w-5 text-green-600 flex-shrink-0" />
      <div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="font-medium text-gray-900">{value || children}</div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuthContext();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);

  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    mobile: '',
    state: '',
    city: '',
    address: '',
    apartment: '',
    pincode: '',
    avatar: '',
    bio: '',
  });
  const [originalData, setOriginalData] = useState({});

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    const fetchProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};
        const profileInfo = {
          displayName: userData.displayName || '',
          email: user.email || '',
          mobile: userData.mobile || '',
          state: userData.state || '',
          city: userData.city || '',
          address: userData.address || '',
          apartment: userData.apartment || '',
          pincode: userData.pincode || '',
          avatar: user.photoURL || '/default-avatar.png',
          bio: userData.bio || '',
        };
        setProfileData(profileInfo);
        setOriginalData(profileInfo);
      } catch {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!profileData.displayName.trim()) {
      toast.error('Name is required');
      return false;
    }
    if (profileData.mobile && (profileData.mobile.length !== 10 || !/^\d+$/.test(profileData.mobile))) {
      toast.error('Please enter a valid 10-digit mobile number');
      return false;
    }
    if (profileData.pincode && (profileData.pincode.length !== 6 || !/^\d+$/.test(profileData.pincode))) {
      toast.error('Please enter a valid 6-digit PIN code');
      return false;
    }
    return true;
  };

  const handleCancel = () => {
    setProfileData(originalData);
    setEditMode(false);
  };

  const handleSendVerificationEmail = async () => {
    try {
      await sendEmailVerification(auth.currentUser);
      setEmailVerificationSent(true);
      toast.success('Verification email sent. Please check your inbox.');
    } catch {
      toast.error('Failed to send verification email.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    try {
      // Remove updateProfile call for displayName to prevent its update
      // Only update Firestore user doc for editable fields
      await setDoc(
        doc(db, 'users', user.uid),
        {
          mobile: profileData.mobile,
          state: profileData.state,
          city: profileData.city,
          address: profileData.address,
          apartment: profileData.apartment,
          pincode: profileData.pincode,
          bio: profileData.bio,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      setOriginalData(profileData);
      setEditMode(false);
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) {
      toast.error('No user signed in');
      return;
    }
    setDeletingAccount(true);
    try {
      await deleteDoc(doc(db, 'users', user.uid));
      await deleteUser(auth.currentUser);
      toast.success('Account deleted successfully');
      router.push('/');
    } catch (error) {
      if (error.code === 'auth/requires-recent-login') {
        toast.error('Please re-login before deleting your account.');
      } else {
        toast.error('Failed to delete account');
      }
    } finally {
      setDeletingAccount(false);
      setDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Profile Card */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 bg-white shadow-lg rounded-xl p-6 mb-10">
          <div className="flex-shrink-0 self-center">
            <div className="w-32 h-32 rounded-full border-4 border-green-100 overflow-hidden relative shadow-md">
              <Image src={profileData.avatar} alt={profileData.displayName || 'User Avatar'} fill className="object-cover" priority />
            </div>
          </div>
          <div className="flex-1 min-h-[7.5rem]">
            <div className="flex items-center gap-2">
              {/* Display displayName as read-only text */}
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{profileData.displayName || 'Your Name'}</h2>
              {user?.emailVerified ? (
                <CheckIcon className="h-5 w-5 text-green-500" title="Email verified" />
              ) : (
                <button
                  onClick={handleSendVerificationEmail}
                  disabled={emailVerificationSent}
                  className="text-yellow-600 underline ml-2 text-xs"
                >
                  Verify Email
                </button>
              )}
            </div>
            {/* Display email as read-only text */}
            <div className="flex items-center mt-1 text-gray-500 gap-3 text-sm">
              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              {profileData.email}
            </div>
            {profileData.bio && (
              <div className="mt-3 italic text-gray-600">{profileData.bio}</div>
            )}
            <div className="flex gap-2 mt-4">
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold flex gap-2 items-center transition"
                onClick={() => setEditMode(true)}
              >
                <PencilSquareIcon className="h-5 w-5" /> Edit Profile
              </button>
              <button
                className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-4 py-2 rounded-lg font-medium flex gap-2 items-center transition"
                onClick={() => setDeleteConfirm(true)}
              >
                <TrashIcon className="h-5 w-5" /> Delete Account
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {editMode ? (
            <motion.form
              key="edit-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onSubmit={handleSubmit}
              className="space-y-8 bg-white shadow rounded-xl p-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
               

                {/* Editable fields below */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    name="mobile"
                    value={profileData.mobile}
                    onChange={handleInputChange}
                    maxLength={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-900"
                    placeholder="10-digit mobile number"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <select
                    name="state"
                    value={profileData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-900"
                    disabled={saving}
                  >
                    <option value="">Select your state</option>
                    {indianStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={profileData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-900"
                    placeholder="Your city"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    name="address"
                    value={profileData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-900"
                    placeholder="Street address"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apartment, Suite, etc.</label>
                  <input
                    type="text"
                    name="apartment"
                    value={profileData.apartment}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-900"
                    placeholder="Apartment, suite, etc."
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                  <input
                    type="text"
                    name="pincode"
                    value={profileData.pincode}
                    onChange={handleInputChange}
                    maxLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-900"
                    placeholder="6-digit PIN code"
                    disabled={saving}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    name="bio"
                    rows={3}
                    value={profileData.bio}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-900 resize-none"
                    placeholder="Tell us about yourself"
                    disabled={saving}
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={saving}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <ArrowPathIcon className="h-5 w-5 animate-spin" /> Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </motion.button>
              </div>
            </motion.form>
          ) : (
            <motion.div key="profile-details" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}>
              <ProfileSection title="Contact Details">
                <LabeledField icon={UserIcon} label="Full Name" value={profileData.displayName} />
                <LabeledField icon={EnvelopeIcon} label="Email" value={profileData.email} />
                {profileData.mobile && <LabeledField icon={PhoneIcon} label="Mobile" value={profileData.mobile} />}
              </ProfileSection>
              <ProfileSection title="Address">
                {(profileData.state || profileData.city) && (
                  <LabeledField
                    icon={GlobeAltIcon}
                    label="Location"
                    value={[profileData.city, profileData.state].filter(Boolean).join(', ')}
                  />
                )}
                {profileData.address && (
                  <LabeledField
                    icon={MapPinIcon}
                    label="Street Address"
                    value={
                      <div>
                        {profileData.address}
                        {profileData.apartment && <>, {profileData.apartment}</>}
                        {profileData.pincode && (
                          <span className="block text-sm text-gray-500 mt-0.5">PIN: {profileData.pincode}</span>
                        )}
                      </div>
                    }
                  />
                )}
              </ProfileSection>
              {profileData.bio && (
                <ProfileSection title="Bio">
                  <div className="font-medium text-gray-900">{profileData.bio}</div>
                </ProfileSection>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl p-7 max-w-sm w-full shadow-xl text-center"
              >
                <h2 className="text-lg font-bold text-red-700 flex justify-center items-center gap-2 mb-3">
                  <XCircleIcon className="h-6 w-6" /> Confirm Account Deletion
                </h2>
                <p className="mb-7 text-gray-700">
                  Are you sure you want to{' '}
                  <span className="font-semibold text-red-700">permanently delete your account?</span>
                  <br />
                  This action cannot be undone.
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                    disabled={deletingAccount}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
                    disabled={deletingAccount}
                  >
                    {deletingAccount ? (
                      <>
                        <ArrowPathIcon className="h-5 w-5 animate-spin" /> Deleting...
                      </>
                    ) : (
                      'Delete Account'
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
